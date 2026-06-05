import { motion } from 'framer-motion';
import type { ScreenName } from '../data/gameStates';

const NAV = [
  { id: 'game',    label: 'Jugar',  icon: '/assets/nav/icon-game.svg'    },
  { id: 'food',    label: 'Comer',  icon: '/assets/nav/icon-food.svg'    },
  { id: 'hygiene', label: 'Bañar',  icon: '/assets/nav/icon-hygiene.svg' },
  { id: 'sleep',   label: 'Dormir', icon: '/assets/nav/icon-sleep.svg'   },
] as const;

const SIZE = 'min(17.13vw, 9.64vh)';

interface Props { onSelect:(game:ScreenName)=>void; onBack:()=>void; score?:number; }

const GAMES = [
  {
    id:    'footballGame'         as ScreenName,
    title: 'PENALES',
    sub:   'Chuta el balón al arco',
    visual: 'football' as const,
  },
  {
    id:    'fallingBagsBenefits' as ScreenName,
    title: 'ATRÁPALO',
    sub:   'Atrapa los productos NutreCat',
    visual: 'bags' as const,
  },
];

// ─── Balón (node 209:12) — centro x=50%, y=30.4% de tarjeta, ancho=51% ──────
function SoccerBall() {
  return (
    <motion.img
      src="/assets/games/ball.svg"
      alt=""
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: '24.5%',   // 50% - 51%/2
        top:  '20.3%',
        width: '51%',
        height: 'auto',
        userSelect: 'none', pointerEvents: 'none',
      }}
    />
  );
}

