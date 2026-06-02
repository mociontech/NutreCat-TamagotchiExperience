import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { sfx, bgStop, sfxStop } from '../utils/sounds';

// ─── Config ────────────────────────────────────────────────────────────────────
const N_PENS       = 5;
const SHOOT_MS     = 560;
const RESULT_MS    = 1800;
const INTRO_MS     = 1100;
const SAVE_SECS    = 5;
const PTS_GOAL     = 50;
const PTS_SAVE     = 30;

// Bar: narrower green zone + faster speed
const GREEN  = [0.465, 0.535] as const;  // 7% success zone
const YELLOW = [0.35,  0.65 ] as const;
const BSPEED = 2.6;

// Save: GK cover radius (normalized 0-1 within goal width)
const GK_COVER = 0.13;

type BZ      = 'green'|'yellow'|'red';
type Outcome = null|boolean;              // null=pending, true=scored, false=missed
type Phase   =
  | 'aim'          // player draws trajectory to goal
  | 'timing'       // precision bar
  | 'firing'       // ball in flight
  | 'kick_result'  // flash goal/miss
  | 'save_intro'   // "¡Ahora defiende!" splash
  | 'save_ready'   // player drags GK
  | 'save_fire'    // machine ball flies
  | 'save_result'  // flash save/goal
  | 'gameover';

interface Props { onGoal:(pts:number)=>void; }

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getBZ = (p:number):BZ =>
  p>=GREEN[0]&&p<=GREEN[1]?'green':p>=YELLOW[0]&&p<=YELLOW[1]?'yellow':'red';

const rnd = (a:number,b:number) => a+Math.random()*(b-a);

// Machine GK: decides where to dive after player commits target
const gkAI = (tx:number):number => {
  const r = Math.random();
  if(r<0.35) return Math.max(0.04,Math.min(0.96,tx+rnd(-0.10,0.10)));  // ~correct
  if(r<0.65) return tx>0.5?rnd(0.04,0.28):rnd(0.72,0.96);              // wrong side
  return rnd(0.38,0.62);                                                  // stays center
};

// Machine picks shot target (biased toward corners)
const machinePick = ():number => {
  const r = Math.random();
  return r<0.38?rnd(0.05,0.22):r<0.76?rnd(0.78,0.95):rnd(0.38,0.62);
};

// Resolve player's kick
const resolveKick = (bz:BZ, tx:number, gkX:number):boolean => {
  const covered = Math.abs(tx-gkX)<GK_COVER;
  const base    = bz==='green'?0.92:bz==='yellow'?0.62:0.28;
  return Math.random()<(covered?base*0.14:base);
};

// Resolve player save
const resolveSave = (gkX:number, mTx:number):boolean =>
  Math.abs(gkX-mTx)<GK_COVER+0.01;

