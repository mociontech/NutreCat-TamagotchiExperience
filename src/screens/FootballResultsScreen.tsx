import { motion } from 'framer-motion';

interface Props {
  pts:    number;
  pScore: number;
  mScore: number;
  onDone: () => void;
}

export default function FootballResultsScreen({ pts: _pts, pScore, mScore, onDone }: Props) {
  const win  = pScore > mScore;
  const tie  = pScore === mScore;
  const resultText = tie ? 'EMPATE' : win ? 'GANASTE' : 'PERDISTE';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>

      {win && <Confetti />}

      {/* Background */}
      <img src="/assets/backgrounds/bg-football-results.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.31, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.97%', left: '28.14%', right: '28.14%', bottom: '77.45%', zIndex: 5 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Victory cat */}
      <video
        src={win ? '/assets/cat/Animation/Celebrando.webm' : '/assets/cat/Animation/Perdedor.webm'}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          left: '50%',
          top: 'calc(18% + 100px)',
          transform: 'translateX(-50%)',
          width: '40%',
          objectFit: 'contain',
          zIndex: 5,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 6px 16px rgba(0,87,122,0.25))',
        }}
      />

      {/* GANASTE / PERDISTE / EMPATE
          Figma top = 40.47% (top edge). Use left:0 right:0 + textAlign to avoid transform conflict */}
      <motion.div
        initial={{ opacity: 0, scale: 0.65 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.25 }}
        style={{
          position: 'absolute',
          left: 0, right: 0,
          top: 'calc(40.47% + 80px)',
          display: 'flex', justifyContent: 'center',
          zIndex: 6, pointerEvents: 'none',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(22.3vw, 12.57vh)',
          color: 'white',
          textTransform: 'uppercase',
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: '0.03em',
          textShadow: '0 0 40px rgba(255,255,255,0.55)',
          whiteSpace: 'nowrap',
        }}>
          {resultText}
        </span>
      </motion.div>

      {/* Score box — Figma center at (50%, 64.04%). Without translate: top = 64.04% - height/2 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.45 }}
        style={{
          position: 'absolute',
          left: '22.3%',
          right: '22.3%',
          top: 'calc(64.04% - min(17vw, 9.55vh) + 80px)',
          height: 'min(34vw, 19.1vh)',
          background: '#00577a',
          borderRadius: 'min(5vw, 2.8vh)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 6,
          boxShadow: '0 12px 40px rgba(0,0,0,0.28)',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(25vw, 14.1vh)',
          color: 'white',
          lineHeight: 1,
          letterSpacing: '0.04em',
          paddingTop: '0.18em',
        }}>
          {pScore}-{mScore}
        </span>
      </motion.div>

      {/* Ball 1 */}
      <motion.img src="/assets/games/football-ball.svg" alt=""
        animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '16.8%', top: 'calc(55.4% + 80px)', width: '10.9%', objectFit: 'contain', zIndex: 7, pointerEvents: 'none', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
      />

      {/* Ball 2 */}
      <motion.img src="/assets/games/football-ball.svg" alt=""
        animate={{ y: [0, -12, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{ position: 'absolute', left: '69.2%', top: 'calc(68.7% + 80px)', width: '10.9%', objectFit: 'contain', zIndex: 7, pointerEvents: 'none', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
      />

      {/* CONTINUAR button */}
      <motion.button
        onClick={onDone}
        initial={{ opacity: 0, y: 16 }}
        animate={{
          opacity: 1, y: 0,
          boxShadow: ['0 0 18px rgba(255,255,255,0.25)', '0 0 48px rgba(255,255,255,0.65)', '0 0 18px rgba(255,255,255,0.25)'],
        }}
        transition={{ opacity: { duration: 0.4, delay: 0.75 }, y: { duration: 0.4, delay: 0.75 }, boxShadow: { duration: 1.8, repeat: Infinity, delay: 1 } }}
        style={{
          position: 'absolute',
          left: '13.3%',
          right: '13.3%',
          top: '85.2%',
          height: 'min(8.5vw, 4.79vh)',
          zIndex: 10,
          background: 'white',
          border: 'none',
          borderRadius: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(7.5vw, 4.22vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          cursor: 'pointer',
          lineHeight: 1,
          paddingTop: '0.18em',
          whiteSpace: 'nowrap',
        }}
      >
        CONTINUAR
      </motion.button>
    </div>
  );
}

const CONFETTI_COLORS = ['#00b6ed', '#fcd116', '#d23d22', '#a049bb', '#ffffff', '#b0e8f9'];
const PIECES = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.6,
  dur: 1.5 + Math.random() * 1.4,
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
