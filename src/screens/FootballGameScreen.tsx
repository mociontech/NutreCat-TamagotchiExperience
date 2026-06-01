import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { sfx, bgStop, sfxStop } from '../utils/sounds';

// ─── Config ────────────────────────────────────────────────────────────────────
const GAME_SECS    = 30;
const SHOOT_MS     = 680;
const RESULT_MS    = 1400;
const CONFIRM_MS   = 900;
const SAVE_SECS    = 4;

const barSpeed = (t: number) => t > 22 ? 2.0 : t > 15 ? 1.6 : t > 8 ? 1.2 : 0.88;

const GREEN  = [0.44, 0.56] as const;
const YELLOW = [0.31, 0.69] as const;
const PTS    = { green: 100, yellow: 60, red: 30, save: 50 } as const;
const BASE   = { green: 0.80, yellow: 0.50, red: 0.20 }     as const;

const ZONES = [
  { id:0, x:0.12, y:0.15, label:'1', name:'Alta izq',   bonus: 0.12, col:'#ef4444' },
  { id:1, x:0.88, y:0.15, label:'2', name:'Alta der',   bonus: 0.12, col:'#ef4444' },
  { id:2, x:0.14, y:0.66, label:'3', name:'Lat. izq',   bonus: 0.04, col:'#fbbf24' },
  { id:3, x:0.86, y:0.66, label:'4', name:'Lat. der',   bonus: 0.04, col:'#fbbf24' },
  { id:4, x:0.50, y:0.50, label:'5', name:'Centro',     bonus:-0.18, col:'#00b6ed' },
] as const;

const AI_W = [0.28, 0.28, 0.18, 0.18, 0.08] as const;
const ADJ: [number,number][] = [[0,2],[1,3],[2,4],[3,4],[2,3]];

const GOL_TXT  = ['¡GOLAZO DE ESQUINA! 🎯','¡GOLAZO DE ESQUINA! 🎯','¡Bien colocado! ⚽','¡Bien colocado! ⚽','¡Gol al centro! 😅'];
const MISS_TXT = ['Esquina difícil…','Esquina difícil…','¡El portero lo atajó!','¡El portero lo atajó!','Muy al centro…'];

const diveL = (z:number) => `${8 + ZONES[z].x * 70}%`;
const diveB = (z:number) => `${Math.max(2, Math.round((1-ZONES[z].y)*70-5))}%`;

type BZ    = 'green'|'yellow'|'red';
type Phase = 'shoot_aim'|'shoot_confirm'|'shoot_timing'|'shoot_firing'|'shoot_result'|'save_ready'|'save_firing'|'save_result'|'gameover';
interface RoundR { scored:boolean; saved:boolean; }
interface Props  { onGoal:(pts:number)=>void; onBack:()=>void; }

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getBZ = (p:number):BZ => p>=GREEN[0]&&p<=GREEN[1]?'green':p>=YELLOW[0]&&p<=YELLOW[1]?'yellow':'red';

const pickAI = (lastGk:number|null):number => {
  const base=():number=>{let r=Math.random(),acc=0;for(let i=0;i<AI_W.length;i++){acc+=AI_W[i];if(r<acc)return i;}return 4;};
  if(lastGk===null||Math.random()<0.30) return base();
  const opp:Record<number,number[]>={0:[1,3],1:[0,2],2:[1,3],3:[0,2],4:[0,1]};
  const c=opp[lastGk]; return c[Math.floor(Math.random()*c.length)];
};

const goalChance=(bz:BZ,z:number)=>Math.max(0.05,Math.min(0.97,BASE[bz]+ZONES[z].bonus));
const checkSave=(gk:number,ai:number):boolean=>{
  if(gk===ai) return true;
  return ADJ.some(([a,b])=>(a===gk&&b===ai)||(a===ai&&b===gk))&&Math.random()<0.38;
};
const nearZ=(px:number,py:number,el:HTMLElement):number=>{
  const r=el.getBoundingClientRect();let best=4,bd=Infinity;
  ZONES.forEach((z,i)=>{const d=Math.hypot(px-(r.left+z.x*r.width),py-(r.top+z.y*r.height));if(d<bd){bd=d;best=i;}});
  return best;
};
const bezD=(sx:number,sy:number,ex:number,ey:number)=>{
  const cpx=(sx+ex)/2,cpy=Math.min(sy,ey)-Math.abs(sx-ex)*0.5-40;
  return `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`;
};

