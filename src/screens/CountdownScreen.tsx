import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props { onDone: () => void; }

export default function CountdownScreen({ onDone }: Props) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo inicio */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/assets/backgrounds/bg-Inicio.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        pointerEvents: 'none',
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

      {/* Timer pill — izquierda, debajo del logo */}
      <div style={{
        position: 'absolute',
        left: '29.81%', top: '21.93%',
        width: '40.37%',
        zIndex: 2,
        background: '#00577a',
        borderRadius: 99,
        padding: 'min(2vw, 1.1vh) min(4vw, 2.2vh)',
        display: 'flex', alignItems: 'center', gap: 'min(2.5vw, 1.4vh)',
        boxShadow: '0 4px 20px rgba(0,87,122,0.4)',
      }}>
        {/* wrapper necesario: el SVG tiene overflow:visible */}
        <div style={{ width: 'min(5vw, 2.8vh)', height: 'min(5vw, 2.8vh)', flexShrink: 0, overflow: 'hidden' }}>
          <img src="/assets/ui/icon-clock.svg" alt=""
            style={{ width: '100%', height: '100%', filter: 'brightness(0) invert(1)', display: 'block' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(10.7vw, 6vh)',
          color: 'white',
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}>00:30</span>
      </div>

      {/* Número de cuenta regresiva — centro desplazado al 55% (igual Figma top:calc(50%+89px)) */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: '9%',
        zIndex: 1,
      }}>
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(65vw, 36.5vh)',
              color: 'white',
              lineHeight: 1,
              textShadow: '0 8px 60px rgba(0,87,122,0.4)',
              userSelect: 'none',
            }}
          >
            {count > 0 ? count : '¡YA!'}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
