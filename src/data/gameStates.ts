export type CatLevel = 'Dormido' | 'Despierto' | 'Curioso' | 'Alimentado' | 'Juguetón' | 'Campeón';
export type FoodType = 'dry' | 'wet' | 'treats' | null;

export type ScreenName =
  | 'attract' | 'pet' | 'registration' | 'hub'
  | 'gameSelect' | 'feedSelect' | 'feedInteraction'
  | 'penaltyInstructions' | 'penaltyGame' | 'penaltyResults'
  | 'catchBenefits' | 'catchInstructions' | 'catchCountdown' | 'catchGame'
  | 'sleep'
  | 'finalReward';

export interface CatState {
  name: string;
  energy: number;
  hunger: number;
  affection: number;
  mood: number;
  mundialSpirit: number;
  score: number;
  playScore: number;
  level: CatLevel;
  selectedFood: FoodType;
  hasFed: boolean;
  hasPlayed: boolean;
  hasTalked: boolean;
  isChampion: boolean;
}

export const initialCatState: CatState = {
  name: 'Simón',
  energy: 50,
  hunger: 70,
  affection: 20,
  mood: 40,
  mundialSpirit: 10,
  score: 0,
  playScore: 0,
  level: 'Dormido',
  selectedFood: null,
  hasFed: false,
  hasPlayed: false,
  hasTalked: false,
  isChampion: false,
};

export const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));
