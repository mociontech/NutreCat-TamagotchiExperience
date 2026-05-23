import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { talkOptions } from '../data/gameStates';
import PrimaryButton from '../components/PrimaryButton';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = {
  game:    '/assets/nav/icon-game.svg',
  food:    '/assets/nav/icon-food.svg',
  hygiene: '/assets/nav/icon-hygiene.svg',
  sleep:   '/assets/nav/icon-sleep.svg',
};

interface Props {
  onDone: () => void;
  onBack?: () => void;
}

export default function TalkScreen({ onDone, onBack }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [responded, setResponded] = useState(false);

  const handleBack = onBack ?? onDone;

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: handleBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: true,  isDone: false, onClick: handleBack },
  ];

  const handleSelect = (idx: number) => {
    setSelected(idx);
    setTimeout(() => setResponded(true), 600);
  };

  const opt = selected !== null ? talkOptions[selected] : null;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #1E3A6E 50%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '36px 24px 16px',
        position: 'relative',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'white', marginBottom: '6px' }}>
            Háblale a Simón 💬
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>
            Él te escucha con atención
          </p>
        </div>

        {/* Cat + response */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center' }}>
          <motion.img
            src={responded ? '/assets/cat/cat-hub.png' : selected !== null ? '/assets/cat/cat-hub.png' : '/assets/cat/cat-bed.png'}
            alt="Simón"
            animate={responded
              ? { rotate: [-5, 5, -5, 0], y: [0, -15, 0] }
              : { y: [0, -6, 0] }
            }
            transition={responded ? { duration: 0.6 } : { duration: 2.5, repeat: Infinity }}
            style={{
              width: 220, height: 220,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: responded
                ? 'drop-shadow(0 0 24px rgba(0,174,239,0.4))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              transition: 'filter 0.3s',
            }}
          />

          <motion.div
            animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0 0 rgba(0,174,239,0)', '0 0 0 12px rgba(0,174,239,0.15)', '0 0 0 0 rgba(0,174,239,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 70, height: 70,
              background: 'linear-gradient(135deg, #00AEEF, #0090C8)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px',
              boxShadow: '0 6px 20px rgba(0,174,239,0.4)',
            }}
          >🎙️</motion.div>

          <AnimatePresence>
            {responded && opt && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '20px', padding: '12px 20px',
                  fontSize: '16px', fontWeight: 800, color: '#0A1628',
                  maxWidth: '260px', textAlign: 'center',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                }}
              >
                💬 {opt.response}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Talk options */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {!responded ? (
            talkOptions.map((o, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(i)}
                style={{
                  background: selected === i ? 'rgba(0,174,239,0.2)' : 'rgba(255,255,255,0.06)',
                  border: selected === i ? '2px solid rgba(0,174,239,0.6)' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '18px', padding: '14px 20px',
                  color: 'white', fontSize: '16px', fontWeight: 700,
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>{o.text}</span>
                {selected === i && <span>✓</span>}
              </motion.button>
            ))
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(0,174,239,0.1)', border: '1px solid rgba(0,174,239,0.3)', borderRadius: '16px', padding: '12px 16px', textAlign: 'center' }}>
                <p style={{ color: '#00AEEF', fontSize: '13px', fontWeight: 700 }}>
                  💕 Cariño +{opt?.affectionBonus} &nbsp; 😺 Ánimo +{opt?.moodBonus}
                </p>
              </div>
              <PrimaryButton onClick={onDone} variant="cyan" size="lg" fullWidth>
                Volver al inicio 🏠
              </PrimaryButton>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav tabs={navTabs} />
    </div>
  );
}
