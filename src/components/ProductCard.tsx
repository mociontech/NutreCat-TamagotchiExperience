import { motion } from 'framer-motion';
import { foods } from '../data/gameStates';
import type { FoodType } from '../data/gameStates';

interface ProductCardProps {
  foodId: FoodType;
  selected: boolean;
  onClick: () => void;
}

export default function ProductCard({ foodId, selected, onClick }: ProductCardProps) {
  const food = foods.find(f => f.id === foodId);
  if (!food) return null;

  return (
    <motion.div
      whileTap={{ scale: 0.94 }}
      whileHover={{ scale: 1.04, y: -4 }}
      onClick={onClick}
      style={{
        background: selected ? `linear-gradient(135deg,${food.color}33,${food.color}11)` : 'rgba(255,255,255,0.05)',
        border: selected ? `2px solid ${food.color}` : '2px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '16px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        boxShadow: selected ? `0 0 20px ${food.color}40` : 'none',
        transition: 'all 0.2s ease',
        minWidth: 0,
      }}
    >
      {/* Product image placeholder */}
      <div style={{
        width: '80px', height: '90px',
        background: `linear-gradient(135deg,${food.color}44,${food.color}22)`,
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px',
        border: `1px solid ${food.color}44`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* REPLACE: <img src="/assets/nutre-cat-pack-{foodId}.png" style={{width:'100%',height:'100%',objectFit:'contain'}}/> */}
        <span>{food.emoji}</span>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: food.color,
          height: '4px',
        }}/>
        <div style={{
          position: 'absolute', top: '4px', left: '4px', right: '4px',
          textAlign: 'center', fontSize: '7px', fontWeight: 900,
          color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px',
          lineHeight: 1.1,
        }}>
          NUTRE<br/>CAT
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: 800, color: 'white', lineHeight: 1.2 }}>{food.name}</p>
        <p style={{ fontSize: '10px', color: food.color, fontWeight: 700, marginTop: '2px' }}>{food.subtitle}</p>
      </div>

      <div style={{
        background: `${food.color}22`,
        border: `1px solid ${food.color}44`,
        borderRadius: '10px',
        padding: '4px 8px',
        fontSize: '10px',
        color: food.color,
        fontWeight: 700,
        textAlign: 'center',
      }}>
        {food.benefit}
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            width: '24px', height: '24px',
            background: food.color,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', color: 'white', fontWeight: 900,
          }}
        >✓</motion.div>
      )}
    </motion.div>
  );
}
