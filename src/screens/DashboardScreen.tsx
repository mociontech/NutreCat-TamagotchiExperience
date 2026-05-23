import { motion } from 'framer-motion';
import type { CatState, ScreenName } from '../data/gameStates';
import StatBar from '../components/StatBar';
import PrimaryButton from '../components/PrimaryButton';

interface Props {
  cat: CatState;
  onNavigate: (screen: ScreenName) => void;
}

const actions = [
  { id: 'feedSelect' as ScreenName, label: 'Alimentar', icon: '🍗', color: '#00AEEF', done: 'hasFed' },
  { id: 'footballGame' as ScreenName, label: 'Jugar', icon: '⚽', color: '#FCD116', done: 'hasPlayed' },
  { id: 'care' as ScreenName, label: 'Cuidar', icon: '🛁', color: '#8B5CF6', done: 'hasCared' },
  { id: 'talk' as ScreenName, label: 'Hablar', icon: '💬', color: '#FF8C00', done: 'hasTalked' },
];

export default function DashboardScreen({ cat, onNavigate }: Props) {
  const allDone = cat.hasFed && cat.hasPlayed && cat.hasCared && cat.hasTalked;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #12244A 50%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      padding: '28px 20px 24px',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'white', lineHeight: 1.1 }}>
              ¡Hola, {cat.name}! 🐾
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              Listos para ganar juntos 🏆
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '16px', padding: '8px 14px',
            border: '1px solid rgba(255,255,255,0.12)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>PUNTOS</p>
            <motion.p
              key={cat.score}
              animate={{ scale: [1.3, 1] }}
              style={{ fontSize: '22px', fontWeight: 900, color: '#FCD116', lineHeight: 1 }}
            >
              {cat.score}
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Cat + Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flex: '0 0 auto' }}>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ flexShrink: 0 }}
        >
          <div style={{
            width: 110, height: 110,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A6E, #003087)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '60px',
            boxShadow: '0 0 30px rgba(0,174,239,0.3)',
            border: '3px solid rgba(0,174,239,0.3)',
          }}>
            {/* Colombia jersey cat */}
            🐱
          </div>
          <div style={{
            background: 'linear-gradient(90deg,#FCD116,#CE1126,#003087)',
            borderRadius: '8px', padding: '2px 8px',
            fontSize: '10px', fontWeight: 800, color: 'white',
            textAlign: 'center', marginTop: '4px',
          }}>
            {cat.level}
          </div>
        </motion.div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StatBar label="Energía" value={cat.energy} color="#00AEEF" icon="⚡" />
          <StatBar label="Hambre" value={100 - cat.hunger} color="#FF8C00" icon="🍗" />
          <StatBar label="Cariño" value={cat.affection} color="#ec4899" icon="💕" />
          <StatBar label="Ánimo Mundialista" value={cat.mundialSpirit} color="#FCD116" icon="⚽" />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {actions.map((action, i) => {
          const done = cat[action.done as keyof CatState] as boolean;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onNavigate(action.id)}
              style={{
                background: done
                  ? 'rgba(255,255,255,0.05)'
                  : `linear-gradient(135deg, ${action.color}22, ${action.color}11)`,
                border: done
                  ? '2px solid rgba(74,222,128,0.4)'
                  : `2px solid ${action.color}44`,
                borderRadius: '20px',
                padding: '16px 10px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '8px',
                cursor: 'pointer',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {done && (
                <div style={{
                  position: 'absolute', top: '6px', right: '6px',
                  background: '#4ade80', borderRadius: '50%',
                  width: 18, height: 18, fontSize: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, color: 'white',
                }}>✓</div>
              )}
              <span style={{ fontSize: '32px' }}>{action.icon}</span>
              <span style={{
                fontSize: '13px', fontWeight: 800,
                color: done ? 'rgba(255,255,255,0.5)' : 'white',
              }}>{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Champion button */}
      {allDone ? (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(252,209,22,0.3)', '0 0 50px rgba(252,209,22,0.8)', '0 0 20px rgba(252,209,22,0.3)'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PrimaryButton onClick={() => onNavigate('championResult')} variant="colombia" size="lg" fullWidth>
              🏆 ¡Ver resultado campeón!
            </PrimaryButton>
          </motion.div>
        </motion.div>
      ) : (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '16px', padding: '12px 16px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {actions.map(a => (
              <div key={a.id} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: (cat[a.done as keyof CatState] as boolean) ? '#4ade80' : 'rgba(255,255,255,0.2)',
              }}/>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {[cat.hasFed, cat.hasPlayed, cat.hasCared, cat.hasTalked].filter(Boolean).length}/4 acciones completadas
          </p>
        </div>
      )}

      {/* Bottom nav decoration */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)',
        marginTop: '12px',
      }}>
        {[['🏠','Inicio'],['🏅','Logros'],['🏆','Ranking'],['🛒','Tienda']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', opacity: label === 'Inicio' ? 1 : 0.35 }}>
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
