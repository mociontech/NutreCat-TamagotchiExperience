import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../utils/sounds';

interface Props { onStart: () => void; }

const VIDEO_SRC = '/assets/cat/Animation/caja.webm';

export default function AttractLoop({ onStart }: Props) {
  const [playing,   setPlaying]   = useState(false);
  const [loadPct,   setLoadPct]   = useState(0);
  const [ready,     setReady]     = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const tappedRef = useRef(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Si ya está listo (video liviano cacheado), marcar inmediatamente
    if (v.readyState >= 4) {
      setLoadPct(100);
      setReady(true);
      return;
    }

    const onProgress = () => {
      if (v.duration && v.buffered.length > 0) {
        const pct = Math.min((v.buffered.end(v.buffered.length - 1) / v.duration) * 100, 100);
        setLoadPct(pct);
      }
    };
    const onReady = () => { setLoadPct(100); setReady(true); };

    v.addEventListener('progress', onProgress);
    v.addEventListener('canplaythrough', onReady);
    // No llamar v.load() — evita abortar un play() en progreso
    return () => {
      v.removeEventListener('progress', onProgress);
      v.removeEventListener('canplaythrough', onReady);
    };
  }, []);

  const handleTap = () => {
    if (tappedRef.current) return;
    tappedRef.current = true;
    sfx('meow', 0.35);
    setPlaying(true);
    videoRef.current?.play().catch(() => {});
  };

  const handleEnded = () => { onStart(); };

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      {/* ── Fondo ── */}
      <img src="/assets/backgrounds/bg-Inicio.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── LOGO ── */}
      <div style={{ position: 'absolute', top: '5.52%', right: '27.96%', bottom: '76.75%', left: '27.97%' }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat Premium" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
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

      {/* ── GATO — video al tocar ── */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        preload="auto"
        muted
        playsInline
        onEnded={handleEnded}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '7.81%',
          transform: 'translateX(-50%)',
          width: '69.5%',
          height: 'auto',
          pointerEvents: 'none',
          userSelect: 'none',
          objectFit: 'contain',
          objectPosition: 'bottom',
        }}
      />

      {/* ── Barra de carga del video ── */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            style={{
              position: 'absolute',
              bottom: '5%',
              left: '15%', right: '15%',
              zIndex: 10,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.5vw, 0.85vh)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(3.5vw, 2vh)',
              color: '#00577a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Cargando... {Math.round(loadPct)}%
            </span>
            <div style={{ width: '100%', height: 'min(1.2vw, 0.68vh)', background: 'rgba(0,87,122,0.2)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${loadPct}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ height: '100%', background: '#00577a', borderRadius: 99 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MANO — desaparece al tocar ── */}
      <AnimatePresence>
        {!playing && (
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
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.5, 0.65, 1] }}
              style={{ width: 'min(26.71vw, 15.02vh)', height: 'min(17.73vw, 9.98vh)', rotate: '-27.14deg', flexShrink: 0 }}
            >
              <img src="/assets/ui/hand-pointer.svg" alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
