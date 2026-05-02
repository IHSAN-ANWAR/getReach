import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSyncAlt, FaExclamationTriangle, FaCheckCircle,
  FaExternalLinkAlt, FaInfoCircle, FaClock, FaBoxOpen, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const REFILLABLE_STATUSES = ['completed', 'partial'];

function getStatusBadge(status) {
  const s = (status || '').toLowerCase();
  const map = {
    completed: { bg: 'rgba(172,200,162,0.15)', color: '#ACC8A2', icon: <FaCheckCircle />, label: 'Completed' },
    partial:   { bg: 'rgba(159,122,234,0.15)', color: '#9f7aea', icon: <FaExclamationTriangle />, label: 'Partial' },
  };
  const cfg = map[s] || { bg: 'rgba(128,128,128,0.1)', color: 'var(--color-gray)', icon: <FaClock />, label: status };
  return (
    <span style={{
      padding: '6px 12px', borderRadius: 10, fontSize: 13, fontWeight: 700,
      background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', gap: 6
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

const RefillPage = ({ user }) => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refilling, setRefilling] = useState(null);
  const [success, setSuccess]   = useState({});   // { [orderId]: message }
  const [errors, setErrors]     = useState({});   // { [orderId]: message }

  const uid = user?._id || user?.id;

  const fetchOrders = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/orders/user/${uid}`);
      // Only show completed / partial orders (refillable)
      const eligible = (res.data || []).filter(o =>
        REFILLABLE_STATUSES.includes((o.status || '').toLowerCase())
      );
      setOrders(eligible);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleRefillRequest = async (order) => {
    const id = order._id || order.id;
    setRefilling(id);
    setErrors(p => ({ ...p, [id]: null }));
    setSuccess(p => ({ ...p, [id]: null }));

    try {
      const res = await axios.post(`${API_BASE}/api/orders/refill/${id}`);
      const msg = res.data?.message || 'Refill request submitted successfully.';
      setSuccess(p => ({ ...p, [id]: msg }));
    } catch (err) {
      const msg = err.response?.data?.error || 'Refill request failed. Please try again.';
      setErrors(p => ({ ...p, [id]: msg }));
    } finally {
      setRefilling(null);
    }
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
                {['Order ID', 'Service Details', 'Quantity', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-4 py-3 border-0"
                    style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--color-gray)' }}>
                    <FaSpinner size={22} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 10px' }} />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 48, textAlign: 'center', color: 'var(--color-gray)' }}>
                    <FaBoxOpen size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.25 }} />
                    No completed or partial orders found for refill.
                  </td>
                </tr>
              ) : orders.map((o) => {
                const id = o._id || o.id;
                const isRefilling = refilling === id;
                const successMsg  = success[id];
                const errorMsg    = errors[id];

                return (
                  <tr key={id} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)', verticalAlign: 'middle' }}>
                    {/* Order ID */}
                    <td className="px-4 py-4 border-0">
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        #{o.apiOrderId || id}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FaClock size={10} /> {new Date(o.created || o.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Service Details */}
                    <td className="px-4 py-4 border-0">
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{o.serviceName || o.serviceId}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-gray)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FaExternalLinkAlt size={10} />
                        <a href={o.link} target="_blank" rel="noreferrer"
                          style={{ color: 'var(--color-gray)', textDecoration: 'none', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                          {o.link}
                        </a>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-4 border-0">
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{(o.quantity || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2 }}>
                        Rs {Number(o.price || 0).toFixed(2)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 border-0">{getStatusBadge(o.status)}</td>

                    {/* Action */}
                    <td className="px-4 py-4 border-0">
                      {successMsg ? (
                        <div style={{ color: '#ACC8A2', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaCheckCircle /> {successMsg}
                        </div>
                      ) : errorMsg ? (
                        <div style={{ color: '#ff6b7a', fontWeight: 700, fontSize: 13 }}>{errorMsg}</div>
                      ) : (
                        <button
                          onClick={() => handleRefillRequest(o)}
                          disabled={isRefilling}
                          style={{
                            padding: '10px 20px', borderRadius: 12, border: 'none',
                            background: 'linear-gradient(135deg, #ACC8A2, #7aab6e)',
                            color: '#1A2517',
                            fontWeight: 700, fontSize: 14,
                            cursor: isRefilling ? 'not-allowed' : 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            transition: 'all 0.2s',
                            opacity: isRefilling ? 0.7 : 1,
                            boxShadow: '0 4px 15px rgba(172,200,162,0.25)'
                          }}
                        >
                          {isRefilling
                            ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Requesting...</>
                            : <><FaSyncAlt size={12} /> Request Refill</>
                          }
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy */}
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default RefillPage;
