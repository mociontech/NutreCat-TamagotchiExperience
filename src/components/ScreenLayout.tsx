import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  style?: React.CSSProperties;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundFilter?: string;
  tintColor?: string;
}

/** Cyan base + room background at 44% opacity — used by all interaction screens */
export default function ScreenLayout({ children, style, backgroundImage = '/assets/backgrounds/bg-pet2.png', backgroundOpacity = 0.44, backgroundFilter, tintColor }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00b6ed',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        opacity: backgroundOpacity,
        filter: backgroundFilter,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      {tintColor && (
        <div style={{
          position: 'absolute', inset: 0,
          background: tintColor,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}
