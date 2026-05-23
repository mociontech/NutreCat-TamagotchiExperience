import { motion } from 'framer-motion';
import NutreCatLogo from '../components/NutreCatLogo';
import PrimaryButton from '../components/PrimaryButton';

interface Props { onNext: () => void; }

export default function RewardQrScreen({ onNext }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #00344d 50%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '36px 24px 44px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,174,239,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <NutreCatLogo size={80} />
      </motion.div>

      {/* Reward headline */}
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
          🎁 ¡Recompensa Campeón!
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '80px', color: '#FCD116', lineHeight: 1, textShadow: '0 0 40px rgba(252,209,22,0.5)' }}>10%</span>
        </div>
        <div style={{ background: 'linear-gradient(90deg, #FCD116, #FF8C00)', borderRadius: '8px', padding: '3px 16px', display: 'inline-block', marginBottom: '6px' }}>
          <span style={{ color: '#0A1628', fontWeight: 900, fontSize: '13px' }}>OFF</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600 }}>
          en tu próxima compra de Nutre Cat
        </p>
      </motion.div>

      {/* QR Code placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        style={{
          background: 'white',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 0 60px rgba(0,174,239,0.3), 0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* REPLACE: <img src="real-qr-code.png" width="180" height="180"/> */}
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* QR pattern placeholder */}
          <rect width="180" height="180" fill="white"/>
          {/* Corner squares */}
          {[[10,10],[120,10],[10,120]].map(([x,y],i) => (
            <g key={i}>
              <rect x={x} y={y} width="50" height="50" fill="#0A1628" rx="4"/>
              <rect x={x+8} y={y+8} width="34" height="34" fill="white" rx="2"/>
              <rect x={x+14} y={y+14} width="22" height="22" fill="#0A1628" rx="2"/>
            </g>
          ))}
          {/* Dot matrix simulation */}
          {Array.from({length: 60}).map((_,i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const x = 72 + col * 9;
            const y = 72 + row * 9;
            if (Math.random() > 0.4) return <rect key={i} x={x} y={y} width="6" height="6" fill="#0A1628" rx="1"/>;
            return null;
          })}
          {/* Center logo area */}
          <rect x="75" y="75" width="30" height="30" fill="#00AEEF" rx="6"/>
          <text x="90" y="94" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">NC</text>
        </svg>
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#666', fontWeight: 700, marginTop: '8px', letterSpacing: '1px' }}>
          NUTRE-CAT-CHAMPION-2026
        </p>
      </motion.div>

      {/* Products row */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {['🥘','🍖','⭐'].map((e, i) => (
          <motion.div key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            style={{
              background: 'rgba(0,174,239,0.1)',
              border: '1px solid rgba(0,174,239,0.2)',
              borderRadius: '16px', padding: '10px',
              fontSize: '28px',
            }}
          >{e}</motion.div>
        ))}
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: 600 }}>
          📱 Escanea y redime en tu tienda favorita
        </p>
        <PrimaryButton onClick={onNext} variant="cyan" size="lg" fullWidth>
          📮 Crear postal 🎉
        </PrimaryButton>
      </div>
    </div>
  );
}
