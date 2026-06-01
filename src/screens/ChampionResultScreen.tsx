import { motion } from 'framer-motion';
import type { CatState } from '../data/gameStates';

interface Props { cat: CatState; onClaim: () => void; }

const STATS = [
  { label: 'Energía',  key: 'energy'       as keyof CatState, icon: '⚡', bonus: 20  },
  { label: 'Nutrición', key: 'hunger'      as keyof CatState, icon: '🍗', bonus: 0, invert: true },
  { label: 'Cariño',   key: 'affection'    as keyof CatState, icon: '💕', bonus: 25  },
  { label: 'Ánimo',    key: 'mood'         as keyof CatState, icon: '😄', bonus: 15  },
] as const;

export default function ChampionResultScreen({ cat, onClaim }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '0 9%',
      boxSizing: 'border-box',
    }}>
      {/* Fondo cuarto */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/assets/backgrounds/bg-pet.png)',
        backgroundSize: 'cover', backgroundPosition: 'center bottom',
        opacity: 0.2, pointerEvents: 'none',
      }} />

      {/* Partículas de estrellas */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: `${10 + (i * 7.5) % 80}vw`, y: '100%' }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.6], y: '-20%' }}
          transition={{ delay: (i * 0.18) % 2, duration: 2.2 + (i % 3) * 0.4, repeat: Infinity, repeatDelay: Math.random() * 2 }}
          style={{ position: 'absolute', bottom: 0, fontSize: 'min(5vw, 2.8vh)', pointerEvents: 'none', zIndex: 1 }}
        >
          {['✨', '⭐', '💫', '🌟'][i % 4]}
        </motion.div>
      ))}

      {/* Header: Logo + Puntos */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 2,
        width: '100%',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        paddingTop: 'min(4.8vw, 2.7vh)',
      }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '28.5%', objectFit: 'contain' }} />
        <motion.div
          key={cat.score}
          animate={{ scale: [1.1, 1] }}
          transition={{ duration: 0.3 }}
          style={{ background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {cat.score} pts ⭐
          </span>
        </motion.div>
      </div>

      <div style={{ flex: '0.4' }} />

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 280 }}
        style={{ flexShrink: 0, textAlign: 'center', zIndex: 2, position: 'relative' }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(9.5vw, 5.35vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          lineHeight: 1.05, margin: 0,
          letterSpacing: '0.02em',
        }}>
          ¡{cat.name} es un
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(12vw, 6.75vh)',
          color: 'white',
          textTransform: 'uppercase',
          lineHeight: 1, margin: 0,
          textShadow: '0 4px 20px rgba(0,87,122,0.35)',
          letterSpacing: '0.03em',
        }}>
          Campeón 🏆
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'min(3.8vw, 2.1vh)',
          color: 'rgba(255,255,255,0.85)',
          margin: 'min(1.5vw, 0.85vh) 0 0',
          fontWeight: 700, letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          Gracias por cuidarlo, alimentarlo y jugar con él
        </p>
      </motion.div>

      <div style={{ flex: '0.3' }} />

      {/* Gato campeón */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ flexShrink: 0, position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center' }}
      >
        {/* Halo de marca */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '-min(3vw, 1.7vh)',
            borderRadius: '50%',
            border: 'min(0.6vw, 0.34vh) solid transparent',
            borderTopColor: 'white',
            borderRightColor: 'rgba(255,255,255,0.4)',
            borderBottomColor: 'rgba(0,87,122,0.6)',
          }}
        />
        <img
          src="/assets/cat/cat-champion.png"
          alt={`${cat.name} campeón`}
          style={{
            width: 'min(48vw, 27vh)',
            objectFit: 'contain',
            userSelect: 'none', pointerEvents: 'none',
            filter: 'drop-shadow(0 0 min(6vw, 3.4vh) rgba(255,255,255,0.5))',
          }}
        />
      </motion.div>

      <div style={{ flex: '0.25' }} />

      {/* Card de stats */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          flexShrink: 0, width: '100%', zIndex: 2,
          background: '#00577a',
          borderRadius: 'min(4vw, 2.2vh)',
          padding: 'min(3.5vw, 2vh) min(5vw, 2.8vh)',
          boxShadow: '0 8px 30px rgba(0,87,122,0.35)',
        }}
      >
        {STATS.map(s => {
          const raw = cat[s.key] as number;
          const val = s.invert
            ? Math.min(100, Math.max(0, 100 - raw + s.bonus))
            : Math.min(100, raw + s.bonus);
          return (
            <div key={s.label} style={{ marginBottom: 'min(1.8vw, 1vh)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'min(0.8vw, 0.45vh)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'min(3.4vw, 1.9vh)', color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
                  {s.icon} {s.label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.4vw, 1.9vh)', color: 'white' }}>
                  {Math.round(val)}/100
                </span>
              </div>
              <div style={{ height: 'min(2.2vw, 1.25vh)', background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                  style={{ height: '100%', background: 'white', borderRadius: 99, boxShadow: '0 0 8px rgba(255,255,255,0.4)' }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      <div style={{ flex: '0.35' }} />

      {/* Botón reclamar */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1, y: 0,
          boxShadow: ['0 0 20px rgba(255,255,255,0.3)', '0 0 50px rgba(255,255,255,0.65)', '0 0 20px rgba(255,255,255,0.3)'],
        }}
        transition={{ delay: 0.5, boxShadow: { duration: 1.8, repeat: Infinity } }}
        whileTap={{ scale: 0.94 }}
        onClick={onClaim}
        style={{
          flexShrink: 0,
          background: '#00577a',
          color: 'white', border: 'none',
          borderRadius: 99,
          padding: 'min(3.2vw, 1.8vh) min(11vw, 6.2vh)',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.5vw, 3.65vh)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          zIndex: 2, position: 'relative',
        }}
      >
        🎁 Reclamar mi premio
      </motion.button>

      <div style={{ flex: '0.3' }} />
    </div>
  );
}
