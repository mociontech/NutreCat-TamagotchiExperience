import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import ScreenLayout from '../components/ScreenLayout';
import { bgPlay, bgStop, bgFade } from '../utils/sounds';


interface Particle { id: number; x: number; y: number; text: string; }

interface Props { onNext: () => void; name?: string; }

const PURRWORDS = ['Prrr…', 'Grrr…', 'Miau~', 'Prrr…', '💙'];
const FILL_RATE = 1.2;

export default function PetScreen({ onNext, name = 'Simón' }: Props) {
  const [affection,  setAffection]  = useState(0);
  const [petting,    setPetting]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [particles,  setParticles]  = useState<Particle[]>([]);
  const [ripple,     setRipple]     = useState(false);

  const affRef     = useRef(0);
  const petTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const particleId = useRef(0);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const celebrandoRef   = useRef<HTMLVideoElement>(null);
  const esperandoRef    = useRef<HTMLVideoElement>(null);

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
        setDone(true);
      }
    }, 80);
  };

  const movePetting = (e: React.TouchEvent | React.MouseEvent) => {
    if (!petting || done) return;
    const pt = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    if (Math.random() > 0.55) addParticle(pt.clientX, pt.clientY);
  };

  const stopPetting = () => {
    if (done) return;
    setPetting(false);
    clearInterval(petTimer.current!);
    clearInterval(blinkTimer.current!);
  };

  useEffect(() => {
    bgFade('ukulele', 1400, 0.01);
    return () => {
      clearInterval(petTimer.current!);
      clearInterval(blinkTimer.current!);
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (petting && !done) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [petting, done]);

  useEffect(() => {
    if (!esperandoRef.current) return;
    if (!petting && !done) {
      esperandoRef.current.play();
    } else {
      esperandoRef.current.pause();
    }
  }, [petting, done]);

  useEffect(() => {
    if (petting && !done) bgPlay('purr', 0.65);
    else bgStop('purr');
    return () => bgStop('purr');
  }, [petting, done]);

  useEffect(() => {
    if (done && celebrandoRef.current) {
      celebrandoRef.current.play();
    }
  }, [done]);


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

        {/* Card "ACARICIA A / nombre" — Figma 477:165, rotación -8.24deg */}
        {!done && (
          <motion.div
            animate={{ opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: '50.9%', top: 'calc(29.7% + 100px)',
              width: '41.86%',
              zIndex: 3,
              transform: 'rotate(-8.24deg)',
              background: '#b0e8f9',
              border: '6px solid #00577a',
              borderRadius: 'min(4.05vw, 2.28vh)',
              paddingTop: 30, paddingBottom: 20, paddingLeft: 'min(4vw, 2.2vh)', paddingRight: 'min(4vw, 2.2vh)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'min(0.4vw, 0.22vh)',
              boxShadow: '0 4px 18px rgba(0,87,122,0.22)',
            }}
          >
            <svg
              viewBox="0 0 100 100"
              style={{
                position: 'absolute',
                right: 'calc(-1 * min(5.2vw, 2.93vh) + 3px)',
                top: 'calc(-1 * min(5.2vw, 2.93vh) - 1px)',
                width: 'min(10.4vw, 5.85vh)',
                height: 'min(10.4vw, 5.85vh)',
                zIndex: 1,
                transform: 'rotate(-24.5deg)',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <polygon
                points="50,4 61,35 94,36 67,56 77,87 50,68 23,87 33,56 6,36 39,35"
                fill="#b0e8f9"
                stroke="#00577a"
                strokeWidth="5"
              />
            </svg>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.62vw, 3.73vh)',
              color: '#00577a',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              lineHeight: 0.866,
              textAlign: 'center',
              display: 'block',
            }}>
              ACARICIA A
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(6.62vw, 3.73vh)',
              color: '#00577a',
              textTransform: 'uppercase',
              lineHeight: 0.952,
              textAlign: 'center',
              display: 'block',
            }}>
              {name}
            </span>
          </motion.div>
        )}

        {/* Gato central — grande */}
        <div style={{ position: 'absolute', top: 'calc(28% + 240px)', bottom: '18%', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Video Esperando — visible en idle y al soltar */}
          <video
            ref={esperandoRef}
            src="/assets/cat/Animation/Esperando.webm"
            loop
            muted
            playsInline
            autoPlay
            style={{
              position: 'absolute',
              width: '76.79%', height: 'auto',
              objectFit: 'contain',
              userSelect: 'none', pointerEvents: 'none',
              opacity: !petting && !done ? 1 : 0,
              transition: 'opacity 0.2s ease',
              filter: 'drop-shadow(0 16px 32px rgba(0,87,122,0.2))',
            }}
          />

          {/* Video de consentir — visible solo mientras se acaricia */}
          <video
            ref={videoRef}
            src="/assets/cat/Animation/Concentir.webm"
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              width: '76.79%', height: 'auto',
              objectFit: 'contain',
              userSelect: 'none', pointerEvents: 'none',
              opacity: petting && !done ? 1 : 0,
              transition: 'opacity 0.2s ease',
              filter: 'drop-shadow(0 0 30px rgba(0,87,122,0.35))',
            }}
          />

          {/* Video Celebrando — visible cuando termina, en loop */}
          <video
            ref={celebrandoRef}
            src="/assets/cat/Animation/Celebrando.webm"
            muted
            playsInline
            loop
            style={{
              position: 'absolute',
              width: '76.79%', height: 'auto',
              objectFit: 'contain',
              userSelect: 'none', pointerEvents: 'none',
              opacity: done ? 1 : 0,
              transition: 'opacity 0.3s ease',
              filter: 'drop-shadow(0 20px 50px rgba(0,87,122,0.3))',
            }}
          />

          {/* Burbuja glass al terminar */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 10, x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, delay: 0.35 }}
                style={{ position: 'absolute', top: 'calc(6% - 150px)', left: 'calc(50% + 80px)', zIndex: 10, maxWidth: '65%' }}
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
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: '#00577a', margin: 0, whiteSpace: 'nowrap' }}>
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
                  width: '100%', height: 82, padding: '15px min(4vw, 2.2vh) 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'white', color: '#00577a', border: 'none', borderRadius: 99,
                  fontFamily: 'var(--font-display)', fontSize: 77.742, lineHeight: 1,
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
