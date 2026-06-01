import { motion } from 'framer-motion';
import type { CatState } from '../data/gameStates';

interface Props { cat?: CatState; onNext: () => void; }

export default function RewardQrScreen({ cat, onNext }: Props) {
  return (
    <div
      onClick={onNext}
      style={{
        width: '100%', height: '100%',
        background: '#00b6ed',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', padding: '48px 24px 56px',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <motion.img
        src="/assets/ui/logo-nutre-cat.svg"
        alt="Nutre Cat Premium"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: 220, objectFit: 'contain' }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center' }}
      >
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '54px', color: '#00577a',
          lineHeight: 1, textTransform: 'uppercase',
        }}>
          ¡Gracias por<br />participar!
        </h1>
        <p style={{ color: '#00577a', fontSize: '20px', fontWeight: 700, marginTop: '12px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Obtuviste {cat?.score ?? 130} puntos
        </p>
      </motion.div>

      {/* QR */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 200 }}
        style={{
          background: 'white', borderRadius: '28px', padding: '20px',
          boxShadow: '0 12px 40px rgba(0,87,122,0.2)',
        }}
      >
        <img
          src="/assets/ui/qr-code.png"
          alt="Código QR"
          style={{ width: 200, height: 200, objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      {/* Instrucciones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{ color: '#00577a', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85 }}>
          Escaneando el siguiente código QR<br />
          <strong>10% de descuento</strong>
        </p>
        <p style={{ color: '#00577a', fontSize: '15px', fontWeight: 600, marginTop: '10px', opacity: 0.65, textTransform: 'uppercase' }}>
          Válido en productos Nutre Cat
        </p>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: '#00577a', fontSize: '14px', fontWeight: 700, opacity: 0.6 }}
      >
        Toca para continuar
      </motion.p>
    </div>
  );
}