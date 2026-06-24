import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/global.css';

import type { CatState, ScreenName, FoodType } from './data/gameStates';
import { initialCatState, clamp } from './data/gameStates';
import { bgPlay, bgStop, muteAll, unmuteAll } from './utils/sounds';

import AttractLoop            from './screens/AttractLoop';
import PetScreen              from './screens/PetScreen';
import RegistrationScreen     from './screens/RegistrationScreen';
import HubScreen              from './screens/HubScreen';
import GameSelectScreen       from './screens/GameSelectScreen';
import FeedSelectScreen       from './screens/FeedSelectScreen';
import FeedInteractionScreen  from './screens/FeedInteractionScreen';
import FootballInstructionsScreen from './screens/FootballInstructionsScreen';
import FootballGameScreen     from './screens/FootballGameScreen';
import FootballResultsScreen  from './screens/FootballResultsScreen';
import CountdownScreen                  from './screens/CountdownScreen';
import FallingBagsGameScreen           from './screens/FallingBagsGameScreen';
import FallingBagsBenefitsScreen       from './screens/FallingBagsBenefitsScreen';
import FallingBagsInstructionsScreen   from './screens/FallingBagsInstructionsScreen';
import TalkScreen             from './screens/TalkScreen';
import RewardQrScreen         from './screens/RewardQrScreen';

const IDLE_MS         = 3 * 60 * 1000; // 3 min → aviso

const INTERACTION_SCREENS: ScreenName[] = [
  'gameSelect', 'feedSelect', 'feedInteraction',
  'footballInstructions', 'footballResults',
  'fallingBagsBenefits', 'fallingBagsInstructions', 'fallingBagsCountdown',
];
const WARNING_SECS    = 10;            // 10 s de aviso antes de resetear

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, y: 18 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: -18 },
};

