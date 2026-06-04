import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import { bgPlay, bgStop } from '../utils/sounds';

const CAT_IDLE        = '/assets/cat/cat-hub.png';
const CAT_EYES_CLOSED = '/assets/cat/cat-pet-closed.png';
const CAT_DONE        = '/assets/cat/cat-pet-done.png';

interface Particle { id: number; x: number; y: number; text: string; }

interface Props { onNext: () => void; name?: string; }

const PURRWORDS = ['Prrr…', 'Grrr…', 'Miau~', 'Prrr…', '💙'];
const FILL_RATE = 1.2;

export default function PetScreen({ onNext, name = 'Simón' }: Props) {
  const [affection,  setAffection]  = useState(0);
  const [petting,    setPetting]    = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [done,       setDone]       = useState(false);
  const [particles,  setParticles]  = useState<Particle[]>([]);
  const [ripple,     setRipple]     = useState(false);

  const affRef     = useRef(0);
  const petTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);

  const addParticle = useCallback((x: number, y: number) => {
    const id   = particleId.current++;
    const text = PURRWORDS[Math.floor(Math.random() * PURRWORDS.length)];
    setParticles(p => [...p.slice(-12), { id, x, y, text }]);
    setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 1400);
  }, []);

  const startPetting = (e: React.TouchEvent | React.MouseEvent) => {
    if (done) return;
    setPetting(true);
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    addParticle(pt.clientX, pt.clientY);
    petTimer.current = setInterval(() => {
      affRef.current = Math.min(100, affRef.current + FILL_RATE);
      setAffection(affRef.current);
      if (affRef.current >= 100) {
        clearInterval(petTimer.current!);
        clearInterval(blinkTimer.current!);
        setPetting(false);
        setEyesClosed(false);
        setDone(true);
      }
    }, 80);
    blinkTimer.current = setInterval(() => setEyesClosed(c => !c), 700);
  };

  const movePetting = (e: React.TouchEvent | React.MouseEvent) => {
    if (!petting || done) return;
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    if (Math.random() > 0.55) addParticle(pt.clientX, pt.clientY);
  };

  const stopPetting = () => {
    if (done) return;
    setPetting(false);
    setEyesClosed(false);
    clearInterval(petTimer.current!);
    clearInterval(blinkTimer.current!);
  };

  useEffect(() => () => {
    clearInterval(petTimer.current!);
    clearInterval(blinkTimer.current!);
  }, []);

  useEffect(() => {
    if (petting && !done) bgPlay('purr', 0.65);
    else bgStop('purr');
    return () => bgStop('purr');
  }, [petting, done]);

  const catSrc = done ? CAT_DONE : eyesClosed ? CAT_EYES_CLOSED : CAT_IDLE;

  return (
    <ScreenLayout
      backgroundImage="/assets/backgrounds/bg-pet2.png"
      backgroundOpacity={0.44}
      backgroundFilter="blur(5px) brightness(1.08) saturate(0.78)"
      tintColor="rgba(255, 185, 90, 0.10)"
    >
      {/* Partículas flotantes */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0.7, x: p.x - 20, y: p.y - 40 }}
          animate={{ opacity: 0, scale: 1.3, y: p.y - 140 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{ position: 'fixed', zIndex: 100, pointerEvents: 'none', fontWeight: 900, fontSize: '20px', color: '#00577a' }}
        >
          {p.text}
        </motion.div>
      ))}

      {/* Corazones al terminar */}
      {done && [0,1,2,3,4].map(i => (
        <motion.div
          key={`heart-${i}`}
          initial={{ opacity: 0, scale: 0, x: `${20 + i * 15}%`, y: '65%' }}
          animate={{ opacity: [0,1,1,0], scale: [0,1.3,1,0], y: ['65%','15%'] }}
          transition={{ duration: 1.8, delay: i * 0.2, ease: 'easeOut' }}
          style={{ position: 'absolute', fontSize: '30px', pointerEvents: 'none', zIndex: 5 }}
        >
          💙
        </motion.div>
      ))}

      {/* ── Área de interacción táctil — cubre toda la pantalla ── */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onMouseDown={startPetting} onMouseMove={movePetting} onMouseUp={stopPetting} onMouseLeave={stopPetting}
        onTouchStart={startPetting} onTouchMove={movePetting} onTouchEnd={stopPetting}
      >
        {/* Logo — centrado, doble tamaño, 100px abajo */}
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="Nutre Cat"
          draggable={false}
          style={{
            position: 'absolute',
            top: 'calc(4.79% + 30px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '57%',
            height: 'auto',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        {/* Pills "Acaricia a" + estado — solo cuando no está done */}
        {!done && <motion.div
          animate={!petting && !done ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: 'calc(28% + 80px)', left: 'calc(52% + 150px)', right: '2%', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 'min(2vw, 1.1vh)' }}
        >
          <div style={{ background: 'white', borderRadius: 99, padding: 'min(1.8vw, 1vh) min(4vw, 2.2vh)', boxShadow: '0 2px 12px rgba(0,87,122,0.18)', alignSelf: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Acaricia a
            </span>
          </div>
          <motion.div
            animate={petting ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ background: 'white', borderRadius: 99, padding: 'min(1.5vw, 0.85vh) min(4vw, 2.2vh)', boxShadow: '0 2px 12px rgba(0,87,122,0.18)', alignSelf: 'flex-start' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: '#00577a', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {done ? '¡Listo! 💙' : petting ? 'Prrr… 😸' : `${name} 🐱`}
            </span>
          </motion.div>
        </motion.div>}

        {/* Gato central — grande */}
        <div style={{ position: 'absolute', top: 'calc(28% + 100px)', bottom: '18%', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={catSrc}
              src={catSrc}
              alt="Simón"
              draggable={false}
              initial={{ opacity: 0.7, scale: 0.95 }}
              animate={
                done    ? { opacity: 1, scale: 1, y: [0, -18, 0, -18, 0] }
                : petting ? { opacity: 1, scale: [1, 1.04, 1], rotate: [-2, 2, -2] }
                : { opacity: 1, scale: 1, y: [0, -6, 0] }
              }
              transition={
                done    ? { y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.15 } }
                : petting ? { duration: 0.4, repeat: Infinity, opacity: { duration: 0.1 } }
                : { duration: 3, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.15 } }
              }
              style={{
                width: '62%', height: 'auto',
                userSelect: 'none', pointerEvents: 'none',
                filter: done ? 'drop-shadow(0 20px 50px rgba(0,87,122,0.3))'
                  : petting ? 'drop-shadow(0 0 30px rgba(0,87,122,0.35))'
                  : 'drop-shadow(0 16px 32px rgba(0,87,122,0.15))',
              }}
            />
          </AnimatePresence>

          {/* Burbuja glass al terminar */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, delay: 0.35 }}
                style={{ position: 'absolute', top: '6%', left: 'calc(5% + 480px)', zIndex: 10, maxWidth: '65%' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
                  style={{
                    background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)',
                    borderRadius: '24px', padding: 'min(2vw, 1.1vh) min(4vw, 2.2vh)',
                    boxShadow: '0 8px 28px rgba(0,87,122,0.18), inset 0 1px 0 rgba(255,255,255,0.8)',
                    textAlign: 'center', position: 'relative',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: '#00577a', margin: 0 }}>
                    ¡Estoy listo para jugar!
                  </p>
                  <div style={{ position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '12px solid rgba(255,255,255,0.45)' }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* Botón continuar */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ position: 'absolute', bottom: 'calc(7% - 70px)', left: '7.3%', right: '7.3%', zIndex: 4 }}
            >
              <motion.button
                onClick={() => { setRipple(true); setTimeout(() => { setRipple(false); onNext(); }, 420); }}
                whileHover={{ scale: 1.03, filter: 'brightness(1.18)' }}
                whileTap={{ scale: 0.96 }}
                animate={{ boxShadow: ['0 0 20px rgba(0,87,122,0.2)', '0 0 44px rgba(0,87,122,0.55)', '0 0 20px rgba(0,87,122,0.2)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '100%', padding: 'min(4vw, 2.2vh)',
                  background: '#00577a', color: 'white', border: 'none', borderRadius: 99,
                  fontFamily: 'var(--font-display)', fontSize: 'min(8.5vw, 4.8vh)',
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.03em',
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}
              >
                {ripple && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 5, opacity: 0 }}
                    transition={{ duration: 0.42, ease: 'easeOut' }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.55)', borderRadius: '50%', pointerEvents: 'none', transformOrigin: 'center' }}
                  />
                )}
                Continuar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Barra de cariño — solo mientras no termina ── */}
        {!done && <div style={{ position: 'absolute', bottom: '7%', left: '7.3%', right: '7.3%', zIndex: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'min(1vw, 0.55vh)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
              💙 Cariño
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.1vh)', color: 'white', letterSpacing: '0.04em', opacity: 0.9 }}>
              {Math.round(affection)}%
            </span>
          </div>
          <div style={{ height: 'min(4.5vw, 2.5vh)', background: 'rgba(255,255,255,0.25)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 2px 6px rgba(0,87,122,0.2)' }}>
            <motion.div
              animate={{ width: `${affection}%` }}
              transition={{ duration: 0.12 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, rgba(255,255,255,0.7), white)', borderRadius: 99, boxShadow: affection > 0 ? '0 0 14px rgba(255,255,255,0.7)' : 'none' }}
            />
          </div>
        </div>}
      </div>
    </ScreenLayout>
  );
}
