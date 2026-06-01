import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import ScreenLayout from '../components/ScreenLayout';

const PRODUCTS = [
  '/assets/products/product-1.png',
  '/assets/products/product-2.png',
  '/assets/products/product-3.png',
];

interface Bag {
  id: number;
  x: number;
  img: string;
  speed: number;
  y: number;
  caught: boolean;
}

interface Props { onDone: (score: number) => void; }

export default function FallingBagsGameScreen({ onDone }: Props) {
  const GAME_TIME = 40;
  const [bags, setBags] = useState<Bag[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [catchEffects, setCatchEffects] = useState<{ id: number; x: number; y: number }[]>([]);
  const nextId = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const effectId = useRef(0);

  const spawnBag = useCallback(() => {
    setBags(prev => [...prev, {
      id: nextId.current++,
      x: 8 + Math.random() * 80,
      img: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
      speed: 3.5 + Math.random() * 2,
      y: -15,
      caught: false,
    }]);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    spawnTimer.current = setInterval(spawnBag, 900);
    gameTimer.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(spawnTimer.current!);
          clearInterval(gameTimer.current!);
          setPhase('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { clearInterval(spawnTimer.current!); clearInterval(gameTimer.current!); };
  }, [phase, spawnBag]);

  // Move bags down
  useEffect(() => {
    if (phase !== 'playing') return;
    const raf = setInterval(() => {
      setBags(prev => prev
        .map(b => ({ ...b, y: b.y + b.speed }))
        .filter(b => b.y < 110 && !b.caught)
      );
    }, 50);
    return () => clearInterval(raf);
  }, [phase]);

  const catchBag = (id: number, x: number, y: number) => {
    setBags(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 10);
    const eid = effectId.current++;
    setCatchEffects(prev => [...prev, { id: eid, x, y }]);
    setTimeout(() => setCatchEffects(prev => prev.filter(e => e.id !== eid)), 600);
  };

  return (
    <ScreenLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 0', flexShrink: 0 }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 110 }} />
          <div style={{ background: '#00577a', borderRadius: '40px', padding: '7px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/assets/ui/icon-clock.svg" alt="" style={{ width: 24, filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)' }}>
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <div style={{ background: 'white', borderRadius: '40px', padding: '6px 16px', boxShadow: '0 2px 8px rgba(0,87,122,0.15)' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#00577a' }}>{score}</span>
          </div>
        </div>

        {/* Game field */}
        {phase === 'playing' ? (
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {bags.map(bag => (
              <motion.img
                key={bag.id}
                src={bag.img}
                alt="Nutre Cat"
                onClick={() => catchBag(bag.id, bag.x, bag.y)}
                style={{
                  position: 'absolute',
                  left: `${bag.x}%`,
                  top: `${bag.y}%`,
                  width: 80, height: 100,
                  objectFit: 'contain',
                  cursor: 'pointer',
                  userSelect: 'none',
                  filter: 'drop-shadow(0 4px 12px rgba(0,87,122,0.3))',
                  transform: 'rotate(5deg)',
                }}
                animate={{ rotate: [5, -5, 5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}

            {/* Catch effects */}
            <AnimatePresence>
              {catchEffects.map(e => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2, y: -40 }}
                  exit={{ opacity: 0 }}
                  style={{ position: 'absolute', left: `${e.x}%`, top: `${e.y}%`, fontSize: '24px', pointerEvents: 'none' }}
                >
                  ✨ +10
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cat at bottom */}
            <motion.img
              src="/assets/cat/cat-game.png"
              alt="Simón"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)',
                width: 140, height: 160, objectFit: 'contain', pointerEvents: 'none',
                filter: 'drop-shadow(0 8px 20px rgba(0,87,122,0.25))',
              }}
            />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '0 24px' }}>
            <motion.img
              src="/assets/cat/cat-hub.png"
              alt="Simón"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 240, height: 260, objectFit: 'contain', filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.2))' }}
            />
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: '#00577a' }}>¡Tiempo!</h2>
              <p style={{ color: '#00577a', fontSize: '20px', fontWeight: 800, opacity: 0.8 }}>Atrapaste {score / 10} bolsas</p>
              <div style={{ background: 'white', borderRadius: '20px', padding: '12px 24px', marginTop: '12px', display: 'inline-block', boxShadow: '0 4px 16px rgba(0,87,122,0.15)' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#00577a' }}>+{score} pts ⭐</span>
              </div>
            </div>
            <PrimaryButton onClick={() => onDone(score)} variant="cyan" size="lg" fullWidth>
              🏠 Volver al hub
            </PrimaryButton>
          </div>
        )}
      </div>
    </ScreenLayout>
  );
}