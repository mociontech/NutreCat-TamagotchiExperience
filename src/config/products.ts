import type { FoodType } from '../data/gameStates';
import { ASSETS } from './assets';

export const PRODUCT_IMAGES: Record<Exclude<FoodType, null>, string> = {
  treats: ASSETS.products.treats,
  dry: ASSETS.products.dry,
  wet: ASSETS.products.wet,
};

export const PRODUCT_LAYOUTS: { id: Exclude<FoodType, null>; img: string; left: string; width: string }[] = [
  { id: 'treats', img: PRODUCT_IMAGES.treats, left: '13.61%', width: '21.48%' },
  { id: 'dry', img: PRODUCT_IMAGES.dry, left: '37.41%', width: '22.13%' },
  { id: 'wet', img: PRODUCT_IMAGES.wet, left: '63.52%', width: '21.48%' },
];

export const ACTIVITY_NAV_ITEMS = [
  { id: 'game', label: 'Jugar', icon: ASSETS.nav.game, doneKey: 'hasPlayed' },
  { id: 'food', label: 'Comer', icon: ASSETS.nav.food, doneKey: 'hasFed' },
  { id: 'sleep', label: 'Dormir', icon: ASSETS.nav.sleep, doneKey: 'hasTalked' },
] as const;
