import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { CatState, ScreenName } from '../data/gameStates';

const BLINK_FRAMES = [
  '/assets/cat/cat-hub.png',
  '/assets/cat/cat-hub-blink1.png',
  '/assets/cat/cat-hub-blink2.png',
];

const SLEEPY_PHRASES = ['Tiene sueño... 😴', 'Zzz... 💤', 'Se está durmiendo...', '💤 Zzz...'];

const CONFETTI_COLORS = ['#FCD116', '#ffffff', '#00577a', '#ff6b6b', '#a8edea', '#fed330'];

function useBlink() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const blink = () => {
      setFrame(1);
      t = setTimeout(() => {
        setFrame(2);
        t = setTimeout(() => {
          setFrame(1);
          t = setTimeout(() => {
            setFrame(0);
            t = setTimeout(blink, 3000 + Math.random() * 3000);
          }, 80);
        }, 120);
      }, 80);
    };
    t = setTimeout(blink, 1500 + Math.random() * 2000);
    return () => clearTimeout(t);
  }, []);
  return BLINK_FRAMES[frame];
}

function useSleepy() {
  const [frame, setFrame] = useState(1);
  useEffect(() => {
    const t = setInterval(() => {
      setFrame(f => f === 1 ? 2 : 1);
    }, 1400 + Math.random() * 400);
    return () => clearInterval(t);
  }, []);
  return BLINK_FRAMES[frame];
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

interface Props {
  cat: CatState;
  onNavigate: (screen: ScreenName) => void;
  pointsEarned?: number | null;
  onPointsShown?: () => void;
}

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg',    screen: 'gameSelect' as ScreenName, doneKey: 'hasPlayed' as keyof CatState },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg',    screen: 'feedSelect' as ScreenName, doneKey: 'hasFed'    as keyof CatState },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg', screen: 'care'       as ScreenName, doneKey: 'hasCared'  as keyof CatState },
  { id: 'sleep',   label: 'Hablar', icon: '/assets/nav/icon-sleep.svg',   screen: 'talk'       as ScreenName, doneKey: 'hasTalked' as keyof CatState },
] as const;

