import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ASSETS } from '../../../config/assets';

interface Props { onDone: () => void; score?: number; }

const A = {
  deadCreature: ASSETS.catchInstructions.deadCreature,
  mouse:        ASSETS.catchInstructions.mouse,
};

// ─── Absolute-positioned layout matches Figma 346:162 (1080×1920 canvas) ────
// Same card & button positions as PenaltyInstructionsScreen.
// All % values: x = px/1080*100  (or within-card: (px-98)/887*100)
//               y = px/1920*100  (or within-card: (px-381)/1278*100)

export default function CatchInstructionsScreen({ onDone, score = 0 }: Props) {
  const [refill, setRefill] = useState(false);

  const handlePress = () => {
    setRefill(true);
    setTimeout(() => { setRefill(false); onDone(); }, 360);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#00b6ed' }}>

      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '4.79%', left: '9.07%', right: '62.31%', bottom: '83.7%', zIndex: 5, pointerEvents: 'none' }}>
        <img src={ASSETS.ui.logo} alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Puntos pill ──────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: '57.4%', top: '5.1%',
        width: 'min(33.3vw, 18.75vh)',
        height: 'min(7.6vw, 4.27vh)',
        background: 'white',
        borderRadius: 'min(3.8vw, 2.14vh)',
        boxShadow: '0 2px 14px rgba(0,87,122,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.57vw, 3.7vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          lineHeight: 1, paddingTop: '0.25em',
        }}>
          PUNTOS: {score}
        </span>
      </div>

      {/* ── Card (#b0e8f9) ───────────────────────────────────────────── */}
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
          top: '6.17%', left: 0, right: 0,
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

        {/* ── Step 1 ─────────────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 669) → within card (144, 288) → 13.3%, 22.5% */}
        <StepCircle n={1} cx="9.91%" cy="24.46%" />
        <div style={{ position: 'absolute', left: '58.4%', top: '19%', width: '33%', zIndex: 1 }}>
          <BagsStepText
            main={{ text: 'TOCAS LAS BOLSAS', color: '#00577a' }}
            sub={{ text: '+10 PUNTOS', color: '#a049bb' }}
            extra={{ text: '-5 SI CAE AL SUELO', color: '#d23d22' }}
          />
        </div>
        {/* Illustration — 3 product bags scattered / rotated */}
        {/* Relative container covers the illustration zone within the card */}
        <div style={{ position: 'absolute', left: '17%', top: '13%', width: '38%', height: '19%', zIndex: 1 }}>
          {/* leche — left, small, +7.02° */}
          <img src={ASSETS.products.treats} alt="" style={{
            position: 'absolute', left: '10%', top: '15%',
            height: '41.31%', width: 'auto', objectFit: 'contain',
            transform: 'rotate(7.02deg)', transformOrigin: 'center center',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.22))', pointerEvents: 'none',
          }} />
          {/* salmon — center, larger, +38.14° */}
          <img src={ASSETS.products.dry} alt="" style={{
            position: 'absolute', left: '36.88%', top: '40.56%',
            height: '70%', width: 'auto', objectFit: 'contain',
            transform: 'rotate(38.14deg)', transformOrigin: 'center center',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.22))', pointerEvents: 'none',
          }} />
          {/* tilapia — right, small, -38.09° */}
          <img src={ASSETS.products.wet} alt="" style={{
            position: 'absolute', right: '5%', top: '18%',
            height: '31.2%', width: 'auto', objectFit: 'contain',
            transform: 'rotate(-38.09deg)', transformOrigin: 'center center',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.22))', pointerEvents: 'none',
          }} />
        </div>

        {/* ── Divider 1 @ canvas 846px → within card 465px → 36.4% ── */}
        <Divider cy="36.4%" />

        {/* ── Step 2 ─────────────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 921) → within card (144, 540) → 13.3%, 42.3% */}
        <StepCircle n={2} cx="9.91%" cy="46.4%" />
        <div style={{ position: 'absolute', left: '58.4%', top: '40.4%', width: '33%', zIndex: 1 }}>
          <BagsStepText
            main={{ text: 'EVITA LA ESPINA', color: '#00577a' }}
            sub={{ text: '-10 PUNTOS', color: '#a049bb' }}
          />
        </div>
        {/* imgMuerto1 @ canvas left:307 top:909 w:262 h:141 → within card: 23.6%, 41.2%, 29.5% wide */}
        <img src={A.deadCreature} alt="" style={{
          position: 'absolute',
          left: '23.6%', top: '46.4%',
          width: '29.5%', height: 'auto',
          objectFit: 'contain',
          transform: 'translateY(-50%)',
          zIndex: 1, pointerEvents: 'none',
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.18))',
        }} />

        {/* ── Divider 2 @ canvas 1102px → within card 721px → 56.4% ── */}
        <Divider cy="56.4%" />

        {/* ── Step 3 ─────────────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 1167) → within card (144, 786) → 13.3%, 61.5% */}
        <StepCircle n={3} cx="9.91%" cy="66.2%" />
        <div style={{ position: 'absolute', left: '58.4%', top: '59.4%', width: '33%', zIndex: 1 }}>
          <BagsStepText
            main={{ text: 'ATRAPA EL RATÓN', color: '#00577a' }}
            sub={{ text: 'x2 POR 5 SEG', color: '#a049bb' }}
          />
        </div>
        {/* imgRaton1 @ canvas left:307 top:1125 w:262 h:182 → within card: 23.6%, 58.1%, 29.5% wide */}
        <img src={A.mouse} alt="" style={{
          position: 'absolute',
          left: '23.6%', top: '66.2%',
          width: '29.5%', height: 'auto',
          objectFit: 'contain',
          transform: 'translateY(-50%)',
          zIndex: 1, pointerEvents: 'none',
          filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.55))',
        }} />

        {/* ── Divider 3 @ canvas 1352px → within card 971px → 76% ── */}
        <Divider cy="76%" />

        {/* ── Step 4 ─────────────────────────────────────────────────── */}
        {/* Circle @ canvas (144, 1443) → within card (144, 1062) → 13.3%, 83.1% */}
        <StepCircle n={4} cx="9.91%" cy="88%" />
        <div style={{ position: 'absolute', left: '58.4%', top: '80%', width: '33%', zIndex: 1 }}>
          <BagsStepText
            main={{ text: 'HAZ COMBO', color: '#00577a' }}
            sub={{ text: '3 SEGUIDOS =', color: '#a049bb' }}
            sub2={{ text: 'MÁS PUNTOS', color: '#a049bb' }}
          />
        </div>
        {/* 3 products side by side — canvas left ~291–521px, top ~1402px */}
        {/* Within card: left ~21.8% top ~79.9%, each bag ~8% wide */}
        <div style={{ position: 'absolute', left: '20.26%', top: '80.07%', width: '37%', height: '12.1%', zIndex: 1 }}>
          <img src={ASSETS.products.treats} alt="" style={{
            position: 'absolute', left: '11%', top: '6.47%',
            height: '100%', width: 'auto', objectFit: 'contain',
            transform: 'rotate(-14.36deg)', transformOrigin: 'bottom center',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))', pointerEvents: 'none',
            zIndex: 1,
          }} />
          <img src={ASSETS.products.dry} alt="" style={{
            position: 'absolute', left: '25.10%', top: 0,
            height: '115%', width: 'auto', objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))', pointerEvents: 'none',
            zIndex: 2,
          }} />
          <img src={ASSETS.products.wet} alt="" style={{
            position: 'absolute', left: '49%', top: '6.47%',
            height: '100%', width: 'auto', objectFit: 'contain',
            transform: 'rotate(8.21deg)', transformOrigin: 'bottom center',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))', pointerEvents: 'none',
            zIndex: 1,
          }} />
        </div>

      </motion.div>

      {/* ── ENTIENDO button ── canvas top:1719px → 89.5% ─────────────── */}
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
          lineHeight: 1, paddingTop: '0.269em',
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
        <span style={{ transform: 'translateY(-5px)' }}>
          ENTIENDO
        </span>
      </motion.button>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StepCircle({ n, cx, cy }: { n: number; cx: string; cy: string }) {
  return (
    <div style={{
      position: 'absolute', left: cx, top: cy,
      width: 'min(8.06vw, 4.53vh)', height: 'min(8.06vw, 4.53vh)',
      transform: 'translate(-50%, -50%)',
      background: '#00b6ed', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2,
      boxShadow: '0 4px 14px rgba(0,182,237,0.45)',
    }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'min(6.33vw, 3.54vh)',
        color: 'white', lineHeight: 1, paddingTop: '0.18em',
      }}>
        {n}
      </span>
    </div>
  );
}