// ─── GameOver ─────────────────────────────────────────────────────────────────
function GameOver({score,onClaim}:{score:number;onClaim:()=>void}) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 12%',gap:'min(4vw,2.2vh)',position:'relative',zIndex:10}}>
      <motion.p initial={{y:-24,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1,type:'spring',stiffness:200}}
        style={{fontFamily:'var(--font-display)',fontSize:'min(10vw,5.6vh)',color:'white',textTransform:'uppercase',textAlign:'center',margin:0,lineHeight:1.1,textShadow:'0 0 30px rgba(255,255,255,0.6)'}}>
        ¡Tiempo<br/>terminado!
      </motion.p>
      <motion.img src="/assets/cat/cat-champion.png" alt=""
        animate={{y:[0,-14,0]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
        style={{width:'min(46vw,26vh)',objectFit:'contain',filter:'drop-shadow(0 0 min(5vw,2.8vh) rgba(255,255,255,0.5))'}}/>
      <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3}}
        style={{background:'rgba(255,255,255,0.12)',borderRadius:'min(4vw,2.2vh)',padding:'min(3.5vw,2vh) min(8vw,4.5vh)',textAlign:'center',border:'min(0.4vw,0.22vh) solid rgba(255,255,255,0.25)',backdropFilter:'blur(8px)',width:'100%',boxSizing:'border-box'}}>
        <p style={{fontFamily:'var(--font-body)',fontSize:'min(4vw,2.3vh)',color:'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 min(1vw,0.55vh)'}}>Puntos finales</p>
        <p style={{fontFamily:'var(--font-display)',fontSize:'min(16vw,9vh)',color:'white',margin:0,lineHeight:1}}>{score}</p>
      </motion.div>
      <motion.button initial={{opacity:0,y:16}}
        animate={{opacity:1,y:0,boxShadow:['0 0 20px rgba(255,255,255,0.2)','0 0 55px rgba(255,255,255,0.5)','0 0 20px rgba(255,255,255,0.2)']}}
        transition={{delay:0.5,boxShadow:{duration:1.8,repeat:Infinity}}}
        whileTap={{scale:0.94}} onClick={onClaim}
        style={{width:'100%',padding:'min(4vw,2.2vh)',background:'rgba(255,255,255,0.22)',border:'2px solid rgba(255,255,255,0.5)',borderRadius:99,fontFamily:'var(--font-display)',fontSize:'min(7vw,3.9vh)',color:'white',textTransform:'uppercase',letterSpacing:'0.04em',cursor:'pointer'}}>
        🎁 Reclamar mi premio
      </motion.button>
    </motion.div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function FootballGameScreen({onGoal,onBack}:Props) {
  const [phase,      setPhase]  = useState<Phase>('shoot_aim');
  const [timeLeft,   setTime]   = useState(GAME_SECS);
  const [totalScore, setTotal]  = useState(0);
  const [roundHist,  setHist]   = useState<RoundR[]>([]);

  const [hoverZone,  setHover]  = useState<number|null>(null);
  const [aimZone,    setAim]    = useState<number|null>(null);
  const [isDrawing,  setDraw]   = useState(false);
  const [drawEndPx,  setDEnd]   = useState<{x:number;y:number}|null>(null);
  const [barPos,     setBarPos] = useState(0);
  const [barZone,    setBarZone]= useState<BZ|null>(null);
  const [isGoal,     setIsGoal] = useState(false);
  const [ptsShot,    setPts]    = useState(0);
  const [shotKey,    setKey]    = useState(0);

  const [gkNormX,   setGkX]    = useState(0.5);
  const [gkZone,    setGkZone] = useState(4);
  const [aiZone,    setAiZone] = useState(0);
  const [saveSecs,  setSaveS]  = useState(SAVE_SECS);
  const [savedOk,   setSaved]  = useState(false);

  const [ballPx,    setBallPx] = useState({x:0,y:0});
  const [zonePxs,   setZPxs]  = useState<{x:number;y:number}[]>([]);

  const barRef      = useRef({pos:0,dir:1});
  const barSpeedRef = useRef(2.0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const goalRef     = useRef<HTMLDivElement>(null);
  const ballRef     = useRef<HTMLDivElement>(null);
  const isDragGk    = useRef(false);
  const gkZoneRef   = useRef(4);
  const aiZoneRef   = useRef(0);
  const lastGkZRef  = useRef<number|null>(null);
  const aimRef      = useRef<number|null>(null);
  const isGoalRef   = useRef(false);
  const ptsRef      = useRef(0);
  const spongeThrottle = useRef(0);

  useEffect(()=>{gkZoneRef.current=gkZone;},[gkZone]);
  useEffect(()=>{aiZoneRef.current=aiZone;},[aiZone]);
  useEffect(()=>{aimRef.current=aimZone;},[aimZone]);
  useEffect(()=>{isGoalRef.current=isGoal;},[isGoal]);
  useEffect(()=>{ptsRef.current=ptsShot;},[ptsShot]);
  useEffect(()=>{barSpeedRef.current=barSpeed(timeLeft);},[timeLeft]);

  // Cleanup al desmontar
  useEffect(()=>()=>{bgStop('ukulele');},[]);

  const measure=useCallback(()=>{
    if(!gameAreaRef.current||!goalRef.current||!ballRef.current) return;
    const aR=gameAreaRef.current.getBoundingClientRect();
    const bR=ballRef.current.getBoundingClientRect();
    const gR=goalRef.current.getBoundingClientRect();
    setBallPx({x:bR.left+bR.width/2-aR.left,y:bR.top+bR.height/2-aR.top});
    setZPxs(ZONES.map(z=>({x:gR.left+z.x*gR.width-aR.left,y:gR.top+z.y*gR.height-aR.top})));
  },[]);

  useLayoutEffect(()=>{measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[measure]);

  // Timer
  useEffect(()=>{
    if(timeLeft<=0||phase==='gameover') return;
    const t=setTimeout(()=>setTime(p=>{const n=p-1;if(n<=0)setPhase('gameover');return Math.max(0,n);}),1000);
    return()=>clearTimeout(t);
  },[timeLeft,phase]);

  // Barra
  useEffect(()=>{
    if(phase!=='shoot_timing') return;
    const TICK=16;
    const id=setInterval(()=>{
      const step=TICK/(barSpeedRef.current*1000);
      const b=barRef.current;
      b.pos+=b.dir*step;
      if(b.pos>=1){b.pos=1;b.dir=-1;} if(b.pos<=0){b.pos=0;b.dir=1;}
      setBarPos(b.pos);
    },TICK);
    return()=>clearInterval(id);
  },[phase]);

  // Confirmación → timing
  useEffect(()=>{
    if(phase!=='shoot_confirm') return;
    sfx('bling', 0.7);
    const t=setTimeout(()=>setPhase('shoot_timing'),CONFIRM_MS);
    return()=>clearTimeout(t);
  },[phase]);

  // Countdown tapada
  useEffect(()=>{
    if(phase!=='save_ready') return;
    setSaveS(SAVE_SECS);
    let rem=SAVE_SECS;
    const id=setInterval(()=>{rem--;setSaveS(rem);if(rem<=0){clearInterval(id);setPhase('save_firing');}},1000);
    return()=>clearInterval(id);
  },[phase]);

  // Resultado tapada
  useEffect(()=>{
    if(phase!=='save_result') return;
    const saved=checkSave(gkZoneRef.current,aiZoneRef.current);
    setSaved(saved);
    if(saved){setTotal(p=>p+PTS.save);sfx('correct',0.9);}
    else sfx('fail',0.8);
    setHist(h=>[...h,{scored:isGoalRef.current,saved}]);
    lastGkZRef.current=gkZoneRef.current;
  },[phase]);

  // Auto-avance resultados
  useEffect(()=>{
    if(phase!=='shoot_result'&&phase!=='save_result') return;
    const t=setTimeout(()=>{
      if(phase==='shoot_result'){
        const ai=pickAI(lastGkZRef.current);
        setAiZone(ai);aiZoneRef.current=ai;
        setGkX(0.5);setGkZone(4);gkZoneRef.current=4;
        setPhase('save_firing');
      } else {
        if(timeLeft>0) startNewRound(); else setPhase('gameover');
      }
    },RESULT_MS);
    return()=>clearTimeout(t);
  },[phase]); // eslint-disable-line

  // save_firing → save_result
  useEffect(()=>{
    if(phase!=='save_firing') return;
    sfx('kick',0.85);
    const t=setTimeout(()=>setPhase('save_result'),SHOOT_MS+250);
    return()=>clearTimeout(t);
  },[phase]);

  // gameover
  useEffect(()=>{
    if(phase!=='gameover') return;
    sfx('fanfare',0.9);
  },[phase]);

  const startNewRound=useCallback(()=>{
    setAim(null);setHover(null);setBarZone(null);setIsGoal(false);setPts(0);setDEnd(null);setDraw(false);
    setGkX(0.5);setGkZone(4);gkZoneRef.current=4;
    barRef.current={pos:0,dir:1};setBarPos(0);setKey(k=>k+1);setPhase('shoot_aim');
  },[]);

  // Draw handlers
  const onDrawDown=useCallback((e:React.PointerEvent)=>{
    if(phase!=='shoot_aim') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraw(true);setDEnd({x:e.clientX,y:e.clientY});
    if(goalRef.current) setHover(nearZ(e.clientX,e.clientY,goalRef.current));
  },[phase]);
  const onDrawMove=useCallback((e:React.PointerEvent)=>{
    if(!isDrawing||phase!=='shoot_aim') return;
    setDEnd({x:e.clientX,y:e.clientY});
    if(goalRef.current) setHover(nearZ(e.clientX,e.clientY,goalRef.current));
  },[isDrawing,phase]);
  const onDrawUp=useCallback(()=>{
    if(!isDrawing||phase!=='shoot_aim') return;
    setDraw(false);
    if(hoverZone!==null){setAim(hoverZone);barRef.current={pos:0,dir:1};setBarPos(0);setPhase('shoot_confirm');}
  },[isDrawing,phase,hoverZone]);

  // Bar stop
  const stopBar=useCallback(()=>{
    if(phase!=='shoot_timing'||aimRef.current===null) return;
    sfx('kick',1.0);
    const bz=getBZ(barRef.current.pos);
    const scored=Math.random()<goalChance(bz,aimRef.current);
    const pts=scored?PTS[bz]:0;
    setBarZone(bz);setIsGoal(scored);isGoalRef.current=scored;setPts(pts);ptsRef.current=pts;
    if(scored)setTotal(p=>p+pts);
    setPhase('shoot_firing');
    setTimeout(()=>{
      setPhase('shoot_result');
      if(scored){sfx('crowd',0.9);setTimeout(()=>sfxStop('crowd'),4000);}else sfx('fail',0.8);
    },SHOOT_MS+200);
  },[phase]);

  // GK drag
  const onGoalDown=useCallback((e:React.PointerEvent)=>{
    if(phase!=='save_ready') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);isDragGk.current=true;
  },[phase]);
  const onGoalMove=useCallback((e:React.PointerEvent)=>{
    if(!isDragGk.current||!goalRef.current||phase!=='save_ready') return;
    const r=goalRef.current.getBoundingClientRect();
    setGkX(Math.max(0.05,Math.min(0.95,(e.clientX-r.left)/r.width)));
    const z=nearZ(e.clientX,e.clientY,goalRef.current);setGkZone(z);gkZoneRef.current=z;
  },[phase]);
  const onGoalUp=useCallback(()=>{isDragGk.current=false;},[]);
  const commitSave=useCallback(()=>{if(phase!=='save_ready') return;setPhase('save_firing');},[phase]);

  // ── Derivados ─────────────────────────────────────────────────
  const liveBZC = getBZ(barPos)==='green'?'#22c55e':getBZ(barPos)==='yellow'?'#fbbf24':'#ef4444';
  const aimL    = aimZone!==null?`${8+ZONES[aimZone].x*84}%`:'50%';
  const aimB    = aimZone!==null?`${32+(1-ZONES[aimZone].y)*38}%`:'20%';
  const gkL     = `${gkNormX*82+5}%`;

  const gkLeft   = phase==='shoot_firing'||phase==='shoot_result' ? (aimZone!==null?diveL(aimZone):'38%')
                 : phase==='save_firing'||phase==='save_result'   ? diveL(aiZone) : gkL;
  const gkBottom = phase==='shoot_firing'||phase==='shoot_result' ? (aimZone!==null?diveB(aimZone):'0%')
                 : phase==='save_firing'||phase==='save_result'   ? diveB(aiZone) : '0%';
  const gkRotate = (phase==='save_firing'||phase==='save_result')&&(aiZone===0||aiZone===1) ? (aiZone===0?-28:28) : 0;

  const svgLine = (!isDrawing||hoverZone===null||zonePxs.length===0) ? null
    : bezD(ballPx.x,ballPx.y,zonePxs[hoverZone].x,zonePxs[hoverZone].y);

  const isShooting = phase==='shoot_aim'||phase==='shoot_confirm'||phase==='shoot_timing'||phase==='shoot_firing'||phase==='shoot_result';
  const isSaving   = phase==='save_ready';
  const roundNum   = roundHist.length+1;

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden',
      /* Estadio de día: cielo → tribunas → pasto */
      background:'linear-gradient(180deg, #5ba8d4 0%, #87ceeb 18%, #a8ddef 32%, #b8e0ea 38%, #5aab4a 39%, #4e9e40 55%, #3d8a32 100%)'}}>

      {/* Tribunas: filas de público con degradado */}
      <div style={{position:'absolute',top:'34%',left:0,right:0,height:'7%',
        background:'repeating-linear-gradient(90deg,rgba(220,50,50,0.7) 0px,rgba(220,50,50,0.7) 8px,rgba(255,200,50,0.7) 8px,rgba(255,200,50,0.7) 16px,rgba(30,100,200,0.7) 16px,rgba(30,100,200,0.7) 24px,rgba(50,180,80,0.7) 24px,rgba(50,180,80,0.7) 32px,rgba(220,50,50,0.7) 32px)',
        opacity:0.55,filter:'blur(2px)',pointerEvents:'none',zIndex:1}}/>
      <div style={{position:'absolute',top:'37%',left:0,right:0,height:'5%',
        background:'repeating-linear-gradient(90deg,rgba(255,255,255,0.5) 0,rgba(255,255,255,0.5) 6px,rgba(100,150,255,0.5) 6px,rgba(100,150,255,0.5) 14px,rgba(255,100,100,0.5) 14px,rgba(255,100,100,0.5) 22px)',
        opacity:0.45,filter:'blur(1px)',pointerEvents:'none',zIndex:1}}/>

      {/* Luces de estadio */}
      {[8,25,50,75,92].map((l,i)=>(
        <motion.div key={i} animate={{opacity:[0.7,1,0.7]}} transition={{duration:2+i*0.4,repeat:Infinity,delay:i*0.3}}
          style={{position:'absolute',top:`${4+(i%2)*3}%`,left:`${l}%`,width:'min(4vw,2.3vh)',height:'min(4vw,2.3vh)',borderRadius:'50%',background:'radial-gradient(circle,#fffde0 0%,#ffe97a 50%,transparent 100%)',boxShadow:'0 0 min(5vw,2.8vh) min(2.5vw,1.4vh) rgba(255,240,100,0.4)',pointerEvents:'none',zIndex:2}}/>
      ))}

      {phase==='gameover' ? (
        <GameOver score={totalScore} onClaim={()=>onGoal(totalScore)}/>
      ) : (
        <>
          {/* ── Header ───────────────────────────────────────── */}
          <div style={{flexShrink:0,zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'min(2.5vw,1.4vh) min(4vw,2.2vh)',background:'rgba(0,0,0,0.38)',backdropFilter:'blur(8px)'}}>
            <img src="/assets/ui/logo-nutre-cat.svg" alt="" style={{width:'min(18vw,10.1vh)',filter:'brightness(0) invert(1)'}}/>

            {/* Rondas */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'min(0.5vw,0.28vh)'}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'min(2.8vw,1.6vh)',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.06em'}}>Ronda {roundNum}</span>
              <div style={{display:'flex',gap:'min(1.2vw,0.68vh)'}}>
                {roundHist.slice(-6).map((r,i)=>(
                  <div key={i} style={{width:'min(3vw,1.7vh)',height:'min(3vw,1.7vh)',borderRadius:'50%',background:r.scored&&r.saved?'#22c55e':r.scored||r.saved?'#fbbf24':'#ef4444',boxShadow:`0 0 min(1.5vw,0.85vh) ${r.scored&&r.saved?'#22c55e':r.scored||r.saved?'#fbbf24':'#ef4444'}`}}/>
                ))}
                {roundHist.length===0&&<span style={{fontSize:'min(2.8vw,1.6vh)',color:'rgba(255,255,255,0.25)'}}>— — —</span>}
              </div>
            </div>

            <div style={{display:'flex',gap:'min(2vw,1.1vh)',alignItems:'center'}}>
              <motion.div animate={timeLeft<=10?{scale:[1,1.12,1]}:{}} transition={{duration:0.5,repeat:Infinity}}
                style={{background:timeLeft<=10?'#ef4444':'rgba(0,0,0,0.5)',border:`2px solid ${timeLeft<=10?'#ef4444':'rgba(255,255,255,0.3)'}`,borderRadius:99,padding:'min(1vw,0.55vh) min(3vw,1.7vh)',display:'flex',alignItems:'center',gap:'min(1vw,0.55vh)',transition:'background 0.3s,border-color 0.3s'}}>
                <span style={{fontSize:'min(3.5vw,2vh)'}}>⏱</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:'white',textTransform:'uppercase'}}>{timeLeft}s</span>
              </motion.div>
              <motion.div key={totalScore} animate={{scale:[1.15,1]}} transition={{duration:0.25}}
                style={{background:'white',borderRadius:99,padding:'min(1vw,0.55vh) min(3vw,1.7vh)',display:'flex',alignItems:'center',gap:'min(0.8vw,0.45vh)'}}>
                <span style={{fontSize:'min(3.5vw,2vh)'}}>⭐</span>
                <span style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:'#00577a'}}>{totalScore}</span>
              </motion.div>
            </div>
          </div>

          {/* ── Título + estado ───────────────────────────────── */}
          <div style={{flexShrink:0,zIndex:5,textAlign:'center',padding:'min(1.5vw,0.85vh) 4%',background:'rgba(0,0,0,0.25)'}}>
            <p style={{fontFamily:'var(--font-display)',fontSize:'min(9.5vw,5.35vh)',color:'white',textTransform:'uppercase',margin:0,lineHeight:1,textShadow:'0 2px 16px rgba(0,0,0,0.5)',letterSpacing:'0.06em'}}>
              PENALTY CAT
            </p>
            <AnimatePresence mode="wait">
              <motion.p key={phase} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:0.18}}
                style={{fontFamily:'var(--font-body)',fontSize:'min(3.5vw,1.97vh)',margin:'min(0.4vw,0.22vh) 0 0',fontWeight:800,letterSpacing:'0.04em',textTransform:'uppercase',
                  color:phase==='shoot_confirm'?ZONES[aimZone??4].col:isSaving?'#86efac':phase==='shoot_timing'?'#fde68a':'rgba(255,255,255,0.85)'}}>
                {phase==='shoot_aim'    &&'⚽ Traza el tiro con el dedo hacia el arco'}
                {phase==='shoot_confirm'&&aimZone!==null&&`🎯 Zona ${ZONES[aimZone].label} · ${ZONES[aimZone].name} — ¡Prepárate!`}
                {phase==='shoot_timing' &&`⚡ ¡Detén la barra! · Vel. ${barSpeedRef.current.toFixed(1)}x`}
                {phase==='shoot_firing' &&'🚀 ¡Disparando!'}
                {phase==='shoot_result' &&(isGoal?`${GOL_TXT[aimZone??4]} +${ptsShot}pts`:`${MISS_TXT[aimZone??4]}`)}
                {phase==='save_ready'   &&`🧤 Arrastra el portero · ${saveSecs}s`}
                {phase==='save_firing'  &&'💥 ¡La IA dispara!'}
                {phase==='save_result'  &&(savedOk?`🧤 ¡ATAJADO! +${PTS.save}pts`:'😬 ¡Gol en contra!')}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ── ÁREA DE JUEGO PRINCIPAL ───────────────────────── */}
          <div ref={gameAreaRef} style={{flex:1,position:'relative',overflow:'hidden',minHeight:0}}>

            {/* SVG overlay: trayectoria + balón IA */}
            <svg
              onPointerDown={phase==='shoot_aim'?onDrawDown:undefined}
              onPointerMove={phase==='shoot_aim'?onDrawMove:undefined}
              onPointerUp={phase==='shoot_aim'?onDrawUp:undefined}
              onPointerCancel={phase==='shoot_aim'?onDrawUp:undefined}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:30,touchAction:'none',overflow:'visible',cursor:phase==='shoot_aim'?'crosshair':'none',pointerEvents:phase==='shoot_aim'?'all':'none'}}
            >
              {svgLine&&(
                <><path d={svgLine} stroke="rgba(255,255,255,0.2)" strokeWidth="16" strokeLinecap="round" fill="none"/>
                  <path d={svgLine} stroke="white" strokeWidth="3" strokeDasharray="12 7" strokeLinecap="round" fill="none" opacity="0.85"/></>
              )}
              {hoverZone!==null&&zonePxs.length>0&&(
                <><circle cx={zonePxs[hoverZone].x} cy={zonePxs[hoverZone].y} r={26} fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="2.5"/>
                  <circle cx={zonePxs[hoverZone].x} cy={zonePxs[hoverZone].y} r={7} fill="white"/></>
              )}
              {/* Balón IA en save_firing */}
              {phase==='save_firing'&&zonePxs.length>0&&(
                <motion.g initial={{x:ballPx.x,y:ballPx.y,scale:1}} animate={{x:zonePxs[aiZone].x,y:zonePxs[aiZone].y,scale:0.55}} transition={{duration:SHOOT_MS/1000,ease:[0.4,0,1,1]}}>
                  <circle r={16} fill="white"/>
                  <circle r={16} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
                  {/* Estela */}
                  <circle r={12} fill="rgba(255,80,80,0.4)" cx={-22} cy={10}/>
                  <circle r={8}  fill="rgba(255,80,80,0.25)" cx={-42} cy={20}/>
                </motion.g>
              )}
            </svg>

            {/* ── ARCO — grande, ocupa casi todo el ancho ───── */}
            <div ref={goalRef}
              onPointerDown={onGoalDown} onPointerMove={onGoalMove}
              onPointerUp={onGoalUp} onPointerCancel={onGoalUp}
              style={{
                position:'absolute', top:'2%', left:'2%', right:'2%',
                height:'44%',
                /* Marco del arco: postes blancos gruesos */
                border:'min(2vw,1.1vh) solid white',
                borderBottom:'none',
                borderRadius:'min(1.2vw,0.68vh) min(1.2vw,0.68vh) 0 0',
                boxShadow:'inset 0 0 0 min(0.6vw,0.34vh) rgba(255,255,255,0.15), 0 0 min(3vw,1.7vh) rgba(0,0,0,0.4)',
                background:'rgba(5,20,50,0.5)',
                overflow:'hidden',
                touchAction:'none',
                cursor:isSaving?'grab':'default',
                zIndex:5,
              }}>
              {/* Red */}
              <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.1) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,0.1) 1.5px,transparent 1.5px)',backgroundSize:'12.5% 20%',pointerEvents:'none'}}/>
              {/* Sombra interior del arco */}
              <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,transparent 50%,rgba(0,0,0,0.25) 100%)',pointerEvents:'none'}}/>

              {/* 5 zonas — grandes y claramente visibles */}
              {ZONES.map((z,i)=>{
                const isHov  = hoverZone===i&&phase==='shoot_aim';
                const isConf = aimZone===i&&phase==='shoot_confirm';
                const isAim  = aimZone===i&&(phase==='shoot_timing'||phase==='shoot_firing'||phase==='shoot_result');
                const isAiZ  = aiZone===i&&(phase==='save_firing'||phase==='save_result');
                const isGkZ  = gkZone===i&&(isSaving||phase==='save_firing'||phase==='save_result');
                const lit    = isHov||isConf||isAim;
                return (
                  <div key={i} style={{position:'absolute',left:`${z.x*100}%`,top:`${z.y*100}%`,transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:4}}>
                    <motion.div
                      animate={isConf?{scale:[1,1.5,1],opacity:[0.8,1,0.8]}:isHov?{scale:[1,1.25,1]}:isAim?{scale:[1,1.08,1]}:{}}
                      transition={{duration:0.55,repeat:Infinity}}
                      style={{width:'min(14vw,7.9vh)',height:'min(14vw,7.9vh)',borderRadius:'50%',
                        border:`min(0.8vw,0.45vh) solid ${lit?z.col:isGkZ?'#86efac':'rgba(255,255,255,0.35)'}`,
                        background:lit?`${z.col}28`:isGkZ?'rgba(134,239,172,0.15)':'rgba(255,255,255,0.06)',
                        boxShadow:lit?`0 0 min(5vw,2.8vh) ${z.col},0 0 min(10vw,5.6vh) ${z.col}55`:isGkZ?'0 0 min(3vw,1.7vh) #86efac':'none',
                        display:'flex',alignItems:'center',justifyContent:'center',transition:'border-color 0.2s,background 0.2s'}}
                    >
                      <span style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:lit?z.col:isGkZ?'#86efac':'rgba(255,255,255,0.5)',fontWeight:900,textShadow:lit?`0 0 8px ${z.col}`:''}}>{z.label}</span>
                    </motion.div>
                    {isAiZ&&(
                      <motion.div initial={{scale:0,opacity:0}} animate={{scale:[0,1.7,1.3],opacity:[0,1,0.8]}} transition={{duration:0.4}}
                        style={{position:'absolute',inset:'-40%',borderRadius:'50%',border:'3px solid #ff4444',boxShadow:'0 0 25px #ff4444',pointerEvents:'none'}}/>
                    )}
                  </div>
                );
              })}

              {/* ─ Portero: gato rival en VERDE ─ */}
              <motion.img
                src="/assets/cat/cat-hub.png" alt="Portero"
                animate={{left:gkLeft, bottom:gkBottom, rotate:gkRotate,
                  scaleX:(isSaving||phase==='save_firing'||phase==='save_result')&&gkNormX<0.35?-1:1}}
                transition={{duration:phase==='shoot_firing'?0.28:0.20,ease:'easeOut'}}
                style={{position:'absolute',bottom:0,width:'min(22vw,12.4vh)',objectFit:'contain',pointerEvents:'none',zIndex:5,
                  /* Gato rival → color verde de portero */
                  filter:'hue-rotate(95deg) saturate(2) brightness(1.05)',
                  transformOrigin:'bottom center'}}
              />

              {/* Overlay resultado en arco */}
              <AnimatePresence>
                {(phase==='shoot_result'||phase==='save_result')&&(
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{position:'absolute',inset:0,background:(phase==='shoot_result'?isGoal:savedOk)?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:8}}>
                    <motion.p initial={{scale:0,rotate:-10}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:320}}
                      style={{fontFamily:'var(--font-display)',fontSize:'min(14vw,7.9vh)',color:(phase==='shoot_result'?isGoal:savedOk)?'#4ade80':'#f87171',textTransform:'uppercase',margin:0,textShadow:`0 0 min(6vw,3.4vh) ${(phase==='shoot_result'?isGoal:savedOk)?'#4ade80':'#f87171'}`}}>
                      {phase==='shoot_result'?(isGoal?'¡GOOOL!':'FALLIDO'):(savedOk?'¡ATAJADO!':'GOL')}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Instrucción arrastra portero */}
              {isSaving&&(
                <motion.div animate={{opacity:[0.75,1,0.75]}} transition={{duration:1.1,repeat:Infinity}}
                  style={{position:'absolute',top:6,left:'50%',transform:'translateX(-50%)',background:'rgba(21,128,61,0.85)',borderRadius:99,padding:'min(0.8vw,0.45vh) min(3vw,1.7vh)',whiteSpace:'nowrap',zIndex:9,pointerEvents:'none'}}>
                  <span style={{fontFamily:'var(--font-display)',fontSize:'min(3vw,1.7vh)',color:'white',textTransform:'uppercase'}}>
                    🧤 Arrastra · {saveSecs}s · Zona {ZONES[gkZone].label}: {ZONES[gkZone].name}
                  </span>
                </motion.div>
              )}
            </div>

            {/* ── CAMPO: perspectiva de campo entre gato y arco ── */}
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:'52%',
              background:'linear-gradient(180deg,#3a8a2e 0%,#4ca83c 30%,#5ab844 60%,#4ea83a 100%)',overflow:'hidden',zIndex:3}}>
              {/* Líneas del campo */}
              <div style={{position:'absolute',top:0,left:'6%',right:'6%',height:'min(5vw,2.8vh)',borderLeft:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',borderRight:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',borderBottom:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
              {/* Punto de penalti */}
              <div style={{position:'absolute',top:'min(8vw,4.5vh)',left:'50%',transform:'translateX(-50%)',width:'min(3vw,1.7vh)',height:'min(3vw,1.7vh)',borderRadius:'50%',background:'rgba(255,255,255,0.6)',boxShadow:'0 0 min(2vw,1.1vh) rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
              {/* Sombra del arco hacia abajo (perspectiva) */}
              <div style={{position:'absolute',top:0,left:'2%',right:'2%',height:'15%',background:'linear-gradient(180deg,rgba(0,0,0,0.25) 0%,transparent 100%)',pointerEvents:'none'}}/>

              {/* Balón del usuario */}
              <motion.div ref={ballRef} key={`ball-${shotKey}`}
                animate={phase==='shoot_firing'?{left:aimL,bottom:aimB,scale:[1,0.45],opacity:[1,0.7]}:{}}
                transition={{duration:SHOOT_MS/1000,ease:[0.4,0,1,1]}}
                style={{position:'absolute',left:'50%',bottom:'min(22vw,12.4vh)',transform:'translateX(-50%)',width:'min(10vw,5.6vh)',height:'min(10vw,5.6vh)',borderRadius:'50%',background:'radial-gradient(circle at 35% 32%,white 0%,#ddd 40%,#888 100%)',boxShadow:'0 min(2vw,1.1vh) min(5vw,2.8vh) rgba(0,0,0,0.45)',zIndex:8}}>
                {/* Patrón del balón */}
                <div style={{position:'absolute',top:'25%',left:'15%',width:'30%',height:'30%',background:'#333',borderRadius:'50%',opacity:0.7}}/>
                <div style={{position:'absolute',top:'15%',right:'20%',width:'20%',height:'20%',background:'#333',borderRadius:'50%',opacity:0.5}}/>
              </motion.div>

              {/* Estela del usuario */}
              {phase==='shoot_firing'&&[0.25,0.5,0.75].map((t,i)=>(
                <motion.div key={`tr${i}`} initial={{opacity:0.7}} animate={{opacity:0}} transition={{duration:0.3,delay:i*0.06}}
                  style={{position:'absolute',left:`calc(50% + ${(parseFloat(aimL)-50)*t}%)`,bottom:`calc(${parseFloat('min(22vw, 12.4vh)'.split(',')[0].slice(4))*(1-t)+parseFloat(aimB)*t}%)`,width:'min(8vw,4.5vh)',height:'min(8vw,4.5vh)',borderRadius:'50%',background:'rgba(255,255,255,0.4)',transform:'translate(-50%,50%)',pointerEvents:'none',zIndex:7}}/>
              ))}

              {/* Gato jugador */}
              <motion.img src="/assets/cat/cat-game.png" alt="Simón"
                animate={phase==='shoot_firing'?{rotate:[0,20],y:[0,-10]}:{rotate:0,y:[0,-6,0]}}
                transition={phase==='shoot_firing'?{duration:0.28}:{duration:3,repeat:Infinity,ease:'easeInOut'}}
                style={{position:'absolute',left:'50%',bottom:0,transform:'translateX(-50%)',width:'min(32vw,18vh)',objectFit:'contain',objectPosition:'bottom',pointerEvents:'none',filter:'drop-shadow(0 min(2vw,1.1vh) min(5vw,2.8vh) rgba(0,0,0,0.4))',zIndex:6}}/>

              {/* Instrucción de tiro */}
              {phase==='shoot_aim'&&(
                <motion.div animate={{opacity:[0.6,1,0.6]}} transition={{duration:1.4,repeat:Infinity}}
                  style={{position:'absolute',bottom:'min(28vw,15.7vh)',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:9}}>
                  <span style={{fontFamily:'var(--font-display)',fontSize:'min(4vw,2.3vh)',color:'white',textShadow:'0 2px 8px rgba(0,0,0,0.5)',textTransform:'uppercase'}}>
                    {hoverZone!==null?`Zona ${ZONES[hoverZone].label} · ${ZONES[hoverZone].name}`:'👆 Desliza hacia el arco'}
                  </span>
                </motion.div>
              )}
              {phase==='shoot_confirm'&&aimZone!==null&&(
                <motion.div initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:280}}
                  style={{position:'absolute',bottom:'min(28vw,15.7vh)',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:9}}>
                  <div style={{background:`${ZONES[aimZone].col}cc`,borderRadius:99,padding:'min(1.5vw,0.85vh) min(4vw,2.2vh)',boxShadow:`0 0 min(4vw,2.2vh) ${ZONES[aimZone].col}`}}>
                    <span style={{fontFamily:'var(--font-display)',fontSize:'min(4.5vw,2.5vh)',color:'white',textTransform:'uppercase'}}>🎯 Zona {ZONES[aimZone].label} · {ZONES[aimZone].name}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Controles ─────────────────────────────────────── */}
          <div style={{flexShrink:0,zIndex:10,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(8px)'}}>

            {/* Barra de precisión */}
            <AnimatePresence>
              {(phase==='shoot_timing'||phase==='shoot_confirm'||phase==='shoot_result'||phase==='shoot_firing')&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  style={{padding:'min(1.8vw,1vh) min(5vw,2.8vh) min(1.2vw,0.68vh)',overflow:'hidden'}}>
                  <p style={{fontFamily:'var(--font-display)',fontSize:'min(3.8vw,2.1vh)',color:phase==='shoot_timing'?'#fde68a':'rgba(255,255,255,0.4)',textTransform:'uppercase',textAlign:'center',margin:'0 0 min(1.2vw,0.68vh)',letterSpacing:'0.06em',transition:'color 0.3s'}}>
                    {phase==='shoot_confirm'?'Preparando barra…':phase==='shoot_timing'?'¡Detén la barra en verde!':'Barra de precisión'}
                  </p>
                  <div onPointerDown={phase==='shoot_timing'?stopBar:undefined}
                    style={{position:'relative',height:'min(9vw,5vh)',borderRadius:99,overflow:'hidden',cursor:phase==='shoot_timing'?'pointer':'default',border:`min(0.5vw,0.28vh) solid ${phase==='shoot_timing'?'rgba(253,230,138,0.6)':'rgba(255,255,255,0.15)'}`,boxShadow:phase==='shoot_timing'?'0 0 min(6vw,3.4vh) rgba(253,230,138,0.3)':'none',transition:'border-color 0.3s'}}>
                    <div style={{display:'flex',height:'100%'}}>
                      <div style={{flex:0.20,background:'linear-gradient(90deg,#b91c1c,#ef4444)'}}/>
                      <div style={{flex:0.18,background:'linear-gradient(90deg,#d97706,#fbbf24)'}}/>
                      <div style={{flex:0.24,background:'linear-gradient(90deg,#15803d,#22c55e,#15803d)'}}/>
                      <div style={{flex:0.18,background:'linear-gradient(90deg,#fbbf24,#d97706)'}}/>
                      <div style={{flex:0.20,background:'linear-gradient(90deg,#ef4444,#b91c1c)'}}/>
                    </div>
                    <div style={{position:'absolute',top:'-15%',bottom:'-15%',left:`${barPos*100}%`,width:'min(2vw,1.1vh)',background:'white',borderRadius:3,transform:'translateX(-50%)',boxShadow:`0 0 min(3vw,1.7vh) ${liveBZC},0 0 min(7vw,3.9vh) rgba(255,255,255,0.5)`,pointerEvents:'none',transition:'box-shadow 0.1s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'min(0.8vw,0.45vh)'}}>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#f87171',fontWeight:800,flex:0.38,textAlign:'center'}}>BAJA</span>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#4ade80',fontWeight:800,flex:0.24,textAlign:'center'}}>MEJOR</span>
                    <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.5vh)',color:'#f87171',fontWeight:800,flex:0.38,textAlign:'center'}}>BAJA</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Instrucción tapada */}
            <AnimatePresence>
              {isSaving&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
                  style={{padding:'min(1.2vw,0.68vh) min(5vw,2.8vh)',overflow:'hidden',textAlign:'center'}}>
                  <p style={{fontFamily:'var(--font-body)',fontSize:'min(3.2vw,1.8vh)',color:'rgba(255,255,255,0.55)',textTransform:'uppercase',margin:0,letterSpacing:'0.03em'}}>
                    La IA tira a una de las 5 zonas — adivina cuál
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
                animate={phase==='shoot_timing'?{scale:[1,1.03,1],boxShadow:['0 4px 20px rgba(253,230,138,0.3)','0 4px 40px rgba(253,230,138,0.8)','0 4px 20px rgba(253,230,138,0.3)']}
                        :phase==='save_ready'?{boxShadow:['0 4px 20px rgba(74,222,128,0.3)','0 4px 40px rgba(74,222,128,0.8)','0 4px 20px rgba(74,222,128,0.3)']}:{}}
                transition={{duration:0.8,repeat:Infinity}}
                disabled={phase!=='shoot_timing'&&phase!=='save_ready'&&phase!=='gameover'}
                style={{
                  width:'100%',padding:'min(3.2vw,1.8vh)',
                  background:phase==='shoot_timing'?'#fbbf24':phase==='save_ready'?'#16a34a':'rgba(255,255,255,0.1)',
                  border:'none',borderRadius:99,
                  fontFamily:'var(--font-display)',fontSize:'min(6vw,3.4vh)',
                  color:phase==='shoot_timing'?'#1a0a00':'white',
                  textTransform:'uppercase',letterSpacing:'0.04em',
                  cursor:(phase==='shoot_timing'||phase==='save_ready')?'pointer':'default',
                  opacity:(phase==='shoot_aim'||phase==='shoot_confirm'||phase==='shoot_firing'||phase==='shoot_result'||phase==='save_firing'||phase==='save_result')?0.25:1,
                  transition:'background 0.3s,opacity 0.3s,color 0.3s',
                }}>
                {phase==='shoot_aim'    &&'⚽ Traza la trayectoria hacia arriba'}
                {phase==='shoot_confirm'&&'⏳ Cargando barra…'}
                {phase==='shoot_timing' &&'⚡ ¡DETENER BARRA!'}
                {phase==='shoot_firing' &&'🚀 Disparando…'}
                {phase==='shoot_result' &&(isGoal?`¡Gol! +${ptsShot}pts — ahora a atajar`:'Fallido — ahora a atajar')}
                {phase==='save_ready'   &&`🧤 CONFIRMAR TAPADA · ${saveSecs}s`}
                {phase==='save_firing'  &&'💥 ¡La IA dispara!'}
                {phase==='save_result'  &&(savedOk?`¡Atajado! +${PTS.save}pts`:'Gol en contra')}
                {phase==='gameover'     &&'🎁 Reclamar mi premio'}
              </motion.button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
