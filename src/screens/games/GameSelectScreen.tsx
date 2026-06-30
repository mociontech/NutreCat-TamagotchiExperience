import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { ScreenName } from '../../data/gameStates';
import { ASSETS, cssUrl } from '../../config/assets';
import { ACTIVITY_NAV_ITEMS } from '../../config/products';

const NAV = ACTIVITY_NAV_ITEMS;

const SIZE = 'min(17.13vw, 9.64vh)';

interface Props {
  onSelect:(game:ScreenName)=>void;
  onBack:()=>void;
  score?:number;
  hasFed?: boolean;
  hasPlayed?: boolean;
  hasTalked?: boolean;
}

const GAMES = [
  {
    id:    'penaltyInstructions'  as ScreenName,
    title: 'PENALES',
    sub:   'Chuta el balón\nal arco',
    visual: 'football' as const,
  },
  {
    id:    'catchBenefits' as ScreenName,
    title: 'ATRÁPALO',
    sub:   'Atrapa los productos NutreCat',
    visual: 'bags' as const,
  },
];

// ─── Balón (node 209:12) — centro x=50%, y=30.4% de tarjeta, ancho=51% ──────
function SoccerBall() {
  return (
    <motion.img
      src={ASSETS.games.selectionBall}
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
        src={ASSETS.games.bagTop}
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
        src={ASSETS.games.bagLeft}
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
        src={ASSETS.games.bagRight}
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

export default function GameSelectScreen({ onSelect, onBack, score = 0, hasFed = false, hasPlayed = false, hasTalked = false }: Props) {
  const [showLabels, setShowLabels] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowLabels(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width:'100%', height:'100%', background:'#00b6ed', position:'relative', overflow:'hidden' }}>

      {/* Fondo habitación */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage: cssUrl(ASSETS.backgrounds.pet),
        backgroundSize:'cover', backgroundPosition:'center bottom',
        opacity:0.44, pointerEvents:'none',
      }}/>

      {/* Logo */}
      <div style={{ position:'absolute', top:'4.79%', left:'9.07%', right:'62.31%', bottom:'83.7%', zIndex:3 }}>
        <img src={ASSETS.ui.logo} alt="Nutre Cat"
          style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
      </div>

      {/* Botón volver */}
      <motion.button
        onClick={onBack}
        whileTap={{ scale: 0.88 }}
        style={{
          position: 'absolute', top: '85.6%', left: '6.5%',
          zIndex: 20, background: 'none', border: 'none',
          cursor: 'pointer', padding: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 44 44" fill="none">
          <path d="M28 8 L14 22 L28 36" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>

      {/* Score */}
      <div style={{ position:'absolute', top:'5%', right:'9%', zIndex:3, background:'white', borderRadius:'min(3.8vw, 2.14vh)', width:'min(33.3vw, 18.75vh)', height:'min(7.6vw, 4.27vh)', boxShadow:'0 2px 14px rgba(0,87,122,0.18)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'min(6.57vw, 3.7vh)', color:'#00577a', textTransform:'uppercase', whiteSpace:'nowrap', lineHeight:1, paddingTop:'0.25em' }}>
          Puntos: {score}
        </span>
      </div>

      {/* Gato detrás de las tarjetas */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <video
          src={ASSETS.catVideos.idle}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '90.34%',
            height: 'auto',
            objectFit: 'contain',
            userSelect: 'none',
            filter: 'drop-shadow(0 20px 40px rgba(0,87,122,0.2))',
            marginTop: 180,
          }}
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
                whiteSpace:'pre-line',
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
          const doneMap = { hasFed, hasPlayed, hasTalked };
          const isGame = item.id === 'game';
          const done = doneMap[item.doneKey];
          const inProgress = isGame && !done;
          return (
            <div key={item.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'min(1.2vw, 0.68vh)', flexShrink:0 }}>
              <div style={{ width:SIZE, height:SIZE, flexShrink:0, position:'relative' }}>
                <motion.button
                  onClick={isGame ? undefined : onBack}
                  whileTap={{ scale:0.88 }}
                  style={{
                    position:'absolute', inset:0,
                    borderRadius:'50%', border:'none', cursor:isGame?'default':'pointer',
                    background:done?'white':'#00577a',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:done || inProgress
                      ?'0 6px 22px rgba(0,87,122,0.25)'
                      :'0 4px 16px rgba(0,0,0,0.2)',
                    overflow:'hidden',
                  }}
                >
                  {inProgress && (
                    <svg
                      viewBox="0 0 100 58"
                      preserveAspectRatio="none"
                      style={{ position: 'absolute', left: 0, right: 0, bottom: -2, width: '100%', height: 'calc(58% + 32px)', zIndex: 0, pointerEvents: 'none' }}
                    >
                      <path d="M0 16 C18 4 32 28 50 16 C68 4 82 28 100 16 L100 58 L0 58 Z" fill="white" />
                    </svg>
                  )}
                  <div
                    style={{
                      width: '62%',
                      aspectRatio: '1',
                      position: 'relative',
                      zIndex: 1,
                      backgroundColor: '#00B6ED',
                      WebkitMaskImage: `url(${item.icon})`,
                      maskImage: `url(${item.icon})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      pointerEvents: 'none',
                    }}
                  />
                </motion.button>
              </div>
              <motion.span
                animate={{ opacity: showLabels ? 1 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ fontFamily:'var(--font-display)', fontSize:'min(4.08vw, 2.28vh)', color:'#f2f2f2', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap', pointerEvents:'none' }}
              >
                {item.label}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
