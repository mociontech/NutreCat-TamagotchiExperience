import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { onStart: () => void; }

export default function AttractLoop({ onStart }: Props) {
  const [tap, setTap] = useState(0); // 0=peeking, 1=half-out, 2=full-out

  useEffect(() => {
    if (tap === 2) {
      const t = setTimeout(onStart, 1500);
      return () => clearTimeout(t);
    }
  }, [tap, onStart]);

  const handleTap = () => {
    if (tap < 2) setTap(t => t + 1);
  };

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%',
        height: '100%',
        background: '#00b6ed',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* ── LOGO
          Figma inset: top 5.52% / right 27.96% / bottom 76.75% / left 27.97%
      ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '5.52%', right: '27.96%', bottom: '76.75%', left: '27.97%',
      }}>
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="Nutre Cat Premium"
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* ── TÍTULO
          Figma: top 27.97%, font 145px / frame 1080px → 13.43vw
          min() para que escale bien en landscape (desarrollo)
      ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '27.97%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '86.76%',
        textAlign: 'center',
        lineHeight: 0.88,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(13.43vw, 7.55vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: 'min(0.27vw, 0.15vh)',
          margin: 0,
        }}>El Verdadero</p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(13.43vw, 7.55vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: 'min(0.27vw, 0.15vh)',
          margin: 0,
        }}>Talento Nutrecat</p>
      </div>

      {/* ── SUBTÍTULO
          Figma: top 41.98%, font 66px / 1080px → 6.11vw
      ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '41.98%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '67.04%',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'min(6.11vw, 3.44vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: 'min(0.3vw, 0.17vh)',
          fontWeight: 700,
          lineHeight: 1.25,
          margin: 0,
        }}>
          Cuida a tu gato y hazlo feliz con Nutrecat
        </p>
      </div>

      {/* ── GATO — 3 estados
          Solo cambia la imagen y su posición vertical.
          El resto de la pantalla permanece igual.
          Figma cat position: left 6.76% / top 69.74% / width 89.07%
      ──────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {tap === 0 && (
          // Estado 0: gato apenas asomándose en la caja
          <motion.img
            key="state-0"
            src="/assets/cat/cat-box-hidden.png"
            alt=""
            draggable={false}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            style={{
              position: 'absolute',
              left: '6.76%',
              top: '69.74%',
              width: '89.07%',
              height: 'auto',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}

        {tap === 1 && (
          // Estado 1: gato medio saliendo — misma imagen subida 12% para revelar más cuerpo
          <motion.img
            key="state-1"
            src="/assets/cat/cat-box-hidden.png"
            alt=""
            draggable={false}
            initial={{ top: '69.74%', opacity: 0 }}
            animate={{ top: '57.74%', opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '6.76%',
              width: '89.07%',
              height: 'auto',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}

        {tap === 2 && (
          // Estado 2: gato saliendo de la caja — "3 1" del Figma
          <motion.img
            key="state-2"
            src="/assets/cat/cat-box-out.png"
            alt="Simón"
            draggable={false}
            initial={{ y: '10%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '6.76%',
              top: '55%',
              width: '89.07%',
              height: 'auto',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── MANO
          Figma: inset top 67.45% / right 69.99% / bottom 12.89% / left -9.81%
          Rotate: -27.14deg
          Tamaño natural SVG en Figma: 360.612 × 239.336px en frame 1080px
          Escalado: 360.612/1080 = 33.39% de frame width → min(33.39vw, 18.78vh)
          height: auto para no distorsionar
      ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {tap < 2 && (
          <motion.div
            key="hand"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{
              position: 'absolute',
              top: '67.45%',
              right: '69.99%',
              bottom: '12.89%',
              left: '-9.81%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <motion.img
              src="/assets/ui/hand-pointer.svg"
              alt=""
              draggable={false}
              animate={{
                x: [0, 20, 0, 20, 0],
                y: [0, -13, 0, -13, 0],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
                times: [0, 0.35, 0.5, 0.65, 1],
              }}
              style={{
                /* Ancho natural del SVG escalado al frame:
                   360.612 / 1080 × 100vw = 33.39vw
                   En landscape: 33.39 × 9/16 = 18.78vh */
                width: 'min(33.39vw, 18.78vh)',
                height: 'auto',          // ← respeta el aspect ratio, sin distorsión
                rotate: '-27.14deg',
                transformOrigin: 'bottom right',
                flexShrink: 0,
                userSelect: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}