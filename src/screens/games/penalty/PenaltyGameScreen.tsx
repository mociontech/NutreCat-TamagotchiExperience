import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { ASSETS } from '../../../config/assets';

// ─── Config ────────────────────────────────────────────────────────────────────
const N_PENS     = 3;
const SHOOT_MS   = 750;
const PLAYER_KICK_IMPACT_MS = 3000;
const RIVAL_GK_DIVE_LEAD_MS = 500;
const RIVAL_KICK_IMPACT_MS = 1333;
const PLAYER_KICK_APPROACH_Y = -80;
const RESULT_MS  = 1600;
const INTRO_MS   = 5000;
const PTS_GOAL   = 60;
const BENEFIT_ICON_SIZE = 'min(5.5vw, 3.1vh)';

// GK half-width as fraction of game area (min(20vw)/gameWidth ≈ 0.10 for 1080px totem)
const GK_HALF_W = 0.10;

function playVideo(video: HTMLVideoElement | null, restart = false) {
  if (!video) return;
  try {
    if (restart) video.currentTime = 0;
    video.play().catch(() => {});
  } catch {
    // Video playback can be rejected while the browser is warming assets.
  }
}

function pauseVideo(video: HTMLVideoElement | null, reset = false) {
  if (!video) return;
  try {
    video.pause();
    if (reset) video.currentTime = 0;
  } catch {
    // Ignore media state errors.
  }
}

