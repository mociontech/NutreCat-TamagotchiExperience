import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx, bgPlay, bgStop } from '../utils/sounds';

interface Props { onStart: () => void; }

// 28 frames: frame-02.png → frame-29.png
const FRAMES = Array.from({ length: 28 }, (_, i) =>
  `/assets/cat/box-sprite/frame-${String(i + 2).padStart(2, '0')}.png`
);


/* Logo con shimmer + respiración de brillo */
function ShimmerLogo({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <motion.img
        src={src}
        alt={alt}
        draggable={false}
        animate={{ filter: ['brightness(1)', 'brightness(1.22)', 'brightness(1)'] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
      <motion.div
        animate={{ x: ['-140%', '200%'] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          top: '-20%', bottom: '-20%', width: '55%',
          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export default function AttractLoop({ onStart }: Props) {
  const [frameIdx,  setFrameIdx]  = useState(0);
  const [animating, setAnimating] = useState(false);
  const animRef = useRef(false);

  // Precarga de todos los sprites
  useEffect(() => {
    FRAMES.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  // Música de fondo
  useEffect(() => {
    bgPlay('musicbox', 0.08);
    return () => bgStop('musicbox');
  }, []);


  // Al tocar: reproduce todos los frames y navega al final
  const handleTap = () => {
    if (animRef.current) return;
    animRef.current = true;
    sfx('meow', 0.8);
    setAnimating(true);
    let f = 0;
    const t = setInterval(() => {
      f++;
      if (f >= FRAMES.length) {
        clearInterval(t);
        setTimeout(onStart, 350);
        return;
      }
      setFrameIdx(f);
    }, 72); // ~14 fps → animación completa en ~2s
  };

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%', height: '100%',
        backgroundImage: 'url(/assets/backgrounds/FondoPT1.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* ── LOGO ── */}
      <div style={{ position: 'absolute', top: '5.52%', right: '27.96%', bottom: '76.75%', left: '27.97%' }}>
        <ShimmerLogo src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat Premium" style={{ width: '100%', height: '100%' }} />
      </div>

      {/* ── TÍTULO ── */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ delay: 1.8, duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '27.97%', left: '50%', x: '-50%', width: '86.76%', textAlign: 'center', lineHeight: 0.88 }}
      >
        <motion.p
          initial={{ x: '-115%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 160, damping: 22 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'min(13.43vw, 7.55vh)', color: '#00577a', textTransform: 'uppercase', letterSpacing: 'min(0.27vw, 0.15vh)', margin: 0 }}
        >
          El Verdadero
        </motion.p>
        <motion.p
          initial={{ x: '115%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.42, type: 'spring', stiffness: 160, damping: 22 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'min(13.43vw, 7.55vh)', color: '#00577a', textTransform: 'uppercase', letterSpacing: 'min(0.27vw, 0.15vh)', margin: 0 }}
        >
          Talento Nutrecat
        </motion.p>
      </motion.div>

      {/* ── SUBTÍTULO ── */}
      <motion.div style={{ position: 'absolute', top: '41.98%', left: '50%', x: '-50%', width: '67.04%', textAlign: 'center' }}>
        <motion.p
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: [1, 0.72, 1] }}
          transition={{
            y:       { delay: 0.68, type: 'spring', stiffness: 140, damping: 18 },
            opacity: { delay: 0.68, duration: 3.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] },
          }}
          style={{ fontFamily: 'var(--font-body)', fontSize: 'min(6.11vw, 3.44vh)', color: '#00577a', textTransform: 'uppercase', letterSpacing: 'min(0.3vw, 0.17vh)', fontWeight: 700, lineHeight: 1.25, margin: 0 }}
        >
          Cuida a tu gato y hazlo feliz con Nutrecat
        </motion.p>
      </motion.div>

      {/* ── SPRITE — gato saliendo de la caja ── */}
      <img
        src={FRAMES[frameIdx]}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          left: '6.76%',
          bottom: 0,
          width: '89.07%',
          height: 'auto',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {/* ── MANO — desaparece al iniciar animación ── */}
      <AnimatePresence>
        {!animating && (
          <motion.div
            key="hand"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{
              position: 'absolute',
              top: '67.45%', right: '69.99%', bottom: '12.89%', left: '-9.81%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              animate={{ x: [0, 20, 0, 20, 0], y: [0, -13, 0, -13, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.5, 0.65, 1] }}
              style={{ width: 'min(33.39vw, 18.78vh)', height: 'min(22.16vw, 12.47vh)', rotate: '-27.14deg', flexShrink: 0 }}
            >
              <img src="/assets/ui/hand-pointer.svg" alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
