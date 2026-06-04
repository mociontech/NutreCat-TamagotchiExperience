import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { CatState } from '../data/gameStates';

const TOTAL_SECS   = 20;
const RADIUS       = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Logo con shimmer diagonal + respiración de brillo */
function ShimmerLogo({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <motion.img
        src="/assets/ui/logo-nutre-cat.svg"
        alt="Nutre Cat"
        animate={{ filter: ['brightness(1)', 'brightness(1.22)', 'brightness(1)'] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {/* Clip solo en el shimmer, no en el logo */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{ x: ['-140%', '200%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-20%', bottom: '-20%',
            width: '55%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)',
          }}
        />
      </div>
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
      backgroundImage: 'url(/assets/backgrounds/bg-ptFinal.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      position: 'relative', overflow: 'hidden',
      padding: '0 9%',
      paddingTop: '22%',   /* deja espacio al logo del fondo */
      paddingBottom: '2%',
      boxSizing: 'border-box',
    }}>

      {/* "¡Gracias por participar!" */}
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
            fontSize: 'min(8.5vw, 4.6vh)',
            color: '#00577a',
            lineHeight: 1.05, margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            wordBreak: 'break-word',
            textShadow: '0 2px 8px rgba(255,255,255,0.5)',
          }}
        >
          ¡Gracias por participar!
        </motion.p>
      </motion.div>

      {/* "Obtuviste X puntos" */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden', marginTop: 'min(1.5vw, 0.8vh)' }}>
        <motion.p
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: 0, opacity: [1, 0.75, 1] }}
          transition={{
            x:       { delay: 0.32, type: 'spring', stiffness: 170, damping: 22 },
            opacity: { delay: 1.6, duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(5.2vw, 2.9vh)',
            color: '#00577a',
            margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.04em',
            textShadow: '0 2px 6px rgba(255,255,255,0.45)',
          }}
        >
          Obtuviste {cat?.score ?? 0} puntos
        </motion.p>
      </motion.div>

      <div style={{ flex: '0.4' }} />

      {/* Card QR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{
          opacity: 1, scale: 1,
          boxShadow: [
            '0 12px 40px rgba(0,87,122,0.22)',
            '0 16px 55px rgba(0,87,122,0.42)',
            '0 12px 40px rgba(0,87,122,0.22)',
          ],
        }}
        transition={{
          opacity:   { delay: 0.42, duration: 0.35 },
          scale:     { delay: 0.42, type: 'spring', stiffness: 220 },
          boxShadow: { delay: 1.2, duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          flexShrink: 0,
          width: 'min(48vw, 27vh)',
          aspectRatio: '1',
          background: 'white',
          borderRadius: 'min(4.5vw, 2.5vh)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <img
          src="/assets/backgrounds/QR.png"
          alt="QR"
          style={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      <div style={{ flex: '0.3' }} />

      {/* "Escaneando..." */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden' }}>
        <motion.p
          initial={{ x: '-110%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.58, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.2vw, 2.3vh)',
            color: '#00577a',
            margin: 0, lineHeight: 1.35,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.03em',
            textShadow: '0 1px 5px rgba(255,255,255,0.4)',
          }}
        >
          Escaneando el siguiente código QR{' '}
          <strong>10% descuento</strong>
        </motion.p>
      </motion.div>

      {/* "Válido en..." */}
      <motion.div style={{ flexShrink: 0, width: '100%', overflow: 'hidden', marginTop: 'min(1vw, 0.55vh)' }}>
        <motion.p
          initial={{ x: '110%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.72, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4.2vw, 2.3vh)',
            color: '#00577a',
            margin: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: '0.03em',
            textShadow: '0 1px 5px rgba(255,255,255,0.4)',
          }}
        >
          Válido en productos Nutre Cat
        </motion.p>
      </motion.div>

      <div style={{ flex: 1 }} />

      {/* Countdown circular */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'min(0.8vw, 0.45vh)',
          paddingBottom: 'min(2vw, 1.1vh)',
        }}
      >
        <div
          onClick={onNext}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(0.8vw, 0.45vh)', cursor: 'pointer' }}
        >
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={RADIUS - 4} fill="none" stroke="rgba(0,87,122,0.18)" strokeWidth={5} />
              <circle
                cx={36} cy={36} r={RADIUS - 4}
                fill="none" stroke="#00577a" strokeWidth={5} strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * (secs / TOTAL_SECS) * 0.82} ${CIRCUMFERENCE * 0.82}`}
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: '#00577a', lineHeight: 1 }}>
                {secs}
              </span>
            </div>
          </div>

          <motion.span
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(3vw, 1.65vh)',
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
