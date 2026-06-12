import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props { onNext: (name: string) => void; }

export default function RegistrationScreen({ onNext }: Props) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onNext(trimmed);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Cuarto al 14% de opacidad */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/assets/backgrounds/bg-pet2.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        opacity: 0.44,
        pointerEvents: 'none',
      }} />

      {/* Logo NutreCat */}
      <div style={{
        position: 'absolute',
        top: '8.23%', right: '27.96%', bottom: '74.04%', left: '27.97%',
      }}>
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="Nutre Cat"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Wrapper de posicionamiento (sin transform animado) */}
      <div style={{
        position: 'absolute',
        left: '9.165%',           /* (100% - 81.67%) / 2 */
        right: '9.165%',
        top: '50%',
        transform: 'translateY(-50%)',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            background: '#00577a',
            borderRadius: 54,
            padding: '6% 7%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            overflow: 'hidden',
          }}
        >
          {/* Encabezado */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(4vw, 2.3vh)',
            color: 'rgba(255,255,255,0.7)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
            textAlign: 'center',
            margin: 0,
          }}>
            Ponle nombre a tu gato
          </p>

          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(11.3vw, 6.35vh)',
            color: 'white',
            textTransform: 'uppercase',
            textAlign: 'center',
            lineHeight: 1.05,
            letterSpacing: '0.01em',
            margin: 0,
            width: '100%',
          }}>
            ¿Cómo me llamo?
          </p>

          {/* Input */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={16}
            placeholder="Escribe un nombre…"
            autoFocus
            style={{
              width: '70%',
              background: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '10px 16px',
              fontSize: 'min(4vw, 2.3vh)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: '#00577a',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.03em',
              boxSizing: 'border-box',
            }}
          />
        </motion.div>

        {/* Botón ¡Listo! — aparece al escribir */}
        <AnimatePresence>
          {name.trim().length > 0 && (
            <motion.button
              key="submit"
              initial={{ opacity: 0, y: 12 }}
              animate={{
                opacity: 1, y: 0,
                boxShadow: [
                  '0 0 20px rgba(0,87,122,0.25)',
                  '0 0 44px rgba(0,87,122,0.6)',
                  '0 0 20px rgba(0,87,122,0.25)',
                ],
              }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                opacity: { duration: 0.2 },
                y: { duration: 0.2 },
                boxShadow: { duration: 1.6, repeat: Infinity },
              }}
              onClick={handleSubmit}
              style={{
                display: 'block',
                margin: '20px auto 0',
                padding: '14px 48px',
                background: '#00577a',
                color: 'white',
                border: 'none',
                borderRadius: 48,
                fontFamily: 'var(--font-display)',
                fontSize: 'min(6vw, 3.4vh)',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                letterSpacing: '0.03em',
              }}
            >
              ¡Listo!
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
