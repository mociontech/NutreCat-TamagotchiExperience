import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

const PRODUCTS = [
  '/assets/products/product-1.png',
  '/assets/products/product-2.png',
  '/assets/products/product-3.png',
];

const GAME_TIME = 30;

interface Bag {
  id:       number;
  x:        number;   /* % from left */
  img:      string;
  speed:    number;   /* % per tick */
  y:        number;   /* % from top */
  rotation: number;   /* deg, randomized per bag */
  wobble:   number;   /* amplitude for wiggle */
}

interface Effect { id: number; x: number; y: number; }

interface Props { onDone: (score: number) => void; }

export default function FallingBagsGameScreen({ onDone }: Props) {
  const [bags,         setBags]         = useState<Bag[]>([]);
  const [score,        setScore]        = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(GAME_TIME);
  const [phase,        setPhase]        = useState<'playing' | 'done'>('playing');
  const [catchEffects, setCatchEffects] = useState<Effect[]>([]);
  const nextId    = useRef(0);
  const effectId  = useRef(0);
  const scoreRef  = useRef(0);

  const spawnBag = useCallback(() => {
    setBags(prev => [...prev, {
      id:       nextId.current++,
      x:        5 + Math.random() * 78,
      img:      PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
      speed:    3.2 + Math.random() * 2.4,
      y:        -18,
      rotation: -50 + Math.random() * 100,
      wobble:   6 + Math.random() * 8,
    }]);
  }, []);

  /* Spawn + game timer */
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawn = setInterval(spawnBag, 850);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(spawn);
          clearInterval(timer);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [phase, spawnBag]);

  /* Move bags downward */
  useEffect(() => {
    if (phase !== 'playing') return;
    const move = setInterval(() => {
      setBags(prev => prev
        .map(b => ({ ...b, y: b.y + b.speed * 0.5 }))
        .filter(b => b.y < 108),
      );
    }, 50);
    return () => clearInterval(move);
  }, [phase]);

  /* Trigger onDone when phase flips */
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => onDone(scoreRef.current), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  const catchBag = (id: number, x: number, y: number) => {
    setBags(prev => prev.filter(b => b.id !== id));
    const pts = scoreRef.current + 10;
    scoreRef.current = pts;
    setScore(pts);
    const eid = effectId.current++;
    setCatchEffects(prev => [...prev, { id: eid, x, y }]);
    setTimeout(() => setCatchEffects(prev => prev.filter(e => e.id !== eid)), 600);
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',             /* fondo plano — sin cuarto */
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'min(4.8vw, 2.7vh) 9%',
      }}>
        {/* Logo */}
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat"
          style={{ width: '28.5%', objectFit: 'contain' }} />

        {/* Score pill */}
        <motion.div
          key={score}
          animate={{ scale: [1.15, 1] }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'white', borderRadius: 99,
            padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)',
            boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(6.6vw, 3.7vh)',
            color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap',
          }}>Puntos: {score}</span>
        </motion.div>
      </div>

      {/* Timer pill */}
      <div style={{
        flexShrink: 0,
        marginLeft: '29.81%',
        width: '40.37%',
        zIndex: 10,
        background: '#00577a', borderRadius: 99,
        padding: 'min(2vw, 1.1vh) min(4vw, 2.2vh)',
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
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(10.7vw, 6vh)',
            color: timeLeft <= 10 ? '#fcd116' : 'white',
            whiteSpace: 'nowrap', lineHeight: 1,
            transition: 'color 0.3s',
          }}
        >{mm}:{ss}</motion.span>
      </div>

      {/* ── Campo de juego ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {phase === 'playing' ? (
          <>
            {bags.map(bag => (
              <motion.img
                key={bag.id}
                src={bag.img}
                alt=""
                onClick={() => catchBag(bag.id, bag.x, bag.y)}
                initial={{ rotate: bag.rotation }}
                animate={{ rotate: [bag.rotation - bag.wobble, bag.rotation + bag.wobble, bag.rotation - bag.wobble] }}
                transition={{ duration: 1.2 + Math.random() * 0.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  left:   `${bag.x}%`,
                  top:    `${bag.y}%`,
                  width:  'min(17vw, 9.6vh)',
                  height: 'auto',
                  objectFit: 'contain',
                  cursor: 'pointer',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 6px 16px rgba(0,87,122,0.35))',
                  touchAction: 'none',
                }}
              />
            ))}

            {/* Efecto "+10" al atrapar */}
            <AnimatePresence>
              {catchEffects.map(e => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 1, scale: 0.6, y: 0 }}
                  animate={{ opacity: 0, scale: 1.4, y: -50 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: 'absolute',
                    left: `${e.x}%`, top: `${e.y}%`,
                    fontFamily: 'var(--font-display)',
                    fontSize: 'min(6vw, 3.4vh)',
                    color: 'white',
                    textShadow: '0 2px 8px rgba(0,87,122,0.5)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >+10</motion.div>
              ))}
            </AnimatePresence>
          </>
        ) : (
          /* Pantalla de resultado */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, type: 'spring' }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 'min(4vw, 2.2vh)',
              padding: '0 10%',
            }}
          >
            <motion.img
              src="/assets/cat/cat-hub.png"
              alt=""
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '55%', objectFit: 'contain', pointerEvents: 'none' }}
            />
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(9vw, 5vh)',
              color: 'white', textTransform: 'uppercase',
              textShadow: '0 4px 16px rgba(0,87,122,0.4)',
            }}>¡Tiempo!</p>
            <div style={{
              background: 'white', borderRadius: 'min(4vw, 2.2vh)',
              padding: 'min(3vw, 1.7vh) min(8vw, 4.5vh)',
              boxShadow: '0 6px 24px rgba(0,87,122,0.2)',
              textAlign: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(8vw, 4.5vh)',
                color: '#00577a',
              }}>+{score} pts ⭐</span>
              <p style={{ color: 'rgba(0,87,122,0.6)', fontSize: 'min(3.5vw, 2vh)', marginTop: 4 }}>
                Atrapaste {score / 10} bolsas
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
