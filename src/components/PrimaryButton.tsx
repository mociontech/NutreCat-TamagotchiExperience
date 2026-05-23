import { motion } from 'framer-motion';

interface PrimaryButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'cyan' | 'purple' | 'orange' | 'colombia' | 'green' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const variants = {
  cyan: { bg: 'linear-gradient(135deg, #00AEEF, #0090C8)', shadow: 'rgba(0,174,239,0.4)' },
  purple: { bg: 'linear-gradient(135deg, #8B5CF6, #6C3FCA)', shadow: 'rgba(108,63,202,0.5)' },
  orange: { bg: 'linear-gradient(135deg, #FF8C00, #FFC800)', shadow: 'rgba(255,140,0,0.4)' },
  colombia: { bg: 'linear-gradient(135deg, #FCD116 0%, #CE1126 50%, #003087 100%)', shadow: 'rgba(252,209,22,0.4)' },
  green: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: 'rgba(34,197,94,0.4)' },
  dark: { bg: 'rgba(255,255,255,0.1)', shadow: 'rgba(0,0,0,0.2)' },
};

const sizes = {
  sm: { padding: '10px 20px', fontSize: '14px', borderRadius: '14px' },
  md: { padding: '14px 28px', fontSize: '16px', borderRadius: '18px' },
  lg: { padding: '18px 36px', fontSize: '20px', borderRadius: '24px' },
};

export default function PrimaryButton({ onClick, children, variant = 'cyan', size = 'md', fullWidth = false, disabled = false, style }: PrimaryButtonProps) {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      onClick={disabled ? undefined : onClick}
      style={{
        background: v.bg,
        boxShadow: `0 6px 20px ${v.shadow}`,
        color: 'white',
        fontWeight: 800,
        fontFamily: 'var(--font-body)',
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        letterSpacing: '0.3px',
        ...s,
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
