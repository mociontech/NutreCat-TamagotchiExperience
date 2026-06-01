import { motion } from 'framer-motion';

interface Props { score: number; onContinue: () => void; }

export default function GoalCelebrationScreen({ score, onContinue }: Props) {
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
        opacity: 0.25, pointerEvents: 'none',
      }} />

      {/* Estrellas flotantes */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: '100%', x: `${8 + i * 8}vw` }}
          animate={{ opacity: [0, 1, 0], y: '-10%', scale: [0.5, 1.3, 0.8] }}
          transition={{ delay: i * 0.15, duration: 1.8 + (i % 3) * 0.3, repeat: Infinity, repeatDelay: 0.8 }}
          style={{ position: 'absolute', bottom: 0, fontSize: 'min(5vw, 2.8vh)', pointerEvents: 'none', zIndex: 1 }}
        >
          {['✨', '⭐', '💫'][i % 3]}
        </motion.div>
      ))}

      {/* Logo */}
      <div style={{ flexShrink: 0, alignSelf: 'flex-start', paddingTop: 'min(4.8vw, 2.7vh)', zIndex: 2 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 'min(35vw, 19.7vh)', objectFit: 'contain' }} />
      </div>

      <div style={{ flex: '0.5' }} />

      {/* ¡GOOOL! */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, delay: 0.1 }}
        style={{ flexShrink: 0, textAlign: 'center', zIndex: 2 }}
      >
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(18vw, 10.1vh)',
          color: 'white',
          textTransform: 'uppercase',
          lineHeight: 1, margin: 0,
          textShadow: '0 6px 24px rgba(0,87,122,0.4)',
          letterSpacing: '0.04em',
        }}>¡GOOOL!</p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'min(4.5vw, 2.5vh)',
          color: 'rgba(255,255,255,0.9)',
          fontWeight: 700,
          margin: 'min(1vw, 0.55vh) 0 0',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          ¡Tu gato está más feliz! 🐱💕
        </p>
      </motion.div>

      <div style={{ flex: '0.3' }} />

      {/* Gato campeón */}
      <motion.img
        src="/assets/cat/cat-champion.png"
        alt="Campeón"
        animate={{ y: [0, -18, 0], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          flexShrink: 0,
          width: 'min(52vw, 29.3vh)',
          objectFit: 'contain',
          userSelect: 'none', pointerEvents: 'none',
          filter: 'drop-shadow(0 0 min(5vw, 2.8vh) rgba(255,255,255,0.5))',
          zIndex: 2, position: 'relative',
        }}
      />

      <div style={{ flex: '0.3' }} />

      {/* Puntos ganados */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 280 }}
        style={{
          flexShrink: 0, zIndex: 2,
          background: '#00577a',
          borderRadius: 99,
          padding: 'min(2vw, 1.1vh) min(8vw, 4.5vh)',
          boxShadow: '0 8px 28px rgba(0,87,122,0.4)',
          textAlign: 'center',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(8vw, 4.5vh)',
          color: 'white',
          whiteSpace: 'nowrap',
        }}>
          +{score} puntos ⚽
        </span>
      </motion.div>

      <div style={{ flex: '0.5' }} />

      {/* Botón continuar */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1, y: 0,
          boxShadow: ['0 0 20px rgba(0,87,122,0.3)', '0 0 50px rgba(0,87,122,0.7)', '0 0 20px rgba(0,87,122,0.3)'],
        }}
        transition={{ delay: 0.5, boxShadow: { duration: 1.8, repeat: Infinity } }}
        whileTap={{ scale: 0.94 }}
        onClick={onContinue}
        style={{
          flexShrink: 0, zIndex: 2,
          background: '#00577a', color: 'white',
          border: 'none', borderRadius: 99,
          padding: 'min(3.2vw, 1.8vh) min(11vw, 6.2vh)',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.5vw, 3.65vh)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Continuar 🎉
      </motion.button>

      <div style={{ flex: '0.4' }} />
    </div>
  );
}
