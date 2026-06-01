import { motion } from 'framer-motion';
import { useState } from 'react';
import type { FoodType } from '../data/gameStates';
import { foods } from '../data/gameStates';
import FloatingParticles from '../components/FloatingParticles';
import PrimaryButton from '../components/PrimaryButton';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = { game: '/assets/nav/icon-game.svg', food: '/assets/nav/icon-food.svg', hygiene: '/assets/nav/icon-hygiene.svg', sleep: '/assets/nav/icon-sleep.svg' };

interface Props { selectedFood: FoodType; onDone: () => void; onBack?: () => void; }

export default function FeedInteractionScreen({ selectedFood, onDone, onBack }: Props) {
  const [fed, setFed] = useState(false);
  const food = foods.find(f => f.id === selectedFood);
  const handleBack = onBack ?? onDone;

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: handleBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: true,  isDone: false, onClick: handleBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: handleBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: handleBack },
  ];

  return (
    <ScreenLayout>
      {fed && <FloatingParticles type="sparkles" count={16} active />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 12px', minHeight: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
          <div style={{ background: 'white', borderRadius: '40px', padding: '6px 18px', boxShadow: '0 2px 10px rgba(0,87,122,0.15)' }}>
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#00577a' }}>
              {fed ? '¡Mmm, delicioso!' : '¡Hora de comer!'}
            </span>
          </div>
        </div>

        {/* Gato comiendo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          <motion.img
            src={fed ? '/assets/cat/cat-food-eating.png' : '/assets/cat/cat-food-select.png'}
            alt="Simón"
            animate={fed ? { scale: [1, 1.05, 1], y: [0, -5, 0] } : { y: [0, -8, 0] }}
            transition={fed ? { duration: 1.5, repeat: Infinity } : { duration: 2.5, repeat: Infinity }}
            style={{
              width: 280, height: 300,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: 'drop-shadow(0 14px 28px rgba(0,87,122,0.18))',
              transition: 'filter 0.3s',
            }}
          />

          {fed && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ background: 'white', borderRadius: '20px', padding: '10px 20px', fontSize: '16px', fontWeight: 800, color: '#00577a', marginTop: '8px' }}
            >
              💬 ¡Miau! ¡Estaba delicioso!
            </motion.div>
          )}
        </div>

        {/* Productos o resultado */}
        {!fed ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#00577a', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
              Toca para darle de comer
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setFed(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                background: 'white', borderRadius: '20px', padding: '12px 20px',
                cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(0,87,122,0.2)',
                width: '100%',
              }}
            >
              <img src={`/assets/products/${selectedFood === 'dry' ? 'product-3' : selectedFood === 'wet' ? 'product-2' : 'product-1'}.png`}
                alt={food?.name}
                style={{ width: 60, height: 75, objectFit: 'contain' }}
              />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 900, color: '#00577a', fontSize: '16px' }}>{food?.name}</p>
                <p style={{ color: 'rgba(0,87,122,0.6)', fontSize: '12px' }}>👆 Toca para alimentar</p>
              </div>
            </motion.button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ background: 'white', borderRadius: '20px', padding: '14px 18px', boxShadow: '0 4px 16px rgba(0,87,122,0.15)' }}>
              {[{ label: 'Energía', value: '+20', icon: '⚡' }, { label: 'Hambre', value: '-40', icon: '🍗' }, { label: 'Cariño', value: '+5', icon: '💕' }].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                  <span style={{ color: 'rgba(0,87,122,0.7)', fontSize: '13px', fontWeight: 700 }}>{s.icon} {s.label}</span>
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    style={{ color: s.value.startsWith('+') ? '#22c55e' : '#ef4444', fontWeight: 900, fontSize: '15px' }}
                  >{s.value}</motion.span>
                </div>
              ))}
            </div>
            <PrimaryButton onClick={onDone} variant="cyan" size="lg" fullWidth>
              Volver al inicio 🏠
            </PrimaryButton>
          </motion.div>
        )}
      </div>

      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}