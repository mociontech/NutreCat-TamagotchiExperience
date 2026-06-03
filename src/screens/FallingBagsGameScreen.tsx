import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { sfx } from '../utils/sounds';
import { sfx as _sfx } from '../utils/sounds'; // eslint-disable-line @typescript-eslint/no-unused-vars

const PRODUCTS = [
  '/assets/products/product-1.png',
  '/assets/products/product-2.png',
  '/assets/products/product-3.png',
];

const GAME_TIME = 30;

type ItemType = 'product' | 'fishbone' | 'mouse';

interface Bag {
  id:       number;
  type:     ItemType;
  x:        number;    // posición actual x %
  baseX:    number;    // centro de oscilación para mouse
  img:      string;
  speed:    number;
  y:        number;
  rotation: number;
  wobble:   number;
  t:        number;    // contador de tiempo para trayectorias
  points:   number;
}

interface Effect { id: number; x: number; y: number; points: number; special: boolean; }

interface Props { onDone: (score: number) => void; }

// Puntos y spawn rate por tipo (fishbone resta puntos — malo para el gato)
const ITEM_CONFIG: Record<ItemType, { points: number; weight: number }> = {
  product:  { points: 10, weight: 0.68 },
  fishbone: { points: -10, weight: 0.22 },
  mouse:    { points: 50, weight: 0.10 },
};

function pickType(): ItemType {
  const r = Math.random();
  if (r < ITEM_CONFIG.mouse.weight) return 'mouse';
  if (r < ITEM_CONFIG.mouse.weight + ITEM_CONFIG.fishbone.weight) return 'fishbone';
  return 'product';
}

