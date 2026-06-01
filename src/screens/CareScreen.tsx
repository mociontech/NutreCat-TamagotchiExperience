import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { sfx, sfxStop } from '../utils/sounds';

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   label: 'Hablar', icon: '/assets/nav/icon-sleep.svg'   },
] as const;

interface Bubble { id: number; x: number; y: number; size: number; dx: number; }

interface Props { onDone: () => void; onBack?: () => void; score?: number; }

export default function CareScreen({ onDone, onBack, score = 0 }: Props) {
  const handleDone = () => { sfxStop('purr'); onDone(); };
  const [cleanness,   setCleanness]   = useState(0);
  const [scrubbing,   setScrubbing]   = useState(false);
  const [sponge,      setSponge]      = useState<{ x: number; y: number } | null>(null);
  const [bubbles,     setBubbles]     = useState<Bubble[]>([]);
  const cleanRef  = useRef(0);
  const lastPos   = useRef<{ x: number; y: number } | null>(null);
  const bubbleId  = useRef(0);
  const goBack    = onBack ?? onDone;
  const done = cleanness >= 100;

  useEffect(() => {
    if (done) sfx('purr', 0.85);
  }, [done]);

  /* ── Spawn foam bubbles at pointer position ─────────────── */
  const spawnBubbles = useCallback((x: number, y: number) => {
    const count = 2 + Math.floor(Math.random() * 3);
    const fresh: Bubble[] = Array.from({ length: count }, () => ({
      id:   bubbleId.current++,
      x:    x + (Math.random() - 0.5) * 70,
      y:    y + (Math.random() - 0.5) * 50,
      size: 7 + Math.random() * 18,
      dx:   (Math.random() - 0.5) * 50,
    }));
    setBubbles(prev => [...prev.slice(-30), ...fresh]);
    fresh.forEach(b => setTimeout(() =>
      setBubbles(prev => prev.filter(bb => bb.id !== b.id)), 1300));
  }, []);

  /* ── Pointer handlers ────────────────────────────────────── */
  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setScrubbing(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    setSponge({ x: e.clientX, y: e.clientY });
  };

  const spongeThrottle = useRef(0);

  const onMove = (e: React.PointerEvent) => {
    setSponge({ x: e.clientX, y: e.clientY });
    if (!scrubbing || done) return;
    const prev = lastPos.current;
    if (!prev) { lastPos.current = { x: e.clientX, y: e.clientY }; return; }
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 4) {
      const gain = Math.min(dist * 0.12, 0.8);
      const next  = Math.min(100, cleanRef.current + gain);
      cleanRef.current = next;
      setCleanness(next);
      spawnBubbles(e.clientX, e.clientY);
      lastPos.current = { x: e.clientX, y: e.clientY };
      // Sonido de esponja throttled cada 600ms
      const now = Date.now();
      if (now - spongeThrottle.current > 600) {
        sfx('sponge', 0.6);
        spongeThrottle.current = now;
      }
    }
  };

  const onUp   = () => { setScrubbing(false); lastPos.current = null; };
  const onLeave = (e: React.PointerEvent) => {
    setScrubbing(false);
    setSponge(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onLeave}
      onPointerCancel={onUp}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
      }}
    >
      {/* ── Escena de la bañera ── */}
      {/* Posición Figma: left=-19.07%, top=24.43%, w=138.15%, h=80.73% */}
      <div style={{ position: 'absolute', left: '-19.07%', top: '24.43%', width: '138.15%', height: '80.73%', pointerEvents: 'none' }}>
        {/* Gato sucio → se va desvaneciendo */}
        <img
          src="/assets/cat/cat-bath-dirty.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: Math.max(0, 1 - cleanness / 100), transition: 'opacity 0.3s' }}
        />
        {/* Gato limpio → aparece */}
        <img
          src="/assets/cat/cat-bath-clean.png"
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: cleanness / 100, transition: 'opacity 0.3s' }}
        />
      </div>

      {/* ── Logo ── */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 3 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Score pill ── */}
      <div style={{ position: 'absolute', top: '5%', right: '9%', zIndex: 3, background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Puntos: {score}
        </span>
      </div>

      {/* ── Back arrow ── */}
      <button onClick={goBack} style={{ position: 'absolute', top: '12.29%', right: '9.63%', width: 'min(9vw, 5.1vh)', aspectRatio: '1', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/assets/ui/arrow-back.svg" alt="Volver" style={{ width: '55%', filter: 'brightness(0) invert(1)' }} />
      </button>

      {/* ── Barra de limpieza ── */}
      <div style={{ position: 'absolute', top: '20%', left: '9%', right: '9%', zIndex: 4, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'min(1vw, 0.55vh)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
            Limpieza
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', letterSpacing: '0.04em', opacity: 0.9 }}>
            {Math.round(cleanness)}%
          </span>
        </div>
        <div style={{ height: 'min(4.5vw, 2.5vh)', background: 'rgba(255,255,255,0.25)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 2px 6px rgba(0,87,122,0.2)' }}>
          <motion.div
            animate={{ width: `${cleanness}%` }}
            transition={{ duration: 0.12 }}
            style={{ height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.7), white)', borderRadius: 99, boxShadow: '0 0 14px rgba(255,255,255,0.7)' }}
          />
        </div>
      </div>

      {/* ── Instrucción ── */}
      {!done && (
        <motion.p
          animate={{ opacity: scrubbing ? 0 : [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: '20%', left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(4.5vw, 2.5vh)',
            color: 'white',
            textShadow: '0 2px 8px rgba(0,87,122,0.4)',
            pointerEvents: 'none', zIndex: 4,
          }}
        >
          ¡Frota la esponja sobre el gato!
        </motion.p>
      )}

      {/* ── Estrellas / celebración al quedar limpio ── */}
      <AnimatePresence>
        {done && [...Array(8)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            initial={{ opacity: 0, scale: 0, x: '50%', y: '40%' }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.4, 0],
              x: `${30 + Math.cos(i / 8 * Math.PI * 2) * 35}%`,
              y: `${35 + Math.sin(i / 8 * Math.PI * 2) * 25}%`,
            }}
            transition={{ duration: 1.5, delay: i * 0.12, repeat: Infinity, repeatDelay: 0.5 }}
            style={{ position: 'absolute', fontSize: 'min(6vw, 3.4vh)', pointerEvents: 'none', zIndex: 5 }}
          >✨</motion.div>
        ))}
      </AnimatePresence>

      {/* ── Botón ¡Listo! ── */}
      <AnimatePresence>
        {done && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1, y: 0, scale: 1,
              boxShadow: ['0 0 20px rgba(0,87,122,0.3)', '0 0 50px rgba(0,87,122,0.7)', '0 0 20px rgba(0,87,122,0.3)'],
            }}
            transition={{ duration: 0.35, boxShadow: { duration: 1.6, repeat: Infinity } }}
            onClick={handleDone}
            style={{
              position: 'absolute', bottom: '24%', left: '50%',
              transform: 'translateX(-50%)',
              background: '#00577a', color: 'white',
              border: 'none', borderRadius: 99,
              padding: 'min(2.8vw, 1.6vh) min(10vw, 5.6vh)',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.5vw, 3.6vh)',
              textTransform: 'uppercase',
              cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 6,
            }}
          >
            ¡Listo! 🛁
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Nav botones circulares ── */}
      <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 3 }}>
        {NAV.map(item => {
          const isActive = item.id === 'hygiene';
          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)', flexShrink: 0 }}>
              <motion.button onClick={goBack} whileTap={{ scale: 0.88 }}
                style={{ width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isActive ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <img src={item.icon} alt="" style={{ width: '54%', height: '54%', objectFit: 'contain', filter: isActive ? 'none' : 'brightness(0) invert(1)' }} />
              </motion.button>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.4vw, 1.9vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: isActive ? 1 : 0.75, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {isActive ? '✓ ' : ''}{item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Espuma — burbujas CSS ── */}
      <AnimatePresence>
        {bubbles.map(b => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0.85, scale: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, scale: 1.6, y: -65, x: b.dx }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              left:  b.x - b.size / 2,
              top:   b.y - b.size / 2,
              width: b.size, height: b.size,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.88)',
              border: '1.5px solid rgba(255,255,255,0.55)',
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
              pointerEvents: 'none', zIndex: 90,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Esponja — sigue el puntero ── */}
      {sponge && !done && (
        <motion.div
          animate={scrubbing
            ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1] }
            : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.3, repeat: scrubbing ? Infinity : 0 }}
          style={{
            position: 'fixed',
            left: sponge.x, top: sponge.y,
            transform: 'translate(-50%, -50%)',
            width: 'min(18vw, 10.2vh)', height: 'min(18vw, 10.2vh)',
            pointerEvents: 'none', zIndex: 80,
            filter: 'drop-shadow(0 4px 12px rgba(0,87,122,0.4))',
          }}
        >
          {/* wrapper necesario: el SVG tiene overflow:visible */}
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '4px' }}>
            <img src="/assets/ui/sponge.svg" alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
