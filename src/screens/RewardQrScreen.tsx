import { motion } from 'framer-motion';
import { useEffect } from 'react';
import type { CatState } from '../data/gameStates';

interface Props { cat?: CatState; onNext: () => void; }

export default function RewardQrScreen({ cat, onNext }: Props) {
  useEffect(() => {
    const t = setTimeout(onNext, 20000);
    return () => clearTimeout(t);
  }, [onNext]);

  return (
    <div
      onClick={onNext}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
        padding: '0 9%',
        boxSizing: 'border-box',
      }}
    >
      {/* Logo — ocupa el 17.73% superior */}
      <div style={{
        flexShrink: 0,
        width: '44.07%',
        paddingTop: '8.23%',
        paddingBottom: 0,
      }}>
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="Nutre Cat"
          style={{ width: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>

      {/* Espaciador */}
      <div style={{ flex: '0.8' }} />

      {/* "¡Gracias por participar!" */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
        style={{
          flexShrink: 0,
          width: '100%',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(9.5vw, 5.35vh)',
          color: '#00577a',
          lineHeight: 1.05,
          margin: 0,
          textTransform: 'uppercase',
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        ¡Gracias por participar!
      </motion.p>

      {/* "Obtuviste X puntos" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          flexShrink: 0,
          width: '100%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(5.9vw, 3.3vh)',
          color: '#00577a',
          margin: 'min(2vw, 1.1vh) 0 0',
          textTransform: 'uppercase',
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}
      >
        Obtuviste {cat?.score ?? 0} puntos
      </motion.p>

      {/* Espaciador */}
      <div style={{ flex: '0.6' }} />

      {/* Card blanca con QR */}
      <div style={{ flexShrink: 0 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 220 }}
          style={{
            width: 'min(37vw, 20.9vh)',
            aspectRatio: '1',
            background: 'white',
            borderRadius: 'min(4.5vw, 2.5vh)',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,87,122,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img
            src="/assets/ui/qr-code.png"
            alt="QR"
            style={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }}
          />
        </motion.div>
      </div>

      {/* Espaciador */}
      <div style={{ flex: '0.5' }} />

      {/* "escaneando el siguiente código QR 10% descuento" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        style={{
          flexShrink: 0,
          width: '100%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(4.5vw, 2.5vh)',
          color: '#00577a',
          margin: 0,
          lineHeight: 1.4,
          textTransform: 'uppercase',
          textAlign: 'center',
          letterSpacing: '0.03em',
        }}
      >
        Escaneando el siguiente código QR{' '}
        <strong>10% descuento</strong>
      </motion.p>

      {/* Espaciador */}
      <div style={{ flex: '0.4' }} />

      {/* "Válido en productos Nutre Cat" */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.65 }}
        style={{
          flexShrink: 0,
          width: '100%',
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

      {/* Tap hint */}
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          flexShrink: 0,
          paddingBottom: 'min(3vw, 1.7vh)',
          paddingTop: 'min(2vw, 1.1vh)',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(3.5vw, 2vh)',
          color: '#00577a',
          opacity: 0.6,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        Toca para volver al inicio
      </motion.p>
    </div>
  );
}
