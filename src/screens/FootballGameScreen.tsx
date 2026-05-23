import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import PrimaryButton from '../components/PrimaryButton';
import BottomNav, { type NavTabDef } from '../components/BottomNav';

const NAV_ICONS = {
  game:    '/assets/nav/icon-game.svg',
  food:    '/assets/nav/icon-food.svg',
  hygiene: '/assets/nav/icon-hygiene.svg',
  sleep:   '/assets/nav/icon-sleep.svg',
};

const CAT_BY_PHASE: Record<string, string> = {
  charge:   '/assets/cat/cat-game.png',
  kick:     '/assets/cat/cat-game.png',
  goal:     '/assets/cat/cat-champion.png',
  miss:     '/assets/cat/cat-sleep.png',
};

interface Props {
  onGoal: (points: number) => void;
  onBack: () => void;
}

export default function FootballGameScreen({ onGoal, onBack }: Props) {
  const [power, setPower] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [phase, setPhase] = useState<'charge' | 'kick' | 'result'>('charge');
  const [isGoal, setIsGoal] = useState(false);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [ballPos, setBallPos] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerRef = useRef(0);

  const navTabs: NavTabDef[] = [
    { id: 'game',    label: 'JUEGO',   iconSrc: NAV_ICONS.game,    isActive: true,  isDone: false, onClick: onBack },
    { id: 'food',    label: 'COMER',   iconSrc: NAV_ICONS.food,    isActive: false, isDone: false, onClick: onBack },
    { id: 'hygiene', label: 'HIGIENE', iconSrc: NAV_ICONS.hygiene, isActive: false, isDone: false, onClick: onBack },
    { id: 'sleep',   label: 'DORMIR',  iconSrc: NAV_ICONS.sleep,   isActive: false, isDone: false, onClick: onBack },
  ];

  useEffect(() => {
    if (phase !== 'charge') return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setPhase('kick');
          return 0;
        }
        return t - 1;
      });
      powerRef.current = Math.max(0, powerRef.current - 0.5);
      setPower(powerRef.current);
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [phase]);

  const handleTap = () => {
    if (phase !== 'charge') return;
    powerRef.current = Math.min(100, powerRef.current + 8);
    setPower(powerRef.current);
    setTaps(t => t + 1);
  };

  const handleKick = () => {
    if (phase !== 'kick') return;
    const goal = power >= 40;
    setIsGoal(goal);
    setPhase('result');
    if (goal) {
      const pts = Math.round(power * 1.5);
      setScore(pts);
      setBallPos({ x: (Math.random() - 0.5) * 60, y: -80 });
    } else {
      setBallPos({ x: (Math.random() - 0.5) * 120, y: 20 });
    }
  };

  const handleContinue = () => {
    if (isGoal) {
      onGoal(score);
    } else {
      setPower(0);
      powerRef.current = 0;
      setTimeLeft(25);
      setPhase('charge');
      setTaps(0);
      setBallPos({ x: 0, y: 0 });
    }
  };

  const powerColor = power < 40 ? '#CE1126' : power < 70 ? '#FCD116' : '#4ade80';
  const catPhaseKey = phase === 'result' ? (isGoal ? 'goal' : 'miss') : phase;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A2A0A 0%, #1a4a1a 40%, #0A1628 100%)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Tap zone */}
      <div
        onClick={phase === 'charge' ? handleTap : undefined}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', padding: '32px 24px 16px',
          cursor: phase === 'charge' ? 'pointer' : 'default',
          position: 'relative',
        }}
      >
        {/* Stadium lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${20 + i * 15}%`, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
        ))}

        {/* Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <motion.button
            onClick={e => { e.stopPropagation(); onBack(); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
          >
            ← Salir
          </motion.button>
          <div style={{
            background: 'rgba(0,0,0,0.4)', borderRadius: '16px',
            padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>TIEMPO</p>
              <motion.p
                animate={timeLeft <= 5 ? { scale: [1, 1.3, 1], color: ['#CE1126', '#ffffff', '#CE1126'] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ fontSize: '22px', fontWeight: 900, color: timeLeft <= 5 ? '#CE1126' : '#FCD116' }}
              >
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </motion.p>
            </div>
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>TAPS</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>{taps}</p>
            </div>
          </div>
        </div>

        {/* Goal net */}
        <div style={{ width: '100%', position: 'relative' }}>
          <div style={{
            border: '3px solid rgba(255,255,255,0.4)', borderBottom: 'none',
            borderRadius: '8px 8px 0 0', height: '80px',
            background: 'rgba(255,255,255,0.03)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', left: `${i * 20}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.15)' }} />
            ))}
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', top: `${i * 33}%`, left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            ))}
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: 2 }}>ARCO</span>
            {phase === 'result' && isGoal && (
              <motion.div
                initial={{ x: 0, y: 100, scale: 0.5 }}
                animate={{ x: ballPos.x, y: ballPos.y, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ position: 'absolute', fontSize: '40px', zIndex: 10 }}
              >⚽</motion.div>
            )}
          </div>
        </div>

        {/* Cat */}
        <motion.div
          animate={phase === 'charge' ? { y: [0, -5, 0] } : phase === 'kick' ? { rotate: [-10, 10, -10] } : { y: [0, -12, 0] }}
          transition={{ duration: 1, repeat: phase !== 'result' ? Infinity : 0, ease: 'easeInOut' }}
        >
          <img
            src={CAT_BY_PHASE[catPhaseKey]}
            alt="Simón"
            style={{
              width: 180, height: 180,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: phase === 'result' && isGoal
                ? 'drop-shadow(0 0 30px rgba(252,209,22,0.6))'
                : 'drop-shadow(0 10px 30px rgba(0,0,0,0.4))',
              transition: 'filter 0.3s',
            }}
          />
        </motion.div>

        {/* Ball (kick phase) */}
        {phase === 'kick' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            onClick={e => { e.stopPropagation(); handleKick(); }}
            style={{ fontSize: '70px', cursor: 'pointer', filter: 'drop-shadow(0 0 20px rgba(252,209,22,0.6))' }}
          >⚽</motion.div>
        )}

        {/* Result message */}
        {phase === 'result' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{ textAlign: 'center' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', color: isGoal ? '#FCD116' : '#CE1126', marginBottom: '8px' }}>
              {isGoal ? '¡GOOOL! 🎉' : '¡Casi! Intenta de nuevo'}
            </h2>
            {isGoal && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>+{score} puntos 🏆</p>}
          </motion.div>
        )}

        {/* Bottom controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {phase !== 'result' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>⚡ Potencia de disparo</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: powerColor }}>{Math.round(power)}%</span>
              </div>
              <div style={{ height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
                <motion.div
                  animate={{ width: `${power}%` }}
                  transition={{ duration: 0.1 }}
                  style={{ height: '100%', background: `linear-gradient(90deg, #CE1126, ${powerColor})`, borderRadius: '99px', boxShadow: `0 0 10px ${powerColor}88` }}
                />
              </div>
            </div>
          )}

          {phase === 'charge' && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.02, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ background: 'rgba(252,209,22,0.1)', border: '2px solid rgba(252,209,22,0.3)', borderRadius: '16px', padding: '14px', textAlign: 'center' }}
            >
              <p style={{ color: '#FCD116', fontSize: '18px', fontWeight: 900 }}>👆 ¡Toca rápido para cargar!</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '4px' }}>Carga ≥40% y luego patea el balón</p>
            </motion.div>
          )}

          {phase === 'kick' && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              onClick={e => { e.stopPropagation(); handleKick(); }}
              style={{ background: 'linear-gradient(135deg, #FCD116, #CE1126)', borderRadius: '20px', padding: '18px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 0 30px rgba(252,209,22,0.5)' }}
            >
              <p style={{ color: 'white', fontSize: '22px', fontWeight: 900 }}>⚽ ¡PATEA AHORA!</p>
            </motion.div>
          )}

          {phase === 'result' && (
            <PrimaryButton onClick={handleContinue} variant={isGoal ? 'colombia' : 'cyan'} size="lg" fullWidth>
              {isGoal ? '🎉 ¡Ver celebración!' : '🔄 Intentar de nuevo'}
            </PrimaryButton>
          )}
        </div>
      </div>

      <BottomNav tabs={navTabs} />
    </div>
  );
}