// ─── Penalty dots ──────────────────────────────────────────────────────────────
function PenaltyDots({outcomes,reverse}:{outcomes:Outcome[];reverse?:boolean}) {
  const dots = Array.from({length:N_PENS},(_,i)=>outcomes[i]??null);
  const row  = reverse?[...dots].reverse():dots;
  return (
    <div style={{display:'flex',gap:'min(1.8vw,1vh)',alignItems:'center'}}>
      {row.map((o,i)=>(
        <div key={i} style={{
          width:'min(4vw,2.25vh)',height:'min(4vw,2.25vh)',borderRadius:'50%',
          background:o===null?'rgba(255,255,255,0.16)':o?'#22c55e':'#ef4444',
          border:`min(0.4vw,0.22vh) solid ${o===null?'rgba(255,255,255,0.35)':o?'#4ade80':'#f87171'}`,
          boxShadow:o===true?'0 0 min(2vw,1.1vh) #22c55e80':o===false?'0 0 min(2vw,1.1vh) #ef444480':'none',
          transition:'background 0.35s,box-shadow 0.35s',
        }}/>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function FootballGameScreen({onGoal}:Props) {
  const [phase,      setPhase]   = useState<Phase>('aim');
  const [round,      setRound]   = useState(0);
  const [pOuts,      setPOuts]   = useState<Outcome[]>(Array(N_PENS).fill(null));
  const [mOuts,      setMOuts]   = useState<Outcome[]>(Array(N_PENS).fill(null));
  const [totalPts,   setTotalPts]= useState(0);

  // Aim / bar
  const [barPos,     setBarPos]  = useState(0);
  const [isDrawing,  setDraw]    = useState(false);
  const [fingerPx,   setFinger]  = useState<{x:number;y:number}|null>(null);
  const [targetNX,   setTargetNX]= useState<number|null>(null);  // norm x in goal
  const [targetPx,   setTargetPx]= useState<{x:number;y:number}|null>(null); // game-area px
  const [gkAIPosNX,  setGkAIPosNX]= useState(0.5);   // machine GK norm x during player kick
  const [kickScored, setKickScored]= useState(false);

  // Save
  const [gkNX,       setGkNX]    = useState(0.5);   // player GK norm x
  const [saveSecs,   setSaveSecs] = useState(SAVE_SECS);
  const [mTargetNX,  setMTargetNX]= useState(0.5);  // machine shot norm x
  const [mTargetPx,  setMTargetPx]= useState<{x:number;y:number}|null>(null);
  const [savedOk,    setSavedOk]  = useState(false);

  // Measurements
  const [ballPx,     setBallPx]  = useState({x:0,y:0});
  const [goalBounds, setGoalBounds]= useState({left:0,top:0,right:0,bottom:0,width:0,height:0});

  // Refs
  const barRef      = useRef({pos:0,dir:1});
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const goalDivRef  = useRef<HTMLDivElement>(null);
  const ballDivRef  = useRef<HTMLDivElement>(null);
  const gkNXRef     = useRef(0.5);
  const isDragGK    = useRef(false);
  const phaseRef    = useRef<Phase>('aim');

  useEffect(()=>{gkNXRef.current=gkNX;},[gkNX]);
  useEffect(()=>{phaseRef.current=phase;},[phase]);
  useEffect(()=>()=>{bgStop('ukulele');},[]);

  // ── Measure positions ───────────────────────────────────────────────────────
  const measure = useCallback(()=>{
    const ga=gameAreaRef.current; const gd=goalDivRef.current; const bd=ballDivRef.current;
    if(!ga||!gd||!bd) return;
    const gaR=ga.getBoundingClientRect();
    const gdR=gd.getBoundingClientRect();
    const bdR=bd.getBoundingClientRect();
    setBallPx({x:bdR.left+bdR.width/2-gaR.left, y:bdR.top+bdR.height/2-gaR.top});
    setGoalBounds({
      left:gdR.left-gaR.left, top:gdR.top-gaR.top,
      right:gdR.right-gaR.left, bottom:gdR.bottom-gaR.top,
      width:gdR.width, height:gdR.height,
    });
  },[]);
  useLayoutEffect(()=>{measure();window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);},[measure]);

  // machine target px derived from goalBounds
  useEffect(()=>{
    if(goalBounds.width===0) return;
    setMTargetPx({
      x: goalBounds.left + mTargetNX*goalBounds.width,
      y: goalBounds.top  + goalBounds.height*0.55,
    });
  },[mTargetNX,goalBounds]);

  // ── Bar animation ───────────────────────────────────────────────────────────
  useEffect(()=>{
    if(phase!=='timing') return;
    const TICK=16;
    const id=setInterval(()=>{
      const b=barRef.current;
      b.pos+=b.dir*TICK/(BSPEED*1000);
      if(b.pos>=1){b.pos=1;b.dir=-1;} if(b.pos<=0){b.pos=0;b.dir=1;}
      setBarPos(b.pos);
    },TICK);
    return()=>clearInterval(id);
  },[phase]);

  // ── Save countdown ──────────────────────────────────────────────────────────
  useEffect(()=>{
    if(phase!=='save_ready') return;
    setSaveSecs(SAVE_SECS);
    let rem=SAVE_SECS;
    const id=setInterval(()=>{
      rem--;setSaveSecs(rem);
      if(rem<=0){clearInterval(id);triggerSaveFire();}
    },1000);
    return()=>clearInterval(id);
  },[phase]); // eslint-disable-line

  // ── Phase effects ───────────────────────────────────────────────────────────
  // firing → kick_result
  useEffect(()=>{
    if(phase!=='firing') return;
    const t=setTimeout(()=>setPhase('kick_result'),SHOOT_MS+150);
    return()=>clearTimeout(t);
  },[phase]);

  // kick_result → save_intro
  useEffect(()=>{
    if(phase!=='kick_result') return;
    const t=setTimeout(()=>{
      const mx=machinePick();
      setMTargetNX(mx);
      setGkNX(0.5); gkNXRef.current=0.5;
      setPhase('save_intro');
    },RESULT_MS);
    return()=>clearTimeout(t);
  },[phase]);

  // save_intro → save_ready
  useEffect(()=>{
    if(phase!=='save_intro') return;
    const t=setTimeout(()=>setPhase('save_ready'),INTRO_MS);
    return()=>clearTimeout(t);
  },[phase]);

  // save_fire → save_result
  useEffect(()=>{
    if(phase!=='save_fire') return;
    const t=setTimeout(()=>{
      const saved=resolveSave(gkNXRef.current,mTargetNX);
      setSavedOk(saved);
      if(saved){setTotalPts(p=>p+PTS_SAVE);sfx('correct',0.85);}
      else sfx('fail',0.8);
      setMOuts(prev=>{const n=[...prev];n[round]=!saved;return n;});
      setPhase('save_result');
    },SHOOT_MS+250);
    return()=>clearTimeout(t);
  },[phase,mTargetNX,round]);

  // save_result → next round or gameover
  useEffect(()=>{
    if(phase!=='save_result') return;
    const t=setTimeout(()=>{
      const next=round+1;
      if(next>=N_PENS){sfx('fanfare',0.9);setPhase('gameover');}
      else{setRound(next);startNewRound();setPhase('aim');}
    },RESULT_MS);
    return()=>clearTimeout(t);
  },[phase,round]);

  const startNewRound=useCallback(()=>{
    setTargetNX(null);setTargetPx(null);
    setFinger(null);setDraw(false);
    setGkAIPosNX(0.5);
    barRef.current={pos:0,dir:1};setBarPos(0);
  },[]);

  // ── Trigger save fire ───────────────────────────────────────────────────────
  const triggerSaveFire=useCallback(()=>{
    if(phaseRef.current!=='save_ready') return;
    sfx('kick',0.85);
    setPhase('save_fire');
  },[]);

  const commitSave=useCallback(()=>{ triggerSaveFire(); },[triggerSaveFire]);

  // ── Drawing handlers (player aims) ──────────────────────────────────────────
  const onSvgDown=useCallback((e:React.PointerEvent<SVGSVGElement>)=>{
    if(phase!=='aim') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ga=gameAreaRef.current!.getBoundingClientRect();
    setDraw(true);
    setFinger({x:e.clientX-ga.left, y:e.clientY-ga.top});
  },[phase]);

  const onSvgMove=useCallback((e:React.PointerEvent<SVGSVGElement>)=>{
    if(!isDrawing||phase!=='aim') return;
    const ga=gameAreaRef.current!.getBoundingClientRect();
    setFinger({x:e.clientX-ga.left, y:e.clientY-ga.top});
  },[isDrawing,phase]);

  const onSvgUp=useCallback((e:React.PointerEvent<SVGSVGElement>)=>{
    if(!isDrawing||phase!=='aim') return;
    setDraw(false);
    const ga=gameAreaRef.current!.getBoundingClientRect();
    const fx=e.clientX-ga.left; const fy=e.clientY-ga.top;
    const gb=goalBounds;
    // Commit if released inside/near goal
    if(fx>=gb.left-20&&fx<=gb.right+20&&fy>=gb.top-20&&fy<=gb.bottom+20) {
      const nx=Math.max(0.03,Math.min(0.97,(fx-gb.left)/gb.width));
      setTargetNX(nx);
      setTargetPx({x:fx,y:fy});
      setFinger(null);
      setGkAIPosNX(gkAI(nx));
      barRef.current={pos:0,dir:1};setBarPos(0);
      setPhase('timing');
    } else {
      setFinger(null); // reset, player must try again
    }
  },[isDrawing,phase,goalBounds]);

  // ── Stop bar ────────────────────────────────────────────────────────────────
  const stopBar=useCallback(()=>{
    if(phase!=='timing'||targetNX===null) return;
    sfx('kick',1.0);
    const bz=getBZ(barRef.current.pos);
    const scored=resolveKick(bz,targetNX,gkAIPosNX);
    setKickScored(scored);
    if(scored){
      setTotalPts(p=>p+PTS_GOAL);
      sfx('crowd',0.85);
      setTimeout(()=>sfxStop('crowd'),4000);
    }
    setPOuts(prev=>{const n=[...prev];n[round]=scored;return n;});
    setPhase('firing');
  },[phase,targetNX,gkAIPosNX,round]);

  // ── GK drag (save phase) ────────────────────────────────────────────────────
  const onGoalDown=useCallback((e:React.PointerEvent)=>{
    if(phase!=='save_ready') return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isDragGK.current=true;
  },[phase]);
  const onGoalMove=useCallback((e:React.PointerEvent)=>{
    if(!isDragGK.current||!goalDivRef.current) return;
    const r=goalDivRef.current.getBoundingClientRect();
    setGkNX(Math.max(0.04,Math.min(0.96,(e.clientX-r.left)/r.width)));
  },[]);
  const onGoalUp=useCallback(()=>{isDragGK.current=false;},[]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const bZone   = getBZ(barPos);
  const barColor= bZone==='green'?'#22c55e':bZone==='yellow'?'#fbbf24':'#ef4444';
  const pScore  = pOuts.filter(x=>x===true).length;
  const mScore  = mOuts.filter(x=>x===true).length;

  // SVG bezier from ball to finger
  const svgLine = (isDrawing&&fingerPx)
    ? `M ${ballPx.x} ${ballPx.y} Q ${(ballPx.x+fingerPx.x)/2+(fingerPx.y-ballPx.y)*0.06} ${(ballPx.y+fingerPx.y)/2-Math.abs(ballPx.x-fingerPx.x)*0.22-25} ${fingerPx.x} ${fingerPx.y}`
    : null;

  // Ball firing target (game-area px)
  const fireTx = targetPx?.x ?? goalBounds.left+goalBounds.width*0.5;
  const fireTy = targetPx?.y ?? goalBounds.top+goalBounds.height*0.5;

  const inKickPhase = phase==='aim'||phase==='timing'||phase==='firing'||phase==='kick_result';
  const inSavePhase = phase==='save_intro'||phase==='save_ready'||phase==='save_fire'||phase==='save_result';

  if(phase==='gameover') {
    const tie  = pScore===mScore;
    const win  = pScore>mScore;
    return (
      <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'min(4vw,2.2vh)',
        background:'linear-gradient(180deg,#5ba8d4 0%,#87ceeb 32%,#5aab4a 80%,#3d8a32 100%)',position:'relative',overflow:'hidden',padding:'0 10%',boxSizing:'border-box'}}>
        <motion.p initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1,type:'spring',stiffness:240}}
          style={{fontFamily:'var(--font-display)',fontSize:'min(12vw,6.75vh)',color:'white',textTransform:'uppercase',textAlign:'center',margin:0,lineHeight:1.05,
            textShadow:'0 0 30px rgba(255,255,255,0.5)'}}>
          {tie?'¡Empate!':win?'¡Ganaste!':'¡Perdiste!'}
        </motion.p>
        <motion.img src="/assets/cat/cat-champion.png" alt=""
          animate={{y:[0,-14,0]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
          style={{width:'min(44vw,24.7vh)',objectFit:'contain',filter:'drop-shadow(0 0 min(5vw,2.8vh) rgba(255,255,255,0.45))'}}/>
        {/* Final score */}
        <motion.div initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:0.3}}
          style={{background:'rgba(255,255,255,0.14)',borderRadius:'min(4vw,2.2vh)',padding:'min(3vw,1.7vh) min(8vw,4.5vh)',textAlign:'center',
            border:'min(0.4vw,0.22vh) solid rgba(255,255,255,0.28)',backdropFilter:'blur(8px)',width:'100%',boxSizing:'border-box'}}>
          <p style={{fontFamily:'var(--font-body)',fontSize:'min(3.6vw,2vh)',color:'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 min(1vw,0.55vh)'}}>Resultado final</p>
          <p style={{fontFamily:'var(--font-display)',fontSize:'min(14vw,7.9vh)',color:'white',margin:0,lineHeight:1,letterSpacing:'0.06em'}}>
            {pScore} – {mScore}
          </p>
          <div style={{display:'flex',justifyContent:'space-around',marginTop:'min(2vw,1.1vh)'}}>
            <div style={{textAlign:'center'}}>
              <PenaltyDots outcomes={pOuts}/>
              <p style={{fontFamily:'var(--font-body)',fontSize:'min(2.8vw,1.57vh)',color:'rgba(255,255,255,0.55)',margin:'min(1vw,0.55vh) 0 0',fontWeight:700,textTransform:'uppercase'}}>Tú</p>
            </div>
            <div style={{textAlign:'center'}}>
              <PenaltyDots outcomes={mOuts} reverse/>
              <p style={{fontFamily:'var(--font-body)',fontSize:'min(2.8vw,1.57vh)',color:'rgba(255,255,255,0.55)',margin:'min(1vw,0.55vh) 0 0',fontWeight:700,textTransform:'uppercase'}}>Rival</p>
            </div>
          </div>
          <p style={{fontFamily:'var(--font-display)',fontSize:'min(5vw,2.8vh)',color:'white',margin:'min(2vw,1.1vh) 0 0'}}>
            ⭐ {totalPts} pts
          </p>
        </motion.div>
        <motion.button initial={{opacity:0,y:16}}
          animate={{opacity:1,y:0,boxShadow:['0 0 20px rgba(255,255,255,0.2)','0 0 50px rgba(255,255,255,0.5)','0 0 20px rgba(255,255,255,0.2)']}}
          transition={{delay:0.5,boxShadow:{duration:1.8,repeat:Infinity}}}
          whileTap={{scale:0.94}} onClick={()=>onGoal(totalPts)}
          style={{width:'100%',padding:'min(4vw,2.2vh)',background:'rgba(255,255,255,0.22)',border:'2px solid rgba(255,255,255,0.5)',
            borderRadius:99,fontFamily:'var(--font-display)',fontSize:'min(7vw,3.9vh)',color:'white',textTransform:'uppercase',
            letterSpacing:'0.04em',cursor:'pointer'}}>
          🎁 Reclamar mi premio
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',overflow:'hidden',
      background:'linear-gradient(180deg,#5ba8d4 0%,#87ceeb 18%,#a8ddef 32%,#b8e0ea 38%,#5aab4a 39%,#4e9e40 55%,#3d8a32 100%)'}}>

      {/* ── Tribuna ── */}
      <div style={{position:'absolute',top:'35%',left:0,right:0,height:'7%',
        background:'repeating-linear-gradient(90deg,rgba(220,50,50,0.7) 0px,rgba(220,50,50,0.7) 8px,rgba(255,200,50,0.7) 8px,rgba(255,200,50,0.7) 16px,rgba(30,100,200,0.7) 16px,rgba(30,100,200,0.7) 24px,rgba(50,180,80,0.7) 24px,rgba(50,180,80,0.7) 32px)',
        opacity:0.5,filter:'blur(2px)',pointerEvents:'none',zIndex:1}}/>

      {/* ── SCOREBOARD ── */}
      <div style={{flexShrink:0,zIndex:10,background:'rgba(0,0,0,0.58)',backdropFilter:'blur(10px)',
        padding:'min(1.8vw,1vh) min(3.5vw,1.97vh)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'min(1.5vw,0.85vh)'}}>

        <img src="/assets/ui/logo-nutre-cat.svg" alt="" style={{width:'min(14vw,7.9vh)',filter:'brightness(0) invert(1)',flexShrink:0}}/>

        {/* Player penalties */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'min(0.5vw,0.28vh)'}}>
          <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.4vw,1.35vh)',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',fontWeight:700,letterSpacing:'0.04em'}}>Tú</span>
          <PenaltyDots outcomes={pOuts}/>
        </div>

        {/* Score */}
        <div style={{display:'flex',alignItems:'center',gap:'min(2vw,1.1vh)',flexShrink:0}}>
          <motion.span key={`p${pScore}`} animate={{scale:[1.3,1]}} transition={{duration:0.22}}
            style={{fontFamily:'var(--font-display)',fontSize:'min(10vw,5.6vh)',color:'white',lineHeight:1}}>{pScore}</motion.span>
          <span style={{fontFamily:'var(--font-display)',fontSize:'min(7vw,3.9vh)',color:'rgba(255,255,255,0.35)',lineHeight:1}}>—</span>
          <motion.span key={`m${mScore}`} animate={{scale:[1.3,1]}} transition={{duration:0.22}}
            style={{fontFamily:'var(--font-display)',fontSize:'min(10vw,5.6vh)',color:'white',lineHeight:1}}>{mScore}</motion.span>
        </div>

        {/* Machine penalties */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'min(0.5vw,0.28vh)'}}>
          <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.4vw,1.35vh)',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',fontWeight:700,letterSpacing:'0.04em'}}>Rival</span>
          <PenaltyDots outcomes={mOuts} reverse/>
        </div>

        {/* Round indicator */}
        <div style={{flexShrink:0,background:'rgba(255,255,255,0.12)',borderRadius:'min(2vw,1.1vh)',padding:'min(0.8vw,0.45vh) min(2.2vw,1.24vh)',textAlign:'center'}}>
          <p style={{fontFamily:'var(--font-body)',fontSize:'min(2.2vw,1.24vh)',color:'rgba(255,255,255,0.55)',textTransform:'uppercase',fontWeight:700,margin:0}}>Penal</p>
          <p style={{fontFamily:'var(--font-display)',fontSize:'min(5.5vw,3.1vh)',color:'white',margin:0,lineHeight:1}}>{round+1}/{N_PENS}</p>
        </div>
      </div>

      {/* ── STATUS ── */}
      <div style={{flexShrink:0,zIndex:5,textAlign:'center',padding:'min(1vw,0.55vh) 4%',background:'rgba(0,0,0,0.32)'}}>
        <p style={{fontFamily:'var(--font-display)',fontSize:'min(7.5vw,4.22vh)',color:'white',textTransform:'uppercase',margin:0,lineHeight:1,letterSpacing:'0.05em'}}>
          PENALTY CAT
        </p>
        <AnimatePresence mode="wait">
          <motion.p key={phase} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:0.16}}
            style={{fontFamily:'var(--font-body)',fontSize:'min(3.3vw,1.86vh)',margin:'min(0.3vw,0.17vh) 0 0',fontWeight:800,letterSpacing:'0.04em',textTransform:'uppercase',
              color:phase==='timing'?'#fde68a':inSavePhase?'#86efac':'rgba(255,255,255,0.85)'}}>
            {phase==='aim'         &&'⚽ Desliza el dedo desde el balón hasta el arco'}
            {phase==='timing'      &&'⚡ ¡Toca para disparar!'}
            {phase==='firing'      &&'🚀 ¡Disparo!'}
            {phase==='kick_result' &&(kickScored?'⚽ ¡GOOOL! ':'❌ Fallido')}
            {phase==='save_intro'  &&'🧤 ¡Ahora defiende!'}
            {phase==='save_ready'  &&`👆 Arrastra el portero con el dedo · ${saveSecs}s`}
            {phase==='save_fire'   &&'💥 ¡El rival dispara!'}
            {phase==='save_result' &&(savedOk?'🧤 ¡ATAJADO!':'😬 ¡Gol del rival!')}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── GAME AREA ── */}
      <div ref={gameAreaRef} style={{flex:1,position:'relative',overflow:'hidden',minHeight:0}}>

        {/* SVG overlay: trajectory drawing + ball flight + machine ball */}
        <svg
          onPointerDown={phase==='aim'?onSvgDown:undefined}
          onPointerMove={phase==='aim'?onSvgMove:undefined}
          onPointerUp={phase==='aim'?onSvgUp:undefined}
          onPointerCancel={phase==='aim'?onSvgUp:undefined}
          style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:30,
            touchAction:'none',overflow:'visible',
            cursor:phase==='aim'?'crosshair':'default',
            pointerEvents:phase==='aim'?'all':'none'}}
        >
          {/* Drawn trajectory (while aiming) */}
          {svgLine&&(<>
            <path d={svgLine} stroke="rgba(255,255,255,0.15)" strokeWidth={18} strokeLinecap="round" fill="none"/>
            <path d={svgLine} stroke="white" strokeWidth={2.5} strokeDasharray="9 7" strokeLinecap="round" fill="none" opacity={0.88}/>
          </>)}

          {/* Finger dot */}
          {fingerPx&&isDrawing&&(
            <circle cx={fingerPx.x} cy={fingerPx.y} r={11} fill="rgba(255,255,255,0.55)" stroke="white" strokeWidth={2}/>
          )}

          {/* Target indicator in goal (confirmed) */}
          {targetPx&&(
            <motion.g initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:300}}>
              <circle cx={targetPx.x} cy={targetPx.y} r={17} fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth={2.5}/>
              <circle cx={targetPx.x} cy={targetPx.y} r={5}  fill="white"/>
            </motion.g>
          )}

          {/* Ball flight (player kick) */}
          {phase==='firing'&&(
            <motion.g initial={{x:ballPx.x,y:ballPx.y,scale:1}}
              animate={{x:fireTx,y:fireTy,scale:0.5}}
              transition={{duration:SHOOT_MS/1000,ease:[0.3,0,0.8,1]}}>
              <circle r={13} fill="white"/>
              <circle r={13} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={1.5}/>
            </motion.g>
          )}

          {/* Machine ball flight (save phase) */}
          {phase==='save_fire'&&mTargetPx&&(
            <motion.g initial={{x:ballPx.x,y:ballPx.y,scale:1}}
              animate={{x:mTargetPx.x,y:mTargetPx.y,scale:0.5}}
              transition={{duration:SHOOT_MS/1000,ease:[0.3,0,0.8,1]}}>
              <circle r={13} fill="white"/>
              <circle r={13} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={1.5}/>
              {/* Red trail */}
              <circle r={9} fill="rgba(255,80,80,0.35)" cx={-18} cy={8}/>
              <circle r={6} fill="rgba(255,80,80,0.2)"  cx={-34} cy={15}/>
            </motion.g>
          )}
        </svg>

        {/* ── GOAL ── */}
        <div ref={goalDivRef}
          onPointerDown={inSavePhase?onGoalDown:undefined}
          onPointerMove={inSavePhase?onGoalMove:undefined}
          onPointerUp={inSavePhase?onGoalUp:undefined}
          onPointerCancel={inSavePhase?onGoalUp:undefined}
          style={{position:'absolute',top:'2%',left:'2%',right:'2%',height:'44%',
            border:'min(2vw,1.1vh) solid white',borderBottom:'none',
            borderRadius:'min(1.2vw,0.68vh) min(1.2vw,0.68vh) 0 0',
            boxShadow:'inset 0 0 0 min(0.6vw,0.34vh) rgba(255,255,255,0.12),0 0 min(3vw,1.7vh) rgba(0,0,0,0.35)',
            background:'rgba(5,20,50,0.52)',overflow:'hidden',
            touchAction:'none',cursor:phase==='save_ready'?'grab':'default',zIndex:5}}>
          {/* Net */}
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.09) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,0.09) 1.5px,transparent 1.5px)',backgroundSize:'12.5% 20%',pointerEvents:'none'}}/>

          {/* Machine GK (during player's kick) */}
          {inKickPhase&&(
            <motion.img src="/assets/cat/cat-hub.png" alt="Portero rival"
              animate={{left:`${gkAIPosNX*82+5}%`}}
              transition={{duration:phase==='firing'?0.22:0.18,ease:'easeOut'}}
              style={{position:'absolute',bottom:0,width:'min(19vw,10.7vh)',objectFit:'contain',
                filter:'hue-rotate(95deg) saturate(2) brightness(1.05)',zIndex:5,pointerEvents:'none',transformOrigin:'bottom center'}}/>
          )}

          {/* Player GK (during save phase) */}
          {inSavePhase&&(
            <motion.img src="/assets/cat/cat-hub.png" alt="Tu portero"
              animate={{left:`${gkNX*82+5}%`}}
              transition={{duration:0.1,ease:'easeOut'}}
              style={{position:'absolute',bottom:0,width:'min(19vw,10.7vh)',objectFit:'contain',zIndex:5,pointerEvents:'none',transformOrigin:'bottom center'}}/>
          )}

          {/* Drag hint arrows for save */}
          {phase==='save_ready'&&(
            <motion.div animate={{opacity:[0.55,1,0.55]}} transition={{duration:1.1,repeat:Infinity}}
              style={{position:'absolute',top:6,left:'50%',transform:'translateX(-50%)',background:'rgba(0,87,122,0.88)',
                borderRadius:99,padding:'min(0.8vw,0.45vh) min(3vw,1.7vh)',whiteSpace:'nowrap',zIndex:9,pointerEvents:'none'}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'min(3vw,1.69vh)',color:'white',textTransform:'uppercase'}}>
                ← Arrastra el portero · {saveSecs}s →
              </span>
            </motion.div>
          )}

          {/* Save intro overlay */}
          <AnimatePresence>
            {phase==='save_intro'&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}}
                style={{position:'absolute',inset:0,background:'rgba(0,30,80,0.82)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:10}}>
                <motion.p initial={{scale:0.55,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:260}}
                  style={{fontFamily:'var(--font-display)',fontSize:'min(9.5vw,5.35vh)',color:'white',textTransform:'uppercase',textAlign:'center',margin:0,
                    lineHeight:1.1,letterSpacing:'0.04em',textShadow:'0 0 20px rgba(255,255,255,0.4)'}}>
                  🧤 ¡Ahora<br/>defiende!
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Kick result flash */}
          <AnimatePresence>
            {phase==='kick_result'&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{position:'absolute',inset:0,background:kickScored?'rgba(34,197,94,0.32)':'rgba(239,68,68,0.32)',
                  display:'flex',alignItems:'center',justifyContent:'center',zIndex:8}}>
                <motion.p initial={{scale:0,rotate:-8}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:320}}
                  style={{fontFamily:'var(--font-display)',fontSize:'min(13vw,7.3vh)',color:kickScored?'#4ade80':'#f87171',
                    textTransform:'uppercase',margin:0}}>
                  {kickScored?'¡GOOOL!':'FALLIDO'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save result flash */}
          <AnimatePresence>
            {phase==='save_result'&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{position:'absolute',inset:0,background:savedOk?'rgba(34,197,94,0.32)':'rgba(239,68,68,0.32)',
                  display:'flex',alignItems:'center',justifyContent:'center',zIndex:8}}>
                <motion.p initial={{scale:0,rotate:-8}} animate={{scale:1,rotate:0}} transition={{type:'spring',stiffness:320}}
                  style={{fontFamily:'var(--font-display)',fontSize:'min(11vw,6.2vh)',color:savedOk?'#4ade80':'#f87171',
                    textTransform:'uppercase',margin:0,textAlign:'center',lineHeight:1.05}}>
                  {savedOk?'¡ATAJADO!':'¡GOL\nRIVAL!'}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── FIELD ── */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:'39%',
          background:'linear-gradient(180deg,#3a8a2e 0%,#4ca83c 30%,#5ab844 60%,#4ea83a 100%)',zIndex:3,overflow:'hidden'}}>
          {/* Lines */}
          <div style={{position:'absolute',top:0,left:'6%',right:'6%',height:'min(5vw,2.8vh)',borderLeft:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',borderRight:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',borderBottom:'min(0.5vw,0.28vh) solid rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',top:'min(9vw,5.05vh)',left:'50%',transform:'translateX(-50%)',width:'min(3vw,1.7vh)',height:'min(3vw,1.7vh)',borderRadius:'50%',background:'rgba(255,255,255,0.6)',pointerEvents:'none'}}/>
          <div style={{position:'absolute',top:0,left:'2%',right:'2%',height:'14%',background:'linear-gradient(180deg,rgba(0,0,0,0.22) 0%,transparent 100%)',pointerEvents:'none'}}/>

          {/* Ball (invisible div, just for measurement) */}
          <div ref={ballDivRef} style={{position:'absolute',left:'50%',bottom:'min(22vw,12.4vh)',transform:'translateX(-50%)',
            width:'min(10vw,5.6vh)',height:'min(10vw,5.6vh)',pointerEvents:'none',zIndex:8,
            // Visible only when NOT firing or in save phase
            opacity:(phase==='firing'||phase==='save_fire')?0:1,
          }}>
            <div style={{width:'100%',height:'100%',borderRadius:'50%',
              background:'radial-gradient(circle at 35% 32%,white 0%,#ddd 40%,#888 100%)',
              boxShadow:'0 min(2vw,1.1vh) min(5vw,2.8vh) rgba(0,0,0,0.45)'}}>
              <div style={{position:'absolute',top:'25%',left:'15%',width:'30%',height:'30%',background:'#333',borderRadius:'50%',opacity:0.7}}/>
              <div style={{position:'absolute',top:'15%',right:'20%',width:'20%',height:'20%',background:'#333',borderRadius:'50%',opacity:0.5}}/>
            </div>
          </div>

          {/* Instruction when aiming */}
          {phase==='aim'&&(
            <motion.div animate={{opacity:[0.65,1,0.65]}} transition={{duration:1.5,repeat:Infinity}}
              style={{position:'absolute',bottom:'min(28vw,15.7vh)',left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',pointerEvents:'none',zIndex:9}}>
              <span style={{fontFamily:'var(--font-display)',fontSize:'min(4vw,2.25vh)',color:'white',textShadow:'0 2px 8px rgba(0,0,0,0.5)',textTransform:'uppercase'}}>
                ☝️ Desliza hacia el arco
              </span>
            </motion.div>
          )}

          {/* Player cat */}
          <motion.img src="/assets/cat/cat-game.png" alt="Simón"
            animate={phase==='firing'?{rotate:[0,20],y:[0,-10]}:{rotate:0,y:[0,-6,0]}}
            transition={phase==='firing'?{duration:0.28}:{duration:3,repeat:Infinity,ease:'easeInOut'}}
            style={{position:'absolute',left:'50%',bottom:0,transform:'translateX(-50%)',width:'min(32vw,18vh)',
              objectFit:'contain',objectPosition:'bottom',pointerEvents:'none',
              filter:'drop-shadow(0 min(2vw,1.1vh) min(5vw,2.8vh) rgba(0,0,0,0.4))',zIndex:6}}/>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div style={{flexShrink:0,zIndex:10,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}>

        {/* Precision bar (timing phase) */}
        <AnimatePresence>
          {phase==='timing'&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              style={{padding:'min(1.8vw,1vh) min(5vw,2.8vh) min(1.2vw,0.68vh)',overflow:'hidden'}}>
              <p style={{fontFamily:'var(--font-display)',fontSize:'min(3.8vw,2.14vh)',color:'#fde68a',textTransform:'uppercase',textAlign:'center',margin:'0 0 min(1.2vw,0.68vh)',letterSpacing:'0.05em'}}>
                ⚡ ¡Toca para disparar!
              </p>
              {/* Bar track */}
              <div onPointerDown={stopBar}
                style={{position:'relative',height:'min(9vw,5.05vh)',borderRadius:99,overflow:'hidden',cursor:'pointer',
                  border:'min(0.5vw,0.28vh) solid rgba(253,230,138,0.55)',
                  boxShadow:'0 0 min(5vw,2.8vh) rgba(253,230,138,0.25)'}}>
                {/* Zones: wider red/yellow, very narrow green */}
                <div style={{display:'flex',height:'100%'}}>
                  <div style={{flex:0.35,background:'linear-gradient(90deg,#991b1b,#ef4444)'}}/>
                  <div style={{flex:0.115,background:'linear-gradient(90deg,#d97706,#fbbf24)'}}/>
                  <div style={{flex:0.07, background:'linear-gradient(90deg,#15803d,#22c55e,#15803d)'}}/>
                  <div style={{flex:0.115,background:'linear-gradient(90deg,#fbbf24,#d97706)'}}/>
                  <div style={{flex:0.35,background:'linear-gradient(90deg,#ef4444,#991b1b)'}}/>
                </div>
                {/* Indicator needle */}
                <div style={{position:'absolute',top:'-15%',bottom:'-15%',left:`${barPos*100}%`,width:'min(2.2vw,1.24vh)',
                  background:'white',borderRadius:3,transform:'translateX(-50%)',
                  boxShadow:`0 0 min(3vw,1.7vh) ${barColor},0 0 min(7vw,3.9vh) rgba(255,255,255,0.45)`,
                  pointerEvents:'none',transition:'box-shadow 0.1s'}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'min(0.8vw,0.45vh)'}}>
                <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.46vh)',color:'#f87171',fontWeight:800,flex:0.70,textAlign:'left'}}>POCO PODER</span>
                <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.46vh)',color:'#4ade80',fontWeight:900,flex:0.14,textAlign:'center'}}>PERFECTO</span>
                <span style={{fontFamily:'var(--font-body)',fontSize:'min(2.6vw,1.46vh)',color:'#f87171',fontWeight:800,flex:0.16,textAlign:'right'}}>POCO</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save instruction (save_ready) */}
        <AnimatePresence>
          {phase==='save_ready'&&(
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}
              style={{padding:'min(1.2vw,0.68vh) min(5vw,2.8vh)',overflow:'hidden',textAlign:'center'}}>
              <p style={{fontFamily:'var(--font-body)',fontSize:'min(3.2vw,1.8vh)',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',margin:0,letterSpacing:'0.02em',fontWeight:700}}>
                Arrastra el portero para atajar el disparo del rival
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main CTA button */}
        <div style={{padding:'min(1.6vw,0.9vh) min(5vw,2.8vh) min(2.5vw,1.4vh)'}}>
          <motion.button
            onClick={phase==='timing'?stopBar:phase==='save_ready'?commitSave:undefined}
            whileTap={{scale:0.94}}
            animate={phase==='timing'
              ?{scale:[1,1.03,1],boxShadow:['0 4px 20px rgba(253,230,138,0.3)','0 4px 40px rgba(253,230,138,0.8)','0 4px 20px rgba(253,230,138,0.3)']}
              :phase==='save_ready'
              ?{boxShadow:['0 4px 20px rgba(74,222,128,0.3)','0 4px 40px rgba(74,222,128,0.8)','0 4px 20px rgba(74,222,128,0.3)']}
              :{}}
            transition={{duration:0.8,repeat:Infinity}}
            disabled={phase!=='timing'&&phase!=='save_ready'}
            style={{
              width:'100%',padding:'min(3vw,1.69vh)',
              background:phase==='timing'?'#fbbf24':phase==='save_ready'?'#16a34a':'rgba(255,255,255,0.08)',
              border:'none',borderRadius:99,
              fontFamily:'var(--font-display)',fontSize:'min(6vw,3.38vh)',
              color:phase==='timing'?'#1a0a00':'white',
              textTransform:'uppercase',letterSpacing:'0.04em',
              cursor:(phase==='timing'||phase==='save_ready')?'pointer':'default',
              opacity:(phase==='aim'||phase==='firing'||phase==='kick_result'||phase==='save_intro'||phase==='save_fire'||phase==='save_result')?0.22:1,
              transition:'background 0.3s,opacity 0.3s,color 0.3s',
            }}>
            {phase==='aim'         &&'⚽ Desliza el dedo hacia el arco'}
            {phase==='timing'      &&'⚡ ¡DISPARAR!'}
            {phase==='firing'      &&'🚀 Disparando…'}
            {phase==='kick_result' &&(kickScored?'⚽ ¡Gol!':'❌ Fallido')}
            {phase==='save_intro'  &&'🧤 Prepárate para atajar…'}
            {phase==='save_ready'  &&`🧤 CONFIRMAR POSICIÓN · ${saveSecs}s`}
            {phase==='save_fire'   &&'💥 ¡El rival dispara!'}
            {phase==='save_result' &&(savedOk?'🧤 ¡Atajado!':'😬 Gol del rival')}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
