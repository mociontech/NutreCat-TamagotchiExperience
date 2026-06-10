import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Props { onDone: () => void; score?: number; }

// ─── Absolute-positioned layout matches Figma 356:274 (1080×1920 canvas) ────
// All percentage values: x = px/1080*100, y = px/1920*100

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

      {/* ── Puntos pill (top-right) ──────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '57.4%', top: '5.1%',
        width: '33.3%', height: '4.27%',
        background: 'white',
        borderRadius: 99,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(5vw, 2.8vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          lineHeight: 1,
          paddingTop: '0.18em',
        }}>
          PUNTOS: {score}
        </span>
      </div>

      {/* ── Card (bg #b0e8f9) ─────────────────────────────────────────── */}
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

        {/* ¿CÓMO SE JUEGA? — top of card */}
        <p style={{
          position: 'absolute',
          top: '9.3%', left: 0, right: 0,
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

        {/* ── Step 1 ────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 669) → within card: (144, 669-381)=(144,288) → %: (13.3%, 22.5%) */}
        <StepCircle n={1} cx="13.3%" cy="22.5%" />
        {/* Text @ canvas left:631px top:624px → within card: (631,624-381)=(631,243) → %(58.4%, 19%) */}
        <div style={{ position: 'absolute', left: '58.4%', top: '19%', width: '28.2%', zIndex: 1 }}>
          <StepText lines={[
            { text: 'LANZA EL BALÓN A LOS', color: '#00577a' },
            { text: 'PRODUCTOS', color: '#00b6ed' },
          ]} />
        </div>
        {/* Illustration 1 */}
        <img src="/assets/games/FG-Instruction1.png" alt="" style={{ position: 'absolute', left: '17%', top: '15%', width: '38%', height: '19%', objectFit: 'contain', zIndex: 1, pointerEvents: 'none' }} />

        {/* ── Divider 1 @ canvas top:846px → within card: 465px → 36.4% ── */}
        <Divider cy="36.4%" />

        {/* ── Step 2 ────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 921) → within card: (144, 540) → %(13.3%, 42.3%) */}
        <StepCircle n={2} cx="13.3%" cy="42.3%" />
        {/* Text */}
        <div style={{ position: 'absolute', left: '58.4%', top: '40.4%', width: '28.2%', zIndex: 1 }}>
          <StepText lines={[
            { text: 'SOLO TIENES', color: '#00577a' },
            { text: '3 INTENTOS', color: '#00b6ed' },
          ]} />
        </div>
        {/* Illustration 2 */}
        <img src="/assets/games/FG-Instruction2.png" alt="" style={{ position: 'absolute', left: '17%', top: '36.5%', width: '38%', height: '16%', objectFit: 'contain', zIndex: 1, pointerEvents: 'none' }} />

        {/* ── Divider 2 @ canvas top:1102px → within card: 721px → 56.4% ── */}
        <Divider cy="56.4%" />

        {/* ── Step 3 ────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 1167) → within card: (144, 786) → %(13.3%, 61.5%) */}
        <StepCircle n={3} cx="13.3%" cy="61.5%" />
        {/* Text */}
        <div style={{ position: 'absolute', left: '58.4%', top: '59.4%', width: '28.2%', zIndex: 1 }}>
          <StepText lines={[
            { text: 'DESLIZA CON EL DEDO Y', color: '#00577a' },
            { text: 'ATAJA', color: '#00b6ed' },
          ]} />
        </div>
        {/* Illustration 3 */}
        <img src="/assets/games/FG-Instruction3.png" alt="" style={{ position: 'absolute', left: '17%', top: '55%', width: '38%', height: '19%', objectFit: 'contain', zIndex: 1, pointerEvents: 'none' }} />

        {/* ── Divider 3 @ canvas top:1352px → within card: 971px → 76% ── */}
        <Divider cy="76%" />

        {/* ── Step 4 ────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 1428) → within card: (144, 1047) → %(13.3%, 81.9%) */}
        <StepCircle n={4} cx="13.3%" cy="81.9%" />
        {/* Text */}
        <div style={{ position: 'absolute', left: '58.4%', top: '80%', width: '28.2%', zIndex: 1 }}>
          <StepText lines={[
            { text: 'ATAJA LOS', color: '#00577a' },
            { text: 'TRES TIROS', color: '#00b6ed' },
          ]} />
        </div>
        {/* Illustration 4 */}
        <img src="/assets/games/FG-Instruction4.png" alt="" style={{ position: 'absolute', left: '17%', top: '76.5%', width: '38%', height: '16%', objectFit: 'contain', zIndex: 1, pointerEvents: 'none' }} />

      </motion.div>

      {/* ── ENTIENDO button ── canvas: centered, top 1719px = 89.5% ─── */}
      <motion.button
        onClick={handlePress}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          position: 'absolute',
          left: '9.07%', right: '9.07%',
          top: '89.5%',
          height: '4.27%',
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
          zIndex: 5,
          overflow: 'hidden',
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

function StepCircle({ n, cx, cy }: { n: number; cx: string; cy: string }) {
  // Circle is 87px at 1080px width = 8.06vw, but within the card (left 9.07%)
  // cx is % within the card, cy is % within the card height
  return (
    <div style={{
      position: 'absolute',
      left: cx,
      top: cy,
      width: 'min(8.06vw, 4.53vh)',
      height: 'min(8.06vw, 4.53vh)',
      transform: 'translate(-50%, -50%)',
      background: '#00b6ed',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0,182,237,0.45)',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'min(5vw, 2.8vh)',
        color: 'white',
        lineHeight: 1,
        paddingTop: '0.18em',
      }}>
        {n}
      </span>
    </div>
  );
}

function StepText({ lines }: { lines: { text: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
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
  );
}

function Divider({ cy }: { cy: string }) {
  // Figma node 356:319 — stroke #00B6ED, stroke-width 4px, full card width
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, top: cy,
      height: 4,
      background: '#00b6ed',
      transform: 'translateY(-50%)',
      zIndex: 1,
    }} />
  );
}
