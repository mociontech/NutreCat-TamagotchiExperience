import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { sfx, bgPlay, bgSetRate } from '../utils/sounds';

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
  x:        number;
  baseX:    number;
  img:      string;
  speed:    number;
  y:        number;
  rotation: number;
  wobble:   number;
  t:        number;
  points:   number;
}

interface Effect { id: number; x: number; y: number; points: number; special: boolean; }
interface TapIndicator { id: number; x: number; y: number; }

interface Props { onDone: (score: number) => void; }

const ITEM_CONFIG: Record<ItemType, { points: number; weight: number }> = {
  product:  { points: 10,  weight: 0.68 },
  fishbone: { points: -10, weight: 0.22 },
  mouse:    { points: 50,  weight: 0.10 },
};

function pickType(): ItemType {
  const r = Math.random();
  if (r < ITEM_CONFIG.mouse.weight) return 'mouse';
  if (r < ITEM_CONFIG.mouse.weight + ITEM_CONFIG.fishbone.weight) return 'fishbone';
  return 'product';
}

const COMBO_MIN  = 3;
const COMBO_MULT = 1.5;

export default function FallingBagsGameScreen({ onDone }: Props) {
  const [bags,         setBags]         = useState<Bag[]>([]);
  const [score,        setScore]        = useState(0);
  const [timeLeft,     setTimeLeft]     = useState(GAME_TIME);
  const [phase,        setPhase]        = useState<'playing' | 'done'>('playing');
  const [catchEffects, setCatchEffects] = useState<Effect[]>([]);
  const [tapIndicators, setTapIndicators] = useState<TapIndicator[]>([]);
  const [combo,        setCombo]        = useState(0);
  const [mouseFlash,   setMouseFlash]   = useState(false);
  const [screenShake,  setScreenShake]  = useState(false);
  const [doublePts,    setDoublePts]    = useState(false);

  const nextId         = useRef(0);
  const effectId       = useRef(0);
  const tapId          = useRef(0);
  const scoreRef       = useRef(0);
  const speedMult      = useRef(1.0);
  const comboRef       = useRef(0);
  const timeLeftRef    = useRef(GAME_TIME);
  const doublePtsRef   = useRef(false);
  const doublePtsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      speed:    type === 'mouse'    ? 4.8 + Math.random() * 1.8
               : type === 'fishbone' ? 3.4 + Math.random() * 1.8
               : 3.0 + Math.random() * 2.2,
      y:        -18,
      rotation: -50 + Math.random() * 100,
      wobble:   type === 'mouse' ? 20 : 6 + Math.random() * 8,
      t:        Math.random() * Math.PI * 2,
      points:   ITEM_CONFIG[type].points,
    };
    setBags(prev => (prev.length >= 18 ? prev : [...prev, bag]));
  }, []);

  /* Música */
  useEffect(() => {
    bgPlay('ukulele', 0.16, 1.0);
  }, []);

  /* Spawn + timer */
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawn = setInterval(() => {
      spawnBag();
      if (timeLeftRef.current <= 20 && Math.random() > 0.55) spawnBag();
      if (timeLeftRef.current <= 10 && Math.random() > 0.45) spawnBag();
    }, 820);
    const timer = setInterval(() => {
      setTimeLeft(t => {
        const next = t <= 1 ? 0 : t - 1;
        timeLeftRef.current = next;
        if (t <= 1) { clearInterval(spawn); clearInterval(timer); setPhase('done'); return 0; }
        return next;
      });
    }, 1000);
    return () => { clearInterval(spawn); clearInterval(timer); };
  }, [phase, spawnBag]);

  /* Etapas de velocidad */
  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 10) {
      bgSetRate('ukulele', 1.28);
      speedMult.current = 1.18;
    } else if (timeLeft <= 20) {
      bgSetRate('ukulele', 1.14);
      speedMult.current = 1.09;
    } else {
      bgSetRate('ukulele', 1.0);
      speedMult.current = 1.0;
    }
  }, [timeLeft, phase]);

  /* Mover ítems + penalizar productos caídos */
  useEffect(() => {
    if (phase !== 'playing') return;
    const move = setInterval(() => {
      setBags(prev => prev
        .map(b => {
          const newT = b.t + 0.10;
          const newY = b.y + b.speed * 0.5 * speedMult.current;
          const newX = b.type === 'mouse'
            ? b.baseX + 24 * Math.sin(newT * 1.1)
            : b.x;
          return { ...b, y: newY, x: Math.max(2, Math.min(92, newX)), t: newT };
        })
        .filter(b => {
          if (b.y >= 110) {
            if (b.type === 'product') {
              scoreRef.current = Math.max(0, scoreRef.current - 5);
              setScore(scoreRef.current);
              comboRef.current = 0;
              setCombo(0);
              const eid = effectId.current++;
              setCatchEffects(prev => [...prev, { id: eid, x: b.x, y: 88, points: -5, special: false }]);
              setTimeout(() => setCatchEffects(p => p.filter(e => e.id !== eid)), 600);
            }
            return false;
          }
          return true;
        }),
      );
    }, 50);
    return () => clearInterval(move);
  }, [phase]);

  /* Limpiar timer de doble puntos al desmontar */
  useEffect(() => {
    return () => { if (doublePtsTimer.current) clearTimeout(doublePtsTimer.current); };
  }, []);

  /* Fin de juego */
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => onDone(scoreRef.current), 2200);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  const catchBag = useCallback((id: number, x: number, y: number, points: number, type: ItemType) => {
    setBags(prev => prev.filter(b => b.id !== id));

    let finalPoints = points;
    const isMouse = type === 'mouse';

    if (points > 0) {
      const newCombo = comboRef.current + 1;
      comboRef.current = newCombo;
      setCombo(newCombo);
      if (newCombo >= COMBO_MIN) finalPoints = Math.round(points * COMBO_MULT);
      if (doublePtsRef.current && !isMouse) finalPoints = Math.round(finalPoints * 2);
    } else {
      comboRef.current = 0;
      setCombo(0);
    }

    const pts = Math.max(0, scoreRef.current + finalPoints);
    scoreRef.current = pts;
    setScore(pts);

    if (isMouse) {
      sfx('bling', 1.0);
      setMouseFlash(true);
      setScreenShake(true);
      setTimeout(() => setMouseFlash(false), 500);
      setTimeout(() => setScreenShake(false), 380);
      if (doublePtsTimer.current) clearTimeout(doublePtsTimer.current);
      doublePtsRef.current = true;
      setDoublePts(true);
      doublePtsTimer.current = setTimeout(() => {
        doublePtsRef.current = false;
        setDoublePts(false);
      }, 5000);
    }

    const eid = effectId.current++;
    setCatchEffects(prev => [...prev, { id: eid, x, y, points: finalPoints, special: isMouse }]);
    setTimeout(() => setCatchEffects(prev => prev.filter(e => e.id !== eid)), isMouse ? 900 : 600);
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const isComboActive = combo >= COMBO_MIN;

  return (
    <motion.div
      animate={screenShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.38, ease: 'easeInOut' }}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        backgroundImage: 'url(/assets/backgrounds/bg-Inicio.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >

      {/* Indicadores de combo y doble puntos — superpuestos, fuera del flujo */}
      <div style={{
        position: 'absolute', top: 'min(16vw, 9vh)', right: '9%',
        zIndex: 15, display: 'flex', flexDirection: 'column',
        alignItems: 'flex-end', gap: 'min(1.5vw, 0.85vh)', pointerEvents: 'none',
      }}>
        <AnimatePresence>
          {isComboActive && (
            <motion.div
              key={`combo-${combo}`}
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'linear-gradient(135deg, #ff6b35, #fcd116)', borderRadius: 99, padding: 'min(1vw, 0.55vh) min(3vw, 1.7vh)', boxShadow: '0 2px 12px rgba(255,107,53,0.5)' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(4.5vw, 2.5vh)', color: 'white', whiteSpace: 'nowrap' }}>
                🔥 {combo}x COMBO
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {doublePts && (
            <motion.div
              key="double-pts"
              initial={{ scale: 1.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', borderRadius: 99, padding: 'min(1vw, 0.55vh) min(3vw, 1.7vh)', boxShadow: '0 2px 12px rgba(255,215,0,0.7)' }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(4.5vw, 2.5vh)', color: 'white', whiteSpace: 'nowrap' }}>
                x2 PUNTOS
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flash dorado al atrapar ratón */}
      <AnimatePresence>
        {mouseFlash && (
          <motion.div
            key="mflash"
            initial={{ opacity: 0.55 }} animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(255,215,0,0.45)', pointerEvents: 'none', zIndex: 90 }}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0, position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'min(4.8vw, 2.7vh) 9%',
      }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '28.5%', objectFit: 'contain' }} />

          <motion.div
            key={score}
            animate={{ scale: [1.15, 1] }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'white',
              borderRadius: 'min(3.8vw, 2.14vh)',
              width: 'min(33.3vw, 18.75vh)',
              height: 'min(7.6vw, 4.27vh)',
              boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.57vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1, paddingTop: '0.25em' }}>
              Puntos: {score}
            </span>
          </motion.div>
      </div>

      {/* ── Campo de juego ── */}
      <div
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
          maskImage: 'linear-gradient(to bottom, transparent 0px, black 120px)',
        }}
        onClick={e => {
          if (phase !== 'playing') return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          const id = tapId.current++;
          setTapIndicators(prev => [...prev, { id, x, y }]);
          setTimeout(() => setTapIndicators(p => p.filter(t => t.id !== id)), 500);
        }}
      >
        {phase === 'playing' ? (
          <>
            {bags.map(bag => {
              const isMouse    = bag.type === 'mouse';
              const isFishbone = bag.type === 'fishbone';
              const size = isMouse ? 'min(16vw, 9vh)' : isFishbone ? 'min(15vw, 8.4vh)' : 'min(17vw, 9.6vh)';
              const rotation = isMouse
                ? bag.rotation + bag.t * 80
                : bag.rotation + Math.sin(bag.t) * bag.wobble;
              return (
                <img
                  key={bag.id}
                  src={bag.img}
                  alt=""
                  onClick={() => catchBag(bag.id, bag.x, bag.y, bag.points, bag.type)}
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
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    willChange: 'transform',
                  }}
                />
              );
            })}

            {/* Patita — indicador de tap */}
            <AnimatePresence>
              {tapIndicators.map(t => (
                <motion.img
                  key={t.id}
                  src="/assets/cat/PaticaAtrapalo.png"
                  alt=""
                  initial={{ opacity: 1, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: `${t.x}%`, top: `${t.y}%`,
                    width: 'min(14vw, 7.9vh)',
                    height: 'auto',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 30,
                  }}
                />
              ))}
            </AnimatePresence>

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
            <motion.video
              src={score > 0 ? '/assets/cat/Animation/Celebrando.webm' : '/assets/cat/Animation/Perdedor.webm'}
              autoPlay
              loop
              muted
              playsInline
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '55%', objectFit: 'contain', pointerEvents: 'none' }}
            />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(9vw, 5vh)', color: 'white', textTransform: 'uppercase', textShadow: '0 4px 16px rgba(0,87,122,0.4)' }}>¡Tiempo!</p>
            <div style={{ background: 'white', borderRadius: 'min(4vw, 2.2vh)', padding: 'min(3vw, 1.7vh) min(8vw, 4.5vh)', boxShadow: '0 6px 24px rgba(0,87,122,0.2)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(8vw, 4.5vh)', color: '#00577a' }}>+{score} pts ⭐</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Timer ── */}
      {phase === 'playing' && (
        <div style={{
          position: 'absolute', left: '35.87%', top: '21.93%',
          width: '28.26%',
          zIndex: 20, background: '#00577a', borderRadius: 99,
          padding: 'min(1.4vw, 0.77vh) min(4vw, 2.2vh)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,87,122,0.4)',
          boxSizing: 'border-box',
        }}>
          <div style={{ position: 'absolute', left: 'min(3vw, 1.7vh)', top: '50%', transform: 'translateY(-50%)', width: 'min(5.46vw, 3.06vh)', height: 'min(5.46vw, 3.06vh)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/ui/icon-clock.svg" alt="" style={{ width: '100%', height: '100%', filter: 'brightness(0) invert(1)', display: 'block' }} />
          </div>
          <motion.span
            key={timeLeft}
            animate={timeLeft <= 10 ? { scale: [1.15, 1], x: 35, y: 3 } : { x: 35, y: 3 }}
            transition={{ duration: 0.2 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'min(7.92vw, 4.44vh)', color: timeLeft <= 10 ? '#fcd116' : 'white', whiteSpace: 'nowrap', lineHeight: 1, paddingTop: '0.08em', transformOrigin: 'center center', transition: 'color 0.3s' }}
          >{mm}:{ss}</motion.span>
        </div>
      )}
    </motion.div>
  );
}
