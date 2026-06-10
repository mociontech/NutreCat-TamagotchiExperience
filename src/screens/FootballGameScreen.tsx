import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

// ─── Config ────────────────────────────────────────────────────────────────────
const N_PENS     = 3;
const SHOOT_MS   = 750;
const BENEFITS_MS = 4500;
const RESULT_MS  = 1600;
const INTRO_MS   = 5000;
const PTS_GOAL   = 60;

// GK half-width as fraction of game area (min(20vw)/gameWidth ≈ 0.10 for 1080px totem)
const GK_HALF_W = 0.10;

type Outcome = boolean | null;
type Phase =
  | 'aim'
  | 'firing'
  | 'benefits'
  | 'rival_intro'
  | 'rival_fire'
  | 'rival_result'
  | 'gameover';

interface Props { onGoal: (pts: number, pScore: number, mScore: number) => void; }

const PRODUCTS = [
  {
    id: 0, src: '/assets/products/product-1.png', nx: 0.18,
    name: 'NutreCat con Leche Deslactosada',
    subtitle: 'Para gatitos con sensibilidad a la lactosa.',
    benefits: [
      'Favorece una mejor digestión.',
      'Con vitamina D, calcio y fósforo que apoyan el desarrollo de huesos y dientes fuertes.',
    ],
    badge: 'Sin colorantes y sin sabores artificiales.',
    cardBg: '#f4a875', textColor: '#d23d22', borderColor: '#d23d22',
  },
  {
    id: 1, src: '/assets/products/product-2.png', nx: 0.50,
    name: 'NutreCat con Salmón',
    subtitle: 'Digestión saludable y bienestar integral.',
    benefits: [
      'Ayuda a mantener una digestión equilibrada.',
      'Contiene ácidos grasos y omega 3, lo que contribuye a la salud cardiovascular.',
    ],
    badge: 'Sin colorantes y sin sabores artificiales.',
    cardBg: '#dbd672', textColor: '#606225', borderColor: '#606225',
  },
  {
    id: 2, src: '/assets/products/product-3.png', nx: 0.82,
    name: 'NutreCat con Tilapia',
    subtitle: 'Para gatos con sistema digestivo sensible.',
    benefits: [
      'Apoya la salud digestiva y la regeneración intestinal.',
      'Fortalece los músculos con el aporte de fósforo y potasio.',
    ],
    badge: 'Sin colorantes y sin sabores artificiales.',
    cardBg: '#debbe7', textColor: '#a049bb', borderColor: '#a049bb',
  },
] as const;

type Product = typeof PRODUCTS[number];

