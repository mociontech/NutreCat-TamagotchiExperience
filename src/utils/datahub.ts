import type { CatState, FoodType } from '../data/gameStates';

type SelectedGame = 'penalties' | 'atrapalo' | null;

interface NutreCatExperienceInput {
  cat: CatState;
  selectedGame: SelectedGame;
  startedAt: string;
  endedAt?: string;
  sessionId: string;
}

const QUEUE_KEY = 'datahub_queue';

const DATAHUB_TOKEN = import.meta.env.VITE_DATAHUB_TOKEN as string | undefined;
const DATAHUB_EVENT_ID = import.meta.env.VITE_DATAHUB_EVENT_ID as string | undefined;
const DATAHUB_URL = import.meta.env.VITE_DATAHUB_URL as string | undefined;
const EXPERIENCE_NAME = (import.meta.env.VITE_EXPERIENCE_NAME as string | undefined) || 'NutreCat Play';
const DATAHUB_EXPERIENCE_ID = import.meta.env.VITE_DATAHUB_EXPERIENCE_ID as string | undefined;

const FOOD_LABELS: Record<Exclude<FoodType, null>, string> = {
  treats: 'NutreCat con Leche Deslactosada',
  dry: 'NutreCat con Salmon',
  wet: 'NutreCat con Tilapia',
};

function getExperiencesUrl(): string | null {
  if (!DATAHUB_URL) return null;
  const base = DATAHUB_URL.replace(/\/+$/, '');
  return base.endsWith('/experiences') ? base : `${base}/experiences`;
}

function readQueue(): unknown[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function queuePayload(payload: unknown): void {
  try {
    const queue = readQueue();
    queue.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Ignore storage failures so the experience never blocks.
  }
}

async function postToDatahub(payload: unknown): Promise<void> {
  const url = getExperiencesUrl();
  if (!url || !DATAHUB_EVENT_ID || !DATAHUB_EXPERIENCE_ID) return;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (DATAHUB_TOKEN) headers.Authorization = `Bearer ${DATAHUB_TOKEN}`;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    keepalive: true,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Datahub error ${response.status}`);
  }
}

export async function flushDatahubQueue(): Promise<void> {
  const queue = readQueue();
  if (!queue.length) return;

  const pending: unknown[] = [];
  for (const payload of queue) {
    try {
      await postToDatahub(payload);
    } catch {
      pending.push(payload);
    }
  }

  try {
    if (pending.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
    else localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export async function sendNutreCatExperience({
  cat,
  selectedGame,
  startedAt,
  endedAt = new Date().toISOString(),
  sessionId,
}: NutreCatExperienceInput): Promise<void> {
  const completed = cat.hasFed && cat.hasPlayed && cat.hasTalked;
  if (!completed) return;
  if (!DATAHUB_EVENT_ID || !DATAHUB_EXPERIENCE_ID || !getExperiencesUrl()) return;

  const selectedFood = cat.selectedFood ? FOOD_LABELS[cat.selectedFood] : null;
  const startedMs = Date.parse(startedAt);
  const endedMs = Date.parse(endedAt);
  const durationSeconds = Number.isFinite(startedMs) && Number.isFinite(endedMs)
    ? Math.max(0, Math.round((endedMs - startedMs) / 1000))
    : null;

  const payload = {
    eventId: DATAHUB_EVENT_ID,
    experienceId: DATAHUB_EXPERIENCE_ID,
    source: EXPERIENCE_NAME,
    sentAt: endedAt,
    records: [
      {
        email: `anon-${sessionId}@local`,
        play_timestamp: startedAt,
        score: cat.score,
        bonusScore: completed ? 1 : 0,
        data: {
          experiencia: EXPERIENCE_NAME,
          experienceId: DATAHUB_EXPERIENCE_ID,
          sessionId,
          startedAt,
          endedAt,
          durationSeconds,
          catName: cat.name,
          selectedFood,
          selectedGame,
          totalScore: cat.score,
          gameScore: cat.playScore,
          completed,
          activities: {
            petCompleted: cat.affection > 20,
            feedCompleted: cat.hasFed,
            gameCompleted: cat.hasPlayed,
            sleepCompleted: cat.hasTalked,
          },
          marketing: {
            productSelected: selectedFood,
            gameSelected: selectedGame,
            reachedFinalQr: true,
          },
        },
      },
    ],
  };

  try {
    await postToDatahub(payload);
    await flushDatahubQueue();
  } catch {
    queuePayload(payload);
  }
}

export const sendNutreCatActivity = sendNutreCatExperience;

export function createDatahubSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `nutrecat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
