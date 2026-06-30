import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import type { FoodType } from '../../data/gameStates';
import { ASSETS, cssUrl } from '../../config/assets';
import { ACTIVITY_NAV_ITEMS, PRODUCT_LAYOUTS } from '../../config/products';

const PRODUCTS: { id: FoodType; img: string; left: string; width: string }[] = PRODUCT_LAYOUTS;

const NAV = ACTIVITY_NAV_ITEMS;

interface Props {
  onSelect: (food: FoodType) => void;
  onBack: () => void;
  score?: number;
  hasFed?: boolean;
  hasPlayed?: boolean;
  hasTalked?: boolean;
}

interface Drag { id: FoodType; img: string; cx: number; cy: number; }

export default function FeedSelectScreen({ onSelect, onBack, score = 0, hasFed = false, hasPlayed = false, hasTalked = false }: Props) {
  const [drag,     setDrag]     = useState<Drag | null>(null);
  const [selected, setSelected] = useState<FoodType | null>(null);
  const [flash,    setFlash]    = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Pointer handlers ─────────────────────────────────────── */
  const onDown = (e: React.PointerEvent) => {
    if (selected) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-food-id]');
    if (!el) return;
    e.preventDefault();
    containerRef.current?.setPointerCapture(e.pointerId);
    setDrag({ id: el.dataset.foodId as FoodType, img: el.dataset.foodImg!, cx: e.clientX, cy: e.clientY });
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

    const dx = rx - 0.50;
    const dy = ry - 0.43;
    if (Math.sqrt(dx * dx + dy * dy) < 0.18) {
      const food = drag.id;
      setDrag(null);
      setSelected(food);
      setFlash(true);
      setTimeout(() => setFlash(false), 420);
      setTimeout(() => { setSelected(null); onSelect(food); }, 750);
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
      <div style={{ position: 'absolute', inset: 0, backgroundImage: cssUrl(ASSETS.backgrounds.pet), backgroundSize: 'cover', backgroundPosition: 'center bottom', opacity: 0.44, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 2 }}>
        <img src={ASSETS.ui.logo} alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Score pill */}
      <motion.div
        key={score}
        animate={{ scale: [1.12, 1] }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '5%',
          right: '9%',
          zIndex: 3,
          background: 'white',
          borderRadius: 'min(3.8vw, 2.14vh)',
          width: 'min(33.3vw, 18.75vh)',
          height: 'min(7.6vw, 4.27vh)',
          boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.57vw, 3.7vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          paddingTop: '0.25em',
        }}>
          Puntos: {score}
        </span>
      </motion.div>

      <motion.button
        onClick={onBack}
        whileTap={{ scale: 0.88 }}
        style={{
          position: 'absolute',
          top: '85.6%',
          left: '6.5%',
          zIndex: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
          <path d="M28 8 L14 22 L28 36" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      {/* Gato esperando comida */}
      <video
        src={ASSETS.catVideos.foodIdle}
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', left: '8.5%', top: 'calc(20.73% + 150px)', width: '83%',
          objectFit: 'contain', zIndex: 1, pointerEvents: 'none',
          filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))',
        }}
      />

      {/* Indicador zona de drop */}
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

      {/* Bolsas de comida */}
      {PRODUCTS.map((p, i) => {
        const isSelected = selected === p.id;
        const isDimmed   = selected !== null && !isSelected;
        const isGrabbed  = drag?.id === p.id;

        return (
          <motion.div
            key={p.id as string}
            data-food-id={p.id}
            data-food-img={p.img}
            animate={{
              opacity: isGrabbed ? 0.25 : isDimmed ? 0.32 : 1,
              scale:   isSelected ? 1.10 : 1,
            }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'absolute',
              top: '60.68%',
              left: p.left,
              width: p.width,
              zIndex: isSelected ? 5 : 4,
              cursor: selected ? 'default' : 'grab',
              filter: isSelected
                ? 'drop-shadow(0 0 18px rgba(255,255,255,0.85)) drop-shadow(0 6px 16px rgba(0,87,122,0.25))'
                : 'drop-shadow(0 6px 16px rgba(0,0,0,0.2))',
            }}
          >
            <motion.img
              src={p.img}
              alt=""
              draggable={false}
              animate={!drag && !selected ? { y: [0, -6, 0] } : { y: 0 }}
              transition={{ duration: 2.2, repeat: (!drag && !selected) ? Infinity : 0, ease: 'easeInOut', delay: i * 0.3 }}
              style={{ width: '100%', height: 'auto', objectFit: 'contain', pointerEvents: 'none' }}
            />
          </motion.div>
        );
      })}

      {/* Texto de instrucción */}
      {!drag && !selected && (
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
        {flash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 0.55, 0] }} exit={{ opacity: 0 }}
            transition={{ duration: 0.42 }}
            style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 99, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Nav botones circulares */}
      <div style={{ position: 'absolute', top: '82.6%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 2 }}>
        {NAV.map(item => {
          const doneMap = { hasFed, hasPlayed, hasTalked };
          const done = doneMap[item.doneKey];
          const inProgress = item.id === 'food' && !done;
          return (
            <motion.button key={item.id} onClick={onBack} whileTap={{ scale: 0.88 }}
              style={{ width: 'min(17.13vw, 9.64vh)', aspectRatio: '1', borderRadius: '50%', border: 'none', cursor: 'pointer', background: done ? 'white' : '#00577a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: done ? '0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)' : '0 4px 16px rgba(0,0,0,0.2)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
              {inProgress && (
                <svg
                  viewBox="0 0 100 58"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', left: 0, right: 0, bottom: -2, width: '100%', height: 'calc(58% + 32px)', zIndex: 0, pointerEvents: 'none' }}
                >
                  <path d="M0 16 C18 4 32 28 50 16 C68 4 82 28 100 16 L100 58 L0 58 Z" fill="white" />
                </svg>
              )}
              <div
                style={{
                  width: '62%',
                  aspectRatio: '1',
                  position: 'relative',
                  zIndex: 1,
                  backgroundColor: '#00B6ED',
                  WebkitMaskImage: `url(${item.icon})`,
                  maskImage: `url(${item.icon})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  pointerEvents: 'none',
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
