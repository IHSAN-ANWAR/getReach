import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaWallet, FaChartBar, FaSyncAlt } from 'react-icons/fa';

const cards = [
  {
    id: 'total-spent',
    label: 'Total Spent',
    value: 0,
    prefix: '$',
    decimals: 2,
    icon: <FaDollarSign size={22} />,
    color: '#ACC8A2',
    bg: 'rgba(172,200,162,0.12)',
    description: 'Your total spending',
  },
  {
    id: 'my-balance',
    label: 'My Balance',
    value: 50,
    prefix: '$',
    decimals: 2,
    icon: <FaWallet size={22} />,
    color: '#7aad6e',
    bg: 'rgba(122,173,110,0.12)',
    description: 'Available balance',
  },
  {
    id: 'platform-orders',
    label: 'Platform Orders',
    value: 1234567,
    prefix: '',
    decimals: 0,
    icon: <FaChartBar size={22} />,
    color: '#ACC8A2',
    bg: 'rgba(172,200,162,0.12)',
    description: 'Total orders processed',
    separator: ',',
  },
  {
    id: 'active-orders',
    label: 'Active Orders',
    value: 0,
    prefix: '',
    decimals: 0,
    icon: <FaSyncAlt size={22} />,
    color: '#e8a838',
    bg: 'rgba(232,168,56,0.12)',
    description: 'Currently processing',
  },
];

const StatsCards = () => {
  return (
    <div className="row g-3 mb-4">
      {cards.map((card, i) => (
        <div key={card.id} className="col-6 col-xl-3">
          <motion.div
            id={card.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
            className="card h-100"
            style={{ cursor: 'default', overflow: 'hidden', position: 'relative' }}
          >
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 90, height: 90, borderRadius: '50%',
              background: card.bg,
            }} />

            <div className="card-body p-3 p-md-4">
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: card.bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: card.color, marginBottom: 14,
              }}>
                {card.icon}
              </div>

              {/* Number */}
              <div style={{
                fontFamily: 'Poppins', fontWeight: 700,
                fontSize: 'clamp(20px, 4vw, 28px)',
                color: 'var(--text-color)', lineHeight: 1.1,
              }}>
                {card.id === 'total-spent' || card.id === 'my-balance' ? '$' : ''}
                {card.value.toLocaleString(undefined, { minimumFractionDigits: card.decimals })}
              </div>

              {/* Label */}
              <p style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--text-color)', fontWeight: 600 }}>
                {card.label}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-gray)', opacity: 0.8 }}>
                {card.description}
              </p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
