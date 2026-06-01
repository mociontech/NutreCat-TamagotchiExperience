import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import type { FoodType } from '../data/gameStates';

const PRODUCTS: { id: FoodType; img: string; left: string; width: string }[] = [
  { id: 'dry',    img: '/assets/products/product-3.png', left: '13.61%', width: '21.48%' },
  { id: 'wet',    img: '/assets/products/product-2.png', left: '37.41%', width: '22.13%' },
  { id: 'treats', img: '/assets/products/product-1.png', left: '63.52%', width: '21.48%' },
];

const NAV = [
  { id: 'game',    icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   icon: '/assets/nav/icon-sleep.svg'   },
] as const;

interface Props { onSelect: (food: FoodType) => void; onBack: () => void; score?: number; }

interface Drag { id: FoodType; img: string; cx: number; cy: number; }

export default function FeedSelectScreen({ onSelect, onBack, score = 0 }: Props) {
  const [drag,     setDrag]     = useState<Drag | null>(null);
  const [success,  setSuccess]  = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Pointer handlers on the main container ──────────────── */
  const onDown = (e: React.PointerEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-food-id]');
    if (!el) return;
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    setDrag({
      id:  el.dataset.foodId as FoodType,
      img: el.dataset.foodImg!,
      cx:  e.clientX,
      cy:  e.clientY,
    });
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag(d => d ? { ...d, cx: e.clientX, cy: e.clientY } : null);
  };

  const onUp = (e: React.PointerEvent) => {
    if (!drag || !containerRef.current) { setDrag(null); return; }
    const rect = containerRef.current.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top)  / rect.height;

    /* Drop zone: cat's plate area ≈ (50%, 43%) radius 18% */
    const dx = rx - 0.50;
    const dy = ry - 0.43;
    if (Math.sqrt(dx * dx + dy * dy) < 0.18) {
      const food = drag.id;
      setSuccess(true);
      setDrag(null);
      setTimeout(() => { setSuccess(false); onSelect(food); }, 450);
    } else {
      setDrag(null);
    }
  };

  const inDropZone = drag
    ? (() => {
        if (!containerRef.current) return false;
        const rect = containerRef.current.getBoundingClientRect();
        const dx = (drag.cx - rect.left) / rect.width  - 0.50;
        const dy = (drag.cy - rect.top)  / rect.height - 0.43;
        return Math.sqrt(dx * dx + dy * dy) < 0.18;
      })()
    : false;

  return (
    <div
      ref={containerRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => setDrag(null)}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        position: 'relative', overflow: 'hidden',
        touchAction: 'none', userSelect: 'none',
      }}
    >
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
      <button onClick={onBack} style={{ position: 'absolute', top: '10.36%', right: '9.63%', width: 'min(9vw, 5.1vh)', aspectRatio: '1', background: 'rgba(255,255,255,0.25)', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/assets/ui/arrow-back.svg" alt="Volver" style={{ width: '55%', filter: 'brightness(0) invert(1)' }} />
      </button>

      {/* Gato con tenedor — detrás de las bolsas */}
      <div style={{ position: 'absolute', left: '18.15%', top: '20.73%', width: '69.17%', zIndex: 1, pointerEvents: 'none' }}>
        <motion.img
          src="/assets/cat/cat-food-select.png"
          alt=""
          animate={success ? { scale: [1, 1.08, 1] } : { y: [0, -8, 0] }}
          transition={success ? { duration: 0.35 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))' }}
        />
      </div>

      {/* Indicador zona de drop — aparece mientras arrastra */}
      <AnimatePresence>
        {drag && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: inDropZone ? [0.8, 1, 0.8] : [0.3, 0.6, 0.3],
              scale:   inDropZone ? [1.05, 1.15, 1.05] : [0.9, 1.0, 0.9],
            }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              position: 'absolute',
              left: '38%', top: '35%',
              width: '24%', aspectRatio: '1',
              borderRadius: '50%',
              border: `3px dashed ${inDropZone ? '#ffffff' : 'rgba(255,255,255,0.6)'}`,
              background: inDropZone ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
              zIndex: 5,
              boxShadow: inDropZone ? '0 0 30px rgba(255,255,255,0.6)' : 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Bolsas de comida — arrastrables */}
      {PRODUCTS.map(p => (
        <div
          key={p.id as string}
          data-food-id={p.id}
          data-food-img={p.img}
          style={{
            position: 'absolute',
            top: '60.68%',
            left: p.left,
            width: p.width,
            zIndex: 4,
            opacity: drag?.id === p.id ? 0.25 : 1,
            transition: 'opacity 0.15s',
            cursor: 'grab',
          }}
        >
          <motion.img
            src={p.img}
            alt=""
            draggable={false}
            animate={!drag ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: PRODUCTS.indexOf(p) * 0.3 }}
            style={{ width: '100%', height: 'auto', objectFit: 'contain', pointerEvents: 'none', filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))' }}
          />
        </div>
      ))}

      {/* Texto de instrucción */}
      {!drag && (
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: '19%', left: 0, right: 0,
            textAlign: 'center',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(4.5vw, 2.5vh)',
            color: 'white',
            textShadow: '0 2px 8px rgba(0,87,122,0.4)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          ¡Arrastra la comida al plato!
        </motion.p>
      )}

      {/* Ghost — sigue al puntero */}
      {drag && (
        <div style={{ position: 'fixed', left: drag.cx, top: drag.cy, transform: 'translate(-50%, -55%) scale(1.25)', width: 'min(22vw, 12.4vh)', pointerEvents: 'none', zIndex: 200, filter: 'drop-shadow(0 10px 24px rgba(0,87,122,0.5))' }}>
          <img src={drag.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
      )}

      {/* Flash al soltar correctamente */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0] }} exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 99, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Nav botones circulares */}
      <div style={{ position: 'absolute', top: '82.6%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 2 }}>
        {NAV.map(item => {
          const isFood = item.id === 'food';
          return (
            <motion.button key={item.id} onClick={onBack} whileTap={{ scale: 0.88 }}
              style={{ width: 'min(17.13vw, 9.64vh)', height: 'min(17.13vw, 9.64vh)', borderRadius: '50%', border: 'none', cursor: 'pointer', background: isFood ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isFood ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', flexShrink: 0 }}>
              <img src={item.icon} alt="" style={{ width: '54%', height: '54%', objectFit: 'contain', filter: isFood ? 'none' : 'brightness(0) invert(1)' }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
