import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props { onDone: () => void; }

const SLIDE_MS = 6000;

/* ── Iconos SVG inline ──────────────────────────────────────── */
const GutIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="#00577a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 8C26 8 36 14 36 22C36 30 28 36 20 34C12 32 10 24 16 20C20 17 28 20 28 26C28 32 22 40 12 40C8 40 6 36 8 32"/>
  </svg>
);

const MuscleIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="#00577a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 34C6 26 10 18 18 14C24 11 32 14 36 8C39 4 44 5 44 10C44 15 40 18 36 20C33 21 32 20 32 24C32 30 26 38 16 40C9 42 5 38 6 34Z"/>
    <path d="M28 12C30 10 34 10 35 13"/>
  </svg>
);

const HeartPulseIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="#00577a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 40C24 40 6 28 6 16C6 10 10 6 16 6C19 6 22 8 24 10C26 8 29 6 32 6C38 6 42 10 42 16C42 28 24 40 24 40Z"/>
    <polyline points="10,24 16,24 20,14 26,32 30,24 38,24"/>
  </svg>
);

const BoneIcon = () => (
  <svg width="36" height="36" viewBox="0 0 48 48" fill="none" stroke="#00577a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 11C15 8 12 5 9 7C6 9 7 13 10 14L10 34C7 35 6 39 9 41C12 43 15 40 15 37L33 37C33 40 36 43 39 41C42 39 41 35 38 34L38 14C41 13 42 9 39 7C36 5 33 8 33 11Z"/>
  </svg>
);

type IconType = 'gut' | 'muscle' | 'heartpulse' | 'bone';

function BenefitIcon({ type }: { type: IconType }) {
  if (type === 'gut')        return <GutIcon />;
  if (type === 'muscle')     return <MuscleIcon />;
  if (type === 'heartpulse') return <HeartPulseIcon />;
  return <BoneIcon />;
}

/* ── Datos de slides ────────────────────────────────────────── */
const SLIDES = [
  {
    product: '/assets/products/product-1.png',
    left:  { icon: 'gut'    as IconType, title: 'PARA GATOS CON\nSISTEMA DIGESTIVO\nSENSIBLE', body: 'Proteína magra de alta calidad que ayuda a una fácil digestión y a mantener el equilibrio intestinal.' },
    right: { icon: 'muscle' as IconType, title: 'FORTALECE\nLOS MÚSCULOS',                      body: 'Su aporte de fósforo y potasio favorece el buen funcionamiento muscular.' },
  },
  {
    product: '/assets/products/product-2.png',
    left:  { icon: 'gut'        as IconType, title: 'DIGESTIÓN\nSALUDABLE',            body: 'Con salmón, proteína de alta calidad y fácil asimilación que favorece el equilibrio de la flora digestiva.' },
    right: { icon: 'heartpulse' as IconType, title: 'APOYA LA SALUD\nCARDIOVASCULAR', body: 'Contiene ácidos grasos omega-3 que apoyan una buena circulación y favorecen niveles saludables de lípidos.' },
  },
  {
    product: '/assets/products/product-3.png',
    left:  { icon: 'gut'  as IconType, title: 'PARA GATITOS\nSENSIBLES A\nLA LACTOSA',   body: 'Ayuda a regular el tránsito intestinal y puede aliviar diarreas leves.' },
    right: { icon: 'bone' as IconType, title: 'DESARROLLO\nÓSEO ÓPTIMO\nEN CRECIMIENTO', body: 'Aporta calcio, fósforo y vitamina D, nutrientes esenciales para la formación y fortalecimiento de huesos y dientes.' },
  },
];

/* ── Panel de beneficio individual ─────────────────────────── */
function BenefitPanel({ icon, title, body }: { icon: IconType; title: string; body: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1.2vw, 0.68vh)' }}>
      <div style={{
        width: 'min(13vw, 7.3vh)', height: 'min(13vw, 7.3vh)', borderRadius: '50%',
        border: '1.5px solid rgba(0,182,237,0.35)', background: 'rgba(0,182,237,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <BenefitIcon type={icon} />
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3vw, 1.69vh)', color: '#00577a', textAlign: 'center', margin: 0, lineHeight: 1.2, whiteSpace: 'pre-line', textTransform: 'uppercase' }}>
        {title}
      </p>
      <div style={{ width: 'min(5vw, 2.8vh)', height: 2, background: '#00b6ed', borderRadius: 2, flexShrink: 0 }} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'min(2.6vw, 1.46vh)', color: '#555', textAlign: 'center', margin: 0, lineHeight: 1.35 }}>
        {body}
      </p>
    </div>
  );
}

