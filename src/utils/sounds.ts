// Rutas de todos los efectos de sonido
const SRC = {
  kick:        '/sounds/u_id15birb4y-deep-kick-397047.mp3',
  crowd:       '/sounds/vishiv-crowd-cheering-in-stadium-435357.mp3',
  fail:        '/sounds/freesound_community-wrong-47985.mp3',
  correct:     '/sounds/dragon-studio-correct-472358.mp3',
  victory:     '/sounds/eaglaxle-gaming-victory-464016.mp3',
  fanfare:     '/sounds/freesound_community-fanfare-46385.mp3',
  meow:        '/sounds/stu9-cute-cat-352656.mp3',
  purr:        '/sounds/dragon-studio-cat-purr-sfx-482870.mp3',
  eat:         '/sounds/freesound_community-cat-eats-28338.mp3',
  sponge:      '/sounds/spinopel-washing-sponge-411684.mp3',
  water:       '/sounds/alemaldonadoc-agua-llave-sin-efectos-247529.mp3',
  bling:       '/sounds/u_o8xh7gwsrj-correct_answer_toy_bi-bling-476370.mp3',
  musicbox:    '/sounds/freesound_community-music-box-34179.mp3',
  soundtrack:  '/sounds/waveloom-happy-ukulele-478610.mp3',
  ukulele:     '/sounds/waveloom-happy-ukulele-478610.mp3',
  ukulelef:    '/sounds/waveloom-happy-ukulele-478610f.mp3',
  lightswitch: '/sounds/freesound_community-light-switch-106505.mp3',
  snap:        '/sounds/pensieri_profondi_scuba-snap-274158.mp3',
} as const;

export type SoundName = keyof typeof SRC;

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};
// Volúmenes intencionados para restaurar al desmutear
const _intentVol: Partial<Record<SoundName, number>> = {};
let _muted = false;

function get(name: SoundName): HTMLAudioElement {
  if (!cache[name]) cache[name] = new Audio(SRC[name]);
  return cache[name]!;
}

/** Reproduce un sonido una vez (silenciado si mute activo) */
export function sfx(name: SoundName, volume = 1.0): void {
  if (_muted) return;
  try {
    const a = get(name);
    a.loop = false;
    a.volume = Math.max(0, Math.min(1, volume));
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch { /* ignore */ }
}

/** Inicia un loop de música de fondo */
export function bgPlay(name: SoundName, volume = 0.35, playbackRate = 1.0): void {
  try {
    const a = get(name);
    a.loop = true;
    _intentVol[name] = Math.max(0, Math.min(1, volume));
    a.volume = _muted ? 0 : _intentVol[name]!;
    a.playbackRate = Math.max(0.5, Math.min(4, playbackRate));
    if (a.paused) { a.currentTime = 0; a.play().catch(() => {}); }
  } catch { /* ignore */ }
}

/** Cambia la velocidad de reproducción de un loop en curso */
export function bgSetRate(name: SoundName, playbackRate: number): void {
  try {
    const a = cache[name];
    if (a) a.playbackRate = Math.max(0.5, Math.min(4, playbackRate));
  } catch { /* ignore */ }
}

/** Detiene un loop */
export function bgStop(name: SoundName): void {
  try {
    const a = cache[name];
    if (a) { a.pause(); a.currentTime = 0; }
  } catch { /* ignore */ }
}

/** Desvanece un loop gradualmente hasta targetVolume (0 = detener) */
export function bgFade(name: SoundName, duration = 1200, targetVolume = 0): void {
  try {
    const a = cache[name];
    if (!a || a.paused) return;
    const startVol = a.volume;
    const steps = 24;
    const tick = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      if (_muted) { clearInterval(timer); return; }
      step++;
      const t = step / steps;
      a.volume = Math.max(targetVolume, startVol + (targetVolume - startVol) * t);
      if (step >= steps) {
        clearInterval(timer);
        if (targetVolume <= 0) { a.pause(); a.currentTime = 0; a.volume = startVol; }
      }
    }, tick);
  } catch { /* ignore */ }
}

/** Silencia todo el audio inmediatamente */
export function muteAll(): void {
  _muted = true;
  (Object.keys(cache) as SoundName[]).forEach(name => {
    const a = cache[name];
    if (a) a.volume = 0;
  });
}

/** Restaura todos los volúmenes anteriores */
export function unmuteAll(): void {
  _muted = false;
  (Object.keys(cache) as SoundName[]).forEach(name => {
    const a = cache[name];
    if (a && _intentVol[name] !== undefined) a.volume = _intentVol[name]!;
  });
}

export function isMuted(): boolean { return _muted; }

/** Corta un sfx antes de que termine */
export function sfxStop(name: SoundName): void {
  try {
    const a = cache[name];
    if (a) { a.pause(); a.currentTime = 0; }
  } catch { /* ignore */ }
}
