import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { CatState } from '../data/gameStates';

const TOTAL_SECS   = 20;
const RADIUS       = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Logo con shimmer diagonal + respiración de brillo */
function ShimmerLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <motion.img
        src="/assets/ui/logo-nutre-cat.svg"
        alt="Nutre Cat"
        animate={{ filter: ['brightness(1)', 'brightness(1.22)', 'brightness(1)'] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        style={{ width: '100%', objectFit: 'contain', display: 'block' }}
      />
      <motion.div
        animate={{ x: ['-140%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-20%', bottom: '-20%',
          width: '55%',
          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

interface Props { cat?: CatState; onNext: () => void; onShare?: () => void; }

export default function RewardQrScreen({ cat, onNext, onShare }: Props) {
  const [secs, setSecs] = useState(TOTAL_SECS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(interval); onNext(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onNext]);

  const strokeDash = CIRCUMFERENCE * (secs / TOTAL_SECS);

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

      {/* Logo con shimmer */}
      <ShimmerLogo style={{ flexShrink: 0, width: '44.07%', paddingTop: '6%' }} />

      <div style={{ flex: '0.4' }} />

      {/* "¡Gracias por participar!" — entra desde la izquierda, luego respira */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden' }}>
        <motion.p
          initial={{ x: '-110%', opacity: 0 }}
          animate={{ x: 0, opacity: [1, 0.82, 1] }}
          transition={{
            x:       { delay: 0.15, type: 'spring', stiffness: 170, damping: 22 },
            opacity: { delay: 1.4, duration: 3.8, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(9.5vw, 5.35vh)',
            color: '#00577a',
            lineHeight: 1.05, margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          ¡Gracias por participar!
        </motion.p>
      </motion.div>

      {/* "Obtuviste X puntos" — entra desde la derecha */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden', marginTop: 'min(2vw, 1.1vh)' }}>
        <motion.p
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: 0, opacity: [1, 0.75, 1] }}
          transition={{
            x:       { delay: 0.32, type: 'spring', stiffness: 170, damping: 22 },
            opacity: { delay: 1.6, duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(5.9vw, 3.3vh)',
            color: '#00577a',
            margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          Obtuviste {cat?.score ?? 0} puntos
        </motion.p>
      </motion.div>

      <div style={{ flex: '0.45' }} />

      {/* Card QR — escala + pulso de sombra vivo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: [
            '0 12px 40px rgba(0,87,122,0.22)',
            '0 16px 55px rgba(0,87,122,0.42)',
            '0 12px 40px rgba(0,87,122,0.22)',
          ],
        }}
        transition={{
          opacity:    { delay: 0.42, duration: 0.35 },
          scale:      { delay: 0.42, type: 'spring', stiffness: 220 },
          boxShadow:  { delay: 1.2, duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          flexShrink: 0,
          width: 'min(68vw, 38vh)',
          aspectRatio: '1',
          background: 'white',
          borderRadius: 'min(4.5vw, 2.5vh)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <img
          src="/assets/ui/qr-code.png"
          alt="QR"
          style={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      <div style={{ flex: '0.35' }} />

      {/* "Escaneando..." — entra desde la izquierda */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden' }}>
        <motion.p
          initial={{ x: '-110%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.58, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.5vw, 2.5vh)',
            color: '#00577a',
            margin: 0, lineHeight: 1.4,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.03em',
          }}
        >
          Escaneando el siguiente código QR{' '}
          <strong>10% descuento</strong>
        </motion.p>
      </motion.div>

      <div style={{ flex: '0.2' }} />

      {/* "Válido en..." — entra desde la derecha */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden' }}>
        <motion.p
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.72, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.5vw, 2.5vh)',
            color: '#00577a',
            margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.03em',
          }}
        >
          Válido en productos Nutre Cat
        </motion.p>
      </motion.div>

      <div style={{ flex: '0.35' }} />

      {/* Botón ver postal */}
      {onShare && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, type: 'spring', stiffness: 200 }}
          onClick={onShare}
          style={{
            flexShrink: 0,
            background: '#00577a',
            color: 'white', border: 'none',
            borderRadius: 99,
            padding: 'min(2.8vw, 1.6vh) min(9vw, 5vh)',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(5vw, 2.8vh)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 6px 22px rgba(0,87,122,0.3)',
          }}
        >
          📮 Ver mi postal campeón
        </motion.button>
      )}

      <div style={{ flex: '0.28' }} />

      {/* Countdown circular */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'min(1vw, 0.5vh)',
          paddingBottom: 'min(3vw, 1.7vh)',
        }}
      >
        <div
          onClick={onNext}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1vw, 0.5vh)', cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', width: 88, height: 88 }}>
            <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={44} cy={44} r={RADIUS} fill="none" stroke="rgba(0,87,122,0.18)" strokeWidth={6} />
              <circle
                cx={44} cy={44} r={RADIUS}
                fill="none" stroke="#00577a" strokeWidth={6} strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${CIRCUMFERENCE}`}
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', lineHeight: 1 }}>
                {secs}
              </span>
            </div>
          </div>

          {/* "Toca para volver" — respira */}
          <motion.span
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(3.2vw, 1.8vh)',
              color: '#00577a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Toca para volver al inicio
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