function loadVideo(video: HTMLVideoElement | null) {
  if (!video) return;
  try {
    video.load();
  } catch {
    // Ignore preload errors.
  }
}

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
    id: 0, src: ASSETS.products.treats, nx: 0.18,
    name: 'NutreCat\ncon Leche Deslactosada',
    subtitle: 'Para gatitos con sensibilidad a la lactosa.',
    benefits: [
      'Favorece una mejor digestión.',
      'Con vitamina D, calcio y fósforo\nque apoyan el desarrollo de\nhuesos y dientes fuertes.',
    ],
    benefitIcons: [ASSETS.benefitIcons.digestive, ASSETS.benefitIcons.bone],
    badge: 'Sin colorantes y sin\nsabores artificiales.',
    nameTop: '24.31%', subtitleTop: '45.73%',
    benefit1Top: '59.11%', dividerTop: '64.46%', benefit2Top: '68.99%',
    cardBg: '#f4a875', textColor: '#d23d22', borderColor: '#d23d22',
  },
  {
    id: 1, src: ASSETS.products.dry, nx: 0.50,
    name: 'NutreCat\ncon Salmón',
    subtitle: 'Digestión saludable y bienestar integral.',
    benefits: [
      'Ayuda a mantener una digestión equilibrada.',
      'Contiene ácidos grasos y omega 3 lo que contribuye a la salud cardiovascular.',
    ],
    benefitIcons: [ASSETS.benefitIcons.salmon1, ASSETS.benefitIcons.salmon2],
    badge: 'Sin colorantes y sin\nsabores artificiales.',
    nameTop: '27.14%', subtitleTop: '42.16%',
    benefit1Top: '53.91%', dividerTop: '64.2%', benefit2Top: '66.02%',
    cardBg: '#dbd672', textColor: '#606225', borderColor: '#606225',
  },
  {
    id: 2, src: ASSETS.products.wet, nx: 0.82,
    name: 'NutreCat\ncon Tilapia',
    subtitle: 'Para gatos con sistema digestivo sensible.',
    benefits: [
      'Apoya la salud digestiva y la regeneración intestinal.',
      'Fortalece los músculos con el aporte de fósforo y potasio.',
    ],
    benefitIcons: [ASSETS.benefitIcons.tilapiaDigestive, ASSETS.benefitIcons.tilapia2],
    badge: 'Sin colorantes y sin\nsabores artificiales.',
    nameTop: '27.14%', subtitleTop: '42.16%',
    benefit1Top: '53.91%', dividerTop: '64.2%', benefit2Top: '66.02%',
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
          background: o === null ? '#D9D9D9' : o ? '#22c55e' : '#ef4444',
          boxShadow: o === true ? '0 0 6px #22c55e80' : o === false ? '0 0 6px #ef444480' : 'none',
          transition: 'background 0.3s',
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function PenaltyGameScreen({ onGoal }: Props) {
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
  const [showConfetti,   setShowConfetti]  = useState(false);
  const [rivalDiving,    setRivalDiving]   = useState(false);
  const [rivalDiveDir,   setRivalDiveDir]  = useState<'left' | 'right' | 'center' | null>(null);
  const [playerKicking,  setPlayerKicking] = useState(false);
  const [rivalKicking,   setRivalKicking]  = useState(false);
  const [playerGkJumping, setPlayerGkJumping] = useState(false);
  const isDragging = useRef(false);
  const [ballPx,         setBallPx]        = useState({ x: 0, y: 0 });
  const [ballHalfW,      setBallHalfW]     = useState(0);
  const [goalBounds,     setGoalBounds]    = useState({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 });

  const gameAreaRef      = useRef<HTMLDivElement>(null);
  const goalDivRef       = useRef<HTMLDivElement>(null);
  const ballDivRef       = useRef<HTMLDivElement>(null);
  const gkNXRef          = useRef(0.5);
  const rivalTargetNxRef = useRef(0.5);
  const rivalIdleRef       = useRef<HTMLVideoElement>(null);
  const rivalDiveLeftRef   = useRef<HTMLVideoElement>(null);
  const rivalDiveRightRef  = useRef<HTMLVideoElement>(null);
  const rivalDiveCenterRef = useRef<HTMLVideoElement>(null);
  const playerBackRef      = useRef<HTMLVideoElement>(null);
  const playerKickRef      = useRef<HTMLVideoElement>(null);
  const rivalCatIdleRef    = useRef<HTMLVideoElement>(null);
  const rivalKickRef       = useRef<HTMLVideoElement>(null);
  const playerGkIdleRef    = useRef<HTMLVideoElement>(null);
  const playerGkJumpRef    = useRef<HTMLVideoElement>(null);
  useEffect(() => { gkNXRef.current = gkNX; }, [gkNX]);
  const inPlayerPhases = phase === 'aim' || phase === 'firing' || phase === 'benefits';
  const inRivalPhases  = phase === 'rival_intro' || phase === 'rival_fire' || phase === 'rival_result';

  useEffect(() => {
    [
      rivalIdleRef.current,
      rivalDiveLeftRef.current,
      rivalDiveRightRef.current,
      rivalDiveCenterRef.current,
      playerKickRef.current,
      rivalKickRef.current,
      playerGkJumpRef.current,
    ].forEach(loadVideo);
  }, []);

  useEffect(() => {
    if (playerKicking) {
      pauseVideo(playerBackRef.current);
      playVideo(playerKickRef.current, true);
      return;
    }
    pauseVideo(playerKickRef.current, true);
    if (inPlayerPhases) playVideo(playerBackRef.current);
  }, [playerKicking, inPlayerPhases]);

  useEffect(() => {
    if (phase !== 'aim') return;
    setRivalDiving(false);
    setRivalDiveDir(null);
  }, [phase]);

  useEffect(() => {
    if (!inPlayerPhases) {
      pauseVideo(rivalIdleRef.current, true);
      pauseVideo(rivalDiveLeftRef.current, true);
      pauseVideo(rivalDiveRightRef.current, true);
      pauseVideo(rivalDiveCenterRef.current, true);
      return;
    }

    const activeDive =
      rivalDiveDir === 'left' ? rivalDiveLeftRef.current :
      rivalDiveDir === 'right' ? rivalDiveRightRef.current :
      rivalDiveDir === 'center' ? rivalDiveCenterRef.current :
      null;

    if (rivalDiving && activeDive) {
      pauseVideo(rivalIdleRef.current);
      [rivalDiveLeftRef.current, rivalDiveRightRef.current, rivalDiveCenterRef.current]
        .filter(video => video !== activeDive)
        .forEach(video => pauseVideo(video, true));
      playVideo(activeDive, true);
    } else {
      [rivalDiveLeftRef.current, rivalDiveRightRef.current, rivalDiveCenterRef.current]
        .forEach(video => pauseVideo(video, true));
      playVideo(rivalIdleRef.current);
    }
  }, [inPlayerPhases, rivalDiving, rivalDiveDir]);

  useEffect(() => {
    if (rivalKicking) {
      pauseVideo(rivalCatIdleRef.current);
      playVideo(rivalKickRef.current, true);
      return;
    }
    pauseVideo(rivalKickRef.current, true);
    if (inRivalPhases) playVideo(rivalCatIdleRef.current);
  }, [rivalKicking, inRivalPhases]);

  useEffect(() => {
    if (playerGkJumping) {
      pauseVideo(playerGkIdleRef.current);
      playVideo(playerGkJumpRef.current, true);
      return;
    }
    pauseVideo(playerGkJumpRef.current, true);
    if (inRivalPhases) playVideo(playerGkIdleRef.current);
  }, [playerGkJumping, inRivalPhases]);

  useEffect(() => {
    if (phase === 'rival_intro' || phase === 'rival_result' || phase === 'aim') {
      setPlayerGkJumping(false);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      [
        rivalIdleRef.current,
        rivalDiveLeftRef.current,
        rivalDiveRightRef.current,
        rivalDiveCenterRef.current,
        playerBackRef.current,
        playerKickRef.current,
        rivalCatIdleRef.current,
        rivalKickRef.current,
        playerGkIdleRef.current,
        playerGkJumpRef.current,
      ].forEach(video => pauseVideo(video, true));
    };
  }, []);



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
      setPlayerKicking(false);
      setPhase('benefits');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2600);
    }, SHOOT_MS + 100);
    return () => clearTimeout(t);
  }, [phase, round]); // eslint-disable-line

  // ── Phase: benefits → rival_intro (desactivado mientras se ajusta diseño) ──
  useEffect(() => {
    if (phase !== 'benefits') return;
    const t = setTimeout(() => setPhase('rival_intro'), 10000);
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
    timers.push(setTimeout(() => {
      setRivalKicking(true);
      setPlayerGkJumping(true);
      setTimeout(() => setPhase('rival_fire'), RIVAL_KICK_IMPACT_MS);
    }, INTRO_MS));
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
      setRivalKicking(false);
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
        setRivalKicking(false);
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
    if (phase !== 'aim' || playerKicking) return;
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
    setPlayerKicking(true);
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
    // Dirección del salto
    const dir: 'left' | 'right' | 'center' =
      newRivalGkNX < 0.45 ? 'left' : newRivalGkNX > 0.55 ? 'right' : 'center';
    // Balón y portero arrancan juntos en el impacto del video del jugador.
    setTimeout(() => {
      setRivalDiveDir(dir);
      setRivalDiving(true);
      setRivalGkNX(newRivalGkNX);
    }, Math.max(0, PLAYER_KICK_IMPACT_MS - RIVAL_GK_DIVE_LEAD_MS));
    setTimeout(() => {
      setPhase('firing');
    }, PLAYER_KICK_IMPACT_MS);
  }, [phase, playerKicking]);

  // Player drags GK during rival turn
  const handleGkPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'rival_intro' && phase !== 'rival_fire') return;
    isDragging.current = true;
    setGkDragActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  }, [phase]);

  const handleGkPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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

      {showConfetti && <Confetti />}

      {/* ── Background ──────────────────────────────────────────────── */}
      <img src={ASSETS.backgrounds.footballField} alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Logo ────────────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '2.66%', left: '32.7%', right: '32.78%', bottom: '83.45%', zIndex: 10, pointerEvents: 'none' }}>
        <img src={ASSETS.ui.logo} alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* ── Score pill ──────────────────────────────────────────────── */}
      <div style={{ position: 'absolute', top: '19.3%', left: 0, right: 0, height: 'min(9.5vw, 5.35vh)', zIndex: 10, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '-8%', right: '-8%', top: 0, bottom: 0, background: 'white', borderRadius: 99, boxShadow: '0 4px 18px rgba(0,87,122,0.18)' }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', paddingLeft: 'min(5vw, 2.8vh)', paddingRight: 'min(5vw, 2.8vh)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', textTransform: 'uppercase', lineHeight: 1, paddingTop: '0.18em' }}>TÚ</span>
          <PenaltyDots outcomes={pOuts} />
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
          <PenaltyDots outcomes={mOuts} reverse />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'min(5.5vw, 3.1vh)', color: '#00577a', textTransform: 'uppercase', lineHeight: 1, paddingTop: '0.18em' }}>RIVAL</span>
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
          {(phase === 'aim' || phase === 'firing' || phase === 'benefits') && PRODUCTS.map((p) => {
            const isHit = hitProductIds.includes(p.id);
            return (
            <motion.button
              key={p.id}
              onClick={phase === 'aim' && !isHit ? () => handleProductTap(p) : undefined}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: isHit ? 0.35 : 1, scale: 1, y: [0, -10, 0] }}
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
                cursor: phase === 'aim' && !isHit ? 'pointer' : 'default',
                pointerEvents: phase === 'aim' && !isHit ? 'auto' : 'none',
                zIndex: 8,
              }}
            >
              <img src={p.src} alt={p.name}
                style={{ width: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 14px rgba(255,255,255,0.7))' }} />
            </motion.button>
            );
          })}
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

        {/* GK rival (during player kick) */}
        {inPlayerPhases && (
          <motion.div
            animate={{ left: `calc(${rivalGkNX * 84 + 2}% - min(10vw, 5.6vh))` }}
            transition={{ duration: rivalDiving ? 2 : 0.05, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              bottom: 'calc(-8% - 10px)',
              width: 'min(35.88vw, 20.28vh)',
              zIndex: 9, pointerEvents: 'none',
            }}
          >
            {/* Idle loop */}
            <video
              ref={rivalIdleRef}
              src={ASSETS.catVideos.rivalKeeperIdle}
              loop muted playsInline preload="auto"
              style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
                opacity: rivalDiving ? 0 : 1, transition: 'opacity 0.1s' }}
            />
            {/* Salto izquierda */}
            <video ref={rivalDiveLeftRef}
              src={ASSETS.catVideos.rivalKeeperLeft}
              muted playsInline preload="auto"
              onEnded={() => { setRivalDiving(false); setRivalDiveDir(null); }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
                opacity: rivalDiveDir === 'left' ? 1 : 0, transition: 'opacity 0.1s' }}
            />
            {/* Salto derecha */}
            <video ref={rivalDiveRightRef}
              src={ASSETS.catVideos.rivalKeeperRight}
              muted playsInline preload="auto"
              onEnded={() => { setRivalDiving(false); setRivalDiveDir(null); }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
                opacity: rivalDiveDir === 'right' ? 1 : 0, transition: 'opacity 0.1s' }}
            />
            {/* Salto centro */}
            <video ref={rivalDiveCenterRef}
              src={ASSETS.catVideos.rivalKeeperCenter}
              muted playsInline preload="auto"
              onEnded={() => { setRivalDiving(false); setRivalDiveDir(null); }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: 'auto', objectFit: 'contain', display: 'block',
                opacity: rivalDiveDir === 'center' ? 1 : 0, transition: 'opacity 0.1s' }}
            />
          </motion.div>
        )}

        {/* GK player (during rival kick) — draggable */}
        {inRivalPhases && (
          <motion.div
            animate={{ left: `calc(${gkNX * 84 + 2}% - min(10vw, 5.6vh))` }}
            transition={{ duration: gkDragActive ? 0 : (phase === 'rival_fire' ? 0.35 : 0.12), ease: 'easeOut' }}
            onPointerDown={handleGkPointerDown}
            onPointerMove={handleGkPointerMove}
            onPointerUp={handleGkPointerEnd}
            onPointerCancel={handleGkPointerEnd}
            style={{
              position: 'absolute',
              bottom: 'calc(-8% + 105px)',
              width: 'min(23vw, 13vh)',
              zIndex: 9,
              pointerEvents: (phase === 'rival_intro' || phase === 'rival_fire') ? 'auto' : 'none',
              touchAction: 'none',
              cursor: gkDragActive ? 'grabbing' : 'grab',
              filter: (phase === 'rival_intro' && !gkDragActive) ? 'drop-shadow(0 0 10px rgba(252,209,22,0.8))' : 'drop-shadow(0 6px 18px rgba(0,0,0,0.4))',
            }}
          >
            <video
              ref={playerGkIdleRef}
              src={ASSETS.catVideos.playerKeeperIdle}
              loop
              muted
              playsInline
              preload="auto"
              style={{
                width: '100%',
                objectFit: 'contain',
                display: 'block',
                opacity: playerGkJumping ? 0 : 1,
                transition: 'opacity 0.08s',
                pointerEvents: 'none',
              }}
            />
            <video
              ref={playerGkJumpRef}
              src={ASSETS.catVideos.playerKeeperJumpCenter}
              muted
              playsInline
              preload="auto"
              onEnded={() => setPlayerGkJumping(false)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                objectFit: 'contain',
                display: 'block',
                opacity: playerGkJumping ? 1 : 0,
                transition: 'opacity 0.08s',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}

        {/* Rival intro overlay — countdown, transparent background */}
        <AnimatePresence>
          {phase === 'rival_intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(1.5vw, 0.85vh)', zIndex: 10, pointerEvents: 'none' }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'min(7vw, 3.94vh)',
                color: 'white', textTransform: 'uppercase', textAlign: 'center', margin: 0,
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
                    color: 'white', lineHeight: 1,
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

      </div>

      {/* ── Rival result flash — full screen vignette ───────────────── */}
      <AnimatePresence>
        {phase === 'rival_result' && (
          <motion.div
            key="rival-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none',
              background: rivalScored
                ? 'radial-gradient(ellipse at center, transparent 25%, rgba(220,38,38,0.55) 100%)'
                : 'radial-gradient(ellipse at center, transparent 25%, rgba(22,163,74,0.45) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.p
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(16vw, 9vh)',
                color: rivalScored ? '#fca5a5' : '#86efac',
                textTransform: 'uppercase',
                margin: 0, textAlign: 'center', lineHeight: 1.05,
                textShadow: rivalScored ? '0 0 40px rgba(220,38,38,0.8)' : '0 0 40px rgba(22,163,74,0.8)',
                whiteSpace: 'pre-line',
              }}
            >
              {rivalScored ? '¡GOL\nRIVAL!' : '¡ATAJADO!'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Player cat (shown during player phases) ─────────────────── */}
      {inPlayerPhases && (
        <motion.div
          animate={{ y: playerKicking ? PLAYER_KICK_APPROACH_Y : 0 }}
          transition={{ duration: PLAYER_KICK_IMPACT_MS / 1000, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: 'calc(5% + 90px)', top: 'calc(57.65% + 90px)', width: '51.14%', aspectRatio: '1 / 1', zIndex: 19, pointerEvents: 'none' }}
        >
          <video
            ref={playerBackRef}
            src={ASSETS.catVideos.playerBack}
            loop
            muted
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
              opacity: playerKicking ? 0 : 1,
              transition: 'opacity 0.08s',
            }}
          />
          <video
            ref={playerKickRef}
            src={ASSETS.catVideos.playerKick}
            muted
            playsInline
            preload="auto"
            onEnded={() => setPlayerKicking(false)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              transform: 'scale(1.1)',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
              opacity: playerKicking ? 1 : 0,
              transition: 'opacity 0.08s',
            }}
          />
        </motion.div>
      )}

      {/* ── Rival cat (shown during rival phases) ───────────────────── */}
      {inRivalPhases && (
        <div style={{ position: 'absolute', left: 'calc(5% + 100px)', top: 'calc(57.65% - 80px)', width: '39.34%', aspectRatio: '9 / 16', zIndex: 8, pointerEvents: 'none' }}>
          <video
            ref={rivalCatIdleRef}
            src={ASSETS.catVideos.rivalIdle}
            loop
            muted
            playsInline
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
              opacity: rivalKicking ? 0 : 1,
              transition: 'opacity 0.08s',
            }}
          />
          <video
            ref={rivalKickRef}
            src={ASSETS.catVideos.rivalKick}
            muted
            playsInline
            preload="auto"
            onEnded={() => setRivalKicking(false)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
              opacity: rivalKicking ? 1 : 0,
              transition: 'opacity 0.08s',
            }}
          />
        </div>
      )}

      {/* ── Static ball (hidden during flight) ──────────────────────── */}
      <div
        ref={ballDivRef}
        style={{
          position: 'absolute', left: '41.71%', top: '68.49%', width: '16%',
          zIndex: 7, pointerEvents: 'none',
          opacity: ballHidden ? 0 : 1,
          transition: 'opacity 0.08s',
        }}
      >
        <motion.img
          src={ASSETS.games.footballBall} alt=""
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
              width: 'min(16vw, 9.04vh)',
              zIndex: 18, pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x: fireTarget.x - ballPx.x, y: fireTarget.y - ballPx.y, scale: 0.44, rotate: 720 }}
            transition={{ duration: SHOOT_MS / 1000, ease: [0.18, 0, 0.85, 1] }}
          >
            <img src={ASSETS.games.footballBall} alt=""
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
              width: 'min(16vw, 9.04vh)',
              zIndex: 18, pointerEvents: 'none',
            }}
            initial={{ x: 0, y: 0, scale: 1, rotate: 0 }}
            animate={{ x: rivalTarget.x - ballPx.x, y: rivalTarget.y - ballPx.y, scale: 0.44, rotate: -720 }}
            transition={{ duration: SHOOT_MS / 1000, ease: [0.18, 0, 0.85, 1] }}
          >
            <img src={ASSETS.games.footballBall} alt=""
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
              background: 'linear-gradient(to bottom, transparent 13%, rgba(0,87,122,0.78) 24%)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 'calc(21.1% + 200px)',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'relative', width: '86.9%' }}>
              {/* TODO: quitar — botón temporal para ajuste de diseño */}
              <button
                onClick={() => setPhase('rival_intro')}
                style={{
                  display: 'none',
                  position: 'absolute', top: -18, right: -18, zIndex: 30,
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'white', border: '2px solid #00577a',
                  color: '#00577a', fontSize: 18, fontWeight: 700,
                  cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >✕</button>
<motion.div
              initial={{ scale: 0.88, y: 28 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: -12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                position: 'relative',
                width: '100%',
                height: '70.05vh',
                background: selectedProduct.cardBg,
                borderRadius: 'min(6.2vw, 3.5vh)',
                overflow: 'visible',
                boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
              }}
            >

              {/* Dashed inner border — inset simétrico 8% h / 2.68% v */}
              <div style={{
                position: 'absolute',
                left: '4.16%', top: '2.68%',
                width: '91.68%', height: '94.64%',
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
                  right: '7.66%', top: '-2.91%',
                  width: '37.85%', height: '36.41%', objectFit: 'contain',
                  zIndex: 3, pointerEvents: 'none',
                  filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.28))',
                  transformOrigin: 'bottom center',
                }}
              />

              {/* Badge — top-left, tilted, overflows card edge */}
              <motion.div
                initial={{ opacity: 0, x: -18, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: -12.002 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.24 }}
                style={{
                  position: 'absolute',
                  left: 'calc(-1% - 20px)', top: 'calc(-6% + 55px)',
                  zIndex: 3,
                  width: 'calc(min(36.9vw, 20.8vh) - 50px)',
                  height: 'calc(min(7.07vw, 3.975vh) + 15px)',
                  transformOrigin: 'center center',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.06, 1],
                    boxShadow: [
                      `0 0 0px ${selectedProduct.borderColor}00`,
                      `0 0 14px ${selectedProduct.borderColor}99`,
                      `0 0 0px ${selectedProduct.borderColor}00`,
                    ],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    width: '100%',
                    height: '100%',
                    boxSizing: 'border-box',
                    background: selectedProduct.cardBg,
                    border: `3.631px solid ${selectedProduct.borderColor}`,
                    borderRadius: 25.417,
                    padding: 5,
                  }}
                >
                  <p style={{
                    position: 'relative', zIndex: 1,
                    fontFamily: 'var(--font-display)',
                    fontSize: 'min(3.2vw, 1.8vh)',
                    color: selectedProduct.textColor,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    lineHeight: 1.1, margin: 0,
                    letterSpacing: '0.04em',
                    whiteSpace: 'pre-line',
                    paddingTop: 3,
                  }}>
                    {selectedProduct.badge}
                  </p>
                  {/* Shimmer sweep */}
                  <motion.div
                    animate={{ x: ['-140%', '200%'] }}
                    transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.8, ease: 'easeInOut', delay: 1 }}
                    style={{
                      position: 'absolute',
                      top: '-20%', bottom: '-20%', width: '55%',
                      background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.6) 50%, transparent 80%)',
                      pointerEvents: 'none', zIndex: 2,
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* ¡GOOOL! — centrado, top 7.58% de la card */}
              <motion.p
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.1 }}
                style={{
                  position: 'absolute', left: '8.32%', top: '9.07%',
                  width: '83.36%', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(16.1vw, 9.06vh)',
                  color: 'white', textAlign: 'left',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight: 0.9, margin: 0,
                }}
              >
                ¡GOOOL!
              </motion.p>

              {/* Nombre producto — left 8.32%, top 24.31% */}
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  position: 'absolute',
                  left: '8.32%', top: selectedProduct.nameTop,
                  width: '62.9%', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(9.6vw, 5.42vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 0.91, margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {selectedProduct.name}
              </motion.p>

              {/* Subtítulo — left 8.64%, top 45.73% */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                  position: 'absolute',
                  left: '8.64%', top: `calc(${selectedProduct.subtitleTop} + 10px)`,
                  width: '71.54%', zIndex: 1,
                  fontFamily: 'var(--font-body)',
                  fontSize: 'min(5.19vw, 2.92vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  lineHeight: 1, margin: 0,
                  whiteSpace: 'pre-line',
                }}
              >
                {selectedProduct.subtitle}
              </motion.p>

              {/* Beneficio 1: fila flex */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.26 }}
                style={{
                  position: 'absolute',
                  left: '8.32%', top: selectedProduct.benefit1Top,
                  width: '83.36%', zIndex: 1,
                  display: 'flex', alignItems: 'center', gap: '3%',
                }}
              >
                <img
                  src={selectedProduct.benefitIcons[0]} alt=""
                  style={{ width: BENEFIT_ICON_SIZE, height: BENEFIT_ICON_SIZE, aspectRatio: '1 / 1', objectFit: 'contain', flexShrink: 0 }}
                />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'min(4.17vw, 2.34vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  lineHeight: 1, margin: 0,
                }}>
                  {selectedProduct.benefits[0]}
                </p>
              </motion.div>

              {/* Divisor entre beneficios — left 8.32%, top 71.15% */}
              <div style={{
                position: 'absolute',
                left: '8.32%', top: selectedProduct.dividerTop,
                width: '83.36%', height: 0,
                borderTop: `2px dashed ${selectedProduct.borderColor}`,
                opacity: 0.5, zIndex: 1,
              }} />

              {/* Beneficio 2: fila flex */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  position: 'absolute',
                  left: '8.32%', top: selectedProduct.id === 0 ? `calc(${selectedProduct.benefit2Top} - 35px)` : selectedProduct.benefit2Top,
                  width: '83.36%', zIndex: 1,
                  display: 'flex', alignItems: 'center', gap: '3%',
                }}
              >
                <img
                  src={selectedProduct.benefitIcons[1]} alt=""
                  style={{
                    width: BENEFIT_ICON_SIZE,
                    height: BENEFIT_ICON_SIZE,
                    aspectRatio: '1 / 1',
                    objectFit: 'contain',
                    flexShrink: 0,
                    transform: selectedProduct.id === 0 ? 'translateY(2px)' : undefined,
                  }}
                />
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'min(4.17vw, 2.34vh)',
                  color: selectedProduct.textColor,
                  textTransform: 'uppercase',
                  lineHeight: 1, margin: 0,
                  whiteSpace: 'pre-line',
                }}>
                  {selectedProduct.benefits[1]}
                </p>
              </motion.div>

              {/* Divisor full — alineado con borde punteado */}
              <div style={{
                position: 'absolute',
                left: '4.16%', top: '83.64%',
                width: '91.68%', height: 0,
                borderTop: `2px dashed ${selectedProduct.borderColor}`,
                opacity: 0.6, zIndex: 1,
              }} />

              {/* +60 PUNTOS — centrado, top 86.54% */}
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.33, type: 'spring', stiffness: 260 }}
                style={{
                  position: 'absolute', left: 0, top: '86.54%',
                  width: '100%', zIndex: 1,
                  fontFamily: 'var(--font-display)',
                  fontSize: 'min(10.4vw, 5.83vh)',
                  color: selectedProduct.textColor,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1, margin: 0,
                }}
              >
                +{PTS_GOAL} PUNTOS
              </motion.p>

            </motion.div>
            </div>
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
            style={{ position: 'absolute', left: '9.4%', width: '81.3%', bottom: '2.6%', zIndex: 22 }}
          >
            <motion.div
              animate={phase === 'aim' ? {
                scale: [1, 1.035, 1],
                boxShadow: [
                  '0 4px 20px rgba(0,87,122,0.22), 0 0 0 rgba(255,255,255,0)',
                  '0 8px 32px rgba(0,87,122,0.28), 0 0 22px rgba(255,255,255,0.9)',
                  '0 4px 20px rgba(0,87,122,0.22), 0 0 0 rgba(255,255,255,0)',
                ],
              } : {
                scale: 1,
                boxShadow: '0 4px 20px rgba(0,87,122,0.22)',
              }}
              transition={phase === 'aim' ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.22 }}
              style={{
              background: 'white', borderRadius: 99,
              height: phase === 'aim' ? 'min(8vw, 4.5vh)' : 'min(8.5vw, 4.8vh)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,87,122,0.22)',
              overflow: 'hidden',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: phase === 'aim' ? 'min(6.72vw, 3.78vh)' : 'min(4.2vw, 2.36vh)',
                color: phase === 'rival_result'
                  ? (rivalScored ? '#ef4444' : '#22c55e')
                  : '#00577a',
                textTransform: 'uppercase',
                lineHeight: phase === 'aim' ? 0.92 : 1, paddingTop: '0.18em',
                textAlign: 'center',
                maxWidth: '92%',
              }}>
                {phase === 'aim'          && 'TOCA UN PAQUETE PARA TIRAR'}
                {phase === 'firing'       && '¡DISPARO!'}
                {phase === 'rival_fire'   && '¡ATAJA! ← ARRASTRA EL ARQUERO →'}
                {phase === 'rival_result' && (rivalScored ? '¡GOL DEL RIVAL!' : '¡ATAJADO!')}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#00b6ed', '#fcd116', '#d23d22', '#a049bb', '#ffffff', '#b0e8f9'];
const PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.5,
  dur: 1.3 + Math.random() * 1.2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  w: 8 + Math.random() * 10,
  h: 5 + Math.random() * 7,
  rot: Math.random() * 360,
  drift: (Math.random() - 0.5) * 70,
}));

function Confetti() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30, overflow: 'hidden' }}>
      {PIECES.map(p => (
        <motion.div
          key={p.id}
          initial={{ top: '-3%', left: `${p.x}%`, rotate: p.rot, opacity: 1 }}
          animate={{ top: '108%', left: `calc(${p.x}% + ${p.drift}px)`, rotate: p.rot + 540, opacity: [1, 1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: [0.15, 0, 0.85, 1] }}
          style={{ position: 'absolute', width: p.w, height: p.h, background: p.color, borderRadius: 2 }}
        />
      ))}
    </div>
  );
}
