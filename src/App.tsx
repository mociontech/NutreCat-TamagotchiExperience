import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/global.css';

import type { CatState, ScreenName, FoodType } from './data/gameStates';
import { initialCatState, clamp } from './data/gameStates';

// Screens
import AttractLoop          from './screens/AttractLoop';
import WakeScreen           from './screens/WakeScreen';
import PetScreen            from './screens/PetScreen';
import RegistrationScreen   from './screens/RegistrationScreen';
import HubScreen            from './screens/HubScreen';
import FeedSelectScreen     from './screens/FeedSelectScreen';
import FeedInteractionScreen from './screens/FeedInteractionScreen';
import FootballGameScreen   from './screens/FootballGameScreen';
import GoalCelebrationScreen from './screens/GoalCelebrationScreen';
import CareScreen           from './screens/CareScreen';
import TalkScreen           from './screens/TalkScreen';
import ChampionResultScreen from './screens/ChampionResultScreen';
import RewardQrScreen       from './screens/RewardQrScreen';
import SharePostcardScreen  from './screens/SharePostcardScreen';

const pageVariants = {
  initial: { opacity: 0, scale: 0.97, y: 18 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: -18 },
};

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('attract');
  const [cat,    setCat]    = useState<CatState>(initialCatState);
  const [goalScore, setGoalScore] = useState(0);

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

  /* ── Handlers ── */
  const handleRegistration = (name: string) => {
    updateCat({ name });
    nav('hub');
  };

  const handleFeedSelect = (food: FoodType) => {
    updateCat({ selectedFood: food });
    nav('feedInteraction');
  };

  const handleFeedDone = () => {
    updateCat({
      energy:    clamp(cat.energy + 20),
      hunger:    clamp(cat.hunger - 40),
      affection: clamp(cat.affection + 5),
      hasFed: true,
      level: 'Alimentado',
    });
    nav('hub');
  };

  const handleGoal = (points: number) => {
    setGoalScore(points);
    nav('goalCelebration');
  };

  const handleGoalContinue = () => {
    updateCat({
      score:         cat.score + goalScore,
      mundialSpirit: clamp(cat.mundialSpirit + 25),
      affection:     clamp(cat.affection + 10),
      energy:        clamp(cat.energy - 10),
      hasPlayed: true,
      level: 'Juguetón',
    });
    nav('hub');
  };

  const handleCareDone = () => {
    updateCat({
      affection: clamp(cat.affection + 25),
      energy:    clamp(cat.energy + 10),
      hasCared: true,
      level: 'Cuidado',
    });
    nav('hub');
  };

  const handleTalkDone = () => {
    updateCat({
      affection: clamp(cat.affection + 15),
      mood:      clamp(cat.mood + 15),
      hasTalked: true,
      level: 'Curioso',
    });
    nav('hub');
  };

  const handleRestart = () => {
    setCat(initialCatState);
    setGoalScore(0);
    nav('attract');
  };

  /* ── Screen router ── */
  const renderScreen = () => {
    switch (screen) {
      case 'attract':
        return <AttractLoop onStart={() => nav('wake')} />;

      case 'wake':
        return <WakeScreen onNext={() => nav('pet')} />;

      case 'pet':
        return (
          <PetScreen
            onNext={() => {
              updateCat({ affection: clamp(cat.affection + 30), level: 'Despierto' });
              nav('registration');
            }}
          />
        );

      case 'registration':
        return <RegistrationScreen onNext={handleRegistration} />;

      /* Hub principal (reemplaza Dashboard) */
      case 'hub':
      case 'dashboard':
        return <HubScreen cat={cat} onNavigate={nav} />;

      case 'feedSelect':
        return <FeedSelectScreen onSelect={handleFeedSelect} onBack={() => nav('hub')} />;

      case 'feedInteraction':
        return <FeedInteractionScreen selectedFood={cat.selectedFood} onDone={handleFeedDone} onBack={() => nav('hub')} />;

      case 'footballGame':
        return <FootballGameScreen onGoal={handleGoal} onBack={() => nav('hub')} />;

      case 'goalCelebration':
        return <GoalCelebrationScreen score={goalScore} onContinue={handleGoalContinue} />;

      case 'care':
        return <CareScreen onDone={handleCareDone} onBack={() => nav('hub')} />;

      case 'talk':
        return <TalkScreen onDone={handleTalkDone} onBack={() => nav('hub')} />;

      case 'championResult':
        return <ChampionResultScreen cat={cat} onClaim={() => nav('rewardQr')} />;

      case 'rewardQr':
        return <RewardQrScreen onNext={() => nav('sharePostcard')} />;

      case 'sharePostcard':
        return <SharePostcardScreen cat={cat} onRestart={handleRestart} />;

      default:
        return <AttractLoop onStart={() => nav('wake')} />;
    }
  };

  return (
    <div className="totem-container">
      <div className="totem-frame">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
