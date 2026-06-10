import { motion } from 'framer-motion';

interface Props { onDone: () => void; }

const PRODUCTS = [
  {
    id: 0,
    src: '/assets/products/product-1.png',
    name: 'NutreCat con Leche Deslactosada',
    subtitle: 'Para gatitos con sensibilidad a la lactosa.',
    benefits: [
      'Favorece una mejor digestión.',
      'Con vitamina D, calcio y fósforo que apoyan el desarrollo de huesos y dientes fuertes.',
    ],
    cardBg: '#f4a875', textColor: '#d23d22', borderColor: '#d23d22',
    cardTop: '13.65%',
  },
  {
    id: 1,
    src: '/assets/products/product-3.png',
    name: 'NutreCat con Salmón',
    subtitle: 'Digestión saludable y bienestar integral.',
    benefits: [
      'Ayuda a mantener una digestión equilibrada.',
      'Contiene ácidos grasos y omega 3, lo que contribuye a la salud cardiovascular.',
    ],
    cardBg: '#dbd672', textColor: '#606225', borderColor: '#606225',
    cardTop: '38.7%',
  },
  {
    id: 2,
    src: '/assets/products/product-2.png',
    name: 'NutreCat con Tilapia',
    subtitle: 'Para gatos con sistema digestivo sensible.',
    benefits: [
      'Apoya la salud digestiva y la regeneración intestinal.',
      'Fortalece los músculos con el aporte de fósforo y potasio.',
    ],
    cardBg: '#debbe7', textColor: '#a049bb', borderColor: '#a049bb',
    cardTop: '63.75%',
  },
] as const;

export default function FallingBagsBenefitsScreen({ onDone }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* BENEFICIOS */}
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'absolute',
          top: '4.53%', left: 0, right: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'min(13.4vw, 7.55vh)',
          color: 'white',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: 0.866,
          margin: 0, zIndex: 5,
        }}
      >
        BENEFICIOS
      </motion.p>

      {/* ── Estrella decorativa — canvas left:928px top:52px size:85.7px rotate:-27.7° ── */}
      <div style={{
        position: 'absolute',
        left: '85.94%', top: '2.71%',
        width: 'min(10.72vw, 6.02vh)',
        height: 'auto',
        zIndex: 6, pointerEvents: 'none',
      }}>
        <img
          src="/assets/benefits/star.png" alt=""
          style={{ width: '100%', height: 'auto', objectFit: 'contain', transform: 'rotate(-27.7deg)', transformOrigin: 'center center' }}
        />
      </div>

      {/* ── Badge "Sin colorantes" — canvas left:637px top:111px w:358px h:99px rotate:-4.82° ── */}
      {/* left 637/1080=58.98%, top 111.53/1920=5.81%, w 357.86/1080=33.13%, h 99.37/1920=5.18% */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          position: 'absolute',
          left: '58.98%', top: '5.81%',
          width: '33.13%',
          height: 'min(9.2vw, 5.18vh)',
          background: '#b0e8f9',
          borderRadius: 'min(2.17vw, 1.22vh)',
          border: 'min(0.31vw, 0.17vh) solid #00577a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-4.82deg)',
          transformOrigin: 'center center',
          zIndex: 6,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'min(3.55vw, 2vh)',
          color: '#00577a',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          lineHeight: 1.1,
          paddingTop: '0.1em',
          padding: '0 min(1vw, 0.55vh)',
        }}>
          Sin colorantes y sin sabores artificiales.
        </span>
      </motion.div>

      {/* Product cards */}
      {PRODUCTS.map((p, idx) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + idx * 0.1, duration: 0.35 }}
          style={{
            position: 'absolute',
            top: p.cardTop,
            left: '8.93%', right: '8.93%',
            height: '22.5%',
            background: p.cardBg,
            borderRadius: 'min(3.4vw, 1.93vh)',
            overflow: 'visible',
          }}
        >
          {/* Dashed inner border */}
          <div style={{
            position: 'absolute', inset: 'min(1vw, 0.55vh)',
            border: `2px dashed ${p.borderColor}`,
            borderRadius: 'min(2.5vw, 1.4vh)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Product image — right side, slightly overflowing top */}
          <img
            src={p.src} alt={p.name}
            style={{
              position: 'absolute',
              right: '-2%', top: '-4%',
              height: '108%', width: 'auto',
              objectFit: 'contain',
              zIndex: 3, pointerEvents: 'none',
              filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))',
              transform: 'rotate(11.17deg)',
              transformOrigin: 'bottom center',
            }}
          />

          {/* Text content */}
          <div style={{
            position: 'relative', zIndex: 1,
            padding: 'min(2.5vw, 1.4vh) min(3vw, 1.7vh) min(2.5vw, 1.4vh)',
            display: 'flex', flexDirection: 'column',
            gap: 'min(1vw, 0.55vh)',
            width: '62%',
            height: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Product name */}
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'min(6.5vw, 3.65vh)',
              color: p.textColor,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 0.866,
              margin: 0,
            }}>
              {p.name}
            </p>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(2.7vw, 1.51vh)',
              color: p.textColor,
              textTransform: 'uppercase',
              lineHeight: 1.25,
              margin: 0,
            }}>
              {p.subtitle}
            </p>

            {/* Divider */}
            <div style={{
              height: 1, background: p.borderColor,
              opacity: 0.4, borderRadius: 1,
              flexShrink: 0, margin: 'min(0.5vw, 0.28vh) 0',
            }} />

            {/* Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'min(1vw, 0.55vh)' }}>
              {p.benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 'min(1.5vw, 0.85vh)', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 'min(2.5vw, 1.4vh)', height: 'min(2.5vw, 1.4vh)',
                    borderRadius: '50%', background: p.borderColor,
                    flexShrink: 0, marginTop: 'min(0.4vw, 0.22vh)',
                  }} />
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'min(2.7vw, 1.51vh)',
                    color: p.textColor,
                    textTransform: 'uppercase',
                    lineHeight: 1.25, margin: 0,
                  }}>
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* SIGUIENTE button */}
      <motion.button
        onClick={onDone}
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: 1, y: 0,
          boxShadow: ['0 0 18px rgba(255,255,255,0.25)', '0 0 48px rgba(255,255,255,0.65)', '0 0 18px rgba(255,255,255,0.25)'],
        }}
        transition={{ opacity: { duration: 0.4, delay: 0.45 }, y: { duration: 0.4, delay: 0.45 }, boxShadow: { duration: 1.8, repeat: Infinity, delay: 1 } }}
        style={{
          position: 'absolute',
          left: '8.93%', right: '8.93%',
          top: '88.5%',
          height: 'min(8.5vw, 4.79vh)',
          zIndex: 10,
          background: 'white',
          border: 'none',
          borderRadius: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(7.5vw, 4.22vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          cursor: 'pointer',
          lineHeight: 1,
          paddingTop: '0.18em',
          whiteSpace: 'nowrap',
        }}
      >
        SIGUIENTE
      </motion.button>
    </div>
  );
}
