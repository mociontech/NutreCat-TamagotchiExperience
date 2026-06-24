import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { CatState, ScreenName } from '../data/gameStates';
import { sfx, bgPlay, bgStop } from '../utils/sounds';


const SLEEPY_PHRASES = ['Tiene sueño...', 'Zzz...', 'Se está durmiendo...', 'Zzz...'];

const CONFETTI_COLORS = ['#FCD116', '#ffffff', '#00577a', '#ff6b6b', '#a8edea', '#fed330'];


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
  comingFromSleep?: boolean;
  onComingFromSleepConsumed?: () => void;
}

const NAV = [
  { id: 'game',  label: 'Jugar',  icon: '/assets/nav/icon-game.svg',  screen: 'gameSelect' as ScreenName, doneKey: 'hasPlayed' as keyof CatState },
  { id: 'food',  label: 'Comer',  icon: '/assets/nav/icon-food.svg',  screen: 'feedSelect' as ScreenName, doneKey: 'hasFed'    as keyof CatState },
  { id: 'sleep', label: 'Dormir', icon: '/assets/nav/icon-sleep.svg', screen: 'talk'       as ScreenName, doneKey: 'hasTalked' as keyof CatState },
] as const;

export default function HubScreen({ cat, onNavigate, pointsEarned, onPointsShown, comingFromSleep = false, onComingFromSleepConsumed }: Props) {
  const allDone  = cat.hasFed && cat.hasPlayed && cat.hasTalked;

  // Música ambiental del Hub
  useEffect(() => {
    bgPlay('ukulele', 0.08);
    return () => bgStop('ukulele');
  }, []);
  const isSleepy  = cat.hasFed && !cat.hasTalked;
  const isHungry  = cat.hasPlayed && !cat.hasFed;
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [showPoints,  setShowPoints]  = useState(false);
  const [pointsKey,   setPointsKey]   = useState(0);
  const [displayedScore, setDisplayedScore] = useState(cat.score);
  const [transferPoints, setTransferPoints] = useState(0);
  const [confetti,    setConfetti]    = useState<ConfettiPiece[]>([]);
  const [showLabels,  setShowLabels]  = useState(true);
  const [shakeGame,   setShakeGame]   = useState(false);
  const [animState,   setAnimState]   = useState<{ name: 'Saludar' | 'Aburrido' | 'ConHambreLobby' | 'Esperando' | 'Esperando2' | 'Esperando3' | 'Cansado' | 'Celebrando'; key: number }>(() =>
    comingFromSleep ? { name: 'Celebrando', key: 0 } : cat.hasFed && !cat.hasTalked ? { name: 'Cansado', key: 0 } : { name: 'Saludar', key: 0 }
  );
  const saludarCount           = useRef(0);
  const esperandoCount         = useRef(0);
  const aburridoHungryCount    = useRef(0);
  const esperandoSleepyCount   = useRef(0);
  const isSleepyRef            = useRef(false);
  const esperandoVariant       = useRef(0);
  const ESPERANDO_VARIANTS     = ['Esperando', 'Esperando2', 'Esperando3'] as const;
  const nextEsperando = () => {
    const v = ESPERANDO_VARIANTS[esperandoVariant.current % 3];
    esperandoVariant.current++;
    return v;
  };
  const skipSaludarReset       = useRef(comingFromSleep);
  const hasTalkedRef           = useRef(cat.hasTalked);
  const celebrandoCount        = useRef(0);
  const catVideoRef        = useRef<HTMLVideoElement>(null);
  const prevAllDone        = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLabels(false), 3000);
    return () => clearTimeout(t);
  }, []);

  /* Cambia el src del video sin remount para evitar parpadeo */
  useEffect(() => {
    const v = catVideoRef.current;
    if (!v) return;
    v.src = `/assets/cat/Animation/${animState.name}.webm`;
    v.load();
    v.play().catch(() => {});
  }, [animState.name, animState.key]);

  /* Resetea el ciclo de animación según el estado de actividades */
  useEffect(() => {
    if (isHungry) {
      aburridoHungryCount.current = 0;
      setAnimState(prev => ({ name: 'Aburrido', key: prev.key + 1 }));
    }
  }, [isHungry]);

  useEffect(() => {
    isSleepyRef.current = isSleepy;
  }, [isSleepy]);

  useEffect(() => {
    hasTalkedRef.current = cat.hasTalked;
  }, [cat.hasTalked]);

  useEffect(() => {
    onComingFromSleepConsumed?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSleepy) {
      esperandoSleepyCount.current = 0;
      setAnimState(prev => ({ name: 'Cansado', key: prev.key + 1 }));
    } else if (!isHungry) {
      if (skipSaludarReset.current) return;
      saludarCount.current = 0;
      setAnimState(prev => ({ name: 'Saludar', key: prev.key + 1 }));
    }
  }, [isSleepy]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Sacudida periódica del botón de juego cuando el gato está aburrido */
  useEffect(() => {
    if (animState.name !== 'Aburrido' || cat.hasPlayed) return;
    const interval = setInterval(() => {
      setShakeGame(true);
      setTimeout(() => setShakeGame(false), 600);
    }, 7000);
    return () => clearInterval(interval);
  }, [animState.name, cat.hasPlayed]);

  useEffect(() => {
    if (!isSleepy) return;
    const t = setInterval(() => setPhraseIdx(i => (i + 1) % SLEEPY_PHRASES.length), 2600);
    return () => clearInterval(t);
  }, [isSleepy]);

  useEffect(() => {
    if (!pointsEarned) setDisplayedScore(cat.score);
  }, [cat.score, pointsEarned]);

  /* Inyecta los puntos ganados al contador del Hub */
  useEffect(() => {
    if (!pointsEarned) return;
    const startScore = Math.max(0, cat.score - pointsEarned);
    const duration = 1500;
    const start = performance.now();

    setDisplayedScore(startScore);
    setTransferPoints(pointsEarned);
    setShowPoints(true);
    setPointsKey(k => k + 1);

    let raf = 0;
    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    const tick = (now: number) => {
      const progress = Math.max(0, Math.min((now - start - 650) / duration, 1));
      const eased = 1 - Math.pow(1 - progress, 3);
      const injected = Math.round(pointsEarned * eased);
      setDisplayedScore(startScore + injected);
      setTransferPoints(Math.max(0, pointsEarned - injected));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    delayTimer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 650);
    const t = setTimeout(() => {
      setShowPoints(false);
      setDisplayedScore(cat.score);
      onPointsShown?.();
    }, 2600);
    return () => {
      cancelAnimationFrame(raf);
      if (delayTimer) clearTimeout(delayTimer);
      clearTimeout(t);
    };
  }, [cat.score, pointsEarned, onPointsShown]);

  /* Bling al recibir puntos */
  useEffect(() => {
    if (pointsEarned) sfx('bling', 0.75);
  }, [pointsEarned]);

  /* Confetti + fanfare al completar todas las actividades */
  useEffect(() => {
    if (allDone && !prevAllDone.current) {
      sfx('fanfare', 0.85);
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
        backgroundImage: 'url(/assets/backgrounds/bg-pet2.png)',
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
            borderRadius: 'min(3.8vw, 2.14vh)',
            width: 'min(33.3vw, 18.75vh)',
            height: 'min(7.6vw, 4.27vh)',
            boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(6.57vw, 3.7vh)',
            color: '#00577a',
            textTransform: 'uppercase',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            paddingTop: '0.25em',
          }}>
            Puntos: {displayedScore}
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPoints && pointsEarned && (
          <motion.div
            key={pointsKey}
            initial={{ opacity: 0, scale: 0.82, y: -8 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.92, 1.1, 1.04, 0.9], y: [-8, 0, 0, -10] }}
            exit={{ opacity: 0, scale: 0.85, y: -12 }}
            transition={{ duration: 2.2, ease: 'easeInOut', times: [0, 0.18, 0.78, 1] }}
            style={{
              position: 'absolute',
              top: 'calc(5% + min(7.6vw, 4.27vh) + 10px)',
              right: '9%',
              width: 'min(33.3vw, 18.75vh)',
              zIndex: 18,
              pointerEvents: 'none',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.2vw, 3.5vh)',
              color: 'white',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1,
              letterSpacing: '0.04em',
              textShadow: '0 0 14px rgba(255,255,255,0.95), 0 4px 14px rgba(0,87,122,0.45)',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.45))',
              whiteSpace: 'nowrap',
            }}
          >
            +{transferPoints} puntos
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gato central */}
      <div style={{
        flex: 1, position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 0,
      }}>
        {/* Pill "¿Y si jugamos?" cuando está aburrido */}
        <AnimatePresence>
          {animState.name === 'Aburrido' && !cat.hasPlayed && !isHungry && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.9 }}
              animate={{
                opacity: 1, y: [0, -5, 0], scale: [1, 1.04, 1],
              }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{
                opacity: { duration: 0.4, delay: 0.4 },
                y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
                scale: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 },
              }}
              style={{
                position: 'absolute', top: 'calc(8% + 220px)', left: 'calc(50% + 100px)',
                transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.5)',
                borderRadius: 99,
                padding: 'min(1.5vw, 0.85vh) min(4vw, 2.2vh)',
                fontFamily: 'var(--font-display)',
                fontSize: 'min(4vw, 2.3vh)',
                color: 'white',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 28px rgba(0,87,122,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
                zIndex: 3,
                pointerEvents: 'none',
              }}
            >
              ¿Y si jugamos?
            </motion.div>
          )}
        </AnimatePresence>

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
                position: 'absolute', top: 'calc(8% + 230px)', left: 'calc(50% + 50px)',
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

        {/* Nombre del gato + progreso */}
        <div style={{
          position: 'absolute', top: '4%', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'min(1vw, 0.55vh)', zIndex: 2, pointerEvents: 'none',
        }}>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(3.8vw, 2.1vh)',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.03em',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            {allDone
              ? 'Todas las actividades completadas'
              : `${[cat.hasFed, cat.hasPlayed, cat.hasTalked].filter(Boolean).length} de 3 actividades completadas`}
          </motion.span>

          {/* Badge con nombre del gato */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              marginTop: 'calc(min(2.78vw, 1.56vh) + 5px)',
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 99,
              padding: 'min(0.9vw, 0.5vh) min(4vw, 2.2vh)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6vw, 3.38vh)',
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              paddingTop: 8.5,
              display: 'block',
            }}>
              {cat.name}
            </span>
          </motion.div>
        </div>

        <video
          ref={catVideoRef}
          autoPlay
          muted
          playsInline
          onEnded={() => {
            setAnimState(prev => {
              if (isHungry) {
                if (prev.name === 'Aburrido') {
                  aburridoHungryCount.current += 1;
                  if (aburridoHungryCount.current >= 3) {
                    aburridoHungryCount.current = 0;
                    return { name: 'ConHambreLobby', key: prev.key + 1 };
                  }
                  return { name: 'Aburrido', key: prev.key + 1 };
                }
                return { name: 'Aburrido', key: prev.key + 1 };
              }
              if (prev.name === 'Celebrando') {
                celebrandoCount.current += 1;
                if (celebrandoCount.current < 2) {
                  return { name: 'Celebrando', key: prev.key + 1 };
                }
                skipSaludarReset.current = false;
                saludarCount.current = 0;
                return { name: 'Saludar', key: prev.key + 1 };
              }
              if (prev.name === 'Saludar') {
                if (hasTalkedRef.current) {
                  return { name: 'Saludar', key: prev.key + 1 };
                }
                saludarCount.current += 1;
                if (saludarCount.current >= 1) {
                  saludarCount.current = 0;
                  esperandoCount.current = 0;
                  return { name: nextEsperando(), key: prev.key + 1 };
                }
                return { name: 'Saludar', key: prev.key + 1 };
              }
              const isEsperando = prev.name === 'Esperando' || prev.name === 'Esperando2' || prev.name === 'Esperando3';
              if (isEsperando) {
                if (isSleepyRef.current) {
                  esperandoSleepyCount.current += 1;
                  if (esperandoSleepyCount.current >= 2) {
                    return { name: 'Cansado', key: prev.key + 1 };
                  }
                  return { name: nextEsperando(), key: prev.key + 1 };
                }
                esperandoCount.current += 1;
                if (esperandoCount.current >= 2) {
                  return { name: 'Aburrido', key: prev.key + 1 };
                }
                return { name: nextEsperando(), key: prev.key + 1 };
              }
              if (prev.name === 'Aburrido' && !isHungry) {
                return { name: 'Aburrido', key: prev.key + 1 };
              }
              if (prev.name === 'Cansado') {
                return { name: 'Cansado', key: prev.key + 1 };
              }
              return { name: 'Saludar', key: prev.key + 1 };
            });
          }}
          style={{
            width: animState.name === 'Saludar' ? '90.34%' : '90.34%',
            height: 'auto',
            flexShrink: 0,
            userSelect: 'none', pointerEvents: 'none',
            filter: 'drop-shadow(0 20px 40px rgba(0,87,122,0.2))',
            marginTop: 195,
            marginLeft: 70,
          }}
        />

      </div>

      {/* Campeón CTA — centrado horizontalmente en su propia fila */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, type: 'spring' }}
            style={{ flexShrink: 0, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', padding: '0 9% min(2vw, 1.1vh)', marginBottom: 35 }}
          >
            <motion.button
              animate={{
                scale: [1, 1.035, 1],
                boxShadow: ['0 0 20px rgba(255,255,255,0.3), 0 0 18px rgba(0,87,122,0.22)', '0 0 58px rgba(255,255,255,0.85), 0 0 46px rgba(0,87,122,0.58)', '0 0 20px rgba(255,255,255,0.3), 0 0 18px rgba(0,87,122,0.22)'],
              }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              onClick={() => { sfx('snap', 0.6); onNavigate('rewardQr'); }}
              style={{
                width: '100%', height: 82, padding: '15px min(4vw, 2.2vh) 0',
                background: 'white', color: '#00577a',
                border: 'none',
                borderRadius: 99,
                fontFamily: 'var(--font-display)',
                fontSize: 77.742,
                lineHeight: 1,
                cursor: 'pointer',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.span
                animate={{ opacity: [0.18, 0.45, 0.18], scale: [0.85, 1.25, 0.85] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '-45% 10%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 38%, rgba(255,255,255,0) 70%)',
                  pointerEvents: 'none',
                }}
              />
              <span style={{ position: 'relative', zIndex: 1 }}>Ver resultado campeón</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botones nav circulares */}
      <AnimatePresence>
        {!allDone && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{
              position: 'relative', zIndex: 1, flexShrink: 0,
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: 'min(4.4vw, 2.5vh)',
              padding: 'min(2.5vw, 1.4vh) 9% min(3.5vw, 2vh)',
            }}
          >
            {NAV.map(item => (
              <NavCircle
                key={item.id}
                icon={item.icon}
                label={item.label}
                done={cat[item.doneKey] as boolean}
                showLabel={showLabels}
                pulse={item.id === 'game' && animState.name === 'Aburrido' && !cat.hasPlayed}
                shake={item.id === 'game' && shakeGame}
                onClick={() => onNavigate(item.screen)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Botón circular individual ─────────────────────────────── */
interface NavCircleProps { icon: string; label: string; done: boolean; showLabel: boolean; pulse?: boolean; shake?: boolean; onClick: () => void; }

function NavCircle({ icon, label, done, showLabel, pulse = false, shake = false, onClick }: NavCircleProps) {
  // 185×185px en el canvas Figma 1080×1920
  const SIZE = 'min(17.13vw, 9.64vh)';

  return (
    <motion.div
      animate={{ x: shake ? [0, -7, 7, -7, 7, -4, 4, 0] : 0 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)', flexShrink: 0, flexGrow: 0 }}>
      {/* Wrapper con dimensiones fijas para que el circle nunca se deforme */}
      <div style={{ width: SIZE, height: SIZE, flexShrink: 0, flexGrow: 0, position: 'relative', overflow: 'visible' }}>
      <motion.button
        onClick={() => { sfx('snap', 0.55); onClick(); }}
        whileTap={{ scale: 0.88 }}
        initial={false}
        animate={{
          backgroundColor: done ? '#ffffff' : '#00577a',
          boxShadow: done
            ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)'
            : '0 4px 16px rgba(0,0,0,0.2)',
          scale: pulse ? [1, 1.06, 1] : 1,
        }}
        transition={{
          duration: 0.45, ease: 'easeOut',
          ...(pulse && {
            scale: { duration: 3.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] },
          })
        }}
        style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%', border: 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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

        {pulse && (
          <motion.div
            animate={{ opacity: [0, 0.18, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 100%)',
              zIndex: 2, pointerEvents: 'none',
            }}
          />
        )}
        <div
          style={{
            width: '62%', aspectRatio: '1',
            position: 'relative', zIndex: 3,
            pointerEvents: 'none',
            backgroundColor: '#00B6ED',
            WebkitMaskImage: `url(${icon})`,
            maskImage: `url(${icon})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </motion.button>
      </div>{/* fin wrapper cuadrado */}

      <motion.span

        animate={{ opacity: showLabel ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(4.08vw, 2.28vh)',
          color: '#f2f2f2',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {done ? '✓ ' : ''}{label}
      </motion.span>
    </motion.div>
  );
}