function BagsStepText({
  main, sub, sub2, extra,
}: {
  main:  { text: string; color: string };
  sub:   { text: string; color: string };
  sub2?: { text: string; color: string };
  extra?: { text: string; color: string };
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'min(5.56vw, 3.13vh)',
        color: main.color,
        textTransform: 'uppercase',
        letterSpacing: '0.028em',
        lineHeight: 0.94,
        display: 'block',
      }}>
        {main.text}
      </span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'min(4.63vw, 2.6vh)',
        color: sub.color,
        textTransform: 'uppercase',
        letterSpacing: '0.028em',
        lineHeight: 0.94,
        display: 'block',
        marginTop: '0.15em',
      }}>
        {sub.text}
      </span>
      {sub2 && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(4.63vw, 2.6vh)',
          color: sub2.color,
          textTransform: 'uppercase',
          letterSpacing: '0.028em',
          lineHeight: 0.94,
          display: 'block',
        }}>
          {sub2.text}
        </span>
      )}
      {extra && (
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'min(3.06vw, 1.72vh)',
          color: extra.color,
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          display: 'block',
          marginTop: '0.2em',
          fontWeight: 700,
        }}>
          {extra.text}
        </span>
      )}
    </div>
  );
}

function Divider({ cy }: { cy: string }) {
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