export default function HubScreen({ cat, onNavigate, pointsEarned, onPointsShown }: Props) {
  const allDone  = cat.hasFed && cat.hasPlayed && cat.hasCared && cat.hasTalked;
  const isDirty  = cat.hasFed && !cat.hasCared;
  const isSleepy = cat.hasCared && !cat.hasTalked;

  const blinkSrc  = useBlink();
  const sleepySrc = useSleepy();
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showPoints, setShowPoints] = useState(false);
  const [pointsKey, setPointsKey]   = useState(0);
  const [confetti, setConfetti]     = useState<ConfettiPiece[]>([]);
  const prevAllDone = useRef(false);

  useEffect(() => {
    if (!isSleepy) return;
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % SLEEPY_PHRASES.length), 2600);
    return () => clearInterval(t);
  }, [isSleepy]);

  /* Flash +N puntos al entrar al hub con puntos nuevos */
  useEffect(() => {
    if (!pointsEarned) return;
    setShowPoints(true);
    setPointsKey(k => k + 1);
    const t = setTimeout(() => {
      setShowPoints(false);
      onPointsShown?.();
    }, 2200);
    return () => clearTimeout(t);
  }, [pointsEarned, onPointsShown]);

  /* Confetti al completar todas las actividades por primera vez */
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      const pieces: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: 5 + Math.random() * 90,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 8 + Math.random() * 12,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.2,
        rotate: Math.random() * 360,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 4000);
    }
    prevAllDone.current = allDone;
  }, [allDone]);

  const catSrc = isDirty ? '/assets/cat/cat-dirty.png'
               : isSleepy ? sleepySrc
               : blinkSrc;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo cuarto 44% */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/assets/backgrounds/bg-pet.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        opacity: 0.44,
        pointerEvents: 'none',
      }} />

      {/* Confetti al desbloquear campeón */}
      <AnimatePresence>
        {confetti.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: '-5%', x: `${p.x}vw`, rotate: p.rotate, scale: 1 }}
            animate={{ opacity: 0, y: '110%', rotate: p.rotate + 720, scale: 0.4 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: p.size, height: p.size * 0.55,
              background: p.color,
              borderRadius: 2,
              zIndex: 20,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Header: Logo + Puntos */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'min(4.8vw, 2.7vh) 9%',
      }}>
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="Nutre Cat"
          style={{ width: '28.5%', objectFit: 'contain' }}
        />

        <motion.div
          key={cat.score}
          animate={{ scale: [1.12, 1] }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'white',
            borderRadius: 99,
            padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)',
            boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
          }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(6.6vw, 3.7vh)',
            color: '#00577a',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}>
            Puntos: {cat.score}
          </span>
        </motion.div>
      </div>

      {/* Gato central */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 0,
      }}>
        {/* Burbuja soñolienta */}
        <AnimatePresence mode="wait">
          {isSleepy && (
            <motion.div
              key={phraseIdx}
              initial={{ opacity: 0, scale: 0.7, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'absolute', top: '8%', left: '50%',
                transform: 'translateX(-50%)',
                background: 'white', borderRadius: 99,
                padding: 'min(1.5vw, 0.85vh) min(4vw, 2.2vh)',
                boxShadow: '0 4px 16px rgba(0,87,122,0.2)',
                zIndex: 3, whiteSpace: 'nowrap',
                fontFamily: 'var(--font-display)',
                fontSize: 'min(4vw, 2.3vh)',
                color: '#00577a',
              }}
            >
              {SLEEPY_PHRASES[phraseIdx]}
            </motion.div>
          )}
        </AnimatePresence>

        {/* +N puntos flotante */}
        <AnimatePresence>
          {showPoints && pointsEarned && (
            <motion.div
              key={pointsKey}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1.2, y: -60 }}
              exit={{ opacity: 0, scale: 0.8, y: -100 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              style={{
                position: 'absolute',
                top: '30%', left: '50%',
                transform: 'translateX(-50%)',
                background: '#00577a',
                color: 'white',
                borderRadius: 99,
                padding: 'min(2vw, 1.1vh) min(5vw, 2.8vh)',
                fontFamily: 'var(--font-display)',
                fontSize: 'min(7vw, 3.9vh)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 30px rgba(0,87,122,0.45)',
                zIndex: 15,
                pointerEvents: 'none',
              }}
            >
              +{pointsEarned} puntos 🐾
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nombre del gato + progreso */}
        <div style={{
          position: 'absolute', top: '4%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'min(1vw, 0.55vh)', zIndex: 2, pointerEvents: 'none',
        }}>
          {/* Badge con nombre del gato */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 99,
              padding: 'min(0.9vw, 0.5vh) min(4vw, 2.2vh)',
              display: 'flex', alignItems: 'center', gap: 'min(1.5vw, 0.85vh)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ fontSize: 'min(4vw, 2.3vh)' }}>🐱</span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(4.8vw, 2.7vh)',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {cat.name}
            </span>
          </motion.div>

          {!allDone && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'min(3.8vw, 2.1vh)',
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.03em',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {[cat.hasFed, cat.hasPlayed, cat.hasCared, cat.hasTalked].filter(Boolean).length} de 4 actividades completadas
            </motion.span>
          )}
        </div>

        <motion.img
          src={catSrc}
          alt="Gato"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '62.69%',
            objectFit: 'contain',
            objectPosition: 'bottom',
            userSelect: 'none', pointerEvents: 'none',
            filter: 'drop-shadow(0 20px 40px rgba(0,87,122,0.2))',
          }}
        />

        {/* Campeón CTA */}
        <AnimatePresence>
          {allDone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1, scale: 1, y: 0,
                boxShadow: [
                  '0 0 20px rgba(0,87,122,0.3)',
                  '0 0 55px rgba(0,87,122,0.75)',
                  '0 0 20px rgba(0,87,122,0.3)',
                ],
              }}
              transition={{
                opacity: { duration: 0.35 },
                scale: { duration: 0.35, type: 'spring' },
                boxShadow: { duration: 1.8, repeat: Infinity },
              }}
              onClick={() => onNavigate('championResult')}
              style={{
                position: 'absolute',
                bottom: '5%', left: '50%',
                transform: 'translateX(-50%)',
                background: '#00577a',
                color: 'white', border: 'none',
                borderRadius: 99,
                padding: 'min(2.8vw, 1.6vh) min(7vw, 4vh)',
                fontFamily: 'var(--font-display)',
                fontSize: 'min(5.5vw, 3.1vh)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0.03em',
                zIndex: 10,
              }}
            >
              🏆 ¡Ver resultado campeón!
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Botones nav circulares */}
      <div style={{
        position: 'relative', zIndex: 1, flexShrink: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        gap: 'min(4.4vw, 2.5vh)',
        padding: 'min(2.5vw, 1.4vh) 9% min(3.5vw, 2vh)',
      }}>
        {NAV.map(item => (
          <NavCircle
            key={item.id}
            icon={item.icon}
            label={item.label}
            done={cat[item.doneKey] as boolean}
            onClick={() => onNavigate(item.screen)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Botón circular individual ─────────────────────────────── */
interface NavCircleProps { icon: string; label: string; done: boolean; onClick: () => void; }

function NavCircle({ icon, label, done, onClick }: NavCircleProps) {
  const SIZE = 'min(17.13vw, 9.64vh)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)', flexShrink: 0 }}>
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.88 }}
        initial={false}
        animate={{
          backgroundColor: done ? '#ffffff' : '#00577a',
          boxShadow: done
            ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)'
            : '0 4px 16px rgba(0,0,0,0.2)',
        }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          width: SIZE, height: SIZE,
          borderRadius: '50%', border: 'none',
          cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          backgroundColor: done ? '#ffffff' : '#00577a',
        }}
      >
        <AnimatePresence>
          {done && (
            <motion.div
              key="fill"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: 'white',
                transformOrigin: 'bottom center',
                borderRadius: '50%',
                zIndex: 0,
              }}
            />
          )}
        </AnimatePresence>

        <img
          src={icon}
          alt=""
          style={{
            width: '54%', height: '54%',
            objectFit: 'contain',
            position: 'relative', zIndex: 1,
            filter: done ? 'none' : 'brightness(0) invert(1)',
            transition: 'filter 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      </motion.button>

      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'min(3.4vw, 1.9vh)',
        color: 'white',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        opacity: done ? 1 : 0.75,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        {done ? '✓ ' : ''}{label}
      </span>
    </div>
  );
}
