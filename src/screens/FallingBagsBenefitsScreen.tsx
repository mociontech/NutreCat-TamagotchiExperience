import { motion } from 'framer-motion';

interface Props { onDone: () => void; }

// Figma asset URLs — canvas 1080×1920, node 391:2
const ICONS = {
  leche1:   'https://www.figma.com/api/mcp/asset/5ae95404-3345-4aed-a865-664ce26e05f9',
  leche2:   'https://www.figma.com/api/mcp/asset/6c9ddaea-6fa2-4620-945f-05fbc944e333',
  salmon1:  'https://www.figma.com/api/mcp/asset/e865696b-d2ea-41f7-81a9-c271a28fb7db',
  salmon2:  'https://www.figma.com/api/mcp/asset/538cae56-dc4a-4cd5-bb88-a2fa33e64cf0',
  tilapia1: 'https://www.figma.com/api/mcp/asset/6be43df1-9753-48de-a6e4-3d1d5b0c8af0',
  tilapia2: 'https://www.figma.com/api/mcp/asset/1ede36ea-1d61-4237-8b62-b897eee3e74d',
};

// All positions derived from Figma pixel coords → % of card (887×432) or screen (1080×1920)
const PRODUCTS = [
  {
    id: 0,
    src: '/assets/products/product-1.png',
    name: 'NutreCat con Leche Deslactosada',
    benefits: [
      'Favorece una mejor digestión.',
      'Con vitamina D, calcio y fósforo que apoyan el desarrollo de huesos y dientes fuertes.',
    ],
    icons: [ICONS.leche1, ICONS.leche2],
    cardBg: '#f4a875', textColor: '#d23d22', borderColor: '#d23d22',
    // Card on screen: left 98/1080, top 262/1920
    cardTop: '13.65%',
    // Name: top (321-262)/432
    nameTop: '13.66%',
    // Product img container: left (727.76-98)/887, top (260-262)/432, w 342/887
    imgLeft: '70.97%', imgTop: '-0.46%', imgWidth: '38.58%',
    // Icons: left (129-98)/887; tops (465-262)/432, (562-262)/432
    icon1Top: '46.99%', icon2Top: '69.44%',
    // Divider: left (179-98)/887, top (514-262)/432, w 614/887
    dividerTop: '58.33%', dividerWidth: '69.22%',
  },
  {
    id: 1,
    src: '/assets/products/product-3.png',
    name: 'NutreCat con Salmón',
    benefits: [
      'Ayuda a mantener una digestión equilibrada.',
      'Contiene ácidos grasos y omega 3, lo que contribuye a la salud cardiovascular.',
    ],
    icons: [ICONS.salmon1, ICONS.salmon2],
    cardBg: '#dbd672', textColor: '#606225', borderColor: '#606225',
    // Card top 743/1920
    cardTop: '38.70%',
    nameTop: '13.66%',
    // img: left (727.75-98)/887, top (741.91-743)/432, w 343/887
    imgLeft: '70.97%', imgTop: '-0.25%', imgWidth: '38.67%',
    // Icons: tops (943-743)/432, (1029-743)/432
    icon1Top: '46.30%', icon2Top: '66.20%',
    // Divider: top (996-743)/432, w 614/887
    dividerTop: '58.56%', dividerWidth: '69.22%',
  },
  {
    id: 2,
    src: '/assets/products/product-2.png',
    name: 'NutreCat con Tilapia',
    benefits: [
      'Apoya la salud digestiva y la regeneración intestinal.',
      'Fortalece los músculos con el aporte de fósforo y potasio.',
    ],
    icons: [ICONS.tilapia1, ICONS.tilapia2],
    cardBg: '#debbe7', textColor: '#a049bb', borderColor: '#a049bb',
    // Card top 1224/1920
    cardTop: '63.75%',
    // Name: top (1269-1224)/432
    nameTop: '10.42%',
    // img: left (699-98)/887, top (1227.12-1224)/432, w 351/887
    imgLeft: '67.76%', imgTop: '0.72%', imgWidth: '39.59%',
    // Icons: tops (1429-1224)/432, (1520-1224)/432
    icon1Top: '47.45%', icon2Top: '68.52%',
    // Divider: top (1495-1224)/432, w 716/887
    dividerTop: '62.73%', dividerWidth: '80.72%',
  },
] as const;

