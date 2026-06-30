import { motion, type TargetAndTransition } from 'framer-motion';

export type CatMood =
  | 'idle' | 'sleeping' | 'awake' | 'happy' | 'excited'
  | 'eating' | 'playing' | 'talking' | 'champion';

interface CatCharacterProps {
  mood: CatMood;
  size?: number;
  style?: React.CSSProperties;
}

const CAT_IMAGES: Record<CatMood, string> = {
  sleeping: '/assets/cat/cat-sleep.png',
  idle:     '/assets/cat/cat-hub.png',
  awake:    '/assets/cat/cat-hub.png',
  happy:    '/assets/cat/cat-hub.png',
  excited:  '/assets/cat/cat-champion.png',
  eating:   '/assets/cat/cat-food.png',
  playing:  '/assets/cat/cat-game.png',
  talking:  '/assets/cat/cat-hub.png',
  champion: '/assets/cat/cat-champion.png',
};

const ANIMATIONS: Record<string, TargetAndTransition> = {
  breathe: { scale: [1, 1.04, 1],              transition: { duration: 3,   repeat: Infinity, ease: 'easeInOut' } },
  bounce:  { y: [0, -14, 0, -8, 0],            transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } },
  wiggle:  { rotate: [0, -6, 6, -4, 4, 0],     transition: { duration: 0.8, repeat: Infinity } },
  jump:    { y: [0, -22, 0], rotate: [0, -4, 4, 0], transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } },
};

const MOOD_ANIM: Record<CatMood, string> = {
  sleeping: 'breathe',
  idle:     'breathe',
  awake:    'bounce',
  happy:    'bounce',
  excited:  'wiggle',
  eating:   'bounce',
  playing:  'wiggle',
  talking:  'wiggle',
  champion: 'jump',
};

export default function CatCharacter({ mood, size = 280, style }: CatCharacterProps) {
  const src  = CAT_IMAGES[mood];
  const anim = ANIMATIONS[MOOD_ANIM[mood]];

  return (
    <motion.div
      animate={anim}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <img
        src={src}
        alt={`gato ${mood}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'bottom',
          userSelect: 'none',
          pointerEvents: 'none',
          // Easy swap: change src via CAT_IMAGES map when final PNGs arrive
        }}
        // data-cat-state={mood} — útil para QA/swap de assets
        data-cat-state={mood}
      />
    </motion.div>
  );
}
