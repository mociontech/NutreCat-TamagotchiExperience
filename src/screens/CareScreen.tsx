import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import FloatingParticles from '../components/FloatingParticles';
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

export default function CareScreen({ onDone, onBack }: Props) {
  const [wellness, setWellness] = useState(15);
  const [brushing, setBrushing] = useState(false);
  const wellnessRef = useRef(15);
  const brushInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleBack = onBack ?? onDone;

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: true,  isDone: false, onClick: handleBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: handleBack },
  ];

  const startBrush = () => {
    setBrushing(true);
    brushInterval.current = setInterval(() => {
      wellnessRef.current = Math.min(100, wellnessRef.current + 4);
      setWellness(wellnessRef.current);
    }, 80);
  };

  const stopBrush = () => {
    setBrushing(false);
    if (brushInterval.current) clearInterval(brushInterval.current);
  };

  const done = wellness >= 100;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b69 40%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {(brushing || done) && <FloatingParticles type="hearts" count={10} active />}
      {done && <FloatingParticles type="bubbles" count={8} active />}

      {/* Content */}
      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', padding: '36px 24px 16px',
          position: 'relative',
        }}
        onMouseDown={startBrush} onMouseUp={stopBrush} onMouseLeave={stopBrush}
        onTouchStart={startBrush} onTouchEnd={stopBrush}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'white', marginBottom: '6px' }}>
            {done ? '¡Simón se siente amado! 💜' : 'Aseo y bienestar 🛁'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>
            {done ? 'Gracias por cuidarlo tanto' : 'Mantén presionado para cepillar'}
          </p>
        </div>

        {/* Cat */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', userSelect: 'none' }}>
          <motion.img
            src="/assets/cat/cat-bath.png"
            alt="Simón en el baño"
            animate={brushing
              ? { rotate: [-3, 3, -3], scale: [1, 1.05, 1] }
              : done
              ? { y: [0, -10, 0], scale: [1, 1.05, 1] }
              : { y: [0, -6, 0] }
            }
            transition={{ duration: brushing ? 0.4 : 2.5, repeat: Infinity }}
            style={{
              width: 240, height: 240,
              objectFit: 'contain', objectPosition: 'bottom',
              pointerEvents: 'none',
              filter: brushing
                ? 'drop-shadow(0 0 28px rgba(139,92,246,0.5))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              transition: 'filter 0.3s',
            }}
          />

          {brushing && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '20px', padding: '8px 18px',
                fontSize: '16px', fontWeight: 800, color: '#6C3FCA',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Prrrrr… 💜
            </motion.div>
          )}
        </div>

        {!brushing && !done && (
          <motion.div
            animate={{ x: [-30, 30, -30] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 700 }}
          >
            ← Desliza para cepillarlo →
          </motion.div>
        )}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>🐾 Bienestar</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#8B5CF6' }}>{Math.round(wellness)}/100</span>
            </div>
            <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              <motion.div
                animate={{ width: `${wellness}%` }}
                transition={{ duration: 0.15 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #6C3FCA, #8B5CF6, #ec4899)', borderRadius: '99px', boxShadow: '0 0 10px rgba(139,92,246,0.6)' }}
              />
            </div>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '12px 16px', marginBottom: '12px', textAlign: 'center' }}>
                <p style={{ color: '#8B5CF6', fontSize: '13px', fontWeight: 700 }}>
                  💕 Cariño +25 &nbsp; ⚡ Energía +10
                </p>
              </div>
              <PrimaryButton onClick={onDone} variant="purple" size="lg" fullWidth>
                Volver al inicio 🏠
              </PrimaryButton>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ background: 'rgba(139,92,246,0.1)', border: '2px solid rgba(139,92,246,0.3)', borderRadius: '16px', padding: '12px', textAlign: 'center' }}
            >
              <p style={{ color: '#8B5CF6', fontSize: '15px', fontWeight: 800 }}>
                👆 Mantén presionado para cepillar
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <BottomNav tabs={navTabs} />
    </div>
  );
}