// ─── Penalty dots ───────────────────────────────────────────────────────────────
function PenaltyDots({ outcomes, reverse }: { outcomes: Outcome[]; reverse?: boolean }) {
  const dots = Array.from({ length: N_PENS }, (_, i) => outcomes[i] ?? null);
  const row  = reverse ? [...dots].reverse() : dots;
  return (
    <div style={{ display: 'flex', gap: 'min(1.6vw, 0.9vh)', alignItems: 'center' }}>
      {row.map((o, i) => (
        <div key={i} style={{
          width: 'min(4.5vw, 2.5vh)', height: 'min(4.5vw, 2.5vh)', borderRadius: '50%',
          background: o === null ? 'rgba(0,87,122,0.18)' : o ? '#22c55e' : '#ef4444',
          border: `2px solid ${o === null ? 'rgba(0,87,122,0.28)' : o ? '#4ade80' : '#f87171'}`,
          boxShadow: o === true ? '0 0 6px #22c55e80' : o === false ? '0 0 6px #ef444480' : 'none',
          transition: 'background 0.3s',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function FootballGameScreen({ onGoal }: Props) {
  const [phase,          setPhase]         = useState<Phase>('aim');
  const [round,          setRound]         = useState(0);
  const [pOuts,          setPOuts]         = useState<Outcome[]>(Array(N_PENS).fill(null));
  const [mOuts,          setMOuts]         = useState<Outcome[]>(Array(N_PENS).fill(null));
  const [totalPts,       setTotalPts]      = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [fireTarget,     setFireTarget]    = useState<{ x: number; y: number } | null>(null);
  const [rivalTarget,    setRivalTarget]   = useState<{ x: number; y: number } | null>(null);
  const [gkNX,           setGkNX]          = useState(0.5);
  const [hitProductIds,  setHitProductIds] = useState<number[]>([]);
  const [countdownVal,   setCountdownVal]  = useState(5);
  const [rivalGkNX,      setRivalGkNX]     = useState(0.5);
  const [gkDragActive,   setGkDragActive]  = useState(false);
  const isDragging = useRef(false);
  const [ballPx,         setBallPx]        = useState({ x: 0, y: 0 });
  const [ballHalfW,      setBallHalfW]     = useState(0);
  const [goalBounds,     setGoalBounds]    = useState({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });

  const gameAreaRef      = useRef<HTMLDivElement>(null);
  const goalDivRef       = useRef<HTMLDivElement>(null);
  const ballDivRef       = useRef<HTMLDivElement>(null);
  const gkNXRef          = useRef(0.5);
  const rivalTargetNxRef = useRef(0.5);
  useEffect(() => { gkNXRef.current = gkNX; }, [gkNX]);

  // ── Countdown 5→4→3→2→1 during rival_intro ──────────────────────
  useEffect(() => {
    if (phase !== 'rival_intro') return;
    setCountdownVal(5);
    const t1 = setTimeout(() => setCountdownVal(4), 1000);
    const t2 = setTimeout(() => setCountdownVal(3), 2000);
    const t3 = setTimeout(() => setCountdownVal(2), 3000);
    const t4 = setTimeout(() => setCountdownVal(1), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [phase]);

  // ── Gameover → navigate to results ───────────────────────────────
  useEffect(() => {
    if (phase !== 'gameover') return;
    const ps = pOuts.filter(x => x === true).length;
    const ms = mOuts.filter(x => x === true).length;
    const t = setTimeout(() => onGoal(totalPts, ps, ms), 700);
    return () => clearTimeout(t);
  }, [phase]); // eslint-disable-line

  // ── Measurements ─────────────────────────────────────────────────
  const measure = useCallback(() => {
    const ga = gameAreaRef.current;
    const gd = goalDivRef.current;
    const bd = ballDivRef.current;
    if (!ga || !gd || !bd) return;
    const gaR = ga.getBoundingClientRect();
    const gdR = gd.getBoundingClientRect();
    const bdR = bd.getBoundingClientRect();
    setBallPx({ x: bdR.left + bdR.width / 2 - gaR.left, y: bdR.top + bdR.height / 2 - gaR.top });
    setBallHalfW(bdR.width / 2);
    setGoalBounds({
      left: gdR.left - gaR.left, top: gdR.top - gaR.top,
      right: gdR.right - gaR.left, bottom: gdR.bottom - gaR.top,
      width: gdR.width, height: gdR.height,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  // ── Phase: firing → benefits ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'firing') return;
    const t = setTimeout(() => {
      setPOuts(prev => { const n = [...prev]; n[round] = true; return n; });
      setTotalPts(p => p + PTS_GOAL);
      if (selectedProduct) setHitProductIds(prev => [...prev, selectedProduct.id]);
      setPhase('benefits');
    }, SHOOT_MS + 100);
    return () => clearTimeout(t);
  }, [phase, round]); // eslint-disable-line

  // ── Phase: benefits → rival_intro ─────────────────────────────────
  useEffect(() => {
    if (phase !== 'benefits') return;
    const t = setTimeout(() => setPhase('rival_intro'), BENEFITS_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Phase: rival_intro → rival_fire ───────────────────────────────
  useEffect(() => {
    if (phase !== 'rival_intro') return;
    const ga = gameAreaRef.current;
    const gd = goalDivRef.current;
    const bd = ballDivRef.current;
    if (!ga || !gd || !bd) return;

    const gaR = ga.getBoundingClientRect();
    const gdR = gd.getBoundingClientRect();
    const bdR = bd.getBoundingClientRect();

    // Convert visual viewport px → local CSS px
    const sw = ga.offsetWidth  / gaR.width;
    const sh = ga.offsetHeight / gaR.height;

    const bx  = (bdR.left + bdR.width  / 2 - gaR.left) * sw;
    const by  = (bdR.top  + bdR.height / 2 - gaR.top)  * sh;
    const bhw = (bdR.width / 2) * sw;
    const gl  = (gdR.left - gaR.left) * sw;
    const gt  = (gdR.top  - gaR.top)  * sh;
    const gw  = gdR.width  * sw;
    const gh  = gdR.height * sh;

    setBallPx({ x: bx, y: by });
    setBallHalfW(bhw);
    setGkNX(0.5);  // start centered each rival turn — player controls with tap

    let rx: number, ry: number;
    if (round === 0) {
      rivalTargetNxRef.current = PRODUCTS[2].nx;   // shoots right
      rx = gl + PRODUCTS[2].nx * gw;
      ry = gt + gh * 0.32;
    } else if (round === 1) {
      rivalTargetNxRef.current = PRODUCTS[0].nx;   // shoots left
      rx = gl + PRODUCTS[0].nx * gw;
      ry = gt + gh * 0.32;
    } else {
      rivalTargetNxRef.current = PRODUCTS[1].nx;  // shoots center
      rx = gl + PRODUCTS[1].nx * gw;
      ry = gt + gh * 0.32;
    }
    setRivalTarget({ x: rx, y: ry });
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (round === 2) {
      // Fake-out: GK auto-drifts right so player must correct to center
      timers.push(setTimeout(() => setGkNX(0.84), 650));
    }
    timers.push(setTimeout(() => setPhase('rival_fire'), INTRO_MS));
    return () => timers.forEach(clearTimeout);
  }, [phase, round]); // eslint-disable-line

  // ── Phase: rival_fire → rival_result ──────────────────────────────
  useEffect(() => {
    if (phase !== 'rival_fire') return;
    const t = setTimeout(() => {
      const targetNx = rivalTargetNxRef.current;
      // Convert both to game-area fraction so comparison matches what's visible:
      //   goalDiv spans left:4%–right:4% → 92% of game area
      //   GK center in game area = 0.04 + (gkNX*0.84+0.02)*0.92 = 0.0584 + 0.7728*gkNX
      //   Ball center in game area = 0.04 + targetNx*0.92
      const ballGA = 0.04 + targetNx * 0.92;
      const gkGA   = 0.0584 + 0.7728 * gkNXRef.current;
      const scored = targetNx <= 1 && Math.abs(gkGA - ballGA) > GK_HALF_W + 0.03;
      setMOuts(prev => { const n = [...prev]; n[round] = scored; return n; });
      setPhase('rival_result');
    }, SHOOT_MS + 200);
    return () => clearTimeout(t);
  }, [phase, round]);

  // ── Phase: rival_result → next round or gameover ──────────────────
  useEffect(() => {
    if (phase !== 'rival_result') return;
    const t = setTimeout(() => {
      const next = round + 1;
      if (next >= N_PENS) {
        setPhase('gameover');
      } else {
        setRound(next);
        setSelectedProduct(null);
        setFireTarget(null);
        setRivalTarget(null);
        setGkNX(0.5);
        setRivalGkNX(0.5);
        setPhase('aim');
      }
    }, RESULT_MS);
    return () => clearTimeout(t);
  }, [phase, round]); // eslint-disable-line

  // ── Player taps a product ─────────────────────────────────────────
  // getBoundingClientRect gives visual (post-transform) px.
  // CSS left/top needs local CSS px. Convert with sw/sh = offsetSize / clientRect.
  const handleProductTap = useCallback((product: Product) => {
    if (phase !== 'aim') return;
    const ga = gameAreaRef.current;
    const gd = goalDivRef.current;
    const bd = ballDivRef.current;
    if (!ga || !gd || !bd) return;

    const gaR = ga.getBoundingClientRect();
    const gdR = gd.getBoundingClientRect();
    const bdR = bd.getBoundingClientRect();

    // Scale factors: convert visual viewport px → local CSS px
    const sw = ga.offsetWidth  / gaR.width;
    const sh = ga.offsetHeight / gaR.height;

    // Ball center & half-width in local CSS px
    const bx  = (bdR.left + bdR.width  / 2 - gaR.left) * sw;
    const by  = (bdR.top  + bdR.height / 2 - gaR.top)  * sh;
    const bhw = (bdR.width / 2) * sw;

    // Goal div bounds in local CSS px
    const gl  = (gdR.left - gaR.left) * sw;
    const gt  = (gdR.top  - gaR.top)  * sh;
    const gw  = gdR.width  * sw;
    const gh  = gdR.height * sh;

    setBallPx({ x: bx, y: by });
    setBallHalfW(bhw);
    setGoalBounds({ left: gl, top: gt, right: gl + gw, bottom: gt + gh, width: gw, height: gh });
    setFireTarget({ x: gl + product.nx * gw, y: gt + gh * 0.32 });
    setSelectedProduct(product);
    // Rival GK dives wrong side with randomness — guaranteed no visual overlap
    const goRight = product.nx < 0.4 ? true : product.nx > 0.6 ? false : Math.random() > 0.5;
    const base = goRight ? 0.66 : 0.06;
    let newRivalGkNX = Math.max(0.05, Math.min(0.93, base + Math.random() * 0.24));
    // Ensure GK is visually clear of ball (goalDiv coords: gkPos = gkNX*0.84+0.02)
    const gkInGoal = newRivalGkNX * 0.84 + 0.02;
    if (Math.abs(gkInGoal - product.nx) < 0.20) {
      const safeGoalNx = gkInGoal > product.nx ? product.nx + 0.22 : product.nx - 0.22;
      newRivalGkNX = Math.max(0.05, Math.min(0.93, (safeGoalNx - 0.02) / 0.84));
    }
    setRivalGkNX(newRivalGkNX);
    setPhase('firing');
  }, [phase]);

  // Player drags GK during rival turn
  const handleGkPointerDown = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (phase !== 'rival_intro' && phase !== 'rival_fire') return;
    isDragging.current = true;
    setGkDragActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, [phase]);

  const handleGkPointerMove = useCallback((e: React.PointerEvent<HTMLImageElement>) => {
    if (!isDragging.current) return;
    const ga = gameAreaRef.current;
    if (!ga) return;
    const gaR = ga.getBoundingClientRect();
    const nx = Math.max(0.04, Math.min(0.96, (e.clientX - gaR.left) / gaR.width));
    setGkNX(nx);
  }, []);

  const handleGkPointerEnd = useCallback(() => {
    isDragging.current = false;
    setGkDragActive(false);
  }, []);

  // ── Derived ───────────────────────────────────────────────────────
  const pScore       = pOuts.filter(x => x === true).length;
  const mScore       = mOuts.filter(x => x === true).length;
  const rivalScored  = mOuts[round] === true;
  const inPlayerPhases = phase === 'aim' || phase === 'firing' || phase === 'benefits';
  const inRivalPhases  = phase === 'rival_intro' || phase === 'rival_fire' || phase === 'rival_result';
  const ballHidden     = phase === 'firing' || phase === 'rival_fire';

  if (phase === 'gameover') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#00b6ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'min(8vw, 4.5vh)', color: 'white', textTransform: 'uppercase' }}
        >
          Cargando resultados…
        </motion.p>
      </div>
    );
  }

  return (
    <div ref={gameAreaRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#1a8f40' }}>

      {/* ── Background ──────────────────────────────────────────────── */}
      <img src="/assets/backgrounds/bg-football-field.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Logo ────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '2.66%', left: '32.7%', right: '32.78%', bottom: '83.45%', zIndex: 10, pointerEvents: 'none' }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Score pill ──────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '19.3%', left: 0, right: 0, height: 'min(9.5vw, 5.35vh)', zIndex: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '-8%', right: '-8%', top: 0, bottom: 0, background: 'white', borderRadius: 99, boxShadow: '0 4px 18px rgba(0,87,122,0.18)' }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', paddingLeft: 'min(5vw, 2.8vh)', paddingRight: 'min(5vw, 2.8vh)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'min(2vw, 1.1vh)' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', textTransform: 'uppercase', lineHeight: 1, paddingTop: '0.18em' }}>TÚ</span>
            <PenaltyDots outcomes={pOuts} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'min(2.5vw, 1.4vh)' }}>
            <motion.span key={`p${pScore}`} animate={{ scale: [1.35, 1] }} transition={{ duration: 0.22 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.5vw, 3.65vh)', color: '#00577a', lineHeight: 1, paddingTop: '0.18em' }}>
              {pScore}
            </motion.span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5vw, 2.8vh)', color: '#00577a', opacity: 0.35, lineHeight: 1 }}>-</span>
            <motion.span key={`m${mScore}`} animate={{ scale: [1.35, 1] }} transition={{ duration: 0.22 }}
              style={{ fontFamily: 'var(--font-display)', fontSize: 'min(6.5vw, 3.65vh)', color: '#00577a', lineHeight: 1, paddingTop: '0.18em' }}>
              {mScore}
            </motion.span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'min(2vw, 1.1vh)' }}>
            <PenaltyDots outcomes={mOuts} reverse />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', textTransform: 'uppercase', lineHeight: 1, paddingTop: '0.18em' }}>RIVAL</span>
          </div>
        </div>
      </div>

      {/* ── Goal area (measurement + products + GK) ─────────────────── */}
      <div
        ref={goalDivRef}
        style={{
          position: 'absolute',
          top: '27%', left: '4%', right: '4%', height: '32%',
          zIndex: 6, overflow: 'visible',
        }}
      >
        {/* Product targets — visible until hit, tappable only in aim */}
        <AnimatePresence>
          {PRODUCTS.filter(p => !hitProductIds.includes(p.id) && (phase === 'aim' || phase === 'firing' || phase === 'benefits')).map((p) => (
            <motion.button
              key={p.id}
              onClick={phase === 'aim' ? () => handleProductTap(p) : undefined}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{
                opacity: { duration: 0.3 },
                scale: { duration: 0.35, type: 'spring' },
                y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: p.id * 0.4 },
              }}
              style={{
                position: 'absolute',
                left: `calc(${p.nx * 100}% - min(6.5vw, 3.65vh))`,
                top: '22%',
                width: 'min(13vw, 7.3vh)',
                background: 'none', border: 'none', padding: 0,
                cursor: phase === 'aim' ? 'pointer' : 'default',
                pointerEvents: phase === 'aim' ? 'auto' : 'none',
                zIndex: 8,
              }}
            >
              <img src={p.src} alt={p.name}
                style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(255,255,255,0.7))' }} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Hit flash on selected product position */}
        <AnimatePresence>
          {phase === 'benefits' && fireTarget && (
            <motion.div
              key="hit-flash"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                left: fireTarget.x - goalBounds.left - 30,
                top: fireTarget.y - goalBounds.top - 30,
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(255,255,255,0.85)',
                pointerEvents: 'none', zIndex: 9,
              }}
            />
          )}
        </AnimatePresence>

        {/* GK rival (during player kick) — hue-rotated green, dives on shot */}
        {inPlayerPhases && (
          <motion.img
            src="/assets/cat/cat-goalkeeper.png" alt=""
            animate={{ left: `calc(${rivalGkNX * 84 + 2}% - min(10vw, 5.6vh))` }}
            transition={{ duration: phase === 'firing' ? 0.28 : 0.05, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 'calc(-8% + 200px)',
              width: 'min(20vw, 11.3vh)', objectFit: 'contain',
              filter: 'hue-rotate(95deg) saturate(1.8) brightness(1.05)',
              zIndex: 5, pointerEvents: 'none',
            }}
          />
        )}

        {/* GK player (during rival kick) — draggable */}
        {inRivalPhases && (
          <motion.img
            src="/assets/cat/cat-goalkeeper.png" alt=""
            animate={{ left: `calc(${gkNX * 84 + 2}% - min(10vw, 5.6vh))` }}
            transition={{ duration: gkDragActive ? 0 : (phase === 'rival_fire' ? 0.35 : 0.12), ease: 'easeOut' }}
            onPointerDown={handleGkPointerDown}
            onPointerMove={handleGkPointerMove}
            onPointerUp={handleGkPointerEnd}
            onPointerCancel={handleGkPointerEnd}
            style={{
              position: 'absolute',
              bottom: 'calc(-8% + 200px)',
              width: 'min(20vw, 11.3vh)', objectFit: 'contain',
              zIndex: 5,
              pointerEvents: (phase === 'rival_intro' || phase === 'rival_fire') ? 'auto' : 'none',
              touchAction: 'none',
              cursor: gkDragActive ? 'grabbing' : 'grab',
              filter: (phase === 'rival_intro' && !gkDragActive) ? 'drop-shadow(0 0 10px rgba(252,209,22,0.8))' : 'drop-shadow(0 6px 18px rgba(0,0,0,0.4))',
            }}
          />
        )}

        {/* Rival intro overlay — countdown, transparent background */}
        <AnimatePresence>
          {phase === 'rival_intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(1.5vw, 0.85vh)', zIndex: 10, pointerEvents: 'none' }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'min(7vw, 3.94vh)',
                color: 'white', textTransform: 'uppercase', textAlign: 'center', margin: 0,
                textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.7)',
              }}>
                ¡Ahora el rival!
              </p>
              <AnimatePresence mode="wait">
                <motion.span
                  key={countdownVal}
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: 'var(--font-display)', fontSize: 'min(22vw, 12.4vh)',
                    color: '#fcd116', lineHeight: 1,
                    textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 0 60px rgba(252,209,22,0.5)',
                  }}
                >
                  {countdownVal}
                </motion.span>
              </AnimatePresence>

              {/* Instruction pill — brand colors, breathing */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  marginTop: 'min(2vw, 1.1vh)',
                  background: 'rgba(0,87,122,0.92)',
                  borderRadius: 99,
                  padding: 'min(1.8vw, 1vh) min(5vw, 2.8vh)',
                  backdropFilter: 'blur(6px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(4.8vw, 2.7vh)',
                  color: 'white',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                }}>
                  ← ARRASTRA EL ARQUERO →
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rival result flash */}
        <AnimatePresence>
          {phase === 'rival_result' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: rivalScored ? 'rgba(239,68,68,0.38)' : 'rgba(34,197,94,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8 }}>
              <motion.p initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 'min(11vw, 6.2vh)', color: rivalScored ? '#f87171' : '#4ade80', textTransform: 'uppercase', margin: 0, textAlign: 'center', lineHeight: 1.05 }}>
                {rivalScored ? '¡GOL\nRIVAL!' : '¡ATAJADO!'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Player cat ──────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', left: '49.1%', top: '61.3%', width: '44.7%', zIndex: 6, pointerEvents: 'none' }}>
        <motion.img
          src="/assets/cat/cat-player.png" alt=""
          animate={phase === 'firing' ? { rotate: [0, 20], y: [0, -10] } : { y: [0, -6, 0] }}
          transition={phase === 'firing' ? { duration: 0.28 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))' }}
        />
      </div>

      {/* ── Static ball (hidden during flight) ──────────────────────── */}
      <div
        ref={ballDivRef}
        style={{
          position: 'absolute', left: '25.6%', top: '63.4%', width: '20%',
          zIndex: 7, pointerEvents: 'none',
          opacity: ballHidden ? 0 : 1,
          transition: 'opacity 0.08s',
        }}
      >
        <motion.img
          src="/assets/games/football-ball.svg" alt=""
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.45))' }}
        />
      </div>

      {/* ── Flying ball — player shot ────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'firing' && fireTarget && ballPx.x > 0 && (
          <motion.div
            key="firing-ball"
            style={{
              position: 'absolute',
              left: `${ballPx.x - ballHalfW}px`,
              top: `${ballPx.y - ballHalfW}px`,
              width: 'min(20vw, 11.3vh)',
              zIndex: 18, pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x: fireTarget.x - ballPx.x, y: fireTarget.y - ballPx.y, scale: 0.44, rotate: 720 }}
            transition={{ duration: SHOOT_MS / 1000, ease: [0.18, 0, 0.85, 1] }}
          >
            <img src="/assets/games/football-ball.svg" alt=""
              style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.55))' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Flying ball — rival shot ─────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'rival_fire' && rivalTarget && ballPx.x > 0 && (
          <motion.div
            key="rival-ball"
            style={{
              position: 'absolute',
              left: `${ballPx.x - ballHalfW}px`,
              top: `${ballPx.y - ballHalfW}px`,
              width: 'min(20vw, 11.3vh)',
              zIndex: 18, pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x: rivalTarget.x - ballPx.x, y: rivalTarget.y - ballPx.y, scale: 0.44, rotate: -720 }}
            transition={{ duration: SHOOT_MS / 1000, ease: [0.18, 0, 0.85, 1] }}
          >
            <img src="/assets/games/football-ball.svg" alt=""
              style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(239,68,68,0.5))' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Benefits popup ───────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'benefits' && selectedProduct && (
          <motion.div
            key="benefits-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 22,
              background: 'rgba(0,87,122,0.78)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: '21.1%',
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 28 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: -12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                position: 'relative',
                width: '86.9%',
                background: selectedProduct.cardBg,
                borderRadius: 'min(6.2vw, 3.5vh)',
                overflow: 'visible',
                boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
                padding: 'min(4.5vw, 2.5vh) min(5.5vw, 3.1vh) min(4.5vw, 2.5vh)',
                display: 'flex', flexDirection: 'column',
                gap: 'min(1.8vw, 1vh)',
              }}
            >
              {/* Dashed inner border */}
              <div style={{
                position: 'absolute', inset: 'min(1.5vw, 0.85vh)',
                border: `2px dashed ${selectedProduct.borderColor}`,
                borderRadius: 'min(4.5vw, 2.5vh)',
                pointerEvents: 'none', zIndex: 0,
              }} />

              {/* Product image — top-right, tilted, overflows card edge */}
              <motion.img
                src={selectedProduct.src}
                alt={selectedProduct.name}
                initial={{ opacity: 0, x: 30, rotate: 22 }}
                animate={{ opacity: 1, x: 0, rotate: 15.6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.18 }}
                style={{
                  position: 'absolute',
                  right: '-3%', top: '-9%',
                  width: '46%', objectFit: 'contain',
                  zIndex: 3, pointerEvents: 'none',
                  filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.28))',
                  transformOrigin: 'bottom center',
                }}
              />

              {/* Badge — top-left, tilted, overflows card edge */}
              <motion.div
                initial={{ opacity: 0, x: -18, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: -15.74 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.24 }}
                style={{
                  position: 'absolute',
                  left: '-1%', top: '-6%',
                  zIndex: 3,
                  background: selectedProduct.cardBg,
                  border: `3px solid ${selectedProduct.borderColor}`,
                  borderRadius: 'min(2.5vw, 1.4vh)',
                  padding: 'min(1.5vw, 0.85vh) min(2.5vw, 1.4vh)',
                  maxWidth: '37%',
                  transformOrigin: 'center center',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(3.2vw, 1.8vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  lineHeight: 1.1, margin: 0,
                  letterSpacing: '0.04em',
                }}>
                  {selectedProduct.badge}
                </p>
              </motion.div>

              {/* ¡GOOOL! */}
              <motion.p
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
                style={{
                  position: 'relative', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(18vw, 10.1vh)',
                  color: 'white',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  lineHeight: 0.9, margin: 0,
                  textShadow: '0 4px 30px rgba(0,0,0,0.18)',
                }}
              >
                ¡GOOOL!
              </motion.p>

              {/* Product name */}
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  position: 'relative', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(9.6vw, 5.4vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 0.91, margin: 0,
                  width: '57%',
                }}
              >
                {selectedProduct.name}
              </motion.p>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: 'relative', zIndex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'min(5.2vw, 2.9vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  lineHeight: 1.25, margin: 0,
                  width: '65%',
                }}
              >
                {selectedProduct.subtitle}
              </motion.p>

              {/* Divider */}
              <div style={{
                position: 'relative', zIndex: 1,
                height: 2, width: '57%',
                background: selectedProduct.borderColor,
                opacity: 0.4, borderRadius: 2,
              }} />

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'min(2.5vw, 1.4vh)', width: '65%' }}
              >
                {selectedProduct.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'min(2.5vw, 1.4vh)', alignItems: 'flex-start' }}>
                    <div style={{
                      width: 'min(3.5vw, 1.96vh)', height: 'min(3.5vw, 1.96vh)',
                      borderRadius: '50%', background: selectedProduct.borderColor,
                      flexShrink: 0, marginTop: 'min(0.7vw, 0.4vh)',
                    }} />
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'min(4.2vw, 2.34vh)',
                      color: selectedProduct.textColor,
                      textTransform: 'uppercase',
                      lineHeight: 1.3, margin: 0,
                    }}>
                      {b}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* +60 PUNTOS */}
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.33, type: 'spring', stiffness: 260 }}
                style={{
                  position: 'relative', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(10.4vw, 5.8vh)',
                  color: 'white',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1,
                  margin: 'min(1.5vw, 0.85vh) 0 0',
                  textShadow: '0 2px 20px rgba(0,0,0,0.18)',
                }}
              >
                +{PTS_GOAL} PUNTOS
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Instruction popup ────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {(phase === 'aim' || phase === 'firing' || phase === 'rival_fire' || phase === 'rival_result') && (
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22 }}
            style={{ position: 'absolute', left: '9.4%', width: '81.3%', bottom: '2.6%', zIndex: 15 }}
          >
            <div style={{
              background: 'white', borderRadius: 99,
              height: 'min(8.5vw, 4.8vh)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,87,122,0.22)',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(4.2vw, 2.36vh)',
                color: phase === 'rival_result'
                  ? (rivalScored ? '#ef4444' : '#22c55e')
                  : '#00577a',
                textTransform: 'uppercase',
                lineHeight: 1, paddingTop: '0.18em',
                textAlign: 'center',
              }}>
                {phase === 'aim'          && 'TOCA UN PAQUETE PARA TIRAR'}
                {phase === 'firing'       && '¡DISPARO!'}
                {phase === 'rival_fire'   && '¡ATAJA! ← ARRASTRA EL ARQUERO →'}
                {phase === 'rival_result' && (rivalScored ? '¡GOL DEL RIVAL!' : '¡ATAJADO!')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
