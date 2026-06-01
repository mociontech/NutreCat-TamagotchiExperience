import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

// ─── Config ajustable ──────────────────────────────────────────────────────────
const GAME_SECS    = 30;
const SHOOT_MS     = 680;
const RESULT_MS    = 1400;
const CONFIRM_MS   = 950;  // ms confirmando zona antes de la barra
const SAVE_SECS    = 4;

// Dificultad progresiva: barra acelera con el tiempo
const barSpeed = (t: number): number =>
  t > 22 ? 2.0 : t > 15 ? 1.6 : t > 8 ? 1.2 : 0.88;

const GREEN  = [0.44, 0.56] as const;
const YELLOW = [0.31, 0.69] as const;

const PTS         = { green: 100, yellow: 60, red: 30, save: 50 } as const;
const BASE_CHANCE = { green: 0.80, yellow: 0.50, red: 0.20 }     as const;

const ZONES = [
  { id: 0, x: 0.12, y: 0.15, label: '1', name: 'Alta izquierda', bonus:  0.12, col: '#ef4444' },
  { id: 1, x: 0.88, y: 0.15, label: '2', name: 'Alta derecha',   bonus:  0.12, col: '#ef4444' },
  { id: 2, x: 0.14, y: 0.66, label: '3', name: 'Lateral izq',    bonus:  0.04, col: '#fbbf24' },
  { id: 3, x: 0.86, y: 0.66, label: '4', name: 'Lateral der',    bonus:  0.04, col: '#fbbf24' },
  { id: 4, x: 0.50, y: 0.50, label: '5', name: 'Centro',         bonus: -0.18, col: '#00b6ed' },
] as const;

const AI_W  = [0.28, 0.28, 0.18, 0.18, 0.08] as const;
const ADJ: [number,number][] = [[0,2],[1,3],[2,4],[3,4],[2,3]];

// Texto de celebración/fallo según zona
const GOL_TEXT = ['¡GOLAZO DE ESQUINA! 🎯','¡GOLAZO DE ESQUINA! 🎯','¡Bien colocado! ⚽','¡Bien colocado! ⚽','¡Gol al centro! 😅'];
const MISS_TEXT = ['Esquina difícil...','Esquina difícil...','¡El portero lo atajó!','¡El portero lo atajó!','Muy al centro...'];

// Posición de dive del portero (left + bottom) según zona
const diveLeft   = (z: number) => `${8  + ZONES[z].x * 70}%`;
const diveBottom = (z: number) => `${Math.max(2, Math.round((1 - ZONES[z].y) * 70 - 5))}%`;

type BarZone = 'green'|'yellow'|'red';
type Phase   =
  | 'shoot_aim'      // Traza trayectoria
  | 'shoot_confirm'  // Confirma zona (CONFIRM_MS)
  | 'shoot_timing'   // Barra de precisión
  | 'shoot_firing'   // Balón del usuario
  | 'shoot_result'   // GOL / FALLIDO
  | 'save_ready'     // Usuario posiciona portero
  | 'save_firing'    // Balón de la IA + dive del portero
  | 'save_result'    // ATAJADO / GOL EN CONTRA
  | 'gameover';

interface RoundResult { scored: boolean; saved: boolean; }
interface Props { onGoal: (pts:number) => void; onBack: () => void; }

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getBZ = (p:number): BarZone =>
  p >= GREEN[0]  && p <= GREEN[1]  ? 'green'
  : p >= YELLOW[0] && p <= YELLOW[1] ? 'yellow' : 'red';

// IA con memoria: intenta tirar al lado contrario donde estuvo el portero
const pickAISmart = (lastGkZ: number|null): number => {
  const base = (): number => {
    let r = Math.random(), acc = 0;
    for (let i=0;i<AI_W.length;i++){acc+=AI_W[i];if(r<acc)return i;}
    return 4;
  };
  if (lastGkZ === null || Math.random() < 0.30) return base();
  const opp: Record<number,number[]> = {0:[1,3],1:[0,2],2:[1,3],3:[0,2],4:[0,1]};
  const cands = opp[lastGkZ];
  return cands[Math.floor(Math.random()*cands.length)];
};

const goalChance = (bz:BarZone, zId:number) =>
  Math.max(0.05, Math.min(0.97, BASE_CHANCE[bz] + ZONES[zId].bonus));

const checkSave = (gkZ:number, aiZ:number): boolean => {
  if (gkZ === aiZ) return true;
  return ADJ.some(([a,b])=>(a===gkZ&&b===aiZ)||(a===aiZ&&b===gkZ)) && Math.random()<0.38;
};

const nearestZone = (px:number, py:number, el:HTMLElement): number => {
  const r = el.getBoundingClientRect();
  let best=4, bd=Infinity;
  ZONES.forEach((z,i)=>{
    const d=Math.hypot(px-(r.left+z.x*r.width), py-(r.top+z.y*r.height));
    if(d<bd){bd=d;best=i;}
  });
  return best;
};

const bezierD = (sx:number,sy:number,ex:number,ey:number) => {
  const cpx=(sx+ex)/2, cpy=Math.min(sy,ey)-Math.abs(sx-ex)*0.5-40;
  return `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`;
};

