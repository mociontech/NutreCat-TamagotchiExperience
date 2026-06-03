import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback, useEffect } from 'react';
import { sfx, sfxStop, bgPlay, bgStop } from '../utils/sounds';

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   label: 'Dormir', icon: '/assets/nav/icon-sleep.svg'   },
] as const;

type Phase = 'scrub' | 'rinse' | 'done';
interface Bubble   { id: number; x: number; y: number; size: number; dx: number; }
interface FoamSpot { id: number; x: number; y: number; size: number; opacity: number; blur: number; }
interface Props    { onDone: () => void; onBack?: () => void; score?: number; }

const MAX_FOAM     = 220;
const RINSE_RADIUS = 60;
const FOAM_SPACING = 9;

export default function CareScreen({ onDone, onBack, score = 0 }: Props) {
  const handleDone = () => { sfxStop('purr'); onDone(); };
  const [phase,          setPhase]          = useState<Phase>('scrub');
  const [soapPct,        setSoapPct]        = useState(0);
  const [foamSpots,      setFoamSpots]      = useState<FoamSpot[]>([]);
  const [interacting,    setInteracting]    = useState(false);
  const [pointer,        setPointer]        = useState<{ x: number; y: number } | null>(null);
  const [bubbles,        setBubbles]        = useState<Bubble[]>([]);
  const [showRinseTip,   setShowRinseTip]   = useState(false);

  const soapRef        = useRef(0);
  const phaseRef       = useRef<Phase>('scrub');
  const interactingRef = useRef(false);
  const initFoam       = useRef(0);
  const lastPos        = useRef<{ x: number; y: number } | null>(null);
  const lastFoamPos    = useRef<{ x: number; y: number } | null>(null);
  const bubbleId       = useRef(0);
  const foamId         = useRef(0);
  const goBack         = onBack ?? onDone;

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Rinse progress 0→1 as foam is cleared
  const rinseProgress = phase === 'rinse' && initFoam.current > 0
    ? Math.max(0, 1 - foamSpots.length / initFoam.current)
    : phase === 'done' ? 1 : 0;

  const barPct   = phase === 'scrub' ? Math.round(soapPct) : Math.round(rinseProgress * 100);
  const barLabel = phase === 'scrub' ? 'Jabón' : 'Enjuague';
  const barColor = phase !== 'scrub'
    ? 'linear-gradient(90deg, rgba(0,182,237,0.7), rgba(255,255,255,0.95))'
    : 'linear-gradient(90deg, rgba(255,255,255,0.7), white)';

  // Cat opacity: stays dirty during scrub, reveals clean as foam is removed
  const dirtyOpacity = phase === 'scrub' ? 1 : 1 - rinseProgress;
  const cleanOpacity = phase === 'scrub' ? 0 : rinseProgress;

  useEffect(() => {
    if (phase === 'done') {
      setFoamSpots([]);
      sfx('purr', 0.85);
    }
  }, [phase]);

  // Rinse tip auto-dismiss
  useEffect(() => {
    if (phase === 'rinse') {
      setShowRinseTip(true);
      const t = setTimeout(() => setShowRinseTip(false), 2800);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Done when all foam cleared
  useEffect(() => {
    if (phase === 'rinse' && foamSpots.length === 0 && initFoam.current > 0) {
      bgStop('water');
      phaseRef.current = 'done';
      setPhase('done');
    }
  }, [phase, foamSpots.length]);

  /* ── Floating bubbles (visual flair) ─────────────────────── */
  const spawnBubbles = useCallback((x: number, y: number) => {
    const count = 1 + Math.floor(Math.random() * 2);
    const fresh: Bubble[] = Array.from({ length: count }, () => ({
      id:   bubbleId.current++,
      x:    x + (Math.random() - 0.5) * 50,
      y:    y + (Math.random() - 0.5) * 40,
      size: 5 + Math.random() * 12,
      dx:   (Math.random() - 0.5) * 40,
    }));
    setBubbles(prev => [...prev.slice(-20), ...fresh]);
    fresh.forEach(b =>
      setTimeout(() => setBubbles(prev => prev.filter(bb => bb.id !== b.id)), 900)
    );
  }, []);

  /* ── Transition scrub → rinse ─────────────────────────────── */
  const transitionToRinse = useCallback(() => {
    if (phaseRef.current !== 'scrub') return;
    phaseRef.current = 'rinse';
    setFoamSpots(current => { initFoam.current = Math.max(1, current.length); return current; });
    bgStop('sponge');
    interactingRef.current = false;
    setInteracting(false);
    setPhase('rinse');
  }, []);

  /* ── Pointer handlers ─────────────────────────────────────── */
  const onDown = (e: React.PointerEvent) => {
    if (phaseRef.current === 'done') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    interactingRef.current = true;
    setInteracting(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPointer({ x: e.clientX, y: e.clientY });
    if (phaseRef.current === 'scrub') bgPlay('sponge', 0.6);
    if (phaseRef.current === 'rinse') bgPlay('water', 0.5);
  };

  const onMove = (e: React.PointerEvent) => {
    setPointer({ x: e.clientX, y: e.clientY });
    if (!interactingRef.current || phaseRef.current === 'done') return;

    const prev = lastPos.current;
    if (!prev) { lastPos.current = { x: e.clientX, y: e.clientY }; return; }

    const dx   = e.clientX - prev.x;
    const dy   = e.clientY - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) {
      lastPos.current = { x: e.clientX, y: e.clientY };

      if (phaseRef.current === 'scrub') {
        const gain = Math.min(dist * 0.055, 0.4);
        const next  = Math.min(100, soapRef.current + gain);
        soapRef.current = next;
        setSoapPct(next);
        spawnBubbles(e.clientX, e.clientY);

        // Add foam spot only if far enough from last one
        const lf = lastFoamPos.current;
        const farEnough = !lf || Math.sqrt((e.clientX - lf.x) ** 2 + (e.clientY - lf.y) ** 2) > FOAM_SPACING;
        if (farEnough) {
          lastFoamPos.current = { x: e.clientX, y: e.clientY };
          setFoamSpots(prev => {
            if (prev.length >= MAX_FOAM) return prev;
            // Capa base: blob grande y suave que da volumen
            const isBase = Math.random() < 0.4;
            const newSpot: FoamSpot = isBase
              ? { id: foamId.current++, x: e.clientX + (Math.random() - 0.5) * 24, y: e.clientY + (Math.random() - 0.5) * 24, size: 52 + Math.random() * 32, opacity: 0.42, blur: 16 }
              : { id: foamId.current++, x: e.clientX + (Math.random() - 0.5) * 10, y: e.clientY + (Math.random() - 0.5) * 10, size: 28 + Math.random() * 20, opacity: 0.82, blur: 8 };
            return [...prev, newSpot];
          });
        }

        if (next >= 100) transitionToRinse();

      } else if (phaseRef.current === 'rinse') {
        const cx = e.clientX, cy = e.clientY;
        setFoamSpots(prev => prev.filter(s => {
          const fdx = s.x - cx, fdy = s.y - cy;
          return Math.sqrt(fdx * fdx + fdy * fdy) > RINSE_RADIUS;
        }));
        spawnBubbles(e.clientX, e.clientY);
      }
    }
  };

  const stopInteraction = () => {
    interactingRef.current = false;
    setInteracting(false);
    lastPos.current = null;
    bgStop('sponge');
    bgStop('water');
  };

  const onUp    = () => stopInteraction();
  const onLeave = (e: React.PointerEvent) => {
    stopInteraction();
    setPointer(null);
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
      {/* ── Cat images ── */}
      <div style={{ position: 'absolute', left: '-19.07%', top: '24.43%', width: '138.15%', height: '80.73%', pointerEvents: 'none' }}>
        <img src="/assets/cat/cat-bath-dirty.png" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: dirtyOpacity, transition: 'opacity 0.3s' }} />
        <img src="/assets/cat/cat-bath-clean.png" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: cleanOpacity, transition: 'opacity 0.3s' }} />
      </div>

      {/* ── Foam spots (persistent blurred blobs) ── */}
      {foamSpots.map(s => (
        <div key={s.id} style={{
          position: 'fixed',
          left: s.x - s.size / 2,
          top:  s.y - s.size / 2,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: `rgba(255,255,255,${s.opacity})`,
          filter: `blur(${s.blur}px)`,
          pointerEvents: 'none',
          zIndex: 70,
        }} />
      ))}

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


      {/* ── Progress bar ── */}
      <div style={{ position: 'absolute', top: '20%', left: '9%', right: '9%', zIndex: 4, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'min(1vw, 0.55vh)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9, transition: 'opacity 0.3s' }}>
            {barLabel}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', letterSpacing: '0.04em', opacity: 0.9 }}>
            {barPct}%
          </span>
        </div>
        <div style={{ height: 'min(4.5vw, 2.5vh)', background: 'rgba(255,255,255,0.25)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 2px 6px rgba(0,87,122,0.2)' }}>
          <motion.div
            animate={{ width: `${barPct}%` }}
            transition={{ duration: 0.12 }}
            style={{ height: '100%', background: barColor, borderRadius: 99, boxShadow: '0 0 14px rgba(255,255,255,0.7)', transition: 'background 0.6s' }}
          />
        </div>
      </div>

      {/* ── Rinse unlock banner ── */}
      <AnimatePresence>
        {showRinseTip && (
          <motion.div
            key="rinse-tip"
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
            transition={{ duration: 0.35 }}
            style={{
              position: 'absolute', top: '27%', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,87,122,0.88)', borderRadius: 99,
              padding: 'min(1.8vw, 1vh) min(5.5vw, 3vh)',
              zIndex: 76, whiteSpace: 'nowrap', pointerEvents: 'none',
              boxShadow: '0 4px 20px rgba(0,87,122,0.35)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(4.5vw, 2.5vh)', color: 'white' }}>
              💧 ¡Ahora enjuaga al gato!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Instructions ── */}
      {phase === 'scrub' && (
        <motion.p
          animate={{ opacity: interacting ? 0 : [0.6, 1, 0.6] }}
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

      {phase === 'rinse' && (
        <motion.p
          animate={{ opacity: interacting ? 0 : [0.6, 1, 0.6] }}
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
          ¡Toca para quitar la espuma!
        </motion.p>
      )}

      {/* ── Done celebration ── */}
      <AnimatePresence>
        {phase === 'done' && [...Array(8)].map((_, i) => (
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

      {/* ── ¡Listo! button ── */}
      <AnimatePresence>
        {phase === 'done' && (
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
              <div style={{ width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)', flexShrink: 0, position: 'relative' }}>
                <motion.button onClick={goBack} whileTap={{ scale: 0.88 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isActive ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  <img src={item.icon} alt="" style={{ width: '62%', height: 'auto', objectFit: 'contain', filter: isActive ? 'none' : 'brightness(0) invert(1)' }} />
                </motion.button>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.4vw, 1.9vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: isActive ? 1 : 0.75, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {isActive ? '✓ ' : ''}{item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Floating bubbles ── */}
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
              left: b.x - b.size / 2, top: b.y - b.size / 2,
              width: b.size, height: b.size,
              borderRadius: '50%',
              background: phase === 'rinse'
                ? 'rgba(0,182,237,0.65)'
                : 'rgba(255,255,255,0.88)',
              border: '1.5px solid rgba(255,255,255,0.55)',
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
              pointerEvents: 'none', zIndex: 90,
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Sponge cursor (scrub phase) ── */}
      {pointer && phase === 'scrub' && (
        <motion.div
          animate={interacting
            ? { rotate: [-8, 8, -8], scale: [1, 1.1, 1] }
            : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.3, repeat: interacting ? Infinity : 0 }}
          style={{
            position: 'fixed',
            left: pointer.x, top: pointer.y,
            transform: 'translate(-50%, -50%)',
            width: 'min(18vw, 10.2vh)', height: 'min(18vw, 10.2vh)',
            pointerEvents: 'none', zIndex: 80,
            filter: 'drop-shadow(0 4px 12px rgba(0,87,122,0.4))',
          }}
        >
          <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '4px' }}>
            <img src="/assets/ui/sponge.svg" alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
          </div>
        </motion.div>
      )}

      {/* ── Water cursor (rinse phase) ── */}
      {pointer && phase === 'rinse' && (
        <motion.div
          animate={{ scale: interacting ? [1, 1.18, 1] : 1 }}
          transition={{ duration: 0.5, repeat: interacting ? Infinity : 0 }}
          style={{
            position: 'fixed',
            left: pointer.x, top: pointer.y,
            transform: 'translate(-50%, -50%)',
            width: 'min(18vw, 10.2vh)', height: 'min(18vw, 10.2vh)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(150,230,255,0.9) 0%, rgba(0,182,237,0.55) 55%, transparent 100%)',
            border: '2px solid rgba(255,255,255,0.75)',
            boxShadow: '0 0 22px rgba(0,182,237,0.55)',
            pointerEvents: 'none',
            zIndex: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'min(7vw, 4vh)',
          }}
        >
          💧
        </motion.div>
      )}
    </div>
  );
}