export default function App() {
  const [screen, setScreen]             = useState<ScreenName>('attract');
  const [cat,    setCat]                = useState<CatState>(initialCatState);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [comingFromSleep, setComingFromSleep] = useState(false);
  const [footballResult, setFootballResult] = useState<{ pts: number; pScore: number; mScore: number } | null>(null);
  const [idleWarning, setIdleWarning]   = useState(false);
  const [warnSecs,  setWarnSecs]        = useState(WARNING_SECS);
  const [muted,     setMutedState]      = useState(false);

  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutedRef          = useRef(false);
  const idleAutoMutedRef  = useRef(false);

  const toggleMute = () => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMutedState(next);
    if (next) muteAll(); else unmuteAll();
  };

  const doReset = useCallback(() => {
    setIdleWarning(false);
    // Restaurar audio si fue auto-muteado por idle
    if (idleAutoMutedRef.current && !mutedRef.current) unmuteAll();
    idleAutoMutedRef.current = false;
    setCat(initialCatState);
    setPointsEarned(null);
    setScreen('attract');
  }, []);

  const clearWarning = useCallback(() => {
    setIdleWarning(false);
    if (warnTimer.current)    clearTimeout(warnTimer.current);
    if (warnInterval.current) clearInterval(warnInterval.current);
    // Restaurar audio si fue auto-muteado por idle
    if (idleAutoMutedRef.current && !mutedRef.current) unmuteAll();
    idleAutoMutedRef.current = false;
  }, []);

  const resetIdle = useCallback(() => {
    clearWarning();
    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      // Mostrar aviso con countdown y silenciar audio
      setWarnSecs(WARNING_SECS);
      setIdleWarning(true);
      if (!mutedRef.current) { idleAutoMutedRef.current = true; muteAll(); }

      let remaining = WARNING_SECS;
      warnInterval.current = setInterval(() => {
        remaining -= 1;
        setWarnSecs(remaining);
        if (remaining <= 0) {
          clearInterval(warnInterval.current!);
        }
      }, 1000);

      warnTimer.current = setTimeout(doReset, WARNING_SECS * 1000);
    }, IDLE_MS);
  }, [clearWarning, doReset]);

  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleTimer.current)    clearTimeout(idleTimer.current);
      if (warnTimer.current)    clearTimeout(warnTimer.current);
      if (warnInterval.current) clearInterval(warnInterval.current);
    };
  }, [resetIdle]);

  useEffect(() => {
    if (screen === 'talk') {
      bgStop('soundtrack');
    } else if (['attract', 'registration', 'pet'].includes(screen)) {
      bgPlay('soundtrack', 0.06, 1.0);
    } else if (['hub', 'dashboard'].includes(screen)) {
      bgPlay('soundtrack', 0.08, 1.0);
    } else if (INTERACTION_SCREENS.includes(screen)) {
      bgPlay('soundtrack', 0.04, 1.0);
    } else if (screen === 'fallingBagsGame' || screen === 'footballGame') {
      bgPlay('soundtrack', 0.05, 1.0);
    } else if (screen === 'rewardQr') {
      bgPlay('soundtrack', 0.1, 1.0);
    }
  }, [screen]);

  const nav = useCallback((s: ScreenName) => setScreen(s), []);

  const updateCat = useCallback((updates: Partial<CatState>) => {
    setCat(prev => {
      const next = { ...prev, ...updates };
      if (next.hasFed && next.hasPlayed && next.hasTalked) {
        next.isChampion = true;
        next.level = 'Campeón';
      }
      return next;
    });
  }, []);

  const handleRegistration = (name: string) => { updateCat({ name }); nav('pet'); };
  const handleFeedSelect   = (food: FoodType) => { updateCat({ selectedFood: food }); nav('feedInteraction'); };

  const flashPoints = (pts: number) => setPointsEarned(pts);

  const handleFeedDone = () => {
    const pts = 30;
    updateCat({ energy: clamp(cat.energy + 20), hunger: clamp(cat.hunger - 40), affection: clamp(cat.affection + 5), score: cat.score + pts, hasFed: true, level: 'Alimentado' });
    flashPoints(pts); nav('hub');
  };

  const handleGoal = (pts: number, pScore: number, mScore: number) => {
    updateCat({ score: cat.score + pts, playScore: pts, mundialSpirit: clamp(cat.mundialSpirit + 25), affection: clamp(cat.affection + 10), energy: clamp(cat.energy - 10), hasPlayed: true, level: 'Juguetón' });
    setFootballResult({ pts, pScore, mScore });
    nav('footballResults');
  };

  const handleBagsDone = (points: number) => {
    updateCat({ score: cat.score + points, mundialSpirit: clamp(cat.mundialSpirit + 20), affection: clamp(cat.affection + 10), energy: clamp(cat.energy - 5), hasPlayed: true, level: 'Juguetón' });
    flashPoints(points); nav('hub');
  };

