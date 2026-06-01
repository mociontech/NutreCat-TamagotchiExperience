import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/global.css';

import type { CatState, ScreenName, FoodType } from './data/gameStates';
import { initialCatState, clamp } from './data/gameStates';

import AttractLoop            from './screens/AttractLoop';
import PetScreen              from './screens/PetScreen';
import RegistrationScreen     from './screens/RegistrationScreen';
import HubScreen              from './screens/HubScreen';
import GameSelectScreen       from './screens/GameSelectScreen';
import FeedSelectScreen       from './screens/FeedSelectScreen';
import FeedInteractionScreen  from './screens/FeedInteractionScreen';
import FootballGameScreen     from './screens/FootballGameScreen';
import GoalCelebrationScreen  from './screens/GoalCelebrationScreen';
import CountdownScreen        from './screens/CountdownScreen';
import FallingBagsGameScreen  from './screens/FallingBagsGameScreen';
import CareScreen             from './screens/CareScreen';
import TalkScreen             from './screens/TalkScreen';
import ChampionResultScreen   from './screens/ChampionResultScreen';
import RewardQrScreen         from './screens/RewardQrScreen';
import SharePostcardScreen    from './screens/SharePostcardScreen';

const IDLE_MS         = 3 * 60 * 1000; // 3 min → aviso
const WARNING_SECS    = 10;            // 10 s de aviso antes de resetear

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, y: 18 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: -18 },
};

export default function App() {
  const [screen, setScreen]             = useState<ScreenName>('attract');
  const [cat,    setCat]                = useState<CatState>(initialCatState);
  const [goalScore, setGoalScore]       = useState(0);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const [idleWarning, setIdleWarning]   = useState(false);
  const [warnSecs,  setWarnSecs]        = useState(WARNING_SECS);

  const idleTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const doReset = useCallback(() => {
    setIdleWarning(false);
    setCat(initialCatState);
    setGoalScore(0);
    setPointsEarned(null);
    setScreen('attract');
  }, []);

  const clearWarning = useCallback(() => {
    setIdleWarning(false);
    if (warnTimer.current)    clearTimeout(warnTimer.current);
    if (warnInterval.current) clearInterval(warnInterval.current);
  }, []);

  const resetIdle = useCallback(() => {
    clearWarning();
    if (idleTimer.current) clearTimeout(idleTimer.current);

    idleTimer.current = setTimeout(() => {
      // Mostrar aviso con countdown
      setWarnSecs(WARNING_SECS);
      setIdleWarning(true);

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

  const nav = useCallback((s: ScreenName) => setScreen(s), []);

  const updateCat = useCallback((updates: Partial<CatState>) => {
    setCat(prev => {
      const next = { ...prev, ...updates };
      if (next.hasFed && next.hasPlayed && next.hasCared && next.hasTalked) {
        next.isChampion = true;
        next.level = 'Campeón';
      }
      return next;
    });
  }, []);

  const handleRegistration = (name: string) => { updateCat({ name }); nav('hub'); };
  const handleFeedSelect   = (food: FoodType) => { updateCat({ selectedFood: food }); nav('feedInteraction'); };

  const flashPoints = (pts: number) => setPointsEarned(pts);

  const handleFeedDone = () => {
    const pts = 30;
    updateCat({ energy: clamp(cat.energy + 20), hunger: clamp(cat.hunger - 40), affection: clamp(cat.affection + 5), score: cat.score + pts, hasFed: true, level: 'Alimentado' });
    flashPoints(pts); nav('hub');
  };

  const handleGoal         = (points: number) => { setGoalScore(points); nav('goalCelebration'); };

  const handleGoalContinue = () => {
    updateCat({ score: cat.score + goalScore, mundialSpirit: clamp(cat.mundialSpirit + 25), affection: clamp(cat.affection + 10), energy: clamp(cat.energy - 10), hasPlayed: true, level: 'Juguetón' });
    flashPoints(goalScore); nav('hub');
  };

  const handleBagsDone = (points: number) => {
    updateCat({ score: cat.score + points, mundialSpirit: clamp(cat.mundialSpirit + 20), affection: clamp(cat.affection + 10), energy: clamp(cat.energy - 5), hasPlayed: true, level: 'Juguetón' });
    flashPoints(points); nav('hub');
  };

  const handleCareDone = () => {
    const pts = 25;
    updateCat({ affection: clamp(cat.affection + 25), energy: clamp(cat.energy + 10), score: cat.score + pts, hasCared: true, level: 'Cuidado' });
    flashPoints(pts); nav('hub');
  };

  const handleTalkDone = () => {
    const pts = 20;
    updateCat({ affection: clamp(cat.affection + 15), mood: clamp(cat.mood + 15), score: cat.score + pts, hasTalked: true, level: 'Curioso' });
    flashPoints(pts); nav('hub');
  };

  const handleRestart = () => { setCat(initialCatState); setGoalScore(0); setPointsEarned(null); nav('attract'); };

  const renderScreen = () => {
    switch (screen) {
      case 'attract':      return <AttractLoop onStart={() => nav('pet')} />;
      case 'pet':          return <PetScreen onNext={() => { updateCat({ affection: clamp(cat.affection + 30), level: 'Despierto' }); nav('registration'); }} />;
      case 'registration': return <RegistrationScreen onNext={handleRegistration} />;
      case 'hub':
      case 'dashboard':    return <HubScreen cat={cat} onNavigate={nav} pointsEarned={pointsEarned} onPointsShown={() => setPointsEarned(null)} />;

      case 'gameSelect':   return <GameSelectScreen onSelect={nav} onBack={() => nav('hub')} score={cat.score} />;

      case 'feedSelect':      return <FeedSelectScreen onSelect={handleFeedSelect} onBack={() => nav('hub')} score={cat.score} />;
      case 'feedInteraction': return <FeedInteractionScreen selectedFood={cat.selectedFood} onDone={handleFeedDone} onBack={() => nav('hub')} score={cat.score} />;

      case 'footballGame':    return <FootballGameScreen onGoal={handleGoal} onBack={() => nav('gameSelect')} />;
      case 'goalCelebration': return <GoalCelebrationScreen score={goalScore} onContinue={handleGoalContinue} />;

      case 'fallingBagsCountdown': return <CountdownScreen onDone={() => nav('fallingBagsGame')} />;
      case 'fallingBagsGame':      return <FallingBagsGameScreen onDone={handleBagsDone} />;

      case 'care': return <CareScreen onDone={handleCareDone} onBack={() => nav('hub')} score={cat.score} />;
      case 'talk': return <TalkScreen onDone={handleTalkDone} onBack={() => nav('hub')} score={cat.score} />;

      case 'championResult': return <ChampionResultScreen cat={cat} onClaim={() => nav('rewardQr')} />;
      case 'rewardQr': return <RewardQrScreen cat={cat} onNext={handleRestart} onShare={() => nav('sharePostcard')} />;
      case 'sharePostcard': return <SharePostcardScreen cat={cat} onRestart={handleRestart} />;

      default: return <AttractLoop onStart={() => nav('attract')} />;
    }
  };

  return (
    <div className="totem-container">
      <div className="totem-frame">
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
