import { motion } from 'framer-motion';
import type { CatState } from '../data/gameStates';

interface Props { cat?: CatState; onNext: () => void; }

export default function RewardQrScreen({ onNext }: Props) {
  return (
    <div
      onClick={onNext}
      style={{ width: '100%', height: '100%', background: '#00b6ed', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Fondo */}
      <img src="/assets/backgrounds/bg-Inicio.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{
        position: 'absolute',
        inset: '3.4% 6% 3.4%',
        border: '2px dashed rgba(255,255,255,0.95)',
        borderRadius: 'min(4vw, 2.25vh)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '27%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.88))',
        zIndex: 0,
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '6.15%', left: '31.4%', right: '31.4%', height: '14.7%', zIndex: 2 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="NutreCat Premium"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* ¡Gracias por participar! */}
      <div style={{ position: 'absolute', left: '50%', top: '31.3%', transform: 'translate(-50%, -50%)', width: '82%', zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(15.8vw, 8.9vh)',
            color: '#00577a',
            textAlign: 'center',
            lineHeight: 0.9,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
          }}
        >
          ¡Gracias por participar!
        </motion.p>
      </div>

      {/* Ganaste un descuento */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: '18%', right: '18%', top: 'calc(43.9% - 30px)',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(4.7vw, 2.64vh)',
          color: '#00577a',
          textAlign: 'center',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.045em',
          lineHeight: 1.1,
          margin: 0, zIndex: 2,
        }}
      >
        GANASTE UN DESCUENTO DEL
      </motion.p>

      {/* 10% */}
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.28, type: 'spring', stiffness: 180, damping: 18 }}
        style={{
          position: 'absolute',
          left: '18%', right: '18%', top: '47.1%',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(45.28vw, 25.49vh)',
          color: '#00577a',
          textAlign: 'center',
          lineHeight: 0.9,
          margin: 0,
          zIndex: 2,
        }}
      >
        10%
      </motion.p>

      <div style={{
        position: 'absolute',
        left: '50%',
        top: 'calc(70.2% - 60px)',
        width: '57.6%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6.5%',
        zIndex: 2,
      }}>
        {/* QR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.34, type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            width: '43%',
            aspectRatio: '1',
            background: 'white',
            borderRadius: 'min(5.4vw, 3.04vh)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <img src="/assets/backgrounds/QR.png" alt="QR"
            style={{ width: '83%', height: '83%', objectFit: 'contain', display: 'block' }} />
        </motion.div>

        {/* Código promocional */}
        <motion.p
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.35vw, 2.45vh)',
            color: '#00577a',
            textAlign: 'left',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            lineHeight: 1.18,
            margin: 0,
          }}
        >
          REDÍMELO CON<br />
          ESTE CÓDIGO<br />
          PROMOCIONAL<br />
          NUTRECATPLAY
        </motion.p>
      </div>

      {/* Lugar */}
      <div style={{ position: 'absolute', left: '18%', right: '18%', top: 'calc(91.55% - 80px)', transform: 'translateY(-50%)', zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.7vw, 2.65vh)',
            color: '#00577a',
            textAlign: 'center',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          LUGAR: PLAZACAMPO.COM
        </motion.p>
      </div>

      {/* Volver manualmente */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          position: 'absolute',
          bottom: '1.5%', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
        }}
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(2.5vw, 1.4vh)',
            color: '#00577a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          Toca para volver al inicio
        </motion.span>
      </motion.div>
    </div>
  );
}
