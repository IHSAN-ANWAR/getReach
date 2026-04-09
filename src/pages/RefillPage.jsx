import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSyncAlt, FaExclamationTriangle, FaCheckCircle, 
  FaExternalLinkAlt, FaInfoCircle, FaClock
} from 'react-icons/fa';

const MOCK_REFILL_ORDERS = [
  { id: 10234, service: 'TikTok Likes', platform: 'tiktok', target: 'tiktok.com/@user/v/123', status: 'Eligible', date: '2026-04-03', dropCount: 200 },
  { id: 10221, service: 'Instagram Followers', platform: 'instagram', target: 'instagram.com/user', status: 'Processing', date: '2026-04-01', dropCount: 50 },
  { id: 10215, service: 'YouTube Views', platform: 'youtube', target: 'youtube.com/watch?v=abc', status: 'Completed', date: '2026-03-28', dropCount: 500 },
];

const RefillPage = () => {
  const [loading, setLoading] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRefillRequest = async (id) => {
    setLoading(id);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(null);
    setSuccess(id);
    setTimeout(() => setSuccess(null), 4000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      Eligible: { bg: 'rgba(172,200,162,0.15)', color: '#ACC8A2', icon: <FaCheckCircle /> },
      Processing: { bg: 'rgba(232,168,56,0.15)', color: '#e8a838', icon: <FaSyncAlt className="fa-spin" /> },
      Completed: { bg: 'rgba(172,200,162,0.15)', color: '#ACC8A2', icon: <FaCheckCircle /> },
    };
    const s = styles[status] || styles.Eligible;
    return (
      <span style={{
        padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
        background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 6
      }}>
        {s.icon} {status}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px 28px' }}
    >
      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 32, color: 'var(--text-color)', marginBottom: 8 }}>
          Refill Requests
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 16 }}>
          Request a refill for dropped services within the warranty period
        </p>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info mb-4" style={{ 
        background: 'rgba(172,200,162,0.08)', border: '1px solid rgba(172,200,162,0.2)', 
        borderRadius: 16, color: 'var(--text-color)', padding: '20px'
      }}>
        <div className="d-flex gap-3">
          <FaInfoCircle color="#ACC8A2" size={20} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>How Refill Works</div>
            <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
              Most of our "HQ" and "Premium" services come with a 30-day refill guarantee. If you notice a drop in count, 
              simply find your order below and click "Request Refill". Our system will automatically verify the drop 
              and start the refill process within 24 hours.
            </div>
          </div>
        </div>
      </div>

      {/* Refill Table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table mb-0" style={{ color: 'var(--text-color)' }}>
            <thead style={{ background: '#ACC8A2' }}>
              <tr>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Order ID</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Service Details</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Drop Stats</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Status</th>
                <th className="px-4 py-3 border-0 text-end" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_REFILL_ORDERS.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)', verticalAlign: 'middle' }}>
                  <td className="px-4 py-4 border-0" style={{ fontSize: 15, fontWeight: 700 }}>#{o.id}</td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{o.service}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-gray)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaExternalLinkAlt size={10} /> {o.target}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#ff6b7a' }}>-{o.dropCount} units</div>
                    <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FaClock size={10} /> Ordered {o.date}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">{getStatusBadge(o.status)}</td>
                  <td className="px-4 py-4 border-0 text-end">
                    {success === o.id ? (
                      <span style={{ color: '#ACC8A2', fontWeight: 800, fontSize: 14 }}>Sent!</span>
                    ) : (
                      <button
                        onClick={() => handleRefillRequest(o.id)}
                        disabled={o.status !== 'Eligible' || loading === o.id}
                        style={{
                          padding: '10px 20px', borderRadius: 12, border: 'none',
                          background: o.status === 'Eligible' ? 'linear-gradient(135deg, #ff6b7a, #e74c3c)' : 'rgba(128,128,128,0.1)',
                          color: o.status === 'Eligible' ? '#fff' : 'var(--color-gray)',
                          fontWeight: 700, fontSize: 14,
                          cursor: o.status === 'Eligible' ? 'pointer' : 'not-allowed',
                          display: 'inline-flex', alignItems: 'center', gap: 8,
                          transition: 'all 0.2s',
                          boxShadow: o.status === 'Eligible' ? '0 4px 15px rgba(231,76,60,0.25)' : 'none'
                        }}
                      >
                        {loading === o.id ? <div className="spinner-border spinner-border-sm" /> : <><FaSyncAlt size={12} /> Request Refill</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '24px', borderRadius: 20, background: 'rgba(232,168,56,0.05)', border: '1px solid rgba(232,168,56,0.15)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#e8a838', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaExclamationTriangle /> Important Policy
        </h3>
        <p style={{ fontSize: 14, color: 'var(--color-gray)', lineHeight: 1.6, margin: 0 }}>
          Refill is only available for orders with a "Refill Guarantee" tag in the services list. 
          The refill process will not start if the account is set to private or if you have changed the username 
          since placing the order. Please ensure your account remains public during the refill process.
        </p>
      </div>
    </motion.div>
  );
};

export default RefillPage;
