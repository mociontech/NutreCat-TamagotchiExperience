import { motion } from 'framer-motion';
import NutreCatLogo from '../components/NutreCatLogo';

interface Props { onStart: () => void; }

export default function AttractLoop({ onStart }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: 'url(/assets/Bg1.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '44px 28px 54px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Luces de estadio */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.07, 0.35, 0.07] }}
          transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.35 }}
          style={{
            position: 'absolute', top: '-15%', left: `${8 + i * 16}%`,
            width: '3px', height: '55%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)',
            transform: `rotate(${-18 + i * 7}deg)`, transformOrigin: 'top center',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Estrellas */}
      {[...Array(22)].map((_, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.4, 1] }}
          transition={{ duration: 1.5 + (i % 5) * 0.4, repeat: Infinity, delay: (i % 7) * 0.45 }}
          style={{
            position: 'absolute',
            top: `${5 + (i * 37 % 55)}%`,
            left: `${(i * 47 % 92)}%`,
            width: 2 + (i % 3), height: 2 + (i % 3),
            background: 'white', borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <NutreCatLogo size={88} />
      </motion.div>

      {/* Zona central — CLICABLE */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
        onClick={onStart}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0px', flex: 1, justifyContent: 'center',
          cursor: 'pointer', position: 'relative', width: '100%',
        }}
      >
        {/* Título */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          style={{ textAlign: 'center', marginBottom: '8px' }}
        >
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '42px', color: 'white',
            lineHeight: 1.1, marginBottom: '6px',
            textShadow: '0 2px 20px rgba(0,174,239,0.5)',
          }}>
            EL GATO<br/>
            <span style={{ color: 'var(--nc-cyan)' }}>CAMPEÓN</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', fontWeight: 600 }}>
            está esperando por ti
          </p>
        </motion.div>

        {/* Gato + mano + ripples */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Ripples de tap centrados bajo el gato */}
          {[1, 2, 3].map(i => (
            <motion.div key={i}
              animate={{ scale: [0.6, 2.4], opacity: [0.45, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: '18%', left: '50%',
                transform: 'translateX(-50%)',
                width: 100, height: 100,
                borderRadius: '50%',
                border: '2px solid rgba(0,174,239,0.55)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Gato */}
          <motion.img
            src="/assets/cat/cat-attract.png"
            alt="Gato Nutre Cat"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 340, height: 340,
              objectFit: 'contain', objectPosition: 'bottom',
              userSelect: 'none', pointerEvents: 'none',
              filter: 'drop-shadow(0 20px 40px rgba(0,174,239,0.25))',
              position: 'relative', zIndex: 1,
            }}
          />

          {/* Mano apuntando — animada con intención de tap */}
          <motion.div
            animate={{
              x: [0, 22, 4, 22, 0],
              y: [0, -14, -4, -14, 0],
              rotate: [-27, -18, -24, -18, -27],
            }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.5, 0.65, 1] }}
            style={{
              position: 'absolute',
              bottom: '12%',
              left: '-8%',
              width: 110,
              zIndex: 2,
              pointerEvents: 'none',
              transformOrigin: 'bottom right',
            }}
          >
            <img
              src="/assets/hand-pointer.svg"
              alt=""
              style={{
                width: '100%',
                filter: 'brightness(0) invert(1) opacity(0.85)',
              }}
            />
          </motion.div>

          {/* Brillitos */}
          {['✨', '⭐', '✨'].map((e, i) => (
            <motion.span key={i}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -12, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.65 }}
              style={{
                position: 'absolute',
                top: `${10 + i * 28}%`,
                left: i === 1 ? 'auto' : i === 0 ? '-10%' : '100%',
                right: i === 1 ? '-8%' : 'auto',
                fontSize: '22px',
                pointerEvents: 'none',
              }}
            >{e}</motion.span>
          ))}
        </div>
      </motion.div>

      {/* Pie: dots Colombia + aviso de toque */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#FCD116', '#CE1126', '#003087'].map((c, i) => (
            <motion.span key={i}
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
              style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }}
            />
          ))}
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center', fontWeight: 600 }}>
          Aliméntalo, cuídalo y ayúdalo a ganar 🏆
        </p>

        {/* Aviso de toque — reemplaza el botón */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          onClick={onStart}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <p style={{
            color: 'var(--nc-cyan)',
            fontSize: '17px', fontWeight: 800,
            letterSpacing: '0.04em',
            textShadow: '0 0 20px rgba(0,174,239,0.6)',
          }}>
            🐾 Toca al gato para despertar
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
