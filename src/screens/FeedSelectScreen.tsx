import { motion } from 'framer-motion';
import type { FoodType } from '../data/gameStates';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = {
  game:    '/assets/nav/icon-game.svg',
  food:    '/assets/nav/icon-food.svg',
  hygiene: '/assets/nav/icon-hygiene.svg',
  sleep:   '/assets/nav/icon-sleep.svg',
};

const PRODUCTS: { id: FoodType; img: string; name: string }[] = [
  { id: 'dry',    img: '/assets/products/product-3.png', name: 'Con Salmón' },
  { id: 'wet',    img: '/assets/products/product-2.png', name: 'Con Tilapia' },
  { id: 'treats', img: '/assets/products/product-1.png', name: 'Con Leche' },
];

interface Props {
  onSelect: (food: FoodType) => void;
  onBack: () => void;
}

export default function FeedSelectScreen({ onSelect, onBack }: Props) {
  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: onBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: true,  isDone: false, onClick: onBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: onBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: onBack },
  ];

  return (
    <ScreenLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0', flexShrink: 0 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,87,122,0.2)' }}
        >
          <img src="/assets/ui/arrow-back.svg" alt="Volver" style={{ width: 20, filter: 'brightness(0) saturate(100%) invert(22%) sepia(85%) saturate(600%) hue-rotate(175deg)' }} />
        </motion.button>
      </div>

      {/* Gato con tenedor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
        <motion.img
          src="/assets/cat/cat-food-select.png"
          alt="Simón esperando comer"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 310, height: 330,
            objectFit: 'contain', objectPosition: 'bottom',
            userSelect: 'none', pointerEvents: 'none',
            filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.18))',
          }}
        />

        {/* Productos */}
        <div style={{ display: 'flex', gap: '12px', padding: '0 16px', marginTop: '-4px' }}>
          {PRODUCTS.map((p, i) => (
            <motion.button
              key={p.id as string}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelect(p.id)}
              style={{
                flex: 1, background: 'white', border: '3px solid transparent',
                borderRadius: '20px', padding: '10px 6px 14px',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 16px rgba(0,87,122,0.15)',
              }}
            >
              <img
                src={p.img}
                alt={p.name}
                style={{ width: 90, height: 110, objectFit: 'contain', pointerEvents: 'none' }}
              />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#00577a', textAlign: 'center', lineHeight: 1.2 }}>{p.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}