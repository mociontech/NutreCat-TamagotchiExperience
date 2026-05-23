import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import type { FoodType } from '../data/gameStates';
import { foods } from '../data/gameStates';
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
  selectedFood: FoodType;
  onDone: () => void;
  onBack?: () => void;
}

export default function FeedInteractionScreen({ selectedFood, onDone, onBack }: Props) {
  const [fed, setFed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const plateRef = useRef<HTMLDivElement>(null);
  const catZoneRef = useRef<HTMLDivElement>(null);
  const food = foods.find(f => f.id === selectedFood);

  const handleBack = onBack ?? onDone;

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false,  isDone: false, onClick: handleBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: true,   isDone: false, onClick: handleBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false,  isDone: false, onClick: handleBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false,  isDone: false, onClick: handleBack },
  ];

  const handleDragEnd = (_: unknown, info: { point: { x: number; y: number } }) => {
    setDragging(false);
    const catZone = catZoneRef.current?.getBoundingClientRect();
    if (!catZone) return;
    const { x, y } = info.point;
    if (x > catZone.left && x < catZone.right && y > catZone.top && y < catZone.bottom) {
      setFed(true);
    }
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #12244A 60%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {fed && <FloatingParticles type="sparkles" count={16} active />}

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '36px 24px 16px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'white', marginBottom: '6px' }}>
            {fed ? '¡Mmm, delicioso!' : '¡Hora de comer! 🍽️'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 600 }}>
            {fed ? 'Simón está satisfecho' : 'Arrastra el plato hasta Simón'}
          </p>
        </div>

        {/* Cat zone */}
        <div ref={catZoneRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <motion.img
            src={fed ? '/assets/cat/cat-food-eating.png' : '/assets/cat/cat-food.png'}
            alt="Simón comiendo"
            animate={fed
              ? { scale: [1, 1.05, 1], y: [0, -5, 0] }
              : { y: [0, -8, 0] }
            }
            transition={fed
              ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 2.5, repeat: Infinity }
            }
            style={{
              width: 240, height: 240,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: fed
                ? 'drop-shadow(0 0 24px rgba(0,174,239,0.4))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              transition: 'filter 0.3s',
            }}
          />

          {fed && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px', padding: '10px 20px',
                fontSize: '16px', fontWeight: 800, color: '#0A1628',
              }}
            >
              💬 ¡Miau! ¡Estaba delicioso!
            </motion.div>
          )}

          {!fed && (
            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 100, height: 20,
                background: `radial-gradient(ellipse, ${food?.color ?? '#00AEEF'}44 0%, transparent 70%)`,
                borderRadius: '50%', marginTop: -8,
              }}
            />
          )}
        </div>

        {/* Draggable plate / results */}
        {!fed ? (
          <motion.div
            ref={plateRef}
            drag dragMomentum={false}
            onDragStart={() => setDragging(true)}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            style={{ cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 20, touchAction: 'none' }}
          >
            <div style={{
              width: 100, height: 100,
              background: `linear-gradient(135deg, ${food?.color}33, ${food?.color}11)`,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '52px',
              border: `3px solid ${food?.color}66`,
              boxShadow: `0 0 30px ${food?.color}44`,
            }}>
              {food?.emoji}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 700 }}>{food?.name}</p>
            {!dragging && (
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600 }}
              >
                👆 Arrastra hacia arriba
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[
                { label: 'Energía', value: '+20', color: '#00AEEF', icon: '⚡' },
                { label: 'Hambre',  value: '-40', color: '#FF8C00', icon: '🍗' },
                { label: 'Cariño',  value: '+5',  color: '#ec4899', icon: '💕' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 700 }}>{s.icon} {s.label}</span>
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                    style={{ color: s.value.startsWith('+') ? '#4ade80' : '#f87171', fontWeight: 900, fontSize: '15px' }}
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
    </div>
  );
}
