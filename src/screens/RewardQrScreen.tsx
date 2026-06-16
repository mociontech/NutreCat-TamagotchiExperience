import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { CatState } from '../data/gameStates';

const TOTAL_SECS = 20;
const R = 26;
const CIRCUM = 2 * Math.PI * R;

interface Props { cat?: CatState; onNext: () => void; }

export default function RewardQrScreen({ onNext }: Props) {
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

  const dash = CIRCUM * (secs / TOTAL_SECS);

  return (
    <div
      onClick={onNext}
      style={{ width: '100%', height: '100%', background: '#00b6ed', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Fondo */}
      <img src="/assets/backgrounds/bg-Inicio.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 0 }} />

      {/* Logo — inset top 8.23% left 27.97% right 27.96% bottom 74.04% */}
      <div style={{ position: 'absolute', top: '8.23%', left: '27.97%', right: '27.96%', bottom: '74.04%', zIndex: 1 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="NutreCat Premium"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
      </div>

      {/* ¡Gracias por participar! — canvas 163px, center (50%, 37.45%), w 81.67% */}
      <div style={{ position: 'absolute', left: '50%', top: '37.45%', transform: 'translate(-50%, -50%)', width: '81.67%', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(15.09vw, 8.49vh)',
            color: '#00577a',
            textAlign: 'center',
            lineHeight: 0.866,
            margin: 0,
          }}
        >
          ¡Gracias por participar!
        </motion.p>
      </div>

      {/* 10% — canvas 258px, center (31.11%, 54.94%), w 32.96% */}
      <motion.p
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.22, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: '14.63%', top: '53.38%',
          transform: 'translateY(-50%)',
          width: '32.96%',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(23.94vw, 13.47vh)',
          color: '#00577a',
          textAlign: 'center',
          lineHeight: 1,
          margin: 0, zIndex: 1,
        }}
      >
        10%
      </motion.p>

      {/* GANASTE DE DESCUENTO — canvas 82px, center (65.23%, 53.46%), w 37.5% */}
      <motion.p
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.28, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: '46.48%', top: '51.90%',
          transform: 'translateY(-50%)',
          width: '37.5%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(7.59vw, 4.27vh)',
          color: '#00577a',
          textAlign: 'center',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          margin: 0, zIndex: 1,
        }}
      >
        GANASTE DE DESCUENTO
      </motion.p>

      {/* Tarjeta blanca QR — top-left (52.13%, 62.46%), size 30.83%×18.16% */}
      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          position: 'absolute',
          left: '52.13%', top: '62.46%',
          width: '30.83%', height: '18.16%',
          background: 'white',
          borderRadius: 'min(5.74vw, 3.23vh)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}
      >
        <img src="/assets/backgrounds/QR.png" alt="QR"
          style={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }} />
      </motion.div>

      {/* REDÍMELO CON ESTE CÓDIGO PROMOCIONAL NUTRECATPLAY
          left 16.48%, top 64.43%, width 31.02%, text-align right */}
      <motion.p
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.36, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: '16.48%', top: '64.43%',
          width: '31.02%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(5.56vw, 3.13vh)',
          color: 'white',
          textAlign: 'right',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: 1.3,
          margin: 0, zIndex: 1,
        }}
      >
        REDÍMELO CON ESTE CÓDIGO PROMOCIONAL{' '}
        <br />NUTRECATPLAY
      </motion.p>

      {/* LUGAR: PLAZACAMPO.COM — center (50%, 87.42%), w 74.26% */}
      <div style={{ position: 'absolute', left: '50%', top: '87.42%', transform: 'translate(-50%, -50%)', width: '74.26%', zIndex: 1 }}>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 160, damping: 22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(5.56vw, 3.13vh)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            margin: 0,
          }}
        >
          LUGAR: PLAZACAMPO.COM
        </motion.p>
      </div>

      {/* Countdown — esquina inferior, toca para volver */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          position: 'absolute',
          bottom: '1.5%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 'min(0.5vw, 0.28vh)',
          zIndex: 3,
        }}
      >
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <svg width={52} height={52} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={26} cy={26} r={R - 3} fill="none" stroke="rgba(0,87,122,0.18)" strokeWidth={4} />
            <circle
              cx={26} cy={26} r={R - 3}
              fill="none" stroke="#00577a" strokeWidth={4} strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRCUM}`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(4vw, 2.25vh)', color: '#00577a', lineHeight: 1 }}>
              {secs}
            </span>
          </div>
        </div>
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(2.5vw, 1.4vh)',
            color: '#00577a',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Toca para volver al inicio
        </motion.span>
      </motion.div>
    </div>
  );
}
