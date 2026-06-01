import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import BottomNav, { type NavTabDef } from '../components/BottomNav';
import { bgPlay, bgStop } from '../utils/sounds';

const NAV_ICONS = {
  game:    '/assets/nav/icon-game.svg',
  food:    '/assets/nav/icon-food.svg',
  hygiene: '/assets/nav/icon-hygiene.svg',
  sleep:   '/assets/nav/icon-sleep.svg',
};

const CAT_EYES_OPEN   = '/assets/cat/cat-hub.png';
const CAT_EYES_CLOSED = '/assets/cat/cat-pet-closed.png';
const CAT_DONE        = '/assets/cat/cat-pet-done.png';

interface Particle { id: number; x: number; y: number; text: string; }

interface Props { onNext: () => void; }

const PURRWORDS = ['Prrr…', 'Grrr…', 'Miau~', 'Prrr…', '💜'];

export default function PetScreen({ onNext }: Props) {
  const [affection, setAffection]   = useState(0);
  const [petting, setPetting]       = useState(false);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [done, setDone]             = useState(false);
  const [particles, setParticles]   = useState<Particle[]>([]);

  const affRef     = useRef(0);
  const petTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: false, isDone: false, onClick: onNext },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: onNext },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: onNext },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: onNext },
  ];

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
      affRef.current = Math.min(100, affRef.current + 3);
      setAffection(affRef.current);
      if (affRef.current >= 100) {
        clearInterval(petTimer.current!);
        clearInterval(blinkTimer.current!);
        setPetting(false);
        setEyesClosed(false);
        setDone(true);
      }
    }, 80);

    // Parpadeo: alterna ojos abiertos ↔ cerrados cada 700ms
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

  /* Ronroneo: loop mientras se consienta, para al soltar o terminar */
  useEffect(() => {
    if (petting && !done) {
      bgPlay('purr', 0.65);
    } else {
      bgStop('purr');
    }
    return () => bgStop('purr');
  }, [petting, done]);

  const catSrc = done ? CAT_DONE : eyesClosed ? CAT_EYES_CLOSED : CAT_EYES_OPEN;

  return (
    <ScreenLayout backgroundImage="/assets/backgrounds/bg-pet.png" backgroundOpacity={1}>
      {/* Partículas Prrr/Grrr flotantes */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0.7, x: p.x - 20, y: p.y - 40 }}
          animate={{ opacity: 0, scale: 1.3, y: p.y - 140 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          style={{
            position: 'fixed', zIndex: 100, pointerEvents: 'none',
            fontWeight: 900, fontSize: '18px', color: '#00577a',
            textShadow: '0 1px 4px rgba(0,87,122,0.2)',
          }}
        >
          {p.text}
        </motion.div>
      ))}

      {/* Corazones cuando termina */}
      {done && [0,1,2,3,4].map(i => (
        <motion.div
          key={`heart-${i}`}
          initial={{ opacity: 0, scale: 0, x: `${20 + i * 15}%`, y: '65%' }}
          animate={{ opacity: [0,1,1,0], scale: [0,1.3,1,0], y: ['65%','15%'] }}
          transition={{ duration: 1.8, delay: i * 0.2, ease: 'easeOut' }}
          style={{ position: 'absolute', fontSize: '30px', pointerEvents: 'none', zIndex: 5 }}
        >
          💜
        </motion.div>
      ))}

      {/* Área interactiva */}
      <div
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}
        onMouseDown={startPetting} onMouseMove={movePetting} onMouseUp={stopPetting} onMouseLeave={stopPetting}
        onTouchStart={startPetting} onTouchMove={movePetting} onTouchEnd={stopPetting}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 20px 0', flexShrink: 0, position: 'relative', zIndex: 2,
        }}>
          <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: 130 }} />
          <div style={{
            background: 'white', borderRadius: '40px', padding: '8px 20px',
            boxShadow: '0 2px 10px rgba(0,87,122,0.15)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '18px',
              color: '#00577a', textTransform: 'uppercase',
            }}>
              {done ? '¡Listo!' : petting ? 'Prrr…' : 'Acaríciame'}
            </span>
          </div>
        </div>

        {/* Barra de cariño */}
        <div style={{ padding: '10px 24px 0', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', color: '#00577a', fontWeight: 800 }}>💜 Cariño</span>
            <span style={{ fontSize: '12px', color: '#00577a', fontWeight: 900 }}>{Math.round(affection)}/100</span>
          </div>
          <div style={{ height: '10px', background: 'rgba(0,87,122,0.15)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${affection}%` }}
              transition={{ duration: 0.12 }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #00577a, #00b6ed)', borderRadius: '99px' }}
            />
          </div>
        </div>

        {/* Gato central — 67.22% de ancho (Figma: 726/1080) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={catSrc}
              src={catSrc}
              alt="Simón"
              draggable={false}
              initial={{ opacity: 0.7, scale: 0.95 }}
              animate={
                done
                  ? { opacity: 1, scale: 1, y: [0, -18, 0, -18, 0] }
                  : petting
                  ? { opacity: 1, scale: [1, 1.04, 1], rotate: [-2, 2, -2] }
                  : { opacity: 1, scale: 1, y: [0, -6, 0] }
              }
              transition={
                done
                  ? { y: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.15 } }
                  : petting
                  ? { duration: 0.4, repeat: Infinity, opacity: { duration: 0.1 } }
                  : { duration: 3, repeat: Infinity, ease: 'easeInOut', opacity: { duration: 0.15 } }
              }
              style={{
                width: '67.22%',
                height: 'auto',
                userSelect: 'none', pointerEvents: 'none',
                filter: done
                  ? 'drop-shadow(0 20px 50px rgba(0,87,122,0.3))'
                  : petting
                  ? 'drop-shadow(0 0 30px rgba(0,87,122,0.35))'
                  : 'drop-shadow(0 16px 32px rgba(0,87,122,0.15))',
              }}
            />
          </AnimatePresence>

          {/* Burbuja "¡Estoy listo para jugar!" */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, delay: 0.35 }}
                style={{
                  position: 'absolute', top: '6%', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'white', borderRadius: '24px',
                  padding: '12px 24px',
                  boxShadow: '0 8px 28px rgba(0,87,122,0.25)',
                  whiteSpace: 'nowrap', zIndex: 10,
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: '19px',
                  color: '#00577a', margin: 0,
                }}>
                  💬 ¡Estoy listo para jugar!
                </p>
                <div style={{
                  position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '12px solid white',
                }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instrucción mientras no está pettando */}
          {!petting && !done && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                position: 'absolute', bottom: '4%', color: '#00577a',
                fontSize: '15px', fontWeight: 700, pointerEvents: 'none',
                textAlign: 'center',
              }}
            >
              👆 Desliza para acariciarlo
            </motion.p>
          )}
        </div>

        {/* Botón continuar */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{ padding: '0 24px 14px', flexShrink: 0 }}
            >
              <motion.button
                onClick={onNext}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0,87,122,0.2)',
                    '0 0 44px rgba(0,87,122,0.55)',
                    '0 0 20px rgba(0,87,122,0.2)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '100%', padding: '18px',
                  background: '#00577a', color: 'white',
                  border: 'none', borderRadius: '24px',
                  fontFamily: 'var(--font-display)', fontSize: '20px',
                  cursor: 'pointer', textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Continuar 💜
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav tabs={navTabs} />
    </ScreenLayout>
  );
}