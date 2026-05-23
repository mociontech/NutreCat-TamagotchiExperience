import { motion } from 'framer-motion';
import { useState } from 'react';
import NutreCatLogo from '../components/NutreCatLogo';
import PrimaryButton from '../components/PrimaryButton';

interface Props { onNext: (name: string) => void; }

export default function RegistrationScreen({ onNext }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    onNext(trimmed);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628 0%, #12244A 60%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '60px 36px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Estrellas de fondo */}
      {[...Array(14)].map((_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.4, 1] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
          style={{
            position: 'absolute',
            top: `${10 + Math.random() * 55}%`,
            left: `${5 + Math.random() * 90}%`,
            width: 3 + (i % 3), height: 3 + (i % 3),
            background: 'white', borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}

      <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <NutreCatLogo size={80} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: 'spring' }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}
      >
        {/* Card */}
        <div style={{
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '28px',
          padding: '36px 28px',
          backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '36px', marginBottom: '8px' }}>🐱</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px', color: 'white',
              lineHeight: 1.15, marginBottom: '8px',
            }}>
              ¡Dale un nombre<br/>
              <span style={{ color: 'var(--nc-cyan)' }}>a tu gato!</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600 }}>
              Será tu compañero campeón 🏆
            </p>
          </div>

          {/* Input */}
          <div style={{ width: '100%', position: 'relative' }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              maxLength={16}
              placeholder="Escribe un nombre…"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.08)',
                border: `2px solid ${name.trim() ? 'var(--nc-cyan)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: '18px',
                padding: '16px 20px',
                fontSize: '20px', fontWeight: 800,
                color: 'white',
                outline: 'none',
                textAlign: 'center',
                letterSpacing: '0.03em',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
            />
            {name.trim().length > 0 && (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px',
                }}
              >✨</motion.div>
            )}
          </div>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 600 }}>
            {name.length}/16 caracteres
          </p>
        </div>

        <motion.div
          animate={name.trim() ? {
            boxShadow: ['0 0 20px rgba(0,174,239,0.3)', '0 0 40px rgba(0,174,239,0.7)', '0 0 20px rgba(0,174,239,0.3)'],
          } : {}}
          transition={{ duration: 1.8, repeat: Infinity }}
          style={{ width: '100%' }}
        >
          <PrimaryButton
            onClick={handleSubmit}
            variant="cyan"
            size="lg"
            fullWidth
            disabled={name.trim().length === 0}
          >
            ¡Vamos, {name.trim() || 'campeón'}! 🐾
          </PrimaryButton>
        </motion.div>
      </motion.div>

      {/* Decoración bandera */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['#FCD116', '#CE1126', '#003087'].map((c, i) => (
          <motion.div key={i}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            style={{ width: 10, height: 10, borderRadius: '50%', background: c }}
          />
        ))}
      </div>
    </div>
  );
}