const handleTalkDone = () => {
    const pts = 20;
    updateCat({ affection: clamp(cat.affection + 15), mood: clamp(cat.mood + 15), score: cat.score + pts, hasTalked: true, level: 'Curioso' });
    flashPoints(pts);
    setComingFromSleep(true);
    nav('hub');
  };

  const handleRestart = () => { setCat(initialCatState); setPointsEarned(null); nav('attract'); };

  const renderScreen = () => {
    switch (screen) {
      case 'attract':      return <AttractLoop onStart={() => nav('registration')} />;
      case 'registration': return <RegistrationScreen onNext={handleRegistration} />;
      case 'pet':          return <PetScreen name={cat.name} onNext={() => { updateCat({ affection: clamp(cat.affection + 30), level: 'Despierto' }); nav('hub'); }} />;
      case 'hub':
      case 'dashboard':    return <HubScreen cat={cat} onNavigate={nav} pointsEarned={pointsEarned} onPointsShown={() => setPointsEarned(null)} comingFromSleep={comingFromSleep} onComingFromSleepConsumed={() => setComingFromSleep(false)} />;

      case 'gameSelect':   return <GameSelectScreen onSelect={nav} onBack={() => nav('hub')} score={cat.score} hasFed={cat.hasFed} hasPlayed={cat.hasPlayed} hasTalked={cat.hasTalked} />;

      case 'feedSelect':      return <FeedSelectScreen onSelect={handleFeedSelect} onBack={() => nav('hub')} score={cat.score} hasFed={cat.hasFed} hasPlayed={cat.hasPlayed} hasTalked={cat.hasTalked} />;
      case 'feedInteraction': return <FeedInteractionScreen selectedFood={cat.selectedFood ?? 'treats'} onDone={handleFeedDone} onBack={() => nav('hub')} score={cat.score} />;

      case 'footballInstructions': return <FootballInstructionsScreen onDone={() => nav('footballGame')} score={cat.score} />;
      case 'footballGame':    return <FootballGameScreen onGoal={handleGoal} />;
      case 'footballResults': return <FootballResultsScreen
        pts={footballResult?.pts ?? 0}
        pScore={footballResult?.pScore ?? 0}
        mScore={footballResult?.mScore ?? 0}
        onDone={() => { flashPoints(footballResult?.pts ?? 0); nav('hub'); }}
      />;

      case 'fallingBagsBenefits':     return <FallingBagsBenefitsScreen     onDone={() => nav('fallingBagsInstructions')} />;
      case 'fallingBagsInstructions': return <FallingBagsInstructionsScreen onDone={() => nav('fallingBagsCountdown')} score={cat.score} />;
      case 'fallingBagsCountdown':    return <CountdownScreen               onDone={() => nav('fallingBagsGame')} />;
      case 'fallingBagsGame':         return <FallingBagsGameScreen         onDone={handleBagsDone} />;

      case 'talk': return <TalkScreen onDone={handleTalkDone} onBack={() => nav('hub')} hasFed={cat.hasFed} hasPlayed={cat.hasPlayed} hasTalked={cat.hasTalked} score={cat.score} />;

      case 'rewardQr': return <RewardQrScreen cat={cat} onNext={handleRestart} />;

      default: return <AttractLoop onStart={() => nav('attract')} />;
    }
  };

  return (
    <div className="totem-container">
      <div className="totem-frame">
        {/* Botón mute — casi invisible, esquina superior izquierda */}
        <motion.button
          onClick={toggleMute}
          whileTap={{ opacity: 0.8, scale: 0.88 }}
          style={{
            position: 'absolute',
            top: 'min(2vw, 1.1vh)',
            left: 'min(2vw, 1.1vh)',
            width: 'min(5.5vw, 3.1vh)',
            height: 'min(5.5vw, 3.1vh)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: 0.18,
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 0,
            borderRadius: '50%',
          }}
        >
          <span style={{ fontSize: 'min(4.5vw, 2.5vh)', lineHeight: 1, userSelect: 'none' }}>
            {muted ? '🔇' : '🔊'}
          </span>
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={pageVariants}
            initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.25 }}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* Overlay aviso de inactividad */}
        <AnimatePresence>
          {idleWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => { clearWarning(); resetIdle(); }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,87,122,0.88)',
                backdropFilter: 'blur(6px)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 'min(4vw, 2.2vh)',
                zIndex: 100, cursor: 'pointer',
              }}
            >
              {/* Cuenta regresiva circular */}
              <div style={{ position: 'relative', width: 'min(28vw, 15.7vh)', height: 'min(28vw, 15.7vh)' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none" stroke="white" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(warnSecs / WARNING_SECS) * 263.9} 263.9`}
                    style={{ transition: 'stroke-dasharray 1s linear' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'min(10vw, 5.6vh)',
                    color: 'white',
                    lineHeight: 1,
                  }}>{warnSecs}</span>
                </div>
              </div>

              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(7vw, 3.9vh)',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textAlign: 'center',
                margin: 0,
              }}>
                ¿Sigues ahí?
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'min(4.5vw, 2.5vh)',
                color: 'rgba(255,255,255,0.75)',
                textAlign: 'center',
                margin: 0,
                letterSpacing: '0.02em',
              }}>
                Volviendo al inicio en {warnSecs}s…
              </p>

              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  marginTop: 'min(2vw, 1.1vh)',
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 99,
                  padding: 'min(2.5vw, 1.4vh) min(8vw, 4.5vh)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(4.8vw, 2.7vh)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: '2px solid rgba(255,255,255,0.35)',
                }}
              >
                Toca para continuar
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