// ─── GameOver ─────────────────────────────────────────────────────────────────
function GameOverScreen({score,onClaim}:{score:number;onClaim:()=>void}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 12%',gap:'min(4vw,2.2vh)',position:'relative',zIndex:10}}
    >
      <motion.p initial={{y:-24,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1,type:'spring',stiffness:200}}
        style={{fontFamily:'var(--font-display)',fontSize:'min(10vw,5.6vh)',color:'white',textTransform:'uppercase',textAlign:'center',margin:0,lineHeight:1.1,textShadow:'0 0 30px rgba(0,182,237,0.8)'}}
      >¡Tiempo<br/>terminado!</motion.p>
      <motion.img src="/assets/cat/cat-champion.png" alt=""
        animate={{y:[0,-14,0]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
        style={{width:'min(46vw,26vh)',objectFit:'contain',filter:'drop-shadow(0 0 min(5vw,2.8vh) rgba(0,182,237,0.6))'}}
      />
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3}}
        style={{background:'rgba(255,255,255,0.08)',borderRadius:'min(4vw,2.2vh)',padding:'min(3.5vw,2vh) min(8vw,4.5vh)',textAlign:'center',border:'min(0.4vw,0.22vh) solid rgba(255,255,255,0.2)',backdropFilter:'blur(8px)',width:'100%',boxSizing:'border-box'}}
      >
        <p style={{fontFamily:'var(--font-body)',fontSize:'min(4vw,2.3vh)',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 min(1vw,0.55vh)'}}>Puntos finales</p>
        <p style={{fontFamily:'var(--font-display)',fontSize:'min(16vw,9vh)',color:'#00b6ed',margin:0,lineHeight:1,textShadow:'0 0 20px rgba(0,182,237,0.5)'}}>{score}</p>
      </motion.div>
      <motion.button initial={{opacity:0,y:16}}
        animate={{opacity:1,y:0,boxShadow:['0 0 20px rgba(0,182,237,0.3)','0 0 55px rgba(0,182,237,0.75)','0 0 20px rgba(0,182,237,0.3)']}}
        transition={{delay:0.5,boxShadow:{duration:1.8,repeat:Infinity}}}
        whileTap={{scale:0.94}} onClick={onClaim}
        style={{width:'100%',padding:'min(4vw,2.2vh)',background:'#00b6ed',border:'none',borderRadius:99,fontFamily:'var(--font-display)',fontSize:'min(7vw,3.9vh)',color:'white',textTransform:'uppercase',letterSpacing:'0.04em',cursor:'pointer'}}
      >🎁 Reclamar mi premio</motion.button>
    </motion.div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function FootballGameScreen({onGoal,onBack}:Props) {
  const [phase,      setPhase]  = useState<Phase>('shoot_aim');
  const [timeLeft,   setTime]   = useState(GAME_SECS);
  const [totalScore, setTotal]  = useState(0);
  const [roundHist,  setHist]   = useState<RoundResult[]>([]);
  const [roundScore, setRound]  = useState<{scored:boolean,saved:boolean}|null>(null);

  // Disparo del usuario
  const [hoverZone,  setHover]  = useState<number|null>(null);
  const [aimZone,    setAim]    = useState<number|null>(null);
  const [isDrawing,  setDraw]   = useState(false);
  const [drawEndPx,  setDEnd]   = useState<{x:number;y:number}|null>(null);
  const [barPos,     setBarPos] = useState(0);
  const [barZone,    setBarZone]= useState<BarZone|null>(null);
  const [isGoal,     setIsGoal] = useState(false);
  const [ptsShot,    setPts]    = useState(0);
  const [shotKey,    setKey]    = useState(0);

  // Tapada
  const [gkNormX,   setGkX]    = useState(0.5);
  const [gkZone,    setGkZone] = useState(4);
  const [aiZone,    setAiZone] = useState(0);
  const [saveSecs,  setSaveS]  = useState(SAVE_SECS);
  const [savedOk,   setSaved]  = useState(false);

  // SVG positions (px relativos al gameArea)
  const [ballPx,    setBallPx] = useState({x:0,y:0});
  const [zonePxs,   setZPxs]  = useState<{x:number;y:number}[]>([]);

  // Refs
  const barRef       = useRef({pos:0, dir:1});
  const barSpeedRef  = useRef(2.0);
  const gameAreaRef  = useRef<HTMLDivElement>(null);
  const goalRef      = useRef<HTMLDivElement>(null);
  const ballRef      = useRef<HTMLDivElement>(null);
  const isDragGk     = useRef(false);
  const gkZoneRef    = useRef(4);
  const aiZoneRef    = useRef(0);
  const lastGkZRef   = useRef<number|null>(null);
  const aimZoneRef   = useRef<number|null>(null);
  const isGoalRef    = useRef(false);
  const ptsRef       = useRef(0);

  // Sync refs
  useEffect(()=>{gkZoneRef.current=gkZone;},[gkZone]);
  useEffect(()=>{aiZoneRef.current=aiZone;},[aiZone]);
  useEffect(()=>{aimZoneRef.current=aimZone;},[aimZone]);
  useEffect(()=>{isGoalRef.current=isGoal;},[isGoal]);
  useEffect(()=>{ptsRef.current=ptsShot;},[ptsShot]);
  // Actualizar velocidad de barra con el tiempo
  useEffect(()=>{barSpeedRef.current=barSpeed(timeLeft);},[timeLeft]);

  // Medir posiciones SVG
  const measure = useCallback(()=>{
    if(!gameAreaRef.current||!goalRef.current||!ballRef.current) return;
    const aR=gameAreaRef.current.getBoundingClientRect();
    const bR=ballRef.current.getBoundingClientRect();
    const gR=goalRef.current.getBoundingClientRect();
    setBallPx({x:bR.left+bR.width/2-aR.left, y:bR.top+bR.height/2-aR.top});
    setZPxs(ZONES.map(z=>({x:gR.left+z.x*gR.width-aR.left, y:gR.top+z.y*gR.height-aR.top})));
  },[]);

  useLayoutEffect(()=>{
    measure();
    window.addEventListener('resize',measure);
    return ()=>window.removeEventListener('resize',measure);
  },[measure]);

  // ── Timer ────────────────────────────────────────────────────
  useEffect(()=>{
    if(timeLeft<=0||phase==='gameover') return;
    const t=setTimeout(()=>setTime(p=>{const n=p-1;if(n<=0)setPhase('gameover');return Math.max(0,n);}),1000);
    return ()=>clearTimeout(t);
  },[timeLeft,phase]);

  // ── Barra oscilante (velocidad dinámica vía ref) ─────────────
  useEffect(()=>{
    if(phase!=='shoot_timing') return;
    const TICK=16;
    const id=setInterval(()=>{
      const step=TICK/(barSpeedRef.current*1000);
      const b=barRef.current;
      b.pos+=b.dir*step;
      if(b.pos>=1){b.pos=1;b.dir=-1;}
      if(b.pos<=0){b.pos=0;b.dir=1;}
      setBarPos(b.pos);
    },TICK);
    return ()=>clearInterval(id);
  },[phase]);

  // ── Confirmación de zona → auto-avanza a timing ──────────────
  useEffect(()=>{
    if(phase!=='shoot_confirm') return;
    const t=setTimeout(()=>setPhase('shoot_timing'),CONFIRM_MS);
    return ()=>clearTimeout(t);
  },[phase]);

  // ── Countdown de tapada ──────────────────────────────────────
  useEffect(()=>{
    if(phase!=='save_ready') return;
    setSaveS(SAVE_SECS);
    let rem=SAVE_SECS;
    const id=setInterval(()=>{
      rem--;
      setSaveS(rem);
      if(rem<=0){clearInterval(id);setPhase('save_firing');}
    },1000);
    return ()=>clearInterval(id);
  },[phase]);

  // ── Resultado de tapada al entrar en save_result ─────────────
  useEffect(()=>{
    if(phase!=='save_result') return;
    const saved=checkSave(gkZoneRef.current, aiZoneRef.current);
    setSaved(saved);
    if(saved) setTotal(p=>p+PTS.save);
    const result={scored:isGoalRef.current, saved};
    setRound(result);
    setHist(h=>[...h, result]);
    lastGkZRef.current=gkZoneRef.current;
  },[phase]);

  // ── Auto-avances entre fases resultado ───────────────────────
  useEffect(()=>{
    if(phase!=='shoot_result'&&phase!=='save_result') return;
    const t=setTimeout(()=>{
      if(phase==='shoot_result'){
        const ai=pickAISmart(lastGkZRef.current);
        setAiZone(ai); aiZoneRef.current=ai;
        setGkX(0.5); setGkZone(4); gkZoneRef.current=4;
        setPhase('save_firing');
      } else {
        setRound(null);
        if(timeLeft>0) startNewRound();
        else setPhase('gameover');
      }
    },RESULT_MS);
    return ()=>clearTimeout(t);
  },[phase]); // eslint-disable-line

  // ── save_firing → save_result ────────────────────────────────
  useEffect(()=>{
    if(phase!=='save_firing') return;
    const t=setTimeout(()=>setPhase('save_result'), SHOOT_MS+250);
    return ()=>clearTimeout(t);
  },[phase]);

  const startNewRound=useCallback(()=>{
    setAim(null); setHover(null); setBarZone(null);
    setIsGoal(false); setPts(0); setDEnd(null); setDraw(false);
    setGkX(0.5); setGkZone(4); gkZoneRef.current=4;
    barRef.current={pos:0,dir:1}; setBarPos(0);
    setKey(k=>k+1);
    setPhase('shoot_aim');
  },[]);

  // ── Draw trajectory ──────────────────────────────────────────
  const onDrawDown=useCallback((e:React.PointerEvent)=>{
    if(phase!=='shoot_aim') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraw(true);
    setDEnd({x:e.clientX,y:e.clientY});
    if(goalRef.current) setHover(nearestZone(e.clientX,e.clientY,goalRef.current));
  },[phase]);

  const onDrawMove=useCallback((e:React.PointerEvent)=>{
    if(!isDrawing||phase!=='shoot_aim') return;
    setDEnd({x:e.clientX,y:e.clientY});
    if(goalRef.current) setHover(nearestZone(e.clientX,e.clientY,goalRef.current));
  },[isDrawing,phase]);

  const onDrawUp=useCallback(()=>{
    if(!isDrawing||phase!=='shoot_aim') return;
    setDraw(false);
    if(hoverZone!==null){
      setAim(hoverZone);
      barRef.current={pos:0,dir:1}; setBarPos(0);
      setPhase('shoot_confirm'); // Confirmación antes de la barra
    }
  },[isDrawing,phase,hoverZone]);

  // ── Detener barra ────────────────────────────────────────────
  const stopBar=useCallback(()=>{
    if(phase!=='shoot_timing'||aimZoneRef.current===null) return;
    const bz=getBZ(barRef.current.pos);
    const scored=Math.random()<goalChance(bz,aimZoneRef.current);
    const pts=scored?PTS[bz]:0;
    setBarZone(bz); setIsGoal(scored); isGoalRef.current=scored;
    setPts(pts); ptsRef.current=pts;
    if(scored) setTotal(p=>p+pts);
    setPhase('shoot_firing');
    setTimeout(()=>setPhase('shoot_result'),SHOOT_MS+200);
  },[phase]);

  // ── GK drag ──────────────────────────────────────────────────
  const onGoalDown=useCallback((e:React.PointerEvent)=>{
    if(phase!=='save_ready') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragGk.current=true;
  },[phase]);

  const onGoalMove=useCallback((e:React.PointerEvent)=>{
    if(!isDragGk.current||!goalRef.current||phase!=='save_ready') return;
    const r=goalRef.current.getBoundingClientRect();
    setGkX(Math.max(0.05,Math.min(0.95,(e.clientX-r.left)/r.width)));
    const z=nearestZone(e.clientX,e.clientY,goalRef.current);
    setGkZone(z); gkZoneRef.current=z;
  },[phase]);

  const onGoalUp=useCallback(()=>{isDragGk.current=false;},[]);

  const commitSave=useCallback(()=>{
    if(phase!=='save_ready') return;
    setPhase('save_firing');
  },[phase]);

  // ── Derivados ─────────────────────────────────────────────────
  const liveBZColor = getBZ(barPos)==='green'?'#22c55e':getBZ(barPos)==='yellow'?'#fbbf24':'#ef4444';
  const aimLeft     = aimZone!==null?`${8+ZONES[aimZone].x*84}%`:'50%';
  const aimBottom   = aimZone!==null?`${32+(1-ZONES[aimZone].y)*38}%`:'20%';
  const gkLeftPct   = `${gkNormX*82+5}%`;

  // Trayectoria SVG
  const svgLine = (() => {
    if(!isDrawing||hoverZone===null||zonePxs.length===0) return null;
    return bezierD(ballPx.x, ballPx.y, zonePxs[hoverZone].x, zonePxs[hoverZone].y);
  })();

  // Posición del portero en cada situación
  const gkAnimLeft = (()=>{
    if(phase==='shoot_firing'||phase==='shoot_result') return aimZone!==null?diveLeft(aimZone):'38%';
    if(phase==='save_firing'||phase==='save_result') return diveLeft(aiZone);
    return gkLeftPct;
  })();
  const gkAnimBottom = (()=>{
    if(phase==='shoot_firing'||phase==='shoot_result') return aimZone!==null?diveBottom(aimZone):'0%';
    if(phase==='save_firing'||phase==='save_result') return diveBottom(aiZone);
    return '0%';
  })();

  const isShooting = phase==='shoot_aim'||phase==='shoot_confirm'||phase==='shoot_timing'||phase==='shoot_firing'||phase==='shoot_result';
  const isSaving   = phase==='save_ready';
  const roundNum   = roundHist.length + 1;

  return (
    <div style={{width:'100%',height:'100%',background:'linear-gradient(180deg,#040e1c 0%,#081a10 50%,#0f3015 100%)',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>

      {/* Luces estadio */}
      {[12,29,46,54,71,88].map((left,i)=>(
        <motion.div key={i} animate={{opacity:[0.5,1,0.5]}} transition={{duration:2.2+i*0.3,repeat:Infinity,delay:i*0.35}}
          style={{position:'absolute',top:`${6+(i%2)*3.5}%`,left:`${left}%`,width:'min(5vw,2.8vh)',height:'min(5vw,2.8vh)',borderRadius:'50%',background:'radial-gradient(circle,#fff8e0 0%,#ffd54f 60%,transparent 100%)',boxShadow:'0 0 min(5vw,2.8vh) min(2vw,1.1vh) rgba(255,240,140,0.3)',pointerEvents:'none',zIndex:1}}
        />
      ))}
      {/* Confeti */}
      {[...Array(8)].map((_,i)=>(
        <motion.div key={`c${i}`} animate={{y:['0%','120%'],rotate:[0,360*(i%2===0?1:-1)],opacity:[1,0]}} transition={{duration:3+i*0.4,repeat:Infinity,delay:i*0.7,ease:'linear'}}
          style={{position:'absolute',top:'-5%',left:`${8+i*11}%`,width:'min(2.5vw,1.4vh)',height:'min(5vw,2.8vh)',background:['#00b6ed','#fbbf24','#22c55e','#ef4444','#a78bfa','#00b6ed','#fbbf24','#22c55e'][i],borderRadius:2,pointerEvents:'none',zIndex:2}}
        />
      ))}

      {phase==='gameover' ? (
        <GameOverScreen score={totalScore} onClaim={()=>onGoal(totalScore)} />
      ) : (
        <>
          {/* ── HEADER ───────────────────────────────────────── */}
          <div style={{flexShrink:0,zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'min(3vw,1.7vh) min(5vw,2.8vh)',background:'rgba(0,0,0,0.45)',backdropFilter:'blur(6px)'}}>
            <img src="/assets/ui/logo-nutre-cat.svg" alt="Nutre Cat" style={{width:'min(20vw,11.2vh)',filter:'brightness(0) invert(1)'}} />

            {/* Historial de rondas */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'min(0.8vw,0.45vh)'}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'min(3vw,1.7vh)',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.06em'}}>
                Ronda {roundNum}
              </span>
              <div style={{display:'flex',gap:'min(1.5vw,0.85vh)',alignItems:'center'}}>
                {roundHist.slice(-6).map((r,i)=>(
                  <div key={i} style={{width:'min(3.5vw,2vh)',height:'min(3.5vw,2vh)',borderRadius:'50%',background:r.scored&&r.saved?'#22c55e':r.scored||r.saved?'#fbbf24':'#ef4444',boxShadow:`0 0 min(2vw,1.1vh) ${r.scored&&r.saved?'#22c55e':r.scored||r.saved?'#fbbf24':'#ef4444'}88`}} />
                ))}
                {roundHist.length===0&&<span style={{fontFamily:'var(--font-body)',fontSize:'min(2.8vw,1.6vh)',color:'rgba(255,255,255,0.3)'}}>— — —</span>}
              </div>
            </div>

            <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'min(0.8vw,0.45vh)'}}>
              <motion.div animate={timeLeft<=10?{scale:[1,1.1,1]}:{}} transition={{duration:0.5,repeat:Infinity}}
                style={{background:timeLeft<=10?'#ef4444':'#00b6ed',borderRadius:99,padding:'min(1.2vw,0.68vh) min(3vw,1.7vh)',display:'flex',alignItems:'center',gap:'min(1vw,0.55vh)',boxShadow:`0 4px 16px ${timeLeft<=10?'rgba(239,68,68,0.6)':'rgba(0,182,237,0.5)'}`,transition:'background 0.3s'}}
              >
                <span style={{fontSize:'min(3.5vw,2vh)'}}>⏱</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:'white',textTransform:'uppercase'}}>{timeLeft}s</span>
              </motion.div>
              <motion.div key={totalScore} animate={{scale:[1.15,1]}} transition={{duration:0.25}}
                style={{background:'white',borderRadius:99,padding:'min(0.8vw,0.45vh) min(3vw,1.7vh)',display:'flex',alignItems:'center',gap:'min(0.8vw,0.45vh)',boxShadow:'0 2px 14px rgba(0,87,122,0.18)'}}
              >
                <span style={{fontSize:'min(3.5vw,2vh)'}}>⭐</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:'#00577a',textTransform:'uppercase'}}>{totalScore}</span>
              </motion.div>
            </div>
          </div>

          {/* ── Título + instrucción ──────────────────────────── */}
          <div style={{flexShrink:0,textAlign:'center',padding:'min(1.5vw,0.85vh) 5%',zIndex:5}}>
            <p style={{fontFamily:'var(--font-display)',fontSize:'min(10.5vw,5.9vh)',color:'white',textTransform:'uppercase',margin:0,lineHeight:1,textShadow:'0 0 30px rgba(0,182,237,0.9)',letterSpacing:'0.05em'}}>PENALTY CAT</p>
            <AnimatePresence mode="wait">
              <motion.p key={phase} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}}
                style={{fontFamily:'var(--font-body)',fontSize:'min(3.6vw,2vh)',margin:'min(0.4vw,0.22vh) 0 0',fontWeight:700,letterSpacing:'0.04em',textTransform:'uppercase',
                  color: phase==='shoot_confirm'?ZONES[aimZone??4].col
                       : isSaving?'#22c55e'
                       : phase==='shoot_timing'?'#fbbf24'
                       : '#00b6ed'}}
              >
                {phase==='shoot_aim'    &&'⚽ Traza el tiro con el dedo'}
                {phase==='shoot_confirm'&&aimZone!==null&&`✅ Zona ${ZONES[aimZone].label} · ${ZONES[aimZone].name} · prepárate`}
                {phase==='shoot_timing' &&`⚡ ¡Detén la barra! (vel. ${barSpeedRef.current.toFixed(1)}x)`}
                {phase==='shoot_firing' &&'🚀 ¡Disparando!'}
                {phase==='shoot_result' &&(isGoal?`${GOL_TEXT[aimZone??4]} +${ptsShot}pts`:`${MISS_TEXT[aimZone??4]}`)}
                {phase==='save_ready'   &&`🧤 Arrastra el portero · ${saveSecs}s`}
                {phase==='save_firing'  &&'💥 ¡La IA dispara!'}
                {phase==='save_result'  &&(savedOk?`🧤 ¡ATAJADO! +${PTS.save}pts`:'😬 ¡Gol en contra!')}
              </motion.p>
            </AnimatePresence>

            {/* Barra de velocidad / dificultad */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'min(1.5vw,0.85vh)',marginTop:'min(0.8vw,0.45vh)'}}>
              <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.5vw,1.4vh)',color:'rgba(255,255,255,0.4)',textTransform:'uppercase'}}>Dificultad</span>
              {[2.0,1.6,1.2,0.88].map((sp,i)=>(
                <div key={i} style={{width:'min(5vw,2.8vh)',height:'min(1.5vw,0.85vh)',borderRadius:2,background:barSpeedRef.current<=sp?'rgba(255,255,255,0.15)':['#22c55e','#fbbf24','#f97316','#ef4444'][i],transition:'background 0.5s'}} />
              ))}
            </div>
          </div>

          {/* ── Área de juego ─────────────────────────────────── */}
          <div ref={gameAreaRef} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'0 5%',zIndex:5,minHeight:0,position:'relative'}}>

            {/* SVG overlay: trayectoria (shoot_aim) + balón IA (save_firing) */}
            <svg
              onPointerDown={phase==='shoot_aim'?onDrawDown:undefined}
              onPointerMove={phase==='shoot_aim'?onDrawMove:undefined}
              onPointerUp={phase==='shoot_aim'?onDrawUp:undefined}
              onPointerCancel={phase==='shoot_aim'?onDrawUp:undefined}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:30,touchAction:'none',overflow:'visible',cursor:phase==='shoot_aim'?'crosshair':'none',pointerEvents:phase==='shoot_aim'?'all':'none'}}
            >
              {/* Trayectoria del usuario */}
              {svgLine&&(
                <>
                  <path d={svgLine} stroke="rgba(0,182,237,0.3)" strokeWidth="14" strokeLinecap="round" fill="none"/>
                  <path d={svgLine} stroke="#00b6ed" strokeWidth="3" strokeDasharray="10 7" strokeLinecap="round" fill="none" opacity="0.9"/>
                </>
              )}
              {hoverZone!==null&&zonePxs.length>0&&(
                <>
                  <circle cx={zonePxs[hoverZone].x} cy={zonePxs[hoverZone].y} r={24} fill="rgba(0,182,237,0.2)" stroke="#00b6ed" strokeWidth="2.5"/>
                  <circle cx={zonePxs[hoverZone].x} cy={zonePxs[hoverZone].y} r={6} fill="#00b6ed"/>
                </>
              )}

              {/* Balón de la IA (save_firing) */}
              {phase==='save_firing'&&zonePxs.length>0&&(
                <motion.g initial={{x:ballPx.x, y:ballPx.y}} animate={{x:zonePxs[aiZone].x, y:zonePxs[aiZone].y}} transition={{duration:SHOOT_MS/1000,ease:[0.4,0,1,1]}}>
                  <circle r={14} fill="white" opacity="0.95"/>
                  <circle r={14} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1"/>
                  {/* Estela IA */}
                  <circle r={10} fill="rgba(239,68,68,0.4)" cx={-20} cy={8}/>
                  <circle r={7}  fill="rgba(239,68,68,0.25)" cx={-38} cy={16}/>
                </motion.g>
              )}
            </svg>

            {/* ── Arco ──────────────────────────────────────── */}
            <div ref={goalRef}
              onPointerDown={onGoalDown}
              onPointerMove={onGoalMove}
              onPointerUp={onGoalUp}
              onPointerCancel={onGoalUp}
              style={{flexShrink:0,width:'100%',height:'min(44vw,24.8vh)',position:'relative',touchAction:'none',border:'min(1.2vw,0.68vh) solid white',borderBottom:'none',borderRadius:'min(1.5vw,0.85vh) min(1.5vw,0.85vh) 0 0',overflow:'hidden',background:'rgba(0,18,40,0.6)',cursor:isSaving?'grab':'default'}}
            >
              {/* Red */}
              <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,0.1) 1.5px,transparent 1.5px)',backgroundSize:'14.28% 25%',pointerEvents:'none'}}/>

              {/* 5 zonas marcadas */}
              {ZONES.map((z,i)=>{
                const isHov  = hoverZone===i&&phase==='shoot_aim';
                const isConf = aimZone===i&&phase==='shoot_confirm';
                const isAim  = aimZone===i&&(phase==='shoot_timing'||phase==='shoot_firing'||phase==='shoot_result');
                const isAiZ  = aiZone===i&&(phase==='save_firing'||phase==='save_result');
                const isGkZ  = gkZone===i&&(isSaving||phase==='save_firing'||phase==='save_result');
                const lit = isHov||isConf||isAim;
                return (
                  <div key={i} style={{position:'absolute',left:`${z.x*100}%`,top:`${z.y*100}%`,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:4}}>
                    <motion.div
                      animate={isConf?{scale:[1,1.4,1],opacity:[0.8,1,0.8]}:isHov?{scale:[1,1.2,1],opacity:[0.7,1,0.7]}:isAim?{scale:[1,1.1,1]}:{}}
                      transition={{duration:0.6,repeat:Infinity}}
                      style={{width:'min(11vw,6.2vh)',height:'min(11vw,6.2vh)',borderRadius:'50%',border:`min(0.7vw,0.4vh) solid ${lit?z.col:isGkZ?'#22c55e':'rgba(255,255,255,0.3)'}`,background:lit?`${z.col}30`:isGkZ?'rgba(34,197,94,0.15)':'rgba(255,255,255,0.05)',boxShadow:lit?`0 0 min(4vw,2.2vh) ${z.col}`:isGkZ?'0 0 min(3vw,1.7vh) #22c55e':'none',display:'flex',alignItems:'center',justifyContent:'center',transition:'border-color 0.2s,background 0.2s'}}
                    >
                      <span style={{fontFamily:'var(--font-display)',fontSize:'min(4vw,2.3vh)',color:lit?z.col:isGkZ?'#22c55e':'rgba(255,255,255,0.45)',fontWeight:900}}>{z.label}</span>
                    </motion.div>
                    {/* Flash zona IA en save_result */}
                    {isAiZ&&(
                      <motion.div initial={{scale:0,opacity:0}} animate={{scale:[0,1.6,1.2],opacity:[0,1,0.8]}} transition={{duration:0.45}}
                        style={{position:'absolute',inset:'-35%',borderRadius:'50%',border:'3px solid #ef4444',boxShadow:'0 0 20px #ef4444',pointerEvents:'none'}}
                      />
                    )}
                  </div>
                );
              })}

              {/* Portero: dive con left + bottom */}
              <motion.img src="/assets/cat/cat-hub.png" alt="Portero"
                animate={{
                  left: gkAnimLeft,
                  bottom: gkAnimBottom,
                  scaleX: (phase==='save_ready'||phase==='save_firing'||phase==='save_result')&&gkNormX<0.35?-1:1,
                  rotate: (phase==='save_firing'||phase==='save_result')&&(aiZone===0||aiZone===1)?[0,aiZone===0?-25:25]:[0,0],
                }}
                transition={{duration: phase==='shoot_firing'?0.28:0.22, ease:'easeOut'}}
                style={{position:'absolute',bottom:0,width:'min(19vw,10.7vh)',objectFit:'contain',pointerEvents:'none',filter:'drop-shadow(0 0 min(2vw,1.1vh) rgba(0,182,237,0.5))',zIndex:5}}
              />

              {/* Overlay resultado en el arco */}
              <AnimatePresence>
                {(phase==='shoot_result'||phase==='save_result')&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{position:'absolute',inset:0,background:(phase==='shoot_result'?isGoal:savedOk)?'rgba(34,197,94,0.28)':'rgba(239,68,68,0.28)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:8}}
                  >
                    <motion.p initial={{scale:0,rotate:-10}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:320}}
                      style={{fontFamily:'var(--font-display)',fontSize:'min(11vw,6.2vh)',color:(phase==='shoot_result'?isGoal:savedOk)?'#22c55e':'#ef4444',textTransform:'uppercase',margin:0,textShadow:`0 0 min(5vw,2.8vh) ${(phase==='shoot_result'?isGoal:savedOk)?'#22c55e':'#ef4444'}`}}
                    >
                      {phase==='shoot_result'?(isGoal?'¡GOOOL!':'FALLIDO'):(savedOk?'¡ATAJADO!':'GOL EN CONTRA')}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instrucción arrastra portero */}
              {isSaving&&(
                <motion.div animate={{opacity:[0.7,1,0.7]}} transition={{duration:1.2,repeat:Infinity}}
                  style={{position:'absolute',top:4,left:'50%',transform:'translateX(-50%)',background:'rgba(34,197,94,0.85)',borderRadius:99,padding:'min(0.8vw,0.45vh) min(3vw,1.7vh)',pointerEvents:'none',whiteSpace:'nowrap',zIndex:9}}
                >
                  <span style={{fontFamily:'var(--font-display)',fontSize:'min(3vw,1.7vh)',color:'white',textTransform:'uppercase'}}>
                    🧤 Arrastra el portero · {saveSecs}s — Zona {ZONES[gkZone].label}: {ZONES[gkZone].name}
                  </span>
                </motion.div>
              )}
            </div>

            {/* ── Campo verde ──────────────────────────────── */}
            <div style={{width:'100%',flex:1,background:'linear-gradient(180deg,#1a5c1a 0%,#2a8a2a 60%,#1e6b1e 100%)',position:'relative',overflow:'hidden',minHeight:0}}>
              {/* Línea del área */}
              <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:'min(5vw,2.8vh)',borderLeft:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.25)',borderRight:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.25)',borderBottom:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.25)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',top:'min(7vw,3.9vh)',left:'50%',transform:'translateX(-50%)',width:'min(2.5vw,1.4vh)',height:'min(2.5vw,1.4vh)',borderRadius:'50%',background:'rgba(255,255,255,0.4)',pointerEvents:'none'}}/>

              {/* Balón del usuario */}
              <motion.div ref={ballRef} key={`ball-${shotKey}`}
                animate={phase==='shoot_firing'?{left:aimLeft,bottom:aimBottom,scale:[1,0.5],opacity:[1,0.8]}:{}}
                transition={{duration:SHOOT_MS/1000,ease:[0.4,0,1,1]}}
                style={{position:'absolute',left:'50%',bottom:'min(20vw,11.2vh)',transform:'translateX(-50%)',width:'min(9.5vw,5.35vh)',height:'min(9.5vw,5.35vh)',borderRadius:'50%',background:'radial-gradient(circle at 35% 32%,white 0%,#e0e0e0 40%,#888 100%)',boxShadow:'0 min(1.5vw,0.85vh) min(4vw,2.2vh) rgba(0,0,0,0.55)',zIndex:8}}
              />

              {/* Estela del usuario */}
              {phase==='shoot_firing'&&[0.25,0.5,0.75].map((t,i)=>(
                <motion.div key={`tr${i}`} initial={{opacity:0.7}} animate={{opacity:0}} transition={{duration:0.3,delay:i*0.06}}
                  style={{position:'absolute',left:`calc(50% + ${(parseFloat(aimLeft)-50)*t}%)`,bottom:`calc(${parseFloat('min(20vw, 11.2vh)'.split(',')[0].slice(4))*(1-t)+parseFloat(aimBottom)*t}%)`,width:'min(7vw,3.9vh)',height:'min(7vw,3.9vh)',borderRadius:'50%',background:'rgba(0,182,237,0.5)',transform:'translate(-50%,50%)',pointerEvents:'none',zIndex:7}}
                />
              ))}

              {/* Gato jugador */}
              <motion.img src="/assets/cat/cat-game.png" alt="Simón"
                animate={phase==='shoot_firing'?{rotate:[0,18],y:[0,-8]}:{rotate:0,y:[0,-5,0]}}
                transition={phase==='shoot_firing'?{duration:0.3}:{duration:3,repeat:Infinity,ease:'easeInOut'}}
                style={{position:'absolute',left:'50%',bottom:0,transform:'translateX(-50%)',width:'min(30vw,16.9vh)',objectFit:'contain',objectPosition:'bottom',pointerEvents:'none',filter:'drop-shadow(0 min(2vw,1.1vh) min(5vw,2.8vh) rgba(0,0,0,0.5))',zIndex:6}}
              />

              {/* Instrucción de tiro */}
              {phase==='shoot_aim'&&(
                <motion.div animate={{opacity:[0.6,1,0.6]}} transition={{duration:1.5,repeat:Infinity}}
                  style={{position:'absolute',bottom:'min(26vw,14.6vh)',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:9,textAlign:'center'}}
                >
                  <span style={{fontFamily:'var(--font-display)',fontSize:'min(3.8vw,2.1vh)',color:'rgba(0,182,237,0.9)',textShadow:'0 0 10px rgba(0,182,237,0.8)',textTransform:'uppercase'}}>
                    {hoverZone!==null?`Zona ${ZONES[hoverZone].label} · ${ZONES[hoverZone].name}`:'👆 Desliza hacia el arco'}
                  </span>
                </motion.div>
              )}

              {/* Confirmación de zona */}
              {phase==='shoot_confirm'&&aimZone!==null&&(
                <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:280}}
                  style={{position:'absolute',bottom:'min(26vw,14.6vh)',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:9}}
                >
                  <div style={{background:`${ZONES[aimZone].col}cc`,borderRadius:99,padding:'min(1.5vw,0.85vh) min(4vw,2.2vh)',boxShadow:`0 0 min(4vw,2.2vh) ${ZONES[aimZone].col}`}}>
                    <span style={{fontFamily:'var(--font-display)',fontSize:'min(4.5vw,2.5vh)',color:'white',textTransform:'uppercase'}}>
                      🎯 Zona {ZONES[aimZone].label} · {ZONES[aimZone].name}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Panel inferior ─────────────────────────────────── */}
          <div style={{flexShrink:0,zIndex:10,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(6px)'}}>

            {/* Barra de precisión — fases de disparo */}
            <AnimatePresence>
              {(phase==='shoot_timing'||phase==='shoot_confirm'||phase==='shoot_result'||phase==='shoot_firing')&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  style={{padding:'min(2vw,1.1vh) min(5vw,2.8vh) min(1.5vw,0.85vh)',overflow:'hidden'}}
                >
                  <p style={{fontFamily:'var(--font-display)',fontSize:'min(3.8vw,2.1vh)',color:phase==='shoot_timing'?'#fbbf24':'rgba(255,255,255,0.35)',textTransform:'uppercase',textAlign:'center',margin:'0 0 min(1.5vw,0.85vh)',letterSpacing:'0.06em',transition:'color 0.3s'}}>
                    {phase==='shoot_confirm'?'Preparando barra...':phase==='shoot_timing'?'¡Detén la barra en verde!':'Barra de precisión'}
                  </p>
                  <div onPointerDown={phase==='shoot_timing'?stopBar:undefined}
                    style={{position:'relative',height:'min(9vw,5vh)',borderRadius:99,overflow:'hidden',cursor:phase==='shoot_timing'?'pointer':'default',border:`min(0.5vw,0.28vh) solid ${phase==='shoot_timing'?'rgba(251,191,36,0.6)':'rgba(255,255,255,0.15)'}`,boxShadow:phase==='shoot_timing'?'0 0 min(6vw,3.4vh) rgba(251,191,36,0.3)':'none',transition:'border-color 0.3s'}}
                  >
                    <div style={{display:'flex',height:'100%'}}>
                      <div style={{flex:0.20,background:'linear-gradient(90deg,#b91c1c,#ef4444)'}}/>
                      <div style={{flex:0.18,background:'linear-gradient(90deg,#d97706,#fbbf24)'}}/>
                      <div style={{flex:0.24,background:'linear-gradient(90deg,#16a34a,#22c55e,#16a34a)'}}/>
                      <div style={{flex:0.18,background:'linear-gradient(90deg,#fbbf24,#d97706)'}}/>
                      <div style={{flex:0.20,background:'linear-gradient(90deg,#ef4444,#b91c1c)'}}/>
                    </div>
                    <div style={{position:'absolute',top:'-15%',bottom:'-15%',left:`${barPos*100}%`,width:'min(1.8vw,1vh)',background:'white',borderRadius:3,transform:'translateX(-50%)',boxShadow:`0 0 min(3vw,1.7vh) ${liveBZColor},0 0 min(6vw,3.4vh) rgba(255,255,255,0.4)`,pointerEvents:'none',transition:'box-shadow 0.1s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'min(0.8vw,0.45vh)'}}>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#ef4444',fontWeight:800,flex:0.38,textAlign:'center'}}>BAJA</span>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#22c55e',fontWeight:800,flex:0.24,textAlign:'center'}}>MEJOR</span>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#ef4444',fontWeight:800,flex:0.38,textAlign:'center'}}>BAJA</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instrucción tapada */}
            <AnimatePresence>
              {isSaving&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  style={{padding:'min(1.5vw,0.85vh) min(5vw,2.8vh)',overflow:'hidden'}}
                >
                  <p style={{fontFamily:'var(--font-body)',fontSize:'min(3.5vw,2vh)',color:'rgba(255,255,255,0.55)',textTransform:'uppercase',textAlign:'center',margin:'0 0 min(0.8vw,0.45vh)',letterSpacing:'0.03em'}}>
                    La IA tira a una de las 5 zonas — adivina cuál y posiciona el portero
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón CTA */}
            <div style={{padding:'min(1.8vw,1vh) min(5vw,2.8vh) min(2.5vw,1.4vh)'}}>
              <motion.button
                onClick={()=>{
                  if(phase==='shoot_timing') stopBar();
                  else if(phase==='save_ready') commitSave();
                  else if(phase==='gameover') onGoal(totalScore);
                }}
                whileTap={{scale:0.94}}
                animate={phase==='shoot_timing'?{scale:[1,1.03,1],boxShadow:['0 6px 20px rgba(251,191,36,0.3)','0 6px 45px rgba(251,191,36,0.8)','0 6px 20px rgba(251,191,36,0.3)']}
                        :phase==='save_ready'?{boxShadow:['0 6px 20px rgba(34,197,94,0.3)','0 6px 45px rgba(34,197,94,0.8)','0 6px 20px rgba(34,197,94,0.3)']}:{}}
                transition={{duration:0.8,repeat:Infinity}}
                disabled={phase!=='shoot_timing'&&phase!=='save_ready'&&phase!=='gameover'}
                style={{
                  width:'100%',padding:'min(3.2vw,1.8vh)',
                  background:phase==='shoot_timing'?'#fbbf24':phase==='save_ready'?'#22c55e':'rgba(255,255,255,0.1)',
                  border:'none',borderRadius:99,
                  fontFamily:'var(--font-display)',fontSize:'min(6vw,3.4vh)',
                  color:phase==='shoot_timing'?'#1a1a00':'white',
                  textTransform:'uppercase',letterSpacing:'0.04em',
                  cursor:(phase==='shoot_timing'||phase==='save_ready')?'pointer':'default',
                  opacity:(phase==='shoot_aim'||phase==='shoot_confirm'||phase==='shoot_firing'||phase==='shoot_result'||phase==='save_firing'||phase==='save_result')?0.25:1,
                  transition:'background 0.3s,opacity 0.3s,color 0.3s',
                }}
              >
                {phase==='shoot_aim'     &&'⚽ Traza la trayectoria'}
                {phase==='shoot_confirm' &&'⏳ Cargando barra...'}
                {phase==='shoot_timing'  &&'⚡ ¡DETENER BARRA!'}
                {phase==='shoot_firing'  &&'🚀 Disparando...'}
                {phase==='shoot_result'  &&(isGoal?`¡Gol! +${ptsShot}pts`:'Fallido')}
                {phase==='save_ready'    &&`🧤 CONFIRMAR TAPADA · ${saveSecs}s`}
                {phase==='save_firing'   &&'💥 ¡La IA dispara!'}
                {phase==='save_result'   &&(savedOk?`¡Atajado! +${PTS.save}pts`:'Gol en contra')}
                {phase==='gameover'      &&'🎁 Reclamar mi premio'}
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
