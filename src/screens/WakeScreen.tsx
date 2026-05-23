import { motion } from 'framer-motion';
import { useState } from 'react';
import NutreCatLogo from '../components/NutreCatLogo';

interface Props { onNext: () => void; }

export default function WakeScreen({ onNext }: Props) {
  const [tapped, setTapped] = useState(false);

  const handleTap = () => {
    if (tapped) return;
    setTapped(true);
    setTimeout(onNext, 2000);
  };

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(180deg, #0A1628 0%, #1E3A6E 50%, #003087 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '44px 28px 64px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Estrellas */}
      {[...Array(16)].map((_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.8 + (i % 4) * 0.4, repeat: Infinity, delay: (i % 5) * 0.3 }}
          style={{
            position: 'absolute',
            top: `${5 + (i * 41 % 60)}%`, left: `${(i * 53 % 90)}%`,
            width: 2 + (i % 3), height: 2 + (i % 3),
            background: 'white', borderRadius: '50%', pointerEvents: 'none',
          }}
        />
      ))}

      <NutreCatLogo size={72} />

      {/* Gato + interacción */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }}>
        <motion.div
          animate={tapped
            ? { scale: [1, 1.15, 1.08], rotate: [0, -5, 5, 0] }
            : { y: [0, -10, 0] }
          }
          transition={tapped
            ? { duration: 0.5 }
            : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }
          style={{ position: 'relative' }}
        >
          <img
            src={tapped ? '/assets/cat/cat-hub.png' : '/assets/cat/cat-sleep.png'}
            alt="Simón durmiendo"
            style={{
              width: 300, height: 300,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: tapped
                ? 'drop-shadow(0 0 30px rgba(0,174,239,0.5))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))',
              transition: 'filter 0.3s',
            }}
          />

          {/* Burbuja de diálogo al despertar */}
          {tapped && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              style={{
                position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255,255,255,0.96)',
                borderRadius: '20px', padding: '10px 20px',
                fontSize: '14px', fontWeight: 800, color: '#0A1628',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
              }}
            >
              💬 ¡Hola! ¡Estoy listo para jugar!
            </motion.div>
          )}

          {/* ZZZs cuando duerme */}
          {!tapped && (
            <>
              {['z','z','z'].map((z, i) => (
                <motion.span key={i}
                  animate={{ opacity: [0, 1, 0], y: [0, -20, -40], x: [0, 8, 14] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.55 }}
                  style={{
                    position: 'absolute', top: '15%', right: '-5%',
                    fontSize: `${16 + i * 4}px`,
                    color: 'rgba(255,255,255,0.7)', fontWeight: 900,
                    pointerEvents: 'none',
                  }}
                >{z}</motion.span>
              ))}
            </>
          )}
        </motion.div>

        {/* Indicador de tap */}
        {!tapped && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[1, 2, 3].map(i => (
              <motion.div key={i}
                animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.45 }}
                style={{
                  position: 'absolute', width: 56, height: 56,
                  borderRadius: '50%', border: '2px solid rgba(0,174,239,0.55)',
                }}
              />
            ))}
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(0,174,239,0.18)',
                border: '2px solid rgba(0,174,239,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
              }}
            >👆</motion.div>
          </div>
        )}

        {/* Partículas al despertar */}
        {tapped && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '10px' }}>
            {['✨','💕','⚡'].map((e, i) => (
              <motion.span key={i}
                animate={{ y: [-10, -40, -70], opacity: [1, 1, 0], scale: [1, 1.3, 0.8] }}
                transition={{ delay: i * 0.15, duration: 1 }}
                style={{ fontSize: '26px' }}
              >{e}</motion.span>
            ))}
          </motion.div>
        )}
      </div>

      <motion.p
        animate={tapped ? {} : { opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', fontWeight: 700, textAlign: 'center' }}
      >
        {tapped ? '¡Simón se está despertando! 🌟' : 'Toca para despertar a Simón 🐾'}
      </motion.p>
    </div>
  );
}
