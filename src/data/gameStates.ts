export type CatLevel = 'Dormido' | 'Despierto' | 'Curioso' | 'Alimentado' | 'Juguetón' | 'Campeón';
export type FoodType = 'dry' | 'wet' | 'treats' | null;

export type ScreenName =
  | 'attract' | 'wake' | 'pet' | 'registration' | 'hub' | 'dashboard'
  | 'gameSelect' | 'feedSelect' | 'feedInteraction'
  | 'footballInstructions' | 'footballGame' | 'footballResults' | 'goalCelebration'
  | 'fallingBagsBenefits' | 'fallingBagsInstructions' | 'fallingBagsCountdown' | 'fallingBagsGame'
  | 'talk'
  | 'championResult' | 'rewardQr' | 'sharePostcard';

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

export const foods = [
  { id: 'dry' as FoodType, name: 'Nutre Cat Dry', subtitle: 'Liberty', benefit: '⚡ Energía diaria', color: '#00AEEF', emoji: '🥘', energyBonus: '+20' },
  { id: 'wet' as FoodType, name: 'Nutre Cat Wet', subtitle: 'Premium Húmedo', benefit: '😋 Sabor irresistible', color: '#6C3FCA', emoji: '🍖', energyBonus: '+15' },
  { id: 'treats' as FoodType, name: 'Nutre Cat Treats', subtitle: 'Premio especial', benefit: '🏆 Premio especial', color: '#FF8C00', emoji: '⭐', energyBonus: '+10' },
];

export const talkOptions = [
  { text: '¡Vamos Colombia! 🇨🇴', response: '¡Miaaau! ¡Arriba Colombia! 🐾', affectionBonus: 15, moodBonus: 20 },
  { text: 'Eres un campeón 🏆', response: 'Prrrr… soy el mejor gato 🏆', affectionBonus: 20, moodBonus: 15 },
  { text: 'Te quiero ❤️', response: 'Prrrr… yo también te quiero 💕', affectionBonus: 25, moodBonus: 10 },
  { text: 'Hora de comer 🍽️', response: '¡Miau! ¡Tenía hambre! 🍗', affectionBonus: 10, moodBonus: 10 },
];

export const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));
