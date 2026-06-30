import { motion } from 'framer-motion';
import type { CatState } from '../data/gameStates';

interface Props { cat?: CatState; onNext: () => void; }

const PETROL = '#00577a';
const LIGHT_BLUE = '#b0e8f9';

export default function RewardQrScreen({ onNext }: Props) {
  return (
    <div
      onClick={onNext}
      style={{
        width: '100%',
        height: '100%',
        background: '#00b6ed',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <img
        src="/assets/reward/final-bg.png"
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          top: '6.51%',
          left: '30%',
          width: '40%',
          height: '16.09%',
          zIndex: 5,
        }}
      >
        <img
          src="/assets/ui/logo-nutre-cat.svg"
          alt="NutreCat Premium"
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      <motion.img
        src="/assets/reward/final-cat.png"
        alt=""
        initial={{ opacity: 0, x: 70, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.28, type: 'spring', stiffness: 130, damping: 24 }}
        style={{
          position: 'absolute',
          left: '47.13%',
          top: '26.93%',
          width: '79.35%',
          height: '71.93%',
          objectFit: 'contain',
          objectPosition: 'left bottom',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      <motion.div
        initial={{ opacity: 0, x: -70, rotate: -13, scale: 0.935 }}
        animate={{ opacity: 1, x: 0, rotate: -9.16, scale: 0.935 }}
        transition={{ delay: 0.16, type: 'spring', stiffness: 150, damping: 20 }}
        style={{
          position: 'absolute',
          left: '1.15%',
          top: 'calc(24.45% + 20px)',
          width: '50.77%',
          height: 'calc(12.32% - 15px)',
          background: LIGHT_BLUE,
          border: 'min(0.74vw, 0.42vh) solid #00577a',
          borderRadius: 'min(5.16vw, 2.9vh)',
          zIndex: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          boxShadow: '0 8px 18px rgba(0,87,122,0.12)',
          transformOrigin: 'center center',
        }}
      >
        <div style={{ textAlign: 'center', color: PETROL, textTransform: 'uppercase', transform: 'translateY(4px)' }}>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(8.45vw, 4.75vh)',
              lineHeight: 0.86,
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            ¡Gracias por
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(8.45vw, 4.75vh)',
              lineHeight: 0.95,
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            participar!
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.468, rotate: -58 }}
        animate={{ opacity: 1, scale: 0.55, rotate: -52.96 }}
        transition={{ delay: 0.22, type: 'spring', stiffness: 150, damping: 20 }}
        style={{
          position: 'absolute',
          left: '-9.93%',
          top: 'calc(22.08% + 2px)',
          width: '24.46%',
          aspectRatio: '1',
          zIndex: 7,
          pointerEvents: 'none',
          transformOrigin: 'center center',
        }}
      >
        <img
          src="/assets/reward/final-star.svg"
          alt=""
          style={{
            position: 'absolute',
            left: '2.45%',
            right: '2.45%',
            top: 0,
            bottom: '9.55%',
            width: '95.1%',
            height: '90.45%',
            display: 'block',
            objectFit: 'fill',
          }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(42.35% - 5px)',
          width: '43.5%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(5.74vw, 3.23vh)',
          color: PETROL,
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight: 1.18,
          margin: 0,
          zIndex: 7,
        }}
      >
        Ganaste un<br />
        descuento del
      </motion.p>

      <motion.p
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.42, type: 'spring', stiffness: 170, damping: 18 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: '51.45%',
          width: '45%',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(27.12vw, 15.29vh)',
          color: PETROL,
          textAlign: 'left',
          lineHeight: 0.75,
          letterSpacing: '0.04em',
          margin: 0,
          zIndex: 7,
        }}
      >
        10%
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 22 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(68.44% - 20px)',
          width: '25.5%',
          height: '15.02%',
          background: 'white',
          borderRadius: 'min(3.52vw, 1.98vh)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 8,
          overflow: 'hidden',
        }}
      >
        <img
          src="/assets/backgrounds/QR.png"
          alt="QR"
          style={{ width: '88%', height: '88%', objectFit: 'contain', display: 'block' }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(86.1% - 40px)',
          width: '28.05%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(4.82vw, 2.71vh)',
          color: PETROL,
          textTransform: 'uppercase',
          textAlign: 'left',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: 0,
          zIndex: 8,
        }}
      >
        Redímelo aquí
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.64, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(88.65% - 40px)',
          width: '43.06%',
          fontFamily: 'var(--font-body)',
          fontSize: 'min(4.33vw, 2.44vh)',
          color: PETROL,
          textTransform: 'uppercase',
          textAlign: 'left',
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          margin: 0,
          zIndex: 8,
        }}
      >
        Solo en plazacampo.com
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 160, damping: 22 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(88.65% - 14px)',
          width: '41.02%',
          height: '2.66%',
          background: LIGHT_BLUE,
          borderRadius: 123,
          zIndex: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'min(2.45vw, 1.38vh)',
            color: PETROL,
            textTransform: 'uppercase',
            letterSpacing: '-0.04em',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          11 de julio al 31 de agosto de 2026
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.82 }}
        style={{
          position: 'absolute',
          left: 'calc(5.45% + 25px)',
          top: 'calc(88.65% + 32px)',
          width: '41.02%',
          textAlign: 'center',
          zIndex: 9,
          opacity: 0.72,
        }}
      >
        <motion.span
          animate={{ opacity: [0.42, 0.85, 0.42] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'min(2.5vw, 1.4vh)',
            color: PETROL,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          Toca para volver al inicio
        </motion.span>
      </motion.div>
    </div>
  );
}
