import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  color: string;
  icon: string;
  delta?: number;
}

export default function StatBar({ label, value, color, icon, delta }: StatBarProps) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          {icon} {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {delta !== undefined && delta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '11px', color: delta > 0 ? '#4ade80' : '#f87171', fontWeight: 800 }}
            >
              {delta > 0 ? `+${delta}` : delta}
            </motion.span>
          )}
          <span style={{ fontSize: '12px', color: 'white', fontWeight: 800 }}>{Math.round(value)}/100</span>
        </div>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '99px', boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  );
}
