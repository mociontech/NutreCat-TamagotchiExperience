import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import FloatingParticles from '../components/FloatingParticles';

interface Props { onNext: () => void; }

export default function PetScreen({ onNext }: Props) {
  const [affection, setAffection] = useState(20);
  const [petting, setPetting] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const heartId  = useRef(0);
  const petTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const addHeart = (x: number, y: number) => {
    const id = heartId.current++;
    setHearts(h => [...h.slice(-14), { id, x, y }]);
    setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 1200);
  };

  const startPetting = (e: React.TouchEvent | React.MouseEvent) => {
    setPetting(true);
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    addHeart(pt.clientX, pt.clientY);
    petTimer.current = setInterval(() => {
      setAffection(a => Math.min(100, a + 3));
    }, 100);
  };

  const movePetting = (e: React.TouchEvent | React.MouseEvent) => {
    if (!petting) return;
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    if (Math.random() > 0.6) addHeart(pt.clientX, pt.clientY);
  };

  const stopPetting = () => {
    setPetting(false);
    if (petTimer.current) clearInterval(petTimer.current);
  };

  const catSrc = petting
    ? '/assets/cat/cat-hygiene.png'
    : affection > 60
    ? '/assets/cat/cat-hub.png'
    : '/assets/cat/cat-hub.png';

  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b69 45%, #0A1628 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '40px 28px 52px',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseDown={startPetting} onMouseMove={movePetting} onMouseUp={stopPetting} onMouseLeave={stopPetting}
      onTouchStart={startPetting} onTouchMove={movePetting} onTouchEnd={stopPetting}
    >
      {affection >= 70 && <FloatingParticles type="hearts" count={8} active />}

      {/* Corazones en el punto de toque */}
      {hearts.map(h => (
        <motion.div key={h.id}
          initial={{ opacity: 1, scale: 0, x: h.x - 20, y: h.y - 80 }}
          animate={{ opacity: 0, scale: 1.5, y: h.y - 180 }}
          transition={{ duration: 1.2 }}
          style={{ position: 'fixed', zIndex: 100, fontSize: '28px', pointerEvents: 'none' }}
        >💕</motion.div>
      ))}

      {/* Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'white', marginBottom: '14px' }}>
          Acaricia a Simón
        </h2>
        {/* Barra de cariño */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '99px', height: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
          <motion.div
            animate={{ width: `${affection}%` }}
            transition={{ duration: 0.2 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6C3FCA, #8B5CF6, #ec4899)',
              borderRadius: '99px',
              boxShadow: '0 0 10px rgba(139,92,246,0.6)',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>❤️ Cariño</span>
          <span style={{ fontSize: '12px', color: 'white', fontWeight: 800 }}>{Math.round(affection)}/100</span>
        </div>
      </div>

      {/* Gato */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <motion.div
          animate={petting
            ? { rotate: [-4, 4, -4], scale: [1, 1.06, 1] }
            : { y: [0, -10, 0] }
          }
          transition={petting
            ? { duration: 0.4, repeat: Infinity }
            : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <img
            src={catSrc}
            alt="Simón"
            style={{
              width: 280, height: 280,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: petting
                ? 'drop-shadow(0 0 28px rgba(139,92,246,0.5))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
              transition: 'filter 0.3s',
            }}
          />
        </motion.div>

        {petting && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: '20px', padding: '8px 20px',
              fontSize: '18px', fontWeight: 800, color: '#6C3FCA',
              marginTop: '12px',
            }}
          >
            Prrrrr… 😻
          </motion.div>
        )}
      </div>

      {/* Instrucción / botón */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        {!petting && affection < 70 && (
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 700 }}
          >
            👆 Desliza para acariciarlo
          </motion.p>
        )}

        {affection >= 70 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
            <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>
              ✅ ¡Simón está feliz! Cariño al {Math.round(affection)}%
            </p>
            <PrimaryButton onClick={onNext} variant="purple" size="lg" fullWidth>
              Continuar 💜
            </PrimaryButton>
          </motion.div>
        )}
      </div>
    </div>
  );
}
