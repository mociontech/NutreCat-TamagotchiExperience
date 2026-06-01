import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { CatState, ScreenName } from '../data/gameStates';
import ScreenLayout from '../components/ScreenLayout';
import PrimaryButton from '../components/PrimaryButton';
import BottomNav, { type NavTabId, type NavTabDef } from '../components/BottomNav';

interface Props { cat: CatState; onNavigate: (screen: ScreenName) => void; }

type Tab = NavTabId;

interface TabConfig {
  id: Tab;
  screen: ScreenName;
  label: string;
  shortLabel: string;
  doneKey: keyof CatState;
  catImage: string;
}

const TABS: TabConfig[] = [
  { id: 'game',    screen: 'gameSelect',    label: 'Jugar',    shortLabel: 'JUEGO',   doneKey: 'hasPlayed', catImage: '/assets/cat/cat-game.png'         },
  { id: 'food',    screen: 'feedSelect',    label: 'Comer',    shortLabel: 'COMER',   doneKey: 'hasFed',    catImage: '/assets/cat/cat-food-select.png'  },
  { id: 'hygiene', screen: 'care',          label: 'Higiene',  shortLabel: 'HIGIENE', doneKey: 'hasCared',  catImage: '/assets/cat/cat-hygiene.png'      },
  { id: 'sleep',   screen: 'talk',          label: 'Descanso', shortLabel: 'DORMIR',  doneKey: 'hasTalked', catImage: '/assets/cat/cat-sleep.png'        },
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
    <ScreenLayout>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0', flexShrink: 0,
      }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130, objectFit: 'contain' }} />
        <motion.div
          key={cat.score}
          animate={{ scale: [1.15, 1] }}
          style={{
            background: 'white', borderRadius: '40px',
            padding: '6px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,87,122,0.2)',
          }}
        >
          <span style={{ fontSize: '9px', color: '#00577a', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>Puntos</span>
          <span style={{ fontSize: '20px', fontWeight: 900, color: '#00577a', lineHeight: 1 }}>{cat.score}</span>
        </motion.div>
      </div>

      {/* Cat */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, position: 'relative' }}>
        {/* Progress dots */}
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: '8px',
        }}>
          {TABS.map(t => (
            <motion.div
              key={t.id}
              animate={(cat[t.doneKey] as boolean) ? { scale: [1, 1.4, 1] } : {}}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: (cat[t.doneKey] as boolean) ? '#4ade80' : 'rgba(0,87,122,0.25)',
                border: t.id === activeTab ? '2px solid #00577a' : '2px solid transparent',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {isDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute', top: 30,
              background: '#4ade80', borderRadius: '30px', padding: '5px 14px',
              fontSize: '12px', fontWeight: 900, color: 'white',
              boxShadow: '0 4px 12px rgba(74,222,128,0.4)',
            }}
          >✓ ¡Completado!</motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={activeTab}
            src={current.catImage}
            alt={current.label}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.22 }}
            style={{
              width: 340, height: 420,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: 'drop-shadow(0 16px 30px rgba(0,87,122,0.2))',
            }}
          />
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px 12px', flexShrink: 0 }}>
        {allDone ? (
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(0,87,122,0.2)', '0 0 44px rgba(0,87,122,0.6)', '0 0 20px rgba(0,87,122,0.2)'] }}
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
            size="lg" fullWidth
          >
            {isDone ? `Repetir ${current.label.toLowerCase()} 🔄` : `¡${current.label}!`}
          </PrimaryButton>
        )}
      </div>

      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}