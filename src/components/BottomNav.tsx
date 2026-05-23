import { motion } from 'framer-motion';

export type NavTabId = 'game' | 'food' | 'hygiene' | 'sleep';

export interface NavTabDef {
  id: NavTabId;
  label: string;
  iconSrc: string;
  isActive: boolean;
  isDone: boolean;
  onClick: () => void;
}

interface Props {
  tabs: NavTabDef[];
}

const ACTIVE_BG  = '#303030';
const INACTIVE_BG = '#797979';

export default function BottomNav({ tabs }: Props) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 20px 24px',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
      gap: '8px',
    }}>
      {tabs.map(tab => (
        <motion.button
          key={tab.id}
          whileTap={{ scale: 0.85 }}
          onClick={tab.onClick}
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            position: 'relative',
          }}
        >
          {tab.isDone && (
            <div style={{
              position: 'absolute', top: 0, right: '20%',
              width: 16, height: 16, borderRadius: '50%',
              background: '#4ade80', zIndex: 2,
              fontSize: '9px', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, boxShadow: '0 2px 8px rgba(74,222,128,0.5)',
            }}>✓</div>
          )}

          <motion.div
            animate={tab.isActive
              ? { boxShadow: ['0 0 0 0 rgba(255,255,255,0.1)', '0 0 0 6px rgba(255,255,255,0.08)', '0 0 0 0 rgba(255,255,255,0.1)'] }
              : {}
            }
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              width: 68, height: 68,
              borderRadius: '50%',
              background: tab.isActive ? ACTIVE_BG : INACTIVE_BG,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.25s',
              overflow: 'hidden',
            }}
          >
            <img
              src={tab.iconSrc}
              alt={tab.label}
              style={{
                width: '56%',
                height: '56%',
                objectFit: 'contain',
                filter: 'brightness(0) invert(1)',
                opacity: tab.isActive ? 1 : 0.75,
                transition: 'opacity 0.2s',
              }}
            />
          </motion.div>

          <span style={{
            fontSize: '9px', fontWeight: 800,
            letterSpacing: '0.06em',
            color: tab.isActive ? 'white' : 'rgba(255,255,255,0.4)',
            transition: 'color 0.2s',
          }}>
            {tab.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