export default function FallingBagsGameScreen({ onDone }: Props) {
  const [bags,         setBags]         = useState<Bag[]>([]);
  const [score,        setScore]        = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(GAME_TIME);
  const [phase,        setPhase]        = useState<'playing' | 'done'>('playing');
  const [catchEffects, setCatchEffects] = useState<Effect[]>([]);
  const nextId   = useRef(0);
  const effectId = useRef(0);
  const scoreRef = useRef(0);

  const spawnBag = useCallback(() => {
    const type  = pickType();
    const baseX = type === 'mouse' ? 15 + Math.random() * 60 : 5 + Math.random() * 78;

    const bag: Bag = {
      id:       nextId.current++,
      type,
      x:        baseX,
      baseX,
      img:      type === 'mouse'    ? '/assets/games/mouse_no_bg.png'
               : type === 'fishbone' ? '/assets/games/fishbone_no_bg.png'
               : PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
      speed:    type === 'mouse'    ? 4.8 + Math.random() * 1.8   // más rápido
               : type === 'fishbone' ? 3.4 + Math.random() * 1.8
               : 3.0 + Math.random() * 2.2,
      y:        -18,
      rotation: -50 + Math.random() * 100,
      wobble:   type === 'mouse' ? 20 : 6 + Math.random() * 8,
      t:        Math.random() * Math.PI * 2,  // fase aleatoria para que no oscilen igual
      points:   ITEM_CONFIG[type].points,
    };

    setBags(prev => [...prev, bag]);
  }, []);

  /* Spawn + timer */
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawn = setInterval(spawnBag, 820);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(spawn); clearInterval(timer); setPhase('done'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [phase, spawnBag]);

  /* Mover items — mouse con oscilación sinusoidal */
  useEffect(() => {
    if (phase !== 'playing') return;
    const move = setInterval(() => {
      setBags(prev => prev
        .map(b => {
          const newT = b.t + 0.10;
          const newY = b.y + b.speed * 0.5;
          // Mouse: figura-8 / Lissajous  (sin en x, cos en y-extra)
          const newX = b.type === 'mouse'
            ? b.baseX + 24 * Math.sin(newT * 1.1)
            : b.x;
          return { ...b, y: newY, x: Math.max(2, Math.min(92, newX)), t: newT };
        })
        .filter(b => b.y < 110),
      );
    }, 50);
    return () => clearInterval(move);
  }, [phase]);

  /* Fin de juego */
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => onDone(scoreRef.current), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  const catchBag = useCallback((id: number, x: number, y: number, points: number, special: boolean) => {
    setBags(prev => prev.filter(b => b.id !== id));
    const pts = Math.max(0, scoreRef.current + points);
    scoreRef.current = pts;
    setScore(pts);
    if (special) sfx('bling', 0.85);
    const eid = effectId.current++;
    setCatchEffects(prev => [...prev, { id: eid, x, y, points, special }]);
    setTimeout(() => setCatchEffects(prev => prev.filter(e => e.id !== eid)), special ? 900 : 600);
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: 'url(/assets/backgrounds/FondoJuego2.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'min(4.8vw, 2.7vh) 9%',
      }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat"
          style={{ width: '28.5%', objectFit: 'contain' }} />
        <motion.div
          key={score}
          animate={{ scale: [1.15, 1] }}
          transition={{ duration: 0.25 }}
          style={{ background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)' }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Puntos: {score}
          </span>
        </motion.div>
      </div>

      {/* ── Campo de juego — mask difumina los primeros 120px ── */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
        maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
      }}>
        {phase === 'playing' ? (
          <>
            {bags.map(bag => {
              const isMouse    = bag.type === 'mouse';
              const isFishbone = bag.type === 'fishbone';
              const size = isMouse ? 'min(16vw, 9vh)' : isFishbone ? 'min(15vw, 8.4vh)' : 'min(17vw, 9.6vh)';
              return (
                <motion.img
                  key={bag.id}
                  src={bag.img}
                  alt=""
                  onClick={() => catchBag(bag.id, bag.x, bag.y, bag.points, isMouse)}
                  initial={{ rotate: bag.rotation }}
                  animate={isMouse
                    /* Mouse: gira continuamente además de oscilar */
                    ? { rotate: [bag.rotation, bag.rotation + 360] }
                    : { rotate: [bag.rotation - bag.wobble, bag.rotation + bag.wobble, bag.rotation - bag.wobble] }
                  }
                  transition={isMouse
                    ? { duration: 1.4, repeat: Infinity, ease: 'linear' }
                    : { duration: 1.2 + Math.random() * 0.6, repeat: Infinity, ease: 'easeInOut' }
                  }
                  style={{
                    position: 'absolute',
                    left:   `${bag.x}%`,
                    top:    `${bag.y}%`,
                    width:  size,
                    height: 'auto',
                    objectFit: 'contain',
                    cursor: 'pointer',
                    userSelect: 'none',
                    filter: isMouse
                      ? 'drop-shadow(0 0 12px rgba(255,215,0,0.9)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                      : 'drop-shadow(0 6px 16px rgba(0,87,122,0.35))',
                    touchAction: 'none',
                    zIndex: isMouse ? 8 : 5,
                  }}
                />
              );
            })}

            {/* Efectos de atrapar */}
            <AnimatePresence>
              {catchEffects.map(e => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 1, scale: e.special ? 0.8 : 0.6, y: 0 }}
                  animate={{ opacity: 0, scale: e.special ? 2.0 : 1.4, y: e.special ? -80 : -50 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: e.special ? 0.9 : 0.6 }}
                  style={{
                    position: 'absolute',
                    left: `${e.x}%`, top: `${e.y}%`,
                    fontFamily: 'var(--font-display)',
                    fontSize: e.special ? 'min(9vw, 5vh)' : 'min(6vw, 3.4vh)',
                    color: e.special ? '#ffd700' : e.points < 0 ? '#ff4444' : 'white',
                    textShadow: e.special
                      ? '0 0 20px rgba(255,215,0,0.8), 0 2px 8px rgba(0,0,0,0.5)'
                      : e.points < 0
                        ? '0 0 12px rgba(255,68,68,0.6), 0 2px 8px rgba(0,0,0,0.5)'
                        : '0 2px 8px rgba(0,87,122,0.5)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                  }}
                >
                  {e.special ? `+${e.points} 🌟` : e.points < 0 ? `${e.points}` : `+${e.points}`}
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(4vw, 2.2vh)', padding: '0 10%' }}
          >
            <motion.img src="/assets/cat/cat-hub.png" alt=""
              animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '55%', objectFit: 'contain', pointerEvents: 'none' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(9vw, 5vh)', color: 'white', textTransform: 'uppercase', textShadow: '0 4px 16px rgba(0,87,122,0.4)' }}>¡Tiempo!</p>
            <div style={{ background: 'white', borderRadius: 'min(4vw, 2.2vh)', padding: 'min(3vw, 1.7vh) min(8vw, 4.5vh)', boxShadow: '0 6px 24px rgba(0,87,122,0.2)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(8vw, 4.5vh)', color: '#00577a' }}>+{score} pts ⭐</span>
              <p style={{ color: 'rgba(0,87,122,0.6)', fontSize: 'min(3.5vw, 2vh)', marginTop: 4 }}>
                Atrapaste {score / 10} objetos
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Timer — fijo abajo con 15px de padding ── */}
      {phase === 'playing' && (
        <div style={{
          position: 'absolute', bottom: 15, left: '50%', transform: 'translateX(-50%)',
          zIndex: 20,
          background: '#00577a', borderRadius: 99,
          padding: 'min(2vw, 1.1vh) min(5vw, 2.8vh)',
          display: 'flex', alignItems: 'center', gap: 'min(2.5vw, 1.4vh)',
          boxShadow: '0 4px 20px rgba(0,87,122,0.4)',
        }}>
          <div style={{ width: 'min(5vw, 2.8vh)', height: 'min(5vw, 2.8vh)', flexShrink: 0, overflow: 'hidden' }}>
            <img src="/assets/ui/icon-clock.svg" alt=""
              style={{ width: '100%', height: '100%', filter: 'brightness(0) invert(1)', display: 'block' }} />
          </div>
          <motion.span
            key={timeLeft}
            animate={timeLeft <= 10 ? { scale: [1.15, 1] } : {}}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'min(10.7vw, 6vh)', color: timeLeft <= 10 ? '#fcd116' : 'white', whiteSpace: 'nowrap', lineHeight: 1, transition: 'color 0.3s' }}
          >{mm}:{ss}</motion.span>
        </div>
      )}
    </div>
  );
}
