import { motion } from 'framer-motion';

export type NavTabId = 'game' | 'food' | 'sleep';

export interface NavTabDef {
  id: NavTabId;
  label: string;
  iconSrc: string;
  isActive: boolean;
  isDone: boolean;
  onClick: () => void;
}

interface Props { tabs: NavTabDef[]; }

export default function BottomNav({ tabs }: Props) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 16px 20px',
      flexShrink: 0,
      gap: '6px',
    }}>
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.86 }}
          onClick={tab.onClick}
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '5px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            position: 'relative',
          }}
        >
          {tab.isDone && (
            <div style={{
              position: 'absolute', top: 0, right: '15%',
              width: 16, height: 16, borderRadius: '50%',
              background: '#4ade80', zIndex: 3,
              fontSize: '9px', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, boxShadow: '0 2px 6px rgba(74,222,128,0.5)',
            }}>✓</div>
          )}

          <div style={{
            width: 68, height: 68,
            borderRadius: '50%',
            background: tab.isActive ? '#00577a' : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            boxShadow: tab.isActive
              ? '0 4px 16px rgba(0,87,122,0.45)'
              : '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'background 0.25s, box-shadow 0.25s',
          }}>
            {/* Wave decoration inside active circle */}
            {tab.isActive && (
              <img
                src={`/assets/nav/active-${tab.id}.svg`}
                alt=""
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  opacity: 0.25, pointerEvents: 'none',
                }}
              />
            )}
            <img
              src={tab.iconSrc}
              alt={tab.label}
              style={{
                width: '54%', height: '54%',
                objectFit: 'contain',
                filter: tab.isActive ? 'brightness(0) invert(1)' : 'none',
                position: 'relative', zIndex: 1,
                transition: 'filter 0.2s',
              }}
            />
          </div>

          <span style={{
            fontSize: '9px', fontWeight: 800,
            letterSpacing: '0.05em',
            color: tab.isActive ? '#00577a' : 'rgba(0,87,122,0.55)',
            transition: 'color 0.2s',
          }}>
            {tab.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
