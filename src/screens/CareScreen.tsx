import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import FloatingParticles from '../components/FloatingParticles';
import PrimaryButton from '../components/PrimaryButton';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = { game: '/assets/nav/icon-game.svg', food: '/assets/nav/icon-food.svg', hygiene: '/assets/nav/icon-hygiene.svg', sleep: '/assets/nav/icon-sleep.svg' };

interface Props { onDone: () => void; onBack?: () => void; }

export default function CareScreen({ onDone, onBack }: Props) {
  const [wellness, setWellness] = useState(15);
  const [brushing, setBrushing] = useState(false);
  const wellnessRef = useRef(15);
  const brushInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleBack = onBack ?? onDone;
  const done = wellness >= 100;

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
  const stopBrush = () => { setBrushing(false); if (brushInterval.current) clearInterval(brushInterval.current); };

  return (
    <ScreenLayout>
      {(brushing || done) && <FloatingParticles type="hearts" count={10} active />}
      {done && <FloatingParticles type="bubbles" count={8} active />}

      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px', minHeight: 0 }}
        onMouseDown={startBrush} onMouseUp={stopBrush} onMouseLeave={stopBrush}
        onTouchStart={startBrush} onTouchEnd={stopBrush}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
          <div style={{ background: 'white', borderRadius: '40px', padding: '6px 18px', boxShadow: '0 2px 10px rgba(0,87,122,0.15)' }}>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#00577a' }}>
              {done ? '¡Simón reluciente! 💜' : 'Aseo y bienestar 🛁'}
            </span>
          </div>
        </div>

        {/* Gato */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <motion.img
            src="/assets/cat/cat-hygiene.png"
            alt="Simón"
            animate={brushing ? { rotate: [-3, 3, -3], scale: [1, 1.05, 1] } : done ? { y: [0, -10, 0] } : { y: [0, -6, 0] }}
            transition={{ duration: brushing ? 0.4 : 2.5, repeat: Infinity }}
            style={{
              width: 300, height: 340,
              objectFit: 'contain', objectPosition: 'bottom',
              pointerEvents: 'none', userSelect: 'none',
              filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.18))',
              transition: 'filter 0.3s',
            }}
          />
          {brushing && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'white', borderRadius: '20px', padding: '8px 18px', fontSize: '16px', fontWeight: 800, color: '#00577a', marginTop: '8px' }}
            >
              Prrrrr… 💜
            </motion.div>
          )}
          {!brushing && !done && (
            <motion.p animate={{ x: [-20, 20, -20] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ color: '#00577a', fontSize: '14px', fontWeight: 700, opacity: 0.7, marginTop: '8px' }}>
              ← Desliza para cepillarlo →
            </motion.p>
          )}
        </div>

        {/* Barra + botón */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontSize: '13px', color: '#00577a', fontWeight: 700 }}>🐾 Bienestar</span>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#00577a' }}>{Math.round(wellness)}/100</span>
            </div>
            <div style={{ height: '12px', background: 'rgba(0,87,122,0.15)', borderRadius: '99px', overflow: 'hidden' }}>
              <motion.div animate={{ width: `${wellness}%` }} transition={{ duration: 0.15 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #00577a, #00b6ed)', borderRadius: '99px' }} />
            </div>
          </div>
          {done ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '10px 16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,87,122,0.15)' }}>
                <p style={{ color: '#00577a', fontSize: '13px', fontWeight: 700 }}>💕 Cariño +25 &nbsp; ⚡ Energía +10</p>
              </div>
              <PrimaryButton onClick={onDone} variant="cyan" size="lg" fullWidth>Volver al inicio 🏠</PrimaryButton>
            </motion.div>
          ) : (
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{ background: 'white', borderRadius: '16px', padding: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,87,122,0.1)' }}>
              <p style={{ color: '#00577a', fontSize: '15px', fontWeight: 800 }}>👆 Mantén presionado para cepillar</p>
            </motion.div>
          )}
        </div>
      </div>
      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}