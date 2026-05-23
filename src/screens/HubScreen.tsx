import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { CatState, ScreenName } from '../data/gameStates';
import NutreCatLogo from '../components/NutreCatLogo';
import PrimaryButton from '../components/PrimaryButton';
import BottomNav, { type NavTabId, type NavTabDef } from '../components/BottomNav';

interface Props {
  cat: CatState;
  onNavigate: (screen: ScreenName) => void;
}

type Tab = NavTabId;

interface TabConfig {
  id: Tab;
  screen: ScreenName;
  label: string;
  shortLabel: string;
  doneKey: keyof CatState;
  accentColor: string;
  catImage: string;
}

const TABS: TabConfig[] = [
  { id: 'game',    screen: 'footballGame', label: 'Jugar',    shortLabel: 'JUEGO',   doneKey: 'hasPlayed', accentColor: '#FCD116', catImage: '/assets/cat/cat-game.png'    },
  { id: 'food',    screen: 'feedSelect',   label: 'Comer',    shortLabel: 'COMER',   doneKey: 'hasFed',    accentColor: '#00AEEF', catImage: '/assets/cat/cat-food-eating.png' },
  { id: 'hygiene', screen: 'care',         label: 'Higiene',  shortLabel: 'HIGIENE', doneKey: 'hasCared',  accentColor: '#8B5CF6', catImage: '/assets/cat/cat-bath.png'    },
  { id: 'sleep',   screen: 'talk',         label: 'Descanso', shortLabel: 'DORMIR',  doneKey: 'hasTalked', accentColor: '#003087', catImage: '/assets/cat/cat-bed.png'     },
];

const NAV_ICONS: Record<Tab, string> = {
  game:    '/assets/nav/icon-game.svg',
  food:    '/assets/nav/icon-food.svg',
  hygiene: '/assets/nav/icon-hygiene.svg',
  sleep:   '/assets/nav/icon-sleep.svg',
};

export default function HubScreen({ cat, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const allDone = cat.hasFed && cat.hasPlayed && cat.hasCared && cat.hasTalked;

  const current = TABS.find(t => t.id === activeTab)!;
  const isDone  = cat[current.doneKey] as boolean;

  const navTabs: NavTabDef[] = TABS.map(t => ({
    id:       t.id,
    label:    t.shortLabel,
    iconSrc:  NAV_ICONS[t.id],
    isActive: activeTab === t.id,
    isDone:   cat[t.doneKey] as boolean,
    onClick:  () => setActiveTab(t.id),
  }));

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #12244A 55%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 24px 0',
        flexShrink: 0,
      }}>
        <NutreCatLogo size={56} />
        <motion.div
          key={cat.score}
          animate={{ scale: [1.2, 1] }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '30px',
            padding: '8px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: 1 }}>PUNTOS</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#FCD116', lineHeight: 1 }}>{cat.score}</span>
        </motion.div>
      </div>

      {/* Cat name + tab label */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', padding: '12px 24px 0', flexShrink: 0 }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'white', lineHeight: 1.1 }}>
          {cat.name}
          <span style={{ color: current.accentColor }}> — {current.label}</span>
        </h2>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
          {TABS.map(t => (
            <motion.div
              key={t.id}
              animate={(cat[t.doneKey] as boolean) ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.4 }}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: (cat[t.doneKey] as boolean) ? '#4ade80' : 'rgba(255,255,255,0.2)',
                border: t.id === activeTab ? `2px solid ${t.accentColor}` : '2px solid transparent',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Cat image */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        minHeight: 0,
      }}>
        <div style={{
          position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: '80px',
          background: `radial-gradient(ellipse, ${current.accentColor}33 0%, transparent 70%)`,
          borderRadius: '50%',
          transition: 'background 0.5s',
        }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <motion.img
              src={current.catImage}
              alt={current.label}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 300, height: 300,
                objectFit: 'contain', objectPosition: 'bottom',
                userSelect: 'none', pointerEvents: 'none',
                filter: `drop-shadow(0 16px 40px ${current.accentColor}44)`,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              position: 'absolute', top: '8%',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              borderRadius: '30px', padding: '6px 16px',
              fontSize: '13px', fontWeight: 900, color: 'white',
              boxShadow: '0 4px 20px rgba(74,222,128,0.5)',
            }}
          >
            ✓ ¡Completado!
          </motion.div>
        )}
      </div>

      {/* Action button */}
      <div style={{ padding: '0 28px 14px', flexShrink: 0 }}>
        {allDone ? (
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(252,209,22,0.3)', '0 0 50px rgba(252,209,22,0.8)', '0 0 20px rgba(252,209,22,0.3)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PrimaryButton onClick={() => onNavigate('championResult')} variant="colombia" size="lg" fullWidth>
              🏆 ¡Ver resultado campeón!
            </PrimaryButton>
          </motion.div>
        ) : (
          <PrimaryButton
            onClick={() => onNavigate(current.screen)}
            variant={isDone ? 'purple' : 'cyan'}
            size="lg"
            fullWidth
          >
            {isDone ? `Repetir ${current.label.toLowerCase()} 🔄` : `¡${current.label}!`}
          </PrimaryButton>
        )}
      </div>

      <BottomNav tabs={navTabs} />
    </div>
  );
}
