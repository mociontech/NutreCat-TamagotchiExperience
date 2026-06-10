import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props { onDone: () => void; score?: number; }

// Card: top 19.84% / height 66.56% of 1920px canvas = 381px / 1278px
// Dividers at 36.4% / 56.4% / 76% within card
// Title occupies top 0 → ~17% of card

export default function FootballInstructionsScreen({ onDone, score = 0 }: Props) {
  const [refill, setRefill] = useState(false);

  const handlePress = () => {
    setRefill(true);
    setTimeout(() => { setRefill(false); onDone(); }, 360);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#00b6ed' }}>

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 5, pointerEvents: 'none' }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Puntos pill ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '57.4%', top: '5.1%',
        width: '33.3%', height: '4.27%',
        background: 'white', borderRadius: 99,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(5vw, 2.8vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1, paddingTop: '0.18em',
        }}>
          PUNTOS: {score}
        </span>
      </div>

      {/* ── Card ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: '19.84%', left: '9.07%', right: '9.07%', height: '66.56%',
          background: '#b0e8f9',
          borderRadius: 'min(3.4vw, 1.93vh)',
          overflow: 'hidden',
          zIndex: 3,
        }}
      >
        {/* ¿CÓMO SE JUEGA? */}
        <p style={{
          position: 'absolute',
          top: '5%', left: 0, right: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'min(8.24vw, 4.64vh)',
          color: '#00577a',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: 0.866,
          margin: 0, zIndex: 1,
        }}>
          ¿CÓMO SE JUEGA?
        </p>

        {/* ── Zonas de paso — cada una es un flex row centrado verticalmente ── */}
        {/* Zone 1: after title (~17%) → divider 1 (36.4%) */}
        <StepZone
          n={1} top="14%" bottom="63.6%"
          img="/assets/games/FG-Instruction1.png"
          lines={[
            { text: 'LANZA EL',    color: '#00577a' },
            { text: 'BALÓN A LOS', color: '#00577a' },
            { text: 'PRODUCTOS',   color: '#00b6ed' },
          ]}
        />

        <Divider cy="36.4%" />

        {/* Zone 2: divider 1 (36.4%) → divider 2 (56.4%) */}
        <StepZone
          n={2} top="36.4%" bottom="43.6%"
          img="/assets/games/FG-Instruction2.png"
          lines={[
            { text: 'SOLO TIENES', color: '#00577a' },
            { text: '3 INTENTOS',  color: '#00b6ed' },
          ]}
        />

        <Divider cy="56.4%" />

        {/* Zone 3: divider 2 (56.4%) → divider 3 (76%) */}
        <StepZone
          n={3} top="56.4%" bottom="24%"
          img="/assets/games/FG-Instruction3.png"
          lines={[
            { text: 'DESLIZA CON', color: '#00577a' },
            { text: 'EL DEDO Y',   color: '#00577a' },
            { text: 'ATAJA',       color: '#00b6ed' },
          ]}
        />

        <Divider cy="76%" />

        {/* Zone 4: divider 3 (76%) → card bottom (~97%) */}
        <StepZone
          n={4} top="76%" bottom="3%"
          img="/assets/games/FG-Instruction4.png"
          lines={[
            { text: 'ATAJA LOS',  color: '#00577a' },
            { text: 'TRES TIROS', color: '#00b6ed' },
          ]}
        />

      </motion.div>

      {/* ── ENTIENDO button ─────────────────────────────────────────── */}
      <motion.button
        onClick={handlePress}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          position: 'absolute',
          left: '9.07%', right: '9.07%',
          top: '89.5%', height: '4.27%',
          background: 'white', border: 'none',
          borderRadius: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(7.5vw, 4.22vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1, paddingTop: '0.18em',
          cursor: 'pointer',
          zIndex: 5, overflow: 'hidden',
        }}
      >
        <AnimatePresence>
          {refill && (
            <motion.span
              key="refill"
              initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ opacity: 0 }}
              transition={{ duration: 0.34, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,182,237,0.18)', borderRadius: 99, pointerEvents: 'none' }}
            />
          )}
        </AnimatePresence>
        ENTIENDO
      </motion.button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StepZone({ n, top, bottom, img, lines }: {
  n: number;
  top: string;
  bottom: string;
  img: string;
  lines: { text: string; color: string }[];
}) {
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, top, bottom,
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      padding: '0 4% 0 5%',
      gap: 'min(2.5vw, 1.4vh)',
      zIndex: 1,
    }}>
      {/* Número */}
      <div style={{
        flexShrink: 0,
        width: 'min(9.27vw, 5.21vh)',
        height: 'min(9.27vw, 5.21vh)',
        background: '#00b6ed',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(0,182,237,0.45)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(5.75vw, 3.22vh)',
          color: 'white',
          lineHeight: 1, paddingTop: '0.18em',
        }}>
          {n}
        </span>
      </div>

      {/* Imagen */}
      <img src={img} alt="" style={{
        flexShrink: 0,
        width: '38%',
        maxHeight: '88%',
        objectFit: 'contain',
        pointerEvents: 'none',
        marginLeft: 6,
      }} />

      {/* Texto */}
      <div style={{ flex: 1, paddingLeft: 11 }}>
        {lines.map((l, i) => (
          <span key={i} style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(5.56vw, 3.13vh)',
            color: l.color,
            textTransform: 'uppercase',
            letterSpacing: '0.028em',
            lineHeight: 0.94,
            display: 'block',
          }}>
            {l.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Divider({ cy }: { cy: string }) {
  // Figma node 356:319 — 624px wide on 887px card = 70.35%, centered
  return (
    <div style={{
      position: 'absolute',
      left: '18.49%', width: '70.35%', top: cy,
      height: 2,
      background: '#00b6ed',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      zIndex: 1,
    }} />
  );
}
