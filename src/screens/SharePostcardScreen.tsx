import { motion } from 'framer-motion';
import { useState } from 'react';
import type { CatState } from '../data/gameStates';
import FloatingParticles from '../components/FloatingParticles';

interface Props { cat: CatState; onRestart: () => void; }

export default function SharePostcardScreen({ cat, onRestart }: Props) {
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #1E3A6E 50%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '36px 20px 44px',
      position: 'relative', overflow: 'hidden',
    }}>
      <FloatingParticles type="stars" count={10} active />

      {/* Toast */}
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: '#4ade80', borderRadius: '16px',
            padding: '10px 24px', fontSize: '14px', fontWeight: 800,
            color: '#0A1628', zIndex: 100, whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(74,222,128,0.4)',
          }}
        >
          ✅ ¡Postal lista para compartir!
        </motion.div>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'white', textAlign: 'center' }}>
        Tu postal campeón 📮
      </h2>

      {/* Postcard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 150 }}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #003087 0%, #0A1628 40%, #6C3FCA 80%, #CE1126 100%)',
          borderRadius: '28px',
          padding: '24px',
          border: '2px solid rgba(252,209,22,0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(252,209,22,0.2)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Colombia stripe top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, display: 'flex' }}>
          <div style={{ flex: 2, background: '#FCD116' }}/>
          <div style={{ flex: 1, background: '#CE1126' }}/>
          <div style={{ flex: 1, background: '#003087' }}/>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', marginBottom: '16px' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FCD116, #CE1126)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 0 20px rgba(252,209,22,0.4)',
            flexShrink: 0,
          }}>🏆</div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'white', lineHeight: 1.1 }}>
              {cat.name} es un<br/>
              <span style={{ color: '#FCD116' }}>CAMPEÓN</span>
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
              con Nutre Cat 🐱
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['⚽','🇨🇴','💕'].map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} style={{ fontSize: '24px' }}>{e}</motion.span>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700 }}>PUNTOS TOTALES</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: '#FCD116' }}>{cat.score} ⭐</p>
          </div>
        </div>

        {/* Colombia stripe bottom */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, display: 'flex' }}>
          <div style={{ flex: 1, background: '#003087' }}/>
          <div style={{ flex: 1, background: '#CE1126' }}/>
          <div style={{ flex: 2, background: '#FCD116' }}/>
        </div>
      </motion.div>

      {/* Stats summary */}
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { icon: '⚡', label: 'Energía', value: '100%', color: '#00AEEF' },
          { icon: '🍗', label: 'Nutrido', value: '100%', color: '#FF8C00' },
          { icon: '💕', label: 'Cariño', value: '100%', color: '#ec4899' },
          { icon: '⚽', label: 'Mundialista', value: '100%', color: '#FCD116' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '16px',
            padding: '10px 12px', border: `1px solid ${s.color}22`,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>{s.icon}</span>
            <div>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{s.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 900, color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          style={{
            flex: 1, padding: '16px',
            background: 'linear-gradient(135deg, #00AEEF, #003087)',
            border: 'none', borderRadius: '20px',
            color: 'white', fontSize: '15px', fontWeight: 800,
            boxShadow: '0 6px 20px rgba(0,174,239,0.4)',
          }}
        >
          📤 Compartir
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          style={{
            flex: 1, padding: '16px',
            background: 'rgba(255,255,255,0.08)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: '20px',
            color: 'white', fontSize: '15px', fontWeight: 800,
          }}
        >
          🔄 Jugar de nuevo
        </motion.button>
      </div>
    </div>
  );
}
