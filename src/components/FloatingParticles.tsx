import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type ParticleType = 'hearts' | 'stars' | 'confetti' | 'bubbles' | 'sparkles';

interface FloatingParticlesProps {
  type: ParticleType;
  count?: number;
  active?: boolean;
}

const particleEmojis: Record<ParticleType, string[]> = {
  hearts: ['❤️', '💕', '💗', '💖', '💝'],
  stars: ['⭐', '✨', '💫', '🌟'],
  confetti: ['🎊', '🎉', '✨', '🌟', '💥'],
  bubbles: ['🫧', '⭕', '🔵', '⚪'],
  sparkles: ['✨', '💥', '⚡', '🌟', '💫'],
};

const colombiaColors = ['#FCD116', '#CE1126', '#003087', '#FFFFFF', '#00AEEF'];

interface Particle { id: number; x: number; delay: number; duration: number; emoji: string; size: number; color: string; }

export default function FloatingParticles({ type, count = 12, active = true }: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const emojis = particleEmojis[type];
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 1.5 + Math.random() * 2,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size: 16 + Math.random() * 20,
        color: colombiaColors[Math.floor(Math.random() * colombiaColors.length)],
      }))
    );
  }, [type, count, active]);

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: '100%', opacity: 1, scale: 0 }}
          animate={type === 'confetti'
            ? { y: '-20%', opacity: [1, 1, 0], scale: [0, 1.2, 0.8], rotate: [0, 360] }
            : { y: [0, -80, -160], opacity: [0, 1, 0], scale: [0, 1.3, 0.8] }
          }
          transition={{ delay: p.delay, duration: p.duration, repeat: Infinity, repeatDelay: Math.random() * 1.5 }}
          style={{ position: 'absolute', bottom: type === 'confetti' ? 0 : '20%', left: `${p.x}%`, fontSize: p.size }}
        >
          {type === 'confetti' ? (
            <div style={{ width: 10, height: 20, background: p.color, borderRadius: 2, opacity: 0.9 }} />
          ) : p.emoji}
        </motion.div>
      ))}
    </div>
  );
}