export default function FallingBagsBenefitsScreen({ onDone }: Props) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#00b6ed', position: 'relative', overflow: 'hidden' }}>

      {/* BENEFICIOS — top 87/1920=4.53% */}
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'absolute',
          top: '4.53%', left: 0, right: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'min(13.43vw, 7.55vh)',
          color: 'white',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 'min(0.67vw, 0.38vh)',
          lineHeight: 0.866,
          margin: 0, zIndex: 5,
        }}
      >
        BENEFICIOS
      </motion.p>

      {/* Estrella — left 928/1080=85.94%, top 52/1920=2.71%, size 85.7px→min(7.94vw,4.46vh) */}
      <div style={{
        position: 'absolute',
        left: '85.94%', top: '2.71%',
        width: 'min(10.72vw, 6.02vh)',
        zIndex: 6, pointerEvents: 'none',
      }}>
        <img src="/assets/benefits/star.png" alt=""
          style={{ width: '100%', height: 'auto', objectFit: 'contain', transform: 'rotate(-27.7deg)' }} />
      </div>

      {/* Badge "Sin colorantes" — left 637/1080=58.99%, top 111.53/1920=5.81%, w 357.86/1080=33.13%, rotate -4.82° */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          position: 'absolute',
          left: '58.99%', top: '5.81%',
          width: '33.13%',
          height: 'min(9.2vw, 5.18vh)',
          background: '#b0e8f9',
          borderRadius: 'min(2.17vw, 1.22vh)',
          border: 'min(0.31vw, 0.17vh) solid #00577a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: 'rotate(-4.82deg)',
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
          padding: '0 min(1vw, 0.55vh)',
        }}>
          Sin colorantes y sin sabores artificiales.
        </span>
      </motion.div>

      {/* Cards */}
      {PRODUCTS.map((p, idx) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: idx % 2 === 0 ? -24 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + idx * 0.1, duration: 0.35 }}
          style={{
            position: 'absolute',
            top: p.cardTop,
            left: '9.07%', right: '9.07%',
            height: '22.5%',
            background: p.cardBg,
            borderRadius: 'min(3.43vw, 1.93vh)',
            overflow: 'visible',
          }}
        >
          {/* Dashed inner border — offset 14px = 1.58% h, 3.24% v */}
          <div style={{
            position: 'absolute',
            left: '1.58%', top: '3.24%',
            width: '96.84%', height: '93.52%',
            border: `2px dashed ${p.borderColor}`,
            borderRadius: 'min(2.5vw, 1.4vh)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* Product image */}
          <div style={{
            position: 'absolute',
            left: p.imgLeft, top: p.imgTop,
            width: p.imgWidth,
            height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'visible',
            zIndex: 3, pointerEvents: 'none',
          }}>
            <img
              src={p.src} alt={p.name}
              style={{
                width: '80%', height: 'auto',
                objectFit: 'contain',
                transform: 'rotate(11.17deg)',
                transformOrigin: 'center center',
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))',
              }}
            />
          </div>

          {/* Product name — left (152-98)/887=6.09%, width 547/887=61.67% */}
          <p style={{
            position: 'absolute',
            left: '6.09%', top: p.nameTop,
            width: '61.67%',
            fontFamily: 'var(--font-display)',
            fontSize: 'min(6.48vw, 3.65vh)',
            color: p.textColor,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            lineHeight: 0.866,
            margin: 0, zIndex: 1,
          }}>
            {p.name}
          </p>

          {/* Benefit row 1 — icon left (129-98)/887=3.49%, top=icon1Top */}
          <div style={{
            position: 'absolute',
            left: '3.49%', top: p.icon1Top,
            width: '63%',
            display: 'flex', alignItems: 'flex-start',
            gap: 'min(1.5vw, 0.85vh)',
            zIndex: 1,
          }}>
            <img src={p.icons[0]} alt=""
              style={{ width: 'min(3.31vw, 1.86vh)', height: 'min(3.31vw, 1.86vh)', flexShrink: 0, objectFit: 'contain' }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(2.87vw, 1.61vh)',
              color: p.textColor,
              textTransform: 'uppercase',
              lineHeight: 1.25, margin: 0, fontWeight: 700,
            }}>
              {p.benefits[0]}
            </p>
          </div>

          {/* Divider — left (179-98)/887=9.13% */}
          <div style={{
            position: 'absolute',
            left: '9.13%', top: p.dividerTop,
            width: p.dividerWidth,
            height: 0,
            borderTop: `2px dashed ${p.borderColor}`,
            opacity: 0.55,
            zIndex: 1,
          }} />

          {/* Benefit row 2 */}
          <div style={{
            position: 'absolute',
            left: '3.49%', top: p.icon2Top,
            width: '63%',
            display: 'flex', alignItems: 'flex-start',
            gap: 'min(1.5vw, 0.85vh)',
            zIndex: 1,
          }}>
            <img src={p.icons[1]} alt=""
              style={{ width: 'min(3.31vw, 1.86vh)', height: 'min(3.31vw, 1.86vh)', flexShrink: 0, objectFit: 'contain' }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'min(2.87vw, 1.61vh)',
              color: p.textColor,
              textTransform: 'uppercase',
              lineHeight: 1.25, margin: 0, fontWeight: 700,
            }}>
              {p.benefits[1]}
            </p>
          </div>
        </motion.div>
      ))}

      {/* SIGUIENTE — center: top calc(50%+800px)=1760px, h 82px → top edge 1719/1920=89.53% */}
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
          left: '9.07%', right: '9.07%',
          top: '89.53%',
          height: 'min(7.59vw, 4.27vh)',
          zIndex: 10,
          background: 'white',
          border: 'none',
          borderRadius: 99,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(6.57vw, 3.7vh)',
          color: '#00577a',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
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
