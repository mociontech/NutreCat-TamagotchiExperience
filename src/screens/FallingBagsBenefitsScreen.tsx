import { motion } from 'framer-motion';

interface Props { onDone: () => void; }

const ICONS = {
  leche1:   '/assets/icons/benefit-digestive.svg',
  leche2:   '/assets/icons/benefit-bone.svg',
  salmon1:  '/assets/cat/Salmon1.png?v=salmon-popup-1',
  salmon2:  '/assets/cat/Salmon2.png?v=salmon-popup-1',
  tilapia1: '/assets/icons/benefit-digestive-tilapia.svg',
  tilapia2: '/assets/cat/Tilapila2.png',
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
    nameWidth: '68%', benefitRowWidth: '63%', benefitFontSize: 'min(3.15vw, 1.77vh)',
    // Card on screen: left 98/1080, top 262/1920
    cardTop: '13.65%',
    // Name: top (321-262)/432
    nameTop: '13.66%',
    // Product img container: left (727.76-98)/887, top (260-262)/432, w 342/887
    imgLeft: '70.97%', imgTop: '-0.46%', imgWidth: '38.58%',
    // Icons: left (129-98)/887; tops (465-262)/432, (562-262)/432
    icon1Top: '46.99%', icon2Top: '62.50%', icon2Align: 'center' as const,
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
    nameWidth: '61.67%', benefitRowWidth: '90%', benefitFontSize: 'min(3.06vw, 1.72vh)',
    // Card top 743/1920
    cardTop: '38.70%',
    nameTop: '13.66%',
    // img: left (727.75-98)/887, top (741.91-743)/432, w 343/887
    imgLeft: '70.97%', imgTop: '-0.25%', imgWidth: '38.67%',
    // Icons: tops (943-743)/432, (1029-743)/432
    icon1Top: '46.30%', icon2Top: '66.20%', icon2Align: 'flex-start' as const,
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
    nameWidth: '61.67%', benefitRowWidth: '63%', benefitFontSize: 'min(3.15vw, 1.77vh)',
    // Card top 1224/1920
    cardTop: '63.75%',
    // Name: top (1269-1224)/432
    nameTop: '10.42%',
    // img: left (699-98)/887, top (1227.12-1224)/432, w 351/887
    imgLeft: '67.76%', imgTop: '0.72%', imgWidth: '39.59%',
    // Icons: tops (1429-1224)/432, (1520-1224)/432
    icon1Top: '41.67%', icon2Top: '67.36%', icon2Align: 'flex-start' as const,
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
          top: '4.53%', left: '7.22%',
          width: '86.76%',
          fontFamily: 'var(--font-display)',
          fontSize: 'min(13.43vw, 7.55vh)',
          fontWeight: 400,
          color: 'white',
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: 'min(0.67vw, 0.38vh)',
          lineHeight: 0.866,
          margin: 0, zIndex: 5,
        }}
      >
        BENEFICIOS
      </motion.p>

      {/* Estrella — right de la badge, top 52/1920=2.71%, size 85.7px */}
      <div style={{
        position: 'absolute',
        right: 'calc(7.2% - min(3.97vw, 2.23vh) + 6px)', top: 'calc(6.33% - min(3.97vw, 2.23vh) - 11px)',
        width: 'min(7.94vw, 4.46vh)',
        height: 'min(7.94vw, 4.46vh)',
        transform: 'rotate(0.5deg)',
        zIndex: 7, pointerEvents: 'none',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 81 81" fill="none">
          <path d="M44.085 19.6679L44.8171 20.2619L45.6884 19.9026L69.3633 10.1434L60.1862 34.0505L59.8481 34.9295L60.459 35.6478L77.0552 55.1475L51.4839 53.8072L50.543 53.7585L50.0486 54.5607L36.631 76.3717L30.0046 51.6367L29.7602 50.7259L28.8447 50.5051L3.95476 44.4835L25.4316 30.5377L26.2221 30.0245L26.1497 29.0841L24.1841 3.55219L44.085 19.6679Z" fill="#B0E8F9" stroke="#00577A" strokeWidth="3.17413"/>
        </svg>
      </div>

      {/* Badge "Sin colorantes" — left 637/1080=58.99%, top 111.53/1920=5.81%, w 357.86/1080=33.13%, rotate -4.82° */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotate: -4.816 }}
        animate={{ opacity: 1, scale: 1, rotate: -4.816 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          position: 'absolute',
          right: '7.2%', top: '6.33%',
          width: '33.13%',
          height: 'min(9.2vw, 5.18vh)',
          background: '#B0E8F9',
          borderRadius: 'min(2.17vw, 1.22vh)',
          border: 'min(0.31vw, 0.174vh) solid #00577A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 4,
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
          {/* Dashed inner border — SVG for precise dot density matching Figma */}
          <svg
            style={{ position: 'absolute', left: '1.58%', top: '3.24%', width: '96.84%', height: '93.52%', overflow: 'visible', pointerEvents: 'none', zIndex: 0 }}
            viewBox="0 0 859 404"
            preserveAspectRatio="none"
            fill="none"
          >
            <rect x="1" y="1" width="857" height="402" rx="36" ry="36"
              stroke={p.borderColor}
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          </svg>

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

          {/* Product name */}
          <p style={{
            position: 'absolute',
            left: '6.09%', top: p.nameTop,
            width: p.nameWidth,
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

          {/* Benefit row 1 */}
          <div style={{
            position: 'absolute',
            left: '3.49%', top: p.icon1Top,
            width: p.benefitRowWidth,
            display: 'flex', alignItems: 'center',
            gap: 'min(1.5vw, 0.85vh)',
            zIndex: 1,
          }}>
            <img src={p.icons[0]} alt=""
              style={{ width: 'min(3.31vw, 1.86vh)', height: 'min(3.31vw, 1.86vh)', flexShrink: 0, objectFit: 'contain' }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: p.benefitFontSize,
              color: p.textColor,
              textTransform: 'uppercase',
              lineHeight: 1.2, margin: 0, fontWeight: 400,
              transform: 'scaleX(0.85)', transformOrigin: 'left center', display: 'block',
            }}>
              {p.benefits[0]}
            </p>
          </div>

          {/* Divider */}
          <svg
            style={{ position: 'absolute', left: '9.13%', top: p.dividerTop, width: p.dividerWidth, height: '2px', overflow: 'visible', pointerEvents: 'none', zIndex: 1 }}
            viewBox={`0 0 ${p.id === 2 ? 716 : 614} 2`}
            preserveAspectRatio="none"
            fill="none"
          >
            <line x1="0" y1="1" x2={p.id === 2 ? 716 : 614} y2="1"
              stroke={p.borderColor}
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeLinecap="round"
            />
          </svg>

          {/* Benefit row 2 */}
          <div style={{
            position: 'absolute',
            left: '3.49%', top: p.icon2Top,
            width: p.benefitRowWidth,
            display: 'flex', alignItems: 'center',
            gap: 'min(1.5vw, 0.85vh)',
            zIndex: 1,
          }}>
            <img src={p.icons[1]} alt=""
              style={{ width: 'min(3.31vw, 1.86vh)', height: 'min(3.31vw, 1.86vh)', flexShrink: 0, objectFit: 'contain' }} />
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: p.benefitFontSize,
              color: p.textColor,
              textTransform: 'uppercase',
              lineHeight: 1.2, margin: 0, fontWeight: 400,
              transform: 'scaleX(0.85)', transformOrigin: 'left center', display: 'block',
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
