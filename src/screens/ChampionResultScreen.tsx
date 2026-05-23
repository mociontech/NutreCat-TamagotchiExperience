import { motion } from 'framer-motion';
import type { CatState } from '../data/gameStates';
import FloatingParticles from '../components/FloatingParticles';
import PrimaryButton from '../components/PrimaryButton';
import StatBar from '../components/StatBar';

interface Props { cat: CatState; onClaim: () => void; }

export default function ChampionResultScreen({ cat, onClaim }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #003087 0%, #0A1628 40%, #8a2be2 80%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '36px 24px 44px',
      position: 'relative', overflow: 'hidden',
    }}>
      <FloatingParticles type="confetti" count={40} active />
      <FloatingParticles type="stars" count={15} active />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
          {['🇨🇴','⚽','🏆','⚽','🇨🇴'].map((e, i) => (
            <motion.span key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }} style={{ fontSize: '22px' }}>{e}</motion.span>
          ))}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: 'white', lineHeight: 1.1, textShadow: '0 0 30px rgba(252,209,22,0.8)' }}>
          ¡{cat.name} es un<br/>
          <span style={{ color: '#FCD116' }}>CAMPEÓN!</span> 🏆
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
          Gracias por cuidarlo, alimentarlo y jugar con él
        </p>
      </motion.div>

      {/* Champion cat */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src="/assets/cat/cat-champion.png"
            alt="Simón Campeón"
            style={{
              width: 220, height: 220,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: 'drop-shadow(0 0 40px rgba(252,209,22,0.7))',
            }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#FCD116',
              borderRightColor: '#CE1126',
              borderBottomColor: '#003087',
            }}
          />
        </div>

        {/* Champion badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #FCD116, #FF8C00)',
            borderRadius: '30px', padding: '8px 24px',
            fontSize: '14px', fontWeight: 900, color: '#0A1628',
            boxShadow: '0 4px 20px rgba(252,209,22,0.5)',
          }}
        >
          💙 Vínculo Inquebrantable
        </motion.div>
      </motion.div>

      {/* Final stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '24px', padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <StatBar label="Energía" value={Math.min(100, cat.energy + 20)} color="#00AEEF" icon="⚡" />
        <StatBar label="Hambre bajo control" value={Math.max(0, 100 - cat.hunger + 40)} color="#FF8C00" icon="🍗" />
        <StatBar label="Cariño" value={Math.min(100, cat.affection + 25)} color="#ec4899" icon="💕" />
        <StatBar label="Ánimo Mundialista" value={Math.min(100, cat.mundialSpirit + 25)} color="#FCD116" icon="⚽" />

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>PUNTOS TOTALES </span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: '24px', fontWeight: 900, color: '#FCD116' }}
          >{cat.score} ⭐</motion.span>
        </div>
      </motion.div>

      <PrimaryButton onClick={onClaim} variant="colombia" size="lg" fullWidth style={{ marginTop: '4px' }}>
        🎁 Reclamar mi premio
      </PrimaryButton>
    </div>
  );
}
