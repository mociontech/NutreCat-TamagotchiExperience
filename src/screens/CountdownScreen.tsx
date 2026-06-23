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
        left: '35.87%', top: '21.93%',
        width: '28.26%',
        zIndex: 2,
        background: '#00577a',
        borderRadius: 99,
        padding: 'min(1.4vw, 0.77vh) min(4vw, 2.2vh)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,87,122,0.4)',
        boxSizing: 'border-box',
      }}>
        {/* wrapper necesario: el SVG tiene overflow:visible */}
        <div style={{ position: 'absolute', left: 'min(3vw, 1.7vh)', top: '50%', transform: 'translateY(-50%)', width: 'min(5.46vw, 3.06vh)', height: 'min(5.46vw, 3.06vh)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/assets/ui/icon-clock.svg" alt=""
            style={{ width: '100%', height: '100%', filter: 'brightness(0) invert(1)', display: 'block' }} />
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(7.92vw, 4.44vh)',
          color: 'white',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          paddingTop: '0.08em',
          transform: 'translate(35px, 3px)',
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
