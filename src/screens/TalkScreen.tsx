import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { talkOptions } from '../data/gameStates';
import PrimaryButton from '../components/PrimaryButton';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = { game: '/assets/nav/icon-game.svg', food: '/assets/nav/icon-food.svg', hygiene: '/assets/nav/icon-hygiene.svg', sleep: '/assets/nav/icon-sleep.svg' };

interface Props { onDone: () => void; onBack?: () => void; }

export default function TalkScreen({ onDone, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [responded, setResponded] = useState(false);
  const handleBack = onBack ?? onDone;
  const opt = selected !== null ? talkOptions[selected] : null;

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: handleBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: true,  isDone: false, onClick: handleBack },
  ];

  const handleSelect = (i: number) => { setSelected(i); setTimeout(() => setResponded(true), 600); };

  return (
    <ScreenLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px', minHeight: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
          <div style={{ background: 'white', borderRadius: '40px', padding: '6px 18px', boxShadow: '0 2px 10px rgba(0,87,122,0.15)' }}>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#00577a' }}>Háblale a Simón 💬</span>
          </div>
        </div>

        {/* Gato */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <motion.img
            src={responded ? '/assets/cat/cat-hub.png' : '/assets/cat/cat-sleep.png'}
            alt="Simón"
            animate={responded ? { rotate: [-5, 5, 0], y: [0, -15, 0] } : { y: [0, -6, 0] }}
            transition={responded ? { duration: 0.6 } : { duration: 2.5, repeat: Infinity }}
            style={{
              width: 260, height: 280,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.18))',
            }}
          />

          <motion.div
            animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(0,87,122,0)', '0 0 0 12px rgba(0,87,122,0.1)', '0 0 0 0 rgba(0,87,122,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 60, height: 60, background: '#00577a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}
          >🎙️</motion.div>

          <AnimatePresence>
            {responded && opt && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{ background: 'white', borderRadius: '20px', padding: '12px 20px', fontSize: '16px', fontWeight: 800, color: '#00577a', maxWidth: '280px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,87,122,0.2)' }}
              >
                💬 {opt.response}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Opciones */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!responded ? (
            talkOptions.map((o, i) => (
              <motion.button
                key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                whileTap={{ scale: 0.96 }} onClick={() => handleSelect(i)}
                style={{
                  background: selected === i ? 'rgba(0,87,122,0.12)' : 'white',
                  border: selected === i ? '2px solid #00577a' : '2px solid rgba(0,87,122,0.15)',
                  borderRadius: '16px', padding: '12px 16px',
                  color: '#00577a', fontSize: '15px', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0,87,122,0.1)',
                }}
              >
                <span>{o.text}</span>
                {selected === i && <span>✓</span>}
              </motion.button>
            ))
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '12px 16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,87,122,0.15)' }}>
                <p style={{ color: '#00577a', fontSize: '13px', fontWeight: 700 }}>
                  💕 Cariño +{opt?.affectionBonus} &nbsp; 😺 Ánimo +{opt?.moodBonus}
                </p>
              </div>
              <PrimaryButton onClick={onDone} variant="cyan" size="lg" fullWidth>Volver al inicio 🏠</PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}