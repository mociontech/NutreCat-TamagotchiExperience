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

      {/* Background */}
      <img src="/assets/backgrounds/bg-football-results.png" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.31, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: '4.97%', left: '28.14%', right: '28.14%', bottom: '77.45%', zIndex: 5 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      {/* Left cat */}
      <motion.img
        src="/assets/cat/cat-celebrate-left.png" alt=""
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.4, delay: 0.2 }, y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } }}
        style={{ position: 'absolute', left: '29.3%', top: '29.1%', width: '14.8%', objectFit: 'contain', zIndex: 4, pointerEvents: 'none', filter: 'drop-shadow(0 6px 16px rgba(0,87,122,0.25))' }}
      />

      {/* Center cat */}
      <motion.img
        src="/assets/cat/cat-celebrate-center.png" alt=""
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
        transition={{ opacity: { duration: 0.35 }, scale: { duration: 0.45, type: 'spring', stiffness: 280 }, y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        style={{ position: 'absolute', left: '44%', top: '24.6%', width: '19.1%', objectFit: 'contain', zIndex: 5, pointerEvents: 'none', filter: 'drop-shadow(0 6px 16px rgba(0,87,122,0.25))' }}
      />

      {/* Right cat */}
      <motion.img
        src="/assets/cat/cat-celebrate-right.png" alt=""
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -8, 0] }}
        transition={{ opacity: { duration: 0.4, delay: 0.15 }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.55 } }}
        style={{ position: 'absolute', left: '59.5%', top: '27.9%', width: '15.3%', objectFit: 'contain', zIndex: 4, pointerEvents: 'none', filter: 'drop-shadow(0 6px 16px rgba(0,87,122,0.25))' }}
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
          top: '40.47%',
          display: 'flex', justifyContent: 'center',
          zIndex: 6, pointerEvents: 'none',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(22.3vw, 12.57vh)',
          color: tie ? '#fcd116' : 'white',
          textTransform: 'uppercase',
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: '0.03em',
          textShadow: win
            ? '0 0 40px rgba(255,255,255,0.55)'
            : tie
            ? '0 0 30px rgba(252,209,22,0.55)'
            : '0 0 30px rgba(0,0,0,0.3)',
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
          top: 'calc(64.04% - min(17vw, 9.55vh))',
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
        style={{ position: 'absolute', left: '16.8%', top: '55.4%', width: '10.9%', objectFit: 'contain', zIndex: 7, pointerEvents: 'none', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
      />

      {/* Ball 2 */}
      <motion.img src="/assets/games/football-ball.svg" alt=""
        animate={{ y: [0, -12, 0], rotate: [0, -20, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{ position: 'absolute', left: '69.2%', top: '68.7%', width: '10.9%', objectFit: 'contain', zIndex: 7, pointerEvents: 'none', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}
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
