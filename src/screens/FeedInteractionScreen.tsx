import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
type FoodType = 'dry' | 'wet' | 'treats';
import { sfx, sfxStop } from '../utils/sounds';

const FEED_POINTS = 30;

const PRODUCTS: { id: FoodType; img: string; left: string; width: string }[] = [
  { id: 'treats', img: '/assets/products/product-1.png', left: '13.61%', width: '21.48%' },
  { id: 'dry',    img: '/assets/products/product-3.png', left: '37.41%', width: '22.13%' },
  { id: 'wet',    img: '/assets/products/product-2.png', left: '63.52%', width: '21.48%' },
];

const BENEFITS: Record<FoodType, { line1: string; line2: string; bg: string; color: string }[]> = {
  treats: [
    { line1: 'Favorece una',           line2: 'mejor digestión.',            bg: '#f4a875', color: '#7a1e0e' },
    { line1: 'Calcio y fósforo', line2: 'para huesos fuertes.', bg: '#f4a875', color: '#7a1e0e' },
  ],
  dry: [
    { line1: 'Ayuda a mantener una',   line2: 'digestión equilibrada.',       bg: '#dbd672', color: '#3a3b10' },
    { line1: 'Ácidos grasos omega 3',  line2: 'para el corazón.',             bg: '#dbd672', color: '#3a3b10' },
  ],
  wet: [
    { line1: 'Apoya la salud',         line2: 'digestiva intestinal.',        bg: '#debbe7', color: '#5a1a6e' },
    { line1: 'Fósforo y potasio',      line2: 'para los músculos.',           bg: '#debbe7', color: '#5a1a6e' },
  ],
};

interface Props {
  selectedFood: FoodType;
  onDone: () => void;
  onBack?: () => void;
  score?: number;
}

