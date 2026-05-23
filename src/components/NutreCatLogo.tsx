interface LogoProps { size?: number; style?: React.CSSProperties; }

export default function NutreCatLogo({ size = 80, style }: LogoProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      ...style,
    }}>
      {/* REPLACE: <img src="/assets/nutre-cat-logo.png" style={{width:size,height:'auto'}}/> */}
      <div style={{
        background: 'var(--nc-cyan)',
        borderRadius: '16px',
        padding: '8px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,174,239,0.4)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.35,
          color: 'white',
          lineHeight: 1,
          letterSpacing: '-1px',
        }}>NUTRE</span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.5,
          color: 'white',
          lineHeight: 0.9,
          letterSpacing: '-1px',
        }}>CAT 🐱</span>
        <span style={{
          fontSize: size * 0.12,
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>PREMIUM</span>
      </div>
    </div>
  );
}
