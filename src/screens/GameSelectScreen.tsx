import { motion } from 'framer-motion';
import type { ScreenName } from '../data/gameStates';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = { game: '/assets/nav/icon-game.svg', food: '/assets/nav/icon-food.svg', hygiene: '/assets/nav/icon-hygiene.svg', sleep: '/assets/nav/icon-sleep.svg' };

interface Props {
  onSelect: (game: ScreenName) => void;
  onBack: () => void;
}

export default function GameSelectScreen({ onSelect, onBack }: Props) {
  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: true,  isDone: false, onClick: onBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: onBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: onBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: onBack },
  ];

  const games = [
    {
      id: 'fallingBagsCountdown' as ScreenName,
      emoji: '🛍️',
      title: 'Atrapa las bolsas',
      desc: 'Atrapa los productos Nutre Cat que caen del cielo',
      color: '#00577a',
    },
    {
      id: 'footballGame' as ScreenName,
      emoji: '⚽',
      title: 'Fútbol',
      desc: 'Carga potencia y patea al arco',
      color: '#009ccc',
    },
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

      {/* Cat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', gap: '20px' }}>
        <motion.img
          src="/assets/cat/cat-game.png"
          alt="Simón jugando"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 240, height: 260,
            objectFit: 'contain', objectPosition: 'bottom',
            userSelect: 'none', pointerEvents: 'none',
            filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.2))',
          }}
        />

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#00577a', textAlign: 'center', marginBottom: '-8px' }}>
          ¿Qué quieres jugar?
        </h2>

        {/* Game cards */}
        {games.map((g, i) => (
          <motion.button
            key={g.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(g.id)}
            style={{
              width: '100%', background: 'white', border: 'none',
              borderRadius: '24px', padding: '20px 24px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px',
              boxShadow: '0 6px 20px rgba(0,87,122,0.18)',
              borderLeft: `6px solid ${g.color}`,
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: g.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', flexShrink: 0,
              boxShadow: `0 4px 12px ${g.color}44`,
            }}>{g.emoji}</div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 900, color: '#00577a', fontSize: '18px', lineHeight: 1.1 }}>{g.title}</p>
              <p style={{ color: 'rgba(0,87,122,0.6)', fontSize: '13px', marginTop: '3px' }}>{g.desc}</p>
            </div>
            <span style={{ marginLeft: 'auto', color: g.color, fontSize: '22px' }}>›</span>
          </motion.button>
        ))}
      </div>

      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}