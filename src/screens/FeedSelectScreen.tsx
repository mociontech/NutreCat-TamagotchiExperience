import { motion } from 'framer-motion';
import { useState } from 'react';
import type { FoodType } from '../data/gameStates';
import ProductCard from '../components/ProductCard';
import PrimaryButton from '../components/PrimaryButton';

interface Props {
  onSelect: (food: FoodType) => void;
  onBack: () => void;
}

export default function FeedSelectScreen({ onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<FoodType>(null);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #0A1628, #003087 50%, #0A1628)',
      display: 'flex', flexDirection: 'column',
      padding: '36px 20px 32px',
    }}>
      <motion.button onClick={onBack} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 700, marginBottom: '16px', alignSelf: 'flex-start', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
        ← Volver
      </motion.button>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'white', marginBottom: '6px' }}>
          ¿Qué le damos hoy? 🍽️
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', fontWeight: 600 }}>
          Elige su comida favorita
        </p>
      </motion.div>

      {/* Cat preview */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ textAlign: 'center', fontSize: '90px', marginBottom: '20px' }}
      >
        {selected ? '😋' : '🐱'}
      </motion.div>

      {/* Product cards */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flex: 1, alignItems: 'stretch' }}>
        {(['dry', 'wet', 'treats'] as FoodType[]).map((id) => (
          <ProductCard key={id} foodId={id} selected={selected === id} onClick={() => setSelected(id)} />
        ))}
      </div>

      <PrimaryButton
        onClick={() => selected && onSelect(selected)}
        variant="cyan" size="lg" fullWidth
        disabled={!selected}
      >
        {selected ? '¡Dale de comer! 🍗' : 'Selecciona un producto'}
      </PrimaryButton>
    </div>
  );
}
