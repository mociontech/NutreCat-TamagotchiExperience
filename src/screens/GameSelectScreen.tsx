import { motion } from 'framer-motion';
import type { ScreenName } from '../data/gameStates';

const NAV = [
  { id: 'game',    icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   icon: '/assets/nav/icon-sleep.svg'   },
] as const;

interface Props {
  onSelect: (game: ScreenName) => void;
  onBack: () => void;
  score?: number;
}

const GAMES = [
  {
    id:    'footballGame'        as ScreenName,
    title: 'FÚTBOL',
    sub:   'Chuta el balón al arco',
    icon:  '⚽',
    bg:    '#00577a',
  },
  {
    id:    'fallingBagsCountdown' as ScreenName,
    title: 'ATRAPA\nLAS BOLSAS',
    sub:   'Atrapa los productos NutreCat',
    img:   '/assets/products/product-1.png',
    bg:    '#009ccc',
  },
] as const;

export default function GameSelectScreen({ onSelect, onBack, score = 0 }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo cuarto 44% */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/assets/backgrounds/bg-pet.png)',
        backgroundSize: 'cover', backgroundPosition: 'center bottom',
        opacity: 0.44, pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%',
        zIndex: 2,
      }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Score pill */}
      <div style={{
        position: 'absolute', top: '5%', right: '9%', zIndex: 2,
        background: 'white', borderRadius: 99,
        padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)',
        boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.6vw, 3.7vh)',
          color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>Puntos: {score}</span>
      </div>

      {/* Gato detrás de las cartas — z-index 0 */}
      <div style={{
        position: 'absolute',
        left: '19.7%', top: '20%', width: '66.5%',
        zIndex: 0, pointerEvents: 'none',
      }}>
        <motion.img
          src="/assets/cat/cat-game.png"
          alt=""
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', userSelect: 'none' }}
        />
      </div>

      {/* Cartas de juego — z-index 1 */}
      {GAMES.map((g, i) => (
        <div
          key={g.id}
          style={{
            position: 'absolute',
            left:   i === 0 ? '8.24%' : '51.48%',
            top:    '37.29%',
            width:  '39.26%',
            height: '33.28%',
            zIndex: 1,
          }}
        >
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(g.id)}
            style={{
              width: '100%', height: '100%',
              background: '#d9d9d9',
              border: `3px solid ${g.bg}`,
              borderRadius: 'min(3vw, 1.7vh)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'min(2vw, 1.1vh)',
              padding: '5%',
              overflow: 'hidden',
              boxShadow: `0 6px 24px ${g.bg}44`,
            }}
          >
            {'img' in g ? (
              <img src={g.img} alt="" style={{
                width: '65%', objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              }} />
            ) : (
              <span style={{ fontSize: 'min(14vw, 8vh)', lineHeight: 1 }}>{g.icon}</span>
            )}

            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(5vw, 2.8vh)',
              color: g.bg,
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.1,
              margin: 0,
              whiteSpace: 'pre-line',
            }}>{g.title}</p>

            <p style={{
              fontSize: 'min(3vw, 1.7vh)',
              color: 'rgba(0,0,0,0.5)',
              textAlign: 'center',
              margin: 0,
              lineHeight: 1.2,
            }}>{g.sub}</p>
          </motion.button>
        </div>
      ))}

      {/* Botones nav circulares */}
      <div style={{
        position: 'absolute', top: '82.6%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        gap: 'min(4.4vw, 2.5vh)',
        padding: '0 9%',
        zIndex: 2,
      }}>
        {NAV.map(item => {
          const isGame = item.id === 'game';
          return (
            <motion.button
              key={item.id}
              onClick={isGame ? () => {} : onBack}
              whileTap={{ scale: 0.88 }}
              style={{
                width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)',
                borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: isGame ? 'white' : '#00577a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isGame
                  ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)'
                  : '0 4px 16px rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
            >
              <img src={item.icon} alt="" style={{
                width: '54%', height: '54%', objectFit: 'contain',
                filter: isGame ? 'none' : 'brightness(0) invert(1)',
              }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
