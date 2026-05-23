import { motion } from 'framer-motion';
import FloatingParticles from '../components/FloatingParticles';
import PrimaryButton from '../components/PrimaryButton';

interface Props { score: number; onContinue: () => void; }

export default function GoalCelebrationScreen({ score, onContinue }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #003087 0%, #0A1628 50%, #CE1126 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '40px 24px 50px',
      position: 'relative', overflow: 'hidden',
    }}>
      <FloatingParticles type="confetti" count={30} active />

      {/* Scoreboard */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '24px', padding: '16px 32px',
          border: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', justifyContent: 'center' }}>
              <div style={{ width: 6, height: 20, background: '#FCD116' }}/>
              <div style={{ width: 6, height: 20, background: '#CE1126' }}/>
              <div style={{ width: 6, height: 20, background: '#003087' }}/>
            </div>
            <p style={{ color: 'white', fontSize: '11px', fontWeight: 800 }}>COL</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: '#FCD116' }}
            >2</motion.span>
            <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>-</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'white' }}>0</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 800 }}>RIV</p>
            <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', margin: '4px auto 0' }}/>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginTop: '4px' }}>00:15</p>
      </motion.div>

      {/* Cat celebrating */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, -5, 5, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ fontSize: '130px', textAlign: 'center' }}
      >🏆</motion.div>

      {/* Main text */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '52px', lineHeight: 1,
          color: 'white',
          textShadow: '0 0 40px rgba(252,209,22,0.8)',
          marginBottom: '8px',
        }}>
          ¡GOOOL!
        </h1>
        <div style={{
          background: 'linear-gradient(90deg, #FCD116, #CE1126, #003087)',
          borderRadius: '8px', padding: '3px 16px',
          display: 'inline-block', marginBottom: '12px',
        }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '14px' }}>🇨🇴 POR COLOMBIA 🇨🇴</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 700 }}>
          ¡Tu gato está más feliz! 🐱💕
        </p>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ color: '#FCD116', fontSize: '20px', fontWeight: 900, marginTop: '8px' }}
        >
          +{score} puntos ⚽
        </motion.p>
      </motion.div>

      <PrimaryButton onClick={onContinue} variant="colombia" size="lg" fullWidth>
        Continuar 🎉
      </PrimaryButton>
    </div>
  );
}
