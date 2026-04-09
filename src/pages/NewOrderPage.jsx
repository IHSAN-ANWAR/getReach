import React from 'react';
import { motion } from 'framer-motion';
import StatsCards from '../components/StatsCards';
import OrderForm from '../components/OrderForm';

const NewOrderPage = ({ user, updateBalance }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ padding: '32px 28px', minHeight: '100vh' }}
    >
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="mb-4"
      >
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 'clamp(20px, 3vw, 28px)', color: 'var(--text-color)', marginBottom: 4 }}>
          New Order
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 16, margin: 0 }}>
          Boost your social media presence instantly
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards user={user} />

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(172,200,162,0.3), transparent)',
          marginBottom: 28,
        }}
      />

      {/* Order Form */}
      <OrderForm user={user} updateBalance={updateBalance} />
    </motion.div>
  );
};

export default NewOrderPage;