/* ── Pantalla principal ─────────────────────────────────────── */
export default function FallingBagsBenefitsScreen({ onDone }: Props) {
  const [slide,    setSlide]    = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min((Date.now() - start) / SLIDE_MS, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(tick);
        if (slide < SLIDES.length - 1) setSlide(s => s + 1);
        else onDone();
      }
    }, 40);
    return () => clearInterval(tick);
  }, [slide, onDone]);

  const current = SLIDES[slide];
  const isLast  = slide === SLIDES.length - 1;

  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: 'url(/assets/backgrounds/FondoJuego2.png)',
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 'min(3vw, 1.7vh) 0',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,182,237,0.38)', pointerEvents: 'none' }} />

      {/* Tarjeta blanca */}
      <motion.div
        key={slide}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        style={{
          position: 'relative', zIndex: 1,
          background: 'white',
          borderRadius: 'min(5.5vw, 3.1vh)',
          width: '88%',
          padding: 'min(3.5vw, 1.97vh) min(4.5vw, 2.5vh) min(3vw, 1.7vh)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 'min(2.2vw, 1.24vh)',
          boxShadow: '0 8px 40px rgba(0,87,122,0.22)',
          overflow: 'hidden',
        }}
      >
        {/* Barra de progreso */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, background: 'rgba(0,182,237,0.15)' }}>
          <div style={{ height: '100%', background: '#00b6ed', width: `${progress * 100}%`, transition: 'width 0.04s linear', borderRadius: '0 4px 4px 0' }} />
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', marginTop: 'min(1vw, 0.55vh)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(2.5vw, 1.4vh)' }}>
            <div style={{ display: 'flex', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 18, height: 5, background: '#fcd116', borderRadius: 3, transform: 'rotate(-20deg)' }} />
              <span style={{ display: 'inline-block', width: 10, height: 5, background: '#fcd116', borderRadius: 3, transform: 'rotate(-20deg)' }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'min(7vw, 3.94vh)', color: '#00577a', lineHeight: 1, textTransform: 'uppercase' }}>Beneficios</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'min(7vw, 3.94vh)', color: '#00b6ed',  lineHeight: 1, textTransform: 'uppercase' }}>Nutrecat</div>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 10, height: 5, background: '#fcd116', borderRadius: 3, transform: 'rotate(20deg)' }} />
              <span style={{ display: 'inline-block', width: 18, height: 5, background: '#fcd116', borderRadius: 3, transform: 'rotate(20deg)' }} />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'min(2.8vw, 1.58vh)', color: '#aaa', margin: 'min(0.5vw, 0.28vh) 0 0', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            Se muestra automáticamente
          </p>
        </div>

        {/* Indicador de slide */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(1vw, 0.55vh)' }}>
          <div style={{ background: '#00b6ed', borderRadius: 99, padding: 'min(0.7vw, 0.4vh) min(3vw, 1.7vh)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.8vw, 2.14vh)', color: 'white' }}>{slide + 1}/3</span>
          </div>
          <div style={{ display: 'flex', gap: 'min(1.5vw, 0.85vh)' }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                width: 'min(2.8vw, 1.58vh)', height: 'min(2.8vw, 1.58vh)', borderRadius: '50%',
                background: i === slide ? '#00b6ed' : 'rgba(0,182,237,0.25)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Beneficios + producto */}
        <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 'min(2.5vw, 1.4vh)' }}>
          <BenefitPanel icon={current.left.icon} title={current.left.title} body={current.left.body} />

          <motion.img
            key={current.product}
            src={current.product}
            alt=""
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ width: 'min(32vw, 18vh)', flexShrink: 0, objectFit: 'contain', filter: 'drop-shadow(0 8px 18px rgba(0,87,122,0.22))' }}
          />

          <BenefitPanel icon={current.right.icon} title={current.right.title} body={current.right.body} />
        </div>

        {/* Pill de auto-avance */}
        <div style={{
          background: 'rgba(0,182,237,0.1)', borderRadius: 99,
          padding: 'min(1.5vw, 0.85vh) min(4vw, 2.2vh)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 'min(1.5vw, 0.85vh)', width: '100%',
        }}>
          <span style={{ fontSize: 'min(4.5vw, 2.5vh)', color: '#00b6ed' }}>↺</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(2.8vw, 1.58vh)', color: '#00577a', textTransform: 'uppercase', textAlign: 'center' }}>
            {isLast ? 'Sigue automáticamente a las instrucciones' : 'Sigue automáticamente a la siguiente comida'}
          </span>
        </div>

        {/* Botón saltar */}
        <button
          onClick={onDone}
          style={{
            width: '100%', background: 'transparent',
            border: '2px solid rgba(0,87,122,0.35)', borderRadius: 99,
            padding: 'min(1.8vw, 1vh) min(4vw, 2.2vh)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'min(1.5vw, 0.85vh)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 'min(4vw, 2.25vh)', color: '#00577a' }}>👁</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(3.2vw, 1.8vh)', color: '#00577a', textTransform: 'uppercase' }}>
            {isLast ? 'Ya casi juegas' : 'Después verás las instrucciones'}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
