import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props { onDone: () => void; }

const STEPS = [
  {
    num: 1,
    imgs: ['/assets/products/product-1.png'],
    prohibit: false,
    badge: null,
    title: 'TOCA LAS BOLSAS',
    subtitle: '+10 PUNTOS',
    subtitleColor: '#00b6ed',
    subtitle2: '-5 si cae al suelo',
    subtitle2Color: '#e63c3c',
  },
  {
    num: 2,
    imgs: ['/assets/games/fishbone_no_bg.png'],
    prohibit: true,
    badge: null,
    title: 'EVITA LAS ESPINAS',
    subtitle: '-10 PUNTOS',
    subtitleColor: '#e63c3c',
    subtitle2: null, subtitle2Color: '',
  },
  {
    num: 3,
    imgs: ['/assets/games/mouse_no_bg.png'],
    prohibit: false,
    badge: 'x2',
    title: 'ATRAPA EL RATÓN DORADO',
    subtitle: 'x2 POR 5 SEG',
    subtitleColor: '#00b6ed',
    subtitle2: null, subtitle2Color: '',
  },
  {
    num: 4,
    imgs: ['/assets/products/product-1.png', '/assets/products/product-2.png', '/assets/products/product-3.png'],
    prohibit: false,
    badge: '3',
    title: 'HAZ COMBO',
    subtitle: '3 SEGUIDOS =\nMÁS PUNTOS',
    subtitleColor: '#00b6ed',
    subtitle2: null, subtitle2Color: '',
  },
];

export default function FallingBagsInstructionsScreen({ onDone }: Props) {
  const [refill, setRefill] = useState(false);

  const handlePress = () => {
    setRefill(true);
    setTimeout(() => { setRefill(false); onDone(); }, 380);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: 'url(/assets/backgrounds/FondoJuego2.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: 'min(3vw, 1.7vh) 0 min(4vw, 2.25vh)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,182,237,0.45)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: 'min(1.5vw, 0.85vh)' }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 'min(32vw, 18vh)', objectFit: 'contain' }} />
      </div>

      {/* Título INSTRUCCIONES */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 'min(2.5vw, 1.4vh)', marginBottom: 'min(2vw, 1.1vh)', marginTop: 80 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(8.5vw, 4.8vh)', color: 'white', textTransform: 'uppercase', textShadow: '0 4px 14px rgba(0,87,122,0.4)' }}>
          Instrucciones
        </span>
      </div>

      {/* Tarjeta blanca con pasos */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 'min(5.5vw, 3.1vh)',
        width: '79%',
        padding: 'min(2.5vw, 1.4vh) min(5vw, 2.8vh)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,87,122,0.22)',
      }}>
        {STEPS.map((step, i) => (
          <div key={i}>
            {/* Fila del paso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'min(3vw, 1.7vh)', padding: 'min(2.8vw, 1.58vh) 0' }}>

              {/* Número */}
              <div style={{
                width: 'min(9.5vw, 5.35vh)', height: 'min(9.5vw, 5.35vh)', borderRadius: '50%',
                background: '#00b6ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 3px 10px rgba(0,182,237,0.4)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: 'white', lineHeight: 1 }}>{step.num}</span>
              </div>

              {/* Visual del ítem */}
              <div style={{ width: 'min(17vw, 9.6vh)', height: 'min(17vw, 9.6vh)', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.imgs.length === 1 ? (
                  <img
                    src={step.imgs[0]}
                    alt=""
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain',
                      filter: step.imgs[0].includes('mouse')
                        ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))'
                        : 'drop-shadow(0 3px 8px rgba(0,87,122,0.25))',
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                    {step.imgs.map((src, j) => (
                      <img key={j} src={src} alt="" style={{ width: 'min(5vw, 2.8vh)', height: 'auto', objectFit: 'contain', opacity: 0.9 }} />
                    ))}
                  </div>
                )}

                {/* Badge x2 */}
                {step.badge === 'x2' && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#fcd116', borderRadius: 99, padding: '2px 7px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3vw, 1.69vh)', color: '#00577a' }}>x2</span>
                  </div>
                )}

                {/* Badge combo */}
                {step.badge === '3' && (
                  <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', background: '#00577a', borderRadius: 99, padding: '1px 8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(2.8vw, 1.58vh)', color: 'white' }}>×3</span>
                  </div>
                )}

                {/* Miss — flecha abajo */}
                {step.badge === 'miss' && (
                  <div style={{ position: 'absolute', bottom: 0, right: -2, background: '#e63c3c', borderRadius: 99, width: 'min(5.5vw, 3.1vh)', height: 'min(5.5vw, 3.1vh)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2V12M7 12L3 8M7 12L11 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                {/* Prohibit */}
                {step.prohibit && (
                  <div style={{ position: 'absolute', bottom: 0, right: -2, fontSize: 'min(5.5vw, 3.1vh)' }}>🚫</div>
                )}
              </div>

              {/* Flecha */}
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                  <path d="M2 10H22M22 10L14 3M22 10L14 17" stroke="#00577a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Texto */}
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(4.2vw, 2.36vh)', color: '#00577a', margin: 0, lineHeight: 1.1, textTransform: 'uppercase' }}>
                  {step.title}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.14vh)', color: step.subtitleColor, margin: 'min(0.5vw, 0.28vh) 0 0', lineHeight: 1.1, whiteSpace: 'pre-line' }}>
                  {step.subtitle}
                </p>
                {step.subtitle2 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'min(3vw, 1.69vh)', color: step.subtitle2Color, margin: 'min(0.3vw, 0.17vh) 0 0', lineHeight: 1.1, fontWeight: 700 }}>
                    {step.subtitle2}
                  </p>
                )}
              </div>
            </div>

            {/* Divisor */}
            {i < STEPS.length - 1 && (
              <div style={{ height: 1, background: 'rgba(0,182,237,0.18)', margin: '0 min(1vw, 0.55vh)' }} />
            )}
          </div>
        ))}

        {/* Texto disclaimer */}
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'min(3.3vw, 1.86vh)',
          color: '#00577a', textAlign: 'center', margin: 'min(2vw, 1.1vh) 0 0',
          textTransform: 'uppercase', opacity: 0.75, lineHeight: 1.3,
        }}>
          Toca los productos{' '}
          <span style={{ color: '#00b6ed' }}>antes</span>
          {' '}de que toquen el suelo.
        </p>
      </div>

      {/* Botón Entendido */}
      <motion.button
        onClick={handlePress}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          scale: [1, 1.05, 1],
          boxShadow: ['0 0 18px rgba(252,209,22,0.4)', '0 0 42px rgba(252,209,22,0.85)', '0 0 18px rgba(252,209,22,0.4)'],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'relative', zIndex: 1, overflow: 'hidden',
          marginTop: 'calc(min(3vw, 1.7vh) + 15px)',
          background: '#fcd116', border: 'none', borderRadius: 99,
          padding: 'min(1.07vw, 0.61vh) min(21vw, 11.82vh)',
          fontFamily: 'var(--font-display)', fontSize: 'min(8.5vw, 4.8vh)',
          color: '#00577a', textTransform: 'uppercase',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, paddingTop: 'calc(min(1.07vw, 0.61vh) + 0.22em)',
        }}
      >
        <AnimatePresence>
          {refill && (
            <motion.span
              key="refill"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.36, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(255,255,255,0.45)',
                pointerEvents: 'none',
                borderRadius: 99,
              }}
            />
          )}
        </AnimatePresence>
        Entendido
      </motion.button>
    </div>
  );
}
