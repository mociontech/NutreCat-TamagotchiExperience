import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
type FoodType = 'dry' | 'wet' | 'treats';
import { sfx, sfxStop } from '../utils/sounds';

type BubblePhase = 'in' | 'out';

const PRODUCTS: { id: FoodType; img: string; left: string; width: string }[] = [
  { id: 'treats', img: '/assets/products/product-1.png', left: '13.61%', width: '21.48%' },
  { id: 'dry',    img: '/assets/products/product-3.png', left: '37.41%', width: '22.13%' },
  { id: 'wet',    img: '/assets/products/product-2.png', left: '63.52%', width: '21.48%' },
];

const BENEFITS: Record<FoodType, { text: string; icon: string; bg: string; color: string }[]> = {
  treats: [
    { text: 'Favorece una mejor digestión', icon: '🌿', bg: '#f4a875', color: '#7a1e0e' },
    { text: 'Vitamina D, calcio y fósforo para huesos fuertes', icon: '🦴', bg: '#f4a875', color: '#7a1e0e' },
  ],
  dry: [
    { text: 'Ayuda a mantener una digestión equilibrada', icon: '🌿', bg: '#dbd672', color: '#3a3b10' },
    { text: 'Ácidos grasos omega 3 para el corazón', icon: '🐟', bg: '#dbd672', color: '#3a3b10' },
  ],
  wet: [
    { text: 'Apoya la salud digestiva intestinal', icon: '🌿', bg: '#debbe7', color: '#5a1a6e' },
    { text: 'Fósforo y potasio para los músculos', icon: '💪', bg: '#debbe7', color: '#5a1a6e' },
  ],
};

const NAV = [
  { id: 'game',  label: 'Jugar',  icon: '/assets/nav/icon-game.svg'  },
  { id: 'food',  label: 'Comer',  icon: '/assets/nav/icon-food.svg'  },
  { id: 'sleep', label: 'Dormir', icon: '/assets/nav/icon-sleep.svg' },
] as const;

// Partículas fijas con stagger para evitar gestión de estado
const PARTICLES = [
  { emoji: '❤️', xPct: -18, delay: 0.0,  dur: 2.0, repeatDelay: 0.8 },
  { emoji: '⭐', xPct:  14, delay: 0.35, dur: 2.2, repeatDelay: 0.6 },
  { emoji: '💛', xPct:  -6, delay: 0.65, dur: 1.9, repeatDelay: 1.0 },
  { emoji: '✨', xPct:  22, delay: 1.0,  dur: 2.1, repeatDelay: 0.7 },
  { emoji: '❤️', xPct:  -2, delay: 1.3,  dur: 2.0, repeatDelay: 0.9 },
  { emoji: '⭐', xPct:  10, delay: 0.15, dur: 2.3, repeatDelay: 0.5 },
  { emoji: '💕', xPct: -14, delay: 0.8,  dur: 1.8, repeatDelay: 1.1 },
  { emoji: '✨', xPct:   5, delay: 1.5,  dur: 2.0, repeatDelay: 0.8 },
] as const;

interface Props {
  selectedFood: FoodType;
  onDone: () => void;
  onBack?: () => void;
  score?: number;
}

export default function FeedInteractionScreen({ selectedFood, onDone, onBack, score = 0 }: Props) {
  const [showBtn,     setShowBtn]     = useState(false);
  const [ripple,      setRipple]      = useState(false);
  const [bubblePhase, setBubblePhase] = useState<BubblePhase>('in');
  const [bagServed,   setBagServed]   = useState(false);
  const [eating,      setEating]      = useState(false);
  const [satisfied,   setSatisfied]   = useState(false);

  const goBack     = onBack ?? onDone;
  const handleDone = () => { sfxStop('eat'); onDone(); };
  const handlePress = () => {
    setRipple(true);
    setTimeout(() => { setRipple(false); handleDone(); }, 420);
  };

  useEffect(() => {
    // Fase 1: bolsa sube al centro
    const t0 = setTimeout(() => setBagServed(true), 50);
    // Fase 2: gato come (bolsa llegó)
    const t1 = setTimeout(() => { sfx('eat', 0.7); setEating(true); }, 900);
    // Fase 3: beneficios entran con snaps
    const t2 = setTimeout(() => sfx('snap', 0.6), 1300);
    const t3 = setTimeout(() => sfx('snap', 0.5), 1750);
    const t4 = setTimeout(() => sfx('bling', 0.4), 2500);
    // Fase 4: barra llena → satisfecho
    const t5 = setTimeout(() => setSatisfied(true), 4500); // 900 + 3600
    const t6 = setTimeout(() => setBubblePhase('out'), 4700);
    const t7 = setTimeout(() => setShowBtn(true), 5500);
    return () => { [t0,t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout); };
  }, []);

  const selected = PRODUCTS.find(p => p.id === selectedFood)!;
  const others   = PRODUCTS.filter(p => p.id !== selectedFood);

  return (
    <div style={{ width: '100%', height: '100%', background: '#00b6ed', position: 'relative', overflow: 'hidden' }}>

      {/* Fondo */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/backgrounds/bg-pet2.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', opacity: 0.44, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 2 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Score */}
      <div style={{ position: 'absolute', top: '5%', right: '9%', zIndex: 3, background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Puntos: {score}
        </span>
      </div>

      {/* Gato comiendo */}
      <div style={{ position: 'absolute', left: '18.15%', top: '20.73%', width: '69.17%', zIndex: 1, pointerEvents: 'none' }}>
        <motion.img
          src="/assets/cat/cat-food-eating.png"
          alt=""
          animate={eating
            ? { scale: [1, 1.04, 0.98, 1.04, 1], y: [0, -6, 2, -6, 0] }
            : { scale: 1, y: 0 }
          }
          transition={{ duration: 1.1, repeat: eating ? Infinity : 0, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))' }}
        />
      </div>

      {/* Corazones y estrellas flotantes */}
      {eating && PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0], y: -210, scale: [0.4, 1.3, 1.1, 0.6] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, repeatDelay: p.repeatDelay, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: `calc(50% + ${p.xPct}%)`,
            top: '38%',
            fontSize: 'min(5.5vw, 3.1vh)',
            pointerEvents: 'none', zIndex: 5, lineHeight: 1,
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Barra de saciedad */}
      <AnimatePresence>
        {eating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute',
              left: '15%', right: '15%',
              top: '57%',
              zIndex: 6, pointerEvents: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'min(0.9vw, 0.5vh)',
            }}
          >
            <motion.span
              key={satisfied ? 'sat' : 'eat'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(3.7vw, 2.08vh)',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {satisfied ? '¡Satisfecho! 🐱' : '¡Qué rico!'}
            </motion.span>

            {/* Track */}
            <div style={{
              width: '100%', height: 'min(2.8vw, 1.57vh)',
              background: 'rgba(255,255,255,0.22)',
              borderRadius: 99, overflow: 'hidden',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3.6, ease: 'linear' }}
                style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.96))',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bolsas no seleccionadas — atenuadas */}
      {others.map(p => (
        <div key={p.id as string} style={{
          position: 'absolute', top: '60.68%', left: p.left, width: p.width,
          zIndex: 2, opacity: 0.22, pointerEvents: 'none', filter: 'blur(1px)',
        }}>
          <img src={p.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
      ))}

      {/* Bolsa elegida — sube al centro con spring */}
      <div style={{
        position: 'absolute',
        left:      bagServed ? '50%'       : selected.left,
        top:       bagServed ? '44%'       : '60.68%',
        width:     selected.width,
        transform: bagServed ? 'translateX(-50%) scale(1.18)' : 'translateX(0) scale(1)',
        transition: 'left 0.85s cubic-bezier(0.34,1.56,0.64,1), top 0.85s cubic-bezier(0.34,1.56,0.64,1), transform 0.85s cubic-bezier(0.34,1.56,0.64,1)',
        filter: bagServed
          ? 'drop-shadow(0 0 22px rgba(255,255,255,0.9)) drop-shadow(0 8px 22px rgba(0,87,122,0.3))'
          : 'none',
        zIndex: 4, pointerEvents: 'none',
      }}>
        <img src={selected.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Globitos de beneficios */}
      {BENEFITS[selectedFood].map((b, i) => {
        const fromLeft = i === 0;
        const isIn = bubblePhase === 'in';
        return (
          <motion.div
            key={i}
            initial={{ x: fromLeft ? '-110%' : '110%', opacity: 0 }}
            animate={isIn
              ? { x: 0, opacity: 1 }
              : { x: fromLeft ? '-110%' : '110%', opacity: 0 }
            }
            transition={{
              delay:     isIn ? 0.4 + i * 0.45 : i * 0.12,
              duration:  0.55, type: 'spring', stiffness: 160, damping: 22,
            }}
            style={{
              position: 'absolute',
              left: fromLeft ? '5%' : '53%',
              top:  fromLeft ? '63%' : '71%',
              width: '42%',
              background: b.bg,
              borderRadius: 'min(3vw, 1.7vh)',
              padding: 'min(2vw, 1.1vh) min(3vw, 1.7vh)',
              display: 'flex', alignItems: 'center', gap: 'min(1.5vw, 0.85vh)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
              zIndex: 6, pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: 'min(5vw, 2.8vh)', flexShrink: 0 }}>{b.icon}</span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(3vw, 1.7vh)',
              color: b.color, fontWeight: 700,
              lineHeight: 1.2, textTransform: 'uppercase',
            }}>{b.text}</span>
          </motion.div>
        );
      })}

      {/* Botón ¡Listo! */}
      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1, y: 0, scale: 1,
              boxShadow: ['0 0 20px rgba(0,87,122,0.3)', '0 0 50px rgba(0,87,122,0.7)', '0 0 20px rgba(0,87,122,0.3)'],
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.35, boxShadow: { duration: 1.6, repeat: Infinity } }}
            onClick={handlePress}
            style={{
              position: 'absolute',
              bottom: '24%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,87,122,0.55)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1.5px solid rgba(255,255,255,0.28)',
              color: 'white', borderRadius: 99,
              padding: 'min(2.8vw, 1.6vh) min(10vw, 5.6vh)',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.5vw, 3.6vh)',
              textTransform: 'uppercase',
              cursor: 'pointer', whiteSpace: 'nowrap',
              zIndex: 10, overflow: 'hidden',
            }}
          >
            <AnimatePresence>
              {ripple && (
                <motion.span
                  key="ripple"
                  initial={{ scale: 0, opacity: 0.55 }}
                  animate={{ scale: 6, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.6)',
                    borderRadius: '50%', pointerEvents: 'none',
                    transformOrigin: 'center',
                  }}
                />
              )}
            </AnimatePresence>
            ¡Listo!
          </motion.button>
        )}
      </AnimatePresence>

      {/* Nav */}
      <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 2 }}>
        {NAV.map(item => {
          const isActive = item.id === 'food';
          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)', flexShrink: 0 }}>
              <div style={{ width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)', flexShrink: 0, position: 'relative' }}>
                <motion.button onClick={goBack} whileTap={{ scale: 0.88 }}
                  style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isActive ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  <img src={item.icon} alt="" style={{ width: '62%', height: 'auto', objectFit: 'contain', filter: isActive ? 'none' : 'brightness(0) invert(1)' }} />
                </motion.button>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.4vw, 1.9vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: isActive ? 1 : 0.75, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                {isActive ? '✓ ' : ''}{item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