export default function FeedInteractionScreen({ selectedFood, onDone, score = 0 }: Props) {
  const [showBtn,     setShowBtn]     = useState(false);
  const [displayScore, setDisplayScore] = useState(score);
  const [ripple,      setRipple]      = useState(false);
  const [bagServed,   setBagServed]   = useState(false);
  const [bagReturned, setBagReturned] = useState(false);
  const [eating,      setEating]      = useState(false);
  const [satisfied,   setSatisfied]   = useState(false);
  const [showPills,   setShowPills]   = useState(false);
  const [showWait,    setShowWait]    = useState(false);
  const [waitAnim,    setWaitAnim]    = useState<'Esperando2' | 'Esperando3'>('Esperando2');
  const waitVideoRef   = useRef<HTMLVideoElement>(null);
  const salidaVideoRef = useRef<HTMLVideoElement>(null);

  const handleDone = () => { sfxStop('eat'); onDone(); };
  const handlePress = () => {
    setDisplayScore(score + FEED_POINTS);
    setRipple(true);
    setTimeout(() => { setRipple(false); handleDone(); }, 420);
  };

  useEffect(() => {
    setDisplayScore(score);
  }, [score]);

  useEffect(() => {
    const t0 = setTimeout(() => setBagServed(true), 50);
    // Bolsa vuelve tras 2s en el aire (50ms + 850ms animación + 2000ms espera)
    const tR = setTimeout(() => setBagReturned(true), 2900);
    const t1 = setTimeout(() => { sfx('eat', 0.7); setEating(true); }, 900);
    const t2 = setTimeout(() => sfx('snap', 0.6), 1300);
    const t3 = setTimeout(() => sfx('snap', 0.5), 1750);
    const t4 = setTimeout(() => sfx('bling', 0.4), 2500);
    // Barra se llena en 3.6s → satisfecho a t=4500ms
    const t5 = setTimeout(() => setSatisfied(true), 4500);
    // Pills aparecen 200ms después
    const t6 = setTimeout(() => setShowPills(true), 4700);
    // Botón listo 800ms después de pills
    const t7 = setTimeout(() => setShowBtn(true), 5500);
    return () => { [t0,tR,t1,t2,t3,t4,t5,t6,t7].forEach(clearTimeout); };
  }, []);

  // Arranca SalidaComida solo cuando satisfied se activa
  useEffect(() => {
    if (!satisfied) return;
    const v = salidaVideoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [satisfied]);

  // Cambia src del video de espera post-satisfecho
  useEffect(() => {
    const v = waitVideoRef.current;
    if (!v || !showWait) return;
    v.src = `/assets/cat/Animation/${waitAnim}.webm`;
    v.load();
    v.play().catch(() => {});
  }, [waitAnim, showWait]);

  const selected = PRODUCTS.find(p => p.id === selectedFood)!;
  const others   = PRODUCTS.filter(p => p.id !== selectedFood);
  const benefits = BENEFITS[selectedFood];

  return (
    <div style={{ width: '100%', height: '100%', background: '#00b6ed', position: 'relative', overflow: 'hidden' }}>

      {/* Fondo */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/backgrounds/bg-pet2.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', opacity: 0.44, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 2 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Score */}
      <motion.div
        key={displayScore}
        animate={{ scale: [1.12, 1] }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', top: '5%', right: '9%', zIndex: 3, background: 'white', borderRadius: 'min(3.8vw, 2.14vh)', width: 'min(33.3vw, 18.75vh)', height: 'min(7.6vw, 4.27vh)', boxShadow: '0 2px 14px rgba(0,87,122,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.57vw, 3.7vh)', color: '#00577a', textTransform: 'uppercase', textAlign: 'center', whiteSpace: 'nowrap', lineHeight: 1, paddingTop: '0.25em' }}>
          Puntos: {displayScore}
        </span>
      </motion.div>

      {/* ── Pills de beneficios — una de cada lado, alturas escalonadas ── */}
      <AnimatePresence>
        {showPills && benefits.map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i === 0 ? '-130%' : '130%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: i === 0 ? '-130%' : '130%' }}
            transition={{ delay: i * 0.18, type: 'spring', stiffness: 220, damping: 24 }}
            style={{
              position: 'absolute',
              top: i === 0 ? 'calc(13% + 130px)' : 'calc(19% + 130px)',
              left:  i === 0 ? '9%'  : undefined,
              right: i === 1 ? '9%'  : undefined,
              maxWidth: '40%',
              zIndex: 8, pointerEvents: 'none',
              rotate: i === 0 ? '-10deg' : '15deg',
              scale: 0.95,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.06, 1],
                boxShadow: [
                  '0 0 0px rgba(255,255,255,0)',
                  '0 0 14px rgba(255,255,255,0.7)',
                  '0 0 0px rgba(255,255,255,0)',
                ],
                rotate: [0, -2.5, 2.5, -2.5, 2.5, -1.5, 1.5, 0],
              }}
              transition={{
                scale:     { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
                boxShadow: { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 },
                rotate:    { duration: 0.55, repeat: Infinity, repeatDelay: 3.8, ease: 'easeInOut', delay: 2 + i * 1.4 },
              }}
              style={{
                position: 'relative', overflow: 'hidden',
                background: b.bg,
                border: `2px solid ${b.color}`,
                borderRadius: 'min(2.5vw, 1.4vh)',
                padding: 'calc(min(1.8vw, 1.02vh) - 3px) min(3vw, 1.65vh)',
                boxShadow: `0 4px 16px ${b.bg}99`,
                display: 'inline-block',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'min(2.85vw, 1.6vh)',
                color: b.color,
                fontWeight: 700,
                lineHeight: 1.15,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                display: 'block',
                textAlign: 'center',
                position: 'relative', zIndex: 1,
              }}>
                {b.line1}<br />{b.line2}
              </span>
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ['-140%', '200%'] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: 1 + i * 0.6 }}
                style={{
                  position: 'absolute',
                  top: '-20%', bottom: '-20%', width: '55%',
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
                  pointerEvents: 'none', zIndex: 2,
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Videos del gato ── */}
      <video
        src="/assets/cat/Animation/EsperandoComida.webm"
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', left: '8.5%', top: 'calc(20.73% + 150px)', width: '83%',
          objectFit: 'contain', zIndex: 1, pointerEvents: 'none',
          opacity: !eating ? 1 : 0, transition: 'opacity 0.3s ease',
          filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))',
        }}
      />
      <video
        src="/assets/cat/Animation/Comiendo.webm"
        autoPlay loop muted playsInline
        style={{
          position: 'absolute', left: '8.5%', top: 'calc(20.73% + 150px)', width: '83%',
          objectFit: 'contain', zIndex: 1, pointerEvents: 'none',
          opacity: eating && !satisfied ? 1 : 0, transition: 'opacity 0.3s ease',
          filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))',
        }}
      />
      {/* SalidaComida — arranca solo cuando satisfied, sin autoPlay */}
      <video
        ref={salidaVideoRef}
        src="/assets/cat/Animation/SalidaComida.webm"
        muted playsInline
        onEnded={() => setShowWait(true)}
        style={{
          position: 'absolute', left: '8.5%', top: 'calc(20.73% + 150px)', width: '83%',
          objectFit: 'contain', zIndex: 1, pointerEvents: 'none',
          opacity: satisfied && !showWait ? 1 : 0, transition: 'opacity 0.3s ease',
          filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))',
        }}
      />
      {/* Espera post-satisfecho — alterna Esperando2 / Esperando3 */}
      <video
        ref={waitVideoRef}
        muted playsInline
        onEnded={() => setWaitAnim(p => p === 'Esperando2' ? 'Esperando3' : 'Esperando2')}
        style={{
          position: 'absolute', left: '8.5%', top: 'calc(20.73% + 150px)', width: '83%',
          objectFit: 'contain', zIndex: 1, pointerEvents: 'none',
          opacity: showWait ? 1 : 0, transition: 'opacity 0.3s ease',
          filter: 'drop-shadow(0 16px 36px rgba(0,87,122,0.2))',
        }}
      />

      {/* ── Bolsas no seleccionadas — atenuadas ── */}
      {others.map(p => (
        <div key={p.id as string} style={{
          position: 'absolute', top: '60.68%', left: p.left, width: p.width,
          zIndex: 2, opacity: 0.22, pointerEvents: 'none', filter: 'blur(1px)',
        }}>
          <img src={p.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
        </div>
      ))}

      {/* ── Bolsa seleccionada — vuela arriba y regresa resaltada ── */}
      <div style={{
        position: 'absolute',
        left:      bagServed && !bagReturned ? '50%' : selected.left,
        top:       bagServed && !bagReturned ? 'calc(44% - 200px)' : '60.68%',
        width:     selected.width,
        transform: bagServed && !bagReturned
          ? 'translateX(calc(-50% + 200px)) scale(0.944) rotate(-105deg)'
          : bagReturned ? 'translateX(0) scale(1.18) rotate(0deg)'
          : 'translateX(0) scale(1) rotate(0deg)',
        transition: 'left 0.85s cubic-bezier(0.34,1.56,0.64,1), top 0.85s cubic-bezier(0.34,1.56,0.64,1), transform 0.85s cubic-bezier(0.34,1.56,0.64,1)',
        filter: bagServed
          ? 'drop-shadow(0 0 22px rgba(255,255,255,0.9)) drop-shadow(0 8px 22px rgba(0,87,122,0.3))'
          : 'none',
        zIndex: 4, pointerEvents: 'none',
      }}>
        <img src={selected.img} alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
      </div>

      {/* ── Zona inferior — barra → pills → botón ── */}
      <div style={{
        position: 'absolute',
        bottom: '5%', left: '9%', right: '9%',
        zIndex: 6,
        display: 'flex', flexDirection: 'column', alignItems: 'stretch',
        gap: 'min(2.2vw, 1.24vh)',
      }}>

        {/* Barra de saciedad */}
        <AnimatePresence>
          {eating && !showPills && (
            <motion.div
              key="bar"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'min(1.2vw, 0.68vh)' }}
            >
              {/* Label — desaparece al llenarse */}
              <AnimatePresence>
                {!satisfied && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'min(4.2vw, 2.36vh)',
                      color: 'white',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      textAlign: 'center',
                    }}
                  >
                    ¡Qué rico!
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Track */}
              <div style={{
                width: '100%', height: 'min(3.5vw, 1.97vh)',
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
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.65), rgba(255,255,255,0.96))',
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Botón ¡Listo! — mismo estilo que Continuar en PetScreen */}
        <AnimatePresence>
          {showBtn && (
            <motion.div
              key="btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <motion.button
                onClick={handlePress}
                whileHover={{ scale: 1.03, filter: 'brightness(1.18)' }}
                whileTap={{ scale: 0.96 }}
                animate={{ boxShadow: ['0 0 20px rgba(0,87,122,0.2)', '0 0 44px rgba(0,87,122,0.55)', '0 0 20px rgba(0,87,122,0.2)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '100%', height: 82,
                  padding: '15px min(4vw, 2.2vh) 0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'white', color: '#00577a',
                  border: 'none', borderRadius: 99,
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

      </div>
    </div>
  );
}
