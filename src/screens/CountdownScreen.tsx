import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ScreenLayout from '../components/ScreenLayout';

interface Props { onDone: () => void; }

export default function CountdownScreen({ onDone }: Props) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) { onDone(); return; }
    const t = setTimeout(() => setCount(c => c - 1), 900);
    return () => clearTimeout(t);
  }, [count, onDone]);

  return (
    <ScreenLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
          {/* Timer pill */}
          <div style={{ background: '#00577a', borderRadius: '40px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 16px rgba(0,87,122,0.4)' }}>
            <img src="/assets/ui/icon-clock.svg" alt="" style={{ width: 28, filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white', fontFamily: 'var(--font-display)' }}>01:40</span>
          </div>
        </div>

        {/* Countdown number */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                fontSize: '260px', fontWeight: 900, color: 'white',
                fontFamily: 'var(--font-display)',
                lineHeight: 1,
                textShadow: '0 8px 40px rgba(0,87,122,0.35)',
              }}
            >
              {count > 0 ? count : '¡YA!'}
            </motion.div>
          </AnimatePresence>
        </div>

        <p style={{ color: '#00577a', fontSize: '18px', fontWeight: 800, opacity: 0.8 }}>
          ¡Prepárate para atrapar!
        </p>
      </div>
    </ScreenLayout>
  );
}