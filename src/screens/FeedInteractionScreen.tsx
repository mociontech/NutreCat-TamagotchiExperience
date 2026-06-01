import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { FoodType } from '../data/gameStates';

const PRODUCTS: { id: FoodType; img: string; left: string; width: string }[] = [
  { id: 'dry',    img: '/assets/products/product-3.png', left: '13.61%', width: '21.48%' },
  { id: 'wet',    img: '/assets/products/product-2.png', left: '37.41%', width: '22.13%' },
  { id: 'treats', img: '/assets/products/product-1.png', left: '63.52%', width: '21.48%' },
];

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   label: 'Hablar', icon: '/assets/nav/icon-sleep.svg'   },
] as const;

interface Props {
  selectedFood: FoodType;
  onDone: () => void;
  onBack?: () => void;
  score?: number;
}

export default function FeedInteractionScreen({ selectedFood, onDone, onBack, score = 0 }: Props) {
  const [showBtn, setShowBtn] = useState(false);
  const goBack = onBack ?? onDone;

  useEffect(() => {
    const t = setTimeout(() => setShowBtn(true), 1600);
    return () => clearTimeout(t);
  }, []);

  const selected = PRODUCTS.find(p => p.id === selectedFood)!;
  const others   = PRODUCTS.filter(p => p.id !== selectedFood);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo cuarto 44% */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/backgrounds/bg-pet.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', opacity: 0.44, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 2 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Score pill */}
      <div style={{ position: 'absolute', top: '5%', right: '9%', zIndex: 3, background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Puntos: {score}
        </span>
      </div>

      {/* Back arrow */}
      <button onClick={goBack} style={{ position: 'absolute', top: '10.36%', right: '9.63%', width: 'min(9vw, 5.1vh)', aspectRatio: '1', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/assets/ui/arrow-back.svg" alt="Volver" style={{ width: '55%', filter: 'brightness(0) invert(1)' }} />
      </button>

      {/* Gato comiendo — animación de masticación */}
      <div style={{ position: 'absolute', left: '18.15%', top: '20.73%', width: '69.17%', zIndex: 1, pointerEvents: 'none' }}>
        <motion.img
          src="/assets/cat/cat-food-eating.png"
          alt=""
          animate={{ scale: [1, 1.03, 1, 1.03, 1], y: [0, -4, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))' }}
        />
      </div>

      {/* Bolsas no seleccionadas — en su posición normal abajo */}
      {others.map(p => (
        <div key={p.id as string} style={{ position: 'absolute', top: '60.68%', left: p.left, width: p.width, zIndex: 2, opacity: 0.55, pointerEvents: 'none' }}>
          <img src={p.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
      ))}

      {/* Bolsa seleccionada — elevada y rotada (Figma: left 57.96%, top 51.93%, rotate 22.18deg) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, top: '60.68%', left: selected.left, rotate: 0 }}
        animate={{ opacity: 1, scale: 1, top: '51.93%', left: '57.96%', rotate: 22 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
        style={{ position: 'absolute', width: '21.48%', zIndex: 4, pointerEvents: 'none', transformOrigin: 'center center' }}
      >
        <img src={selected.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(0,87,122,0.35))' }} />
      </motion.div>

      {/* Destellos alrededor del gato mientras come */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale:   [0, 1, 0],
            x: Math.cos((i / 6) * Math.PI * 2) * 40,
            y: Math.sin((i / 6) * Math.PI * 2) * 40,
          }}
          transition={{ duration: 1, delay: i * 0.18, repeat: Infinity, repeatDelay: 0.8 }}
          style={{
            position: 'absolute',
            left: '50%', top: '38%',
            fontSize: 'min(5vw, 2.8vh)',
            pointerEvents: 'none', zIndex: 5,
          }}
        >✨</motion.div>
      ))}

      {/* Botón ¡Listo! */}
      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1, y: 0, scale: 1,
              boxShadow: ['0 0 20px rgba(0,87,122,0.3)', '0 0 50px rgba(0,87,122,0.7)', '0 0 20px rgba(0,87,122,0.3)'],
            }}
            transition={{ duration: 0.35, boxShadow: { duration: 1.6, repeat: Infinity } }}
            onClick={onDone}
            style={{
              position: 'absolute',
              bottom: '24%', left: '50%',
              transform: 'translateX(-50%)',
              background: '#00577a', color: 'white',
              border: 'none', borderRadius: 99,
              padding: 'min(2.8vw, 1.6vh) min(10vw, 5.6vh)',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.5vw, 3.6vh)',
              textTransform: 'uppercase',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              zIndex: 6,
            }}
          >
            ¡Listo! 🐾
          </motion.button>
        )}
      </AnimatePresence>

      {/* Nav botones circulares */}
      <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 2 }}>
        {NAV.map(item => {
          const isActive = item.id === 'food';
          return (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)', flexShrink: 0 }}>
              <motion.button onClick={goBack} whileTap={{ scale: 0.88 }}
                style={{ width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isActive ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <img src={item.icon} alt="" style={{ width: '54%', height: '54%', objectFit: 'contain', filter: isActive ? 'none' : 'brightness(0) invert(1)' }} />
              </motion.button>
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