// ─── Paquetes (nodes 214:8 top, 214:4 left, 214:5 right) ─────────────────────
// Posiciones calculadas desde Figma (relativas a tarjeta 424×639px):
//   bag-top : left=47.6%, top=0, width=41.7%  (entrecortado arriba)
//   bag-left: centro x=29.5% y=18%  rotate=-41.17° width=29%
//   bag-right: centro x=65.8% y=36.9% rotate=+26.49° width=29%
function FloatingProducts() {
  return (
    <>
      {/* bag-top (214:8) — entra por la parte superior, entrecortado */}
      <motion.img
        src="/assets/games/bag-top.svg"
        alt=""
        animate={{ y: ['-35%', '-20%', '-35%'] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          left: '47.6%', top: 0,
          width: '41.7%', height: 'auto',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* bag-left (214:4) — centro 29.5%/18%, rotate -41.17° */}
      <motion.img
        src="/assets/games/bag-left.svg"
        alt=""
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        style={{
          position: 'absolute',
          left: '15%',   // 29.5% - 29%/2
          top:  '3.7%',  // 18%   - 28.6%/2
          width: '29%', height: 'auto',
          rotate: '-41.17deg',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* bag-right (214:5) — centro 65.8%/36.9%, rotate +26.49° */}
      <motion.img
        src="/assets/games/bag-right.svg"
        alt=""
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        style={{
          position: 'absolute',
          left: '51.3%',  // 65.8% - 29%/2
          top:  '23.1%',  // 36.9% - 28.6%/2
          width: '29%', height: 'auto',
          rotate: '26.49deg',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />
    </>
  );
}

export default function GameSelectScreen({ onSelect, onBack, score = 0 }: Props) {
  return (
    <div style={{ width:'100%', height:'100%', background:'#00b6ed', position:'relative', overflow:'hidden' }}>

      {/* Fondo habitación */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'url(/assets/backgrounds/bg-pet2.png)',
        backgroundSize:'cover', backgroundPosition:'center bottom',
        opacity:0.44, pointerEvents:'none',
      }}/>

      {/* Logo */}
      <div style={{ position:'absolute', top:'4.79%', left:'9.07%', right:'62.31%', bottom:'83.7%', zIndex:3 }}>
        <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat"
          style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
      </div>

      {/* Score */}
      <div style={{ position:'absolute', top:'5%', right:'9%', zIndex:3, background:'white', borderRadius:99, padding:'min(1.5vw, 0.85vh) min(4.5vw, 2.5vh)', boxShadow:'0 2px 14px rgba(0,87,122,0.18)' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'min(6.6vw, 3.7vh)', color:'#00577a', textTransform:'uppercase', whiteSpace:'nowrap' }}>
          Puntos: {score}
        </span>
      </div>

      {/* Gato detrás de las tarjetas (Figma: left=19.7% top=27.3% w=66.5%) */}
      <div style={{ position:'absolute', left:'19.7%', top:'27.3%', width:'66.5%', zIndex:0, pointerEvents:'none' }}>
        <motion.img
          src="/assets/cat/cat-game.png" alt=""
          animate={{ y:[0,-8,0] }}
          transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
          style={{ width:'100%', objectFit:'contain', userSelect:'none' }}
        />
      </div>

      {/* ── Tarjetas de juego ──
          Figma: left card left=10% | right card left=51.48%
          top=37.29%, width=39.26%, height=33.28%
      ── */}
      {GAMES.map((g, i) => (
        <div key={g.id} style={{
          position:'absolute',
          left:   i === 0 ? '10%' : '51.48%',
          top:    '37.29%',
          width:  '39.26%',
          height: '33.28%',
          zIndex: 1,
        }}>
          <motion.button
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            whileHover={{ scale:1.04, boxShadow:'0 16px 48px rgba(0,87,122,0.28)' }}
            whileTap={{ scale:0.95, boxShadow:'0 4px 16px rgba(0,87,122,0.18)' }}
            transition={{ type:'spring', stiffness:300, damping:20, delay: i*0.1 }}
            onClick={() => onSelect(g.id)}
            style={{
              width:'100%', height:'100%',
              background:'rgba(255,255,255,0.86)',
              border:'2px solid transparent',
              borderRadius:'min(2.1vw, 1.2vh)',
              cursor:'pointer',
              overflow:'hidden',
              boxShadow:'0 8px 32px rgba(0,87,122,0.16)',
              position:'relative',
            }}
          >
            {/* ── Visual — posicionado con % exactos del Figma ── */}
            {g.visual === 'football' ? <SoccerBall/> : <FloatingProducts/>}

            {/* ── Texto — Figma: título top=69.5% tarjeta, subtítulo abajo ── */}
            <div style={{
              position:'absolute',
              top:'62.6%', left:0, right:0,
              textAlign:'center',
              padding:'0 5%',
            }}>
              <p style={{
                fontFamily:'var(--font-display)',
                fontSize:'min(8vw, 4.5vh)',
                color:'#00577a',
                textTransform:'uppercase',
                textAlign:'center',
                lineHeight:1,
                margin:'0 0 min(1.2vw, 0.68vh)',
                letterSpacing:'0.05em',
                whiteSpace:'nowrap',
              }}>
                {g.title}
              </p>
              <p style={{
                fontFamily:'var(--font-body)',
                fontSize:'min(4.2vw, 2.36vh)',
                color:'#00577a',
                textAlign:'center',
                margin:0,
                lineHeight:1.25,
                fontWeight:700,
                opacity:0.78,
              }}>
                {g.sub}
              </p>
            </div>
          </motion.button>
        </div>
      ))}

      {/* ── Nav botones (Figma: top=82.6%, size=185px, gap=48px) ── */}
      <div style={{
        position:'absolute', top:'82.6%', left:0, right:0,
        display:'flex', justifyContent:'center', alignItems:'center',
        gap:'min(4.4vw, 2.5vh)', padding:'0 9%', zIndex:2,
      }}>
        {NAV.map(item => {
          const isGame = item.id === 'game';
          return (
            <div key={item.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'min(1.2vw, 0.68vh)', flexShrink:0 }}>
              <div style={{ width:SIZE, height:SIZE, flexShrink:0, position:'relative' }}>
                <motion.button
                  onClick={isGame ? undefined : onBack}
                  whileTap={{ scale:0.88 }}
                  style={{
                    position:'absolute', inset:0,
                    borderRadius:'50%', border:'none', cursor:isGame?'default':'pointer',
                    background:isGame?'white':'#00577a',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:isGame
                      ?'0 0 0 3px rgba(255,255,255,0.8), 0 6px 22px rgba(0,87,122,0.25)'
                      :'0 4px 16px rgba(0,0,0,0.2)',
                    overflow:'hidden',
                  }}
                >
                  <img src={item.icon} alt="" style={{ width:'62%', height:'auto', objectFit:'contain', filter:isGame?'none':'brightness(0) invert(1)' }}/>
                </motion.button>
              </div>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'min(3.4vw, 1.9vh)', color:'white', textTransform:'uppercase', letterSpacing:'0.04em', opacity:isGame?1:0.65, whiteSpace:'nowrap', pointerEvents:'none' }}>
                {isGame?'✓ ':''}{item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
