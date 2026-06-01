import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { sfx, bgPlay, bgStop } from '../utils/sounds';

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   label: 'Hablar', icon: '/assets/nav/icon-sleep.svg'   },
] as const;

interface Zzz { id: number; x: number; y: number; size: number; rot: number; char: string; }

interface Props { onDone: () => void; onBack?: () => void; score?: number; }

export default function TalkScreen({ onDone, onBack, score = 0 }: Props) {
  const [phase,   setPhase]   = useState<'light' | 'dimming' | 'dark'>('light');
  const [showBtn, setShowBtn] = useState(false);
  const [zzzList, setZzzList] = useState<Zzz[]>([]);
  const zzzId   = useRef(0);
  const goBack  = onBack ?? onDone;

  /* Musicbox suave solo mientras fase oscura */
  useEffect(() => {
    if (phase !== 'dark') return;
    bgPlay('musicbox', 0.12);
    return () => bgStop('musicbox');
  }, [phase]);

  /* ZZZ spawn loop while dark */
  useEffect(() => {
    if (phase !== 'dark') return;
    const spawn = () => {
      const id = zzzId.current++;
      const chars = ['z', 'Z', 'z', '💤', 'Z', 'z'];
      setZzzList(prev => [...prev.slice(-12), {
        id,
        x: 38 + Math.random() * 22,   /* % left — cat head area */
        y: 28 + Math.random() * 12,   /* % top */
        size: 18 + Math.random() * 22,
        rot: -20 + Math.random() * 40,
        char: chars[Math.floor(Math.random() * chars.length)],
      }]);
      setTimeout(() => setZzzList(p => p.filter(z => z.id !== id)), 2200);
    };
    const interval = setInterval(spawn, 700);
    spawn();
    return () => clearInterval(interval);
  }, [phase]);

  const tapLamp = () => {
    if (phase !== 'light') return;
    sfx('lightswitch', 0.8);
    setPhase('dimming');
    setTimeout(() => {
      setPhase('dark');
      setTimeout(() => setShowBtn(true), 2200);
    }, 600);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#1a0d2e',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Fondo habitación — luz encendida ── */}
      <motion.img
        src="/assets/cat/cat-bed-light.png"
        alt=""
        animate={{ opacity: phase === 'light' ? 1 : 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          pointerEvents: 'none',
        }}
      />

      {/* ── Fondo habitación — luz apagada ── */}
      <motion.img
        src="/assets/cat/cat-bed-dark.png"
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          pointerEvents: 'none',
        }}
      />

      {/* ── Overlay oscuro al apagar ── */}
      <AnimatePresence>
        {phase === 'dimming' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            style={{ position: 'absolute', inset: 0, background: '#0d0820', zIndex: 8, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* ── Logo ── */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 10 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat"
          style={{ width: '100%', height: '100%', objectFit: 'contain',
            filter: phase === 'dark' ? 'brightness(1.4)' : 'none', transition: 'filter 0.8s' }} />
      </div>

      {/* ── Score pill ── */}
      <div style={{ position: 'absolute', top: '5%', right: '9%', zIndex: 10, background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow: '0 2px 14px rgba(0,0,0,0.25)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.6vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Puntos: {score}
        </span>
      </div>

      {/* ── Back arrow ── */}
      <button onClick={goBack} style={{ position: 'absolute', top: '12.29%', right: '9.63%', width: 'min(9vw, 5.1vh)', aspectRatio: '1', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="/assets/ui/arrow-back.svg" alt="Volver" style={{ width: '55%', filter: 'brightness(0) invert(1)' }} />
      </button>

      {/* ── FASE LIGHT: zona de tap de la lámpara ── */}
      {phase === 'light' && (
        <>
          {/* Zona clickeable sobre la lámpara (upper-left) */}
          <div
            onClick={tapLamp}
            style={{
              position: 'absolute', left: 0, top: 0,
              width: '45%', height: '42%',
              zIndex: 9, cursor: 'pointer',
            }}
          />

          {/* Mano apuntando a la lámpara */}
          {/* Figma: inset[19.38%_55.77%_71.29%_24.17%], -scaleX + rotate 19.96deg */}
          <motion.div
            animate={{ x: [-6, 6, -6], y: [-4, 4, -4] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '19.38%', left: '24.17%',
              width: '20%',
              zIndex: 9, pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflow: 'hidden', width: '100%', aspectRatio: '360 / 239' }}>
              <img
                src="/assets/ui/hand-pointer.svg"
                alt=""
                style={{
                  width: '100%', height: '100%', display: 'block',
                  transform: 'scaleX(-1) rotate(20deg)',
                  filter: 'brightness(0) invert(1)',
                }}
              />
            </div>
          </motion.div>

          {/* Texto indicador pulsante */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.3, repeat: Infinity }}
            style={{
              position: 'absolute',
              top: '14%', left: '9%',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 99,
              padding: 'min(1.5vw, 0.85vh) min(3.5vw, 2vh)',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(4vw, 2.3vh)',
              color: '#00577a',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              zIndex: 9,
              whiteSpace: 'nowrap',
            }}
          >
            💡 ¡Apaga la luz!
          </motion.div>
        </>
      )}

      {/* ── FASE DARK: ZZZ flotantes ── */}
      <AnimatePresence>
        {zzzList.map(z => (
          <motion.span
            key={z.id}
            initial={{ opacity: 0.9, scale: 0.8, y: 0, x: 0 }}
            animate={{ opacity: 0, scale: 1.4, y: -80, x: (Math.random() - 0.5) * 40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${z.x}%`, top: `${z.y}%`,
              fontSize: z.size,
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              rotate: `${z.rot}deg`,
              pointerEvents: 'none',
              zIndex: 9,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {z.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* ── Botón ¡Listo! ── */}
      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1, y: 0, scale: 1,
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.2)',
                '0 0 50px rgba(255,255,255,0.5)',
                '0 0 20px rgba(255,255,255,0.2)',
              ],
            }}
            transition={{ duration: 0.35, boxShadow: { duration: 2, repeat: Infinity } }}
            onClick={onDone}
            style={{
              position: 'absolute', bottom: '24%', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white', border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: 99,
              padding: 'min(2.8vw, 1.6vh) min(10vw, 5.6vh)',
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.5vw, 3.6vh)',
              textTransform: 'uppercase',
              cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 10,
            }}
          >
            ¡Listo! 💤
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Nav botones circulares ── */}
      <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(4.4vw, 2.5vh)', padding: '0 9%', zIndex: 10 }}>
        {NAV.map(item => {
          const isActive = item.id === 'sleep';
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
