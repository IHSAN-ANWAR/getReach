import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaClock, FaCheckCircle, FaSyncAlt, FaTimesCircle,
  FaExclamationTriangle, FaFilter, FaSearch, FaLink,
  FaBoxOpen, FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';

const STATUSES = [
  {
    id: 'pending',
    label: 'Pending',
    color: '#e8a838',
    bg: 'rgba(232,168,56,0.12)',
    icon: <FaClock />,
    desc: 'Your order has been received and is waiting to start.'
  },
  {
    id: 'processing',
    label: 'Processing',
    color: '#4299e1',
    bg: 'rgba(66,153,225,0.12)',
    icon: <FaSyncAlt />,
    desc: 'Order is actively being processed by the provider.'
  },
  {
    id: 'in progress',
    label: 'In Progress',
    color: '#4299e1',
    bg: 'rgba(66,153,225,0.12)',
    icon: <FaSyncAlt />,
    desc: 'Delivery is underway — followers/likes are being added.'
  },
  {
    id: 'completed',
    label: 'Completed',
    color: '#ACC8A2',
    bg: 'rgba(172,200,162,0.12)',
    icon: <FaCheckCircle />,
    desc: 'Order fully delivered. All requested quantity has been sent.'
  },
  {
    id: 'partial',
    label: 'Partial',
    color: '#9f7aea',
    bg: 'rgba(159,122,234,0.12)',
    icon: <FaExclamationTriangle />,
    desc: 'Only part of the order was delivered. A partial refund may apply.'
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    color: '#ff6b7a',
    bg: 'rgba(231,76,60,0.12)',
    icon: <FaTimesCircle />,
    desc: 'Order was cancelled. Your balance has been refunded.'
  },
];

const getStatus = (status) => {
  const key = (status || 'pending').toLowerCase();
  return STATUSES.find(s => s.id === key) || STATUSES[0];
};

const StatusBadge = ({ status }) => {
  const s = getStatus(status);
  return (
    <span style={{ padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: s.bg, color: s.color, display: 'inline-flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
      {s.icon} {s.label}
    </span>
  );
};

const FILTERS = ['All', 'Pending', 'Processing', 'In Progress', 'Completed', 'Partial', 'Cancelled'];

const MyOrdersPage = ({ user }) => {
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const uid = user?._id || user?.id;
    if (!uid) return;

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/user/${uid}`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Poll non-terminal orders every 30s
    const poll = setInterval(() => {
      setOrders(current => {
        current.filter(o => !['completed','partial','cancelled'].includes((o.status||'').toLowerCase()))
          .forEach(async o => {
            try {
              const r = await axios.get(`http://localhost:5000/api/orders/order-status/${o._id}`);
              const newStatus = r.data?.apiStatus?.status;
              if (newStatus && newStatus.toLowerCase() !== o.status.toLowerCase()) {
                setOrders(prev => prev.map(x => x._id === o._id ? { ...x, status: newStatus } : x));
              }
            } catch {}
          });
        return current;
      });
    }, 30000);

    return () => clearInterval(poll);
  }, [user]);

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'All' || (o.status || '').toLowerCase() === filter.toLowerCase();
    const matchSearch = (o.serviceName || '').toLowerCase().includes(search.toLowerCase()) ||
                        (o.apiOrderId || '').toString().includes(search) ||
                        (o.link || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Stats
  const stats = STATUSES.map(s => ({
    ...s,
    count: orders.filter(o => (o.status || 'pending').toLowerCase() === s.id).length
  })).filter(s => s.count > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px' }}>

      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 34, color: 'var(--text-color)', marginBottom: 4 }}>My Orders</h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 15, margin: 0 }}>Track all your orders and their live delivery status.</p>
      </div>

      {/* Status summary cards */}
      {!loading && stats.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4">
          {stats.map(s => (
            <div key={s.id} style={{ padding: '14px 20px', borderRadius: 16, background: s.bg, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: s.color, fontSize: 18 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '14px 20px', borderRadius: 16, background: 'var(--card-bg)', border: '1px solid rgba(172,200,162,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#ACC8A2', fontSize: 18 }}><FaBoxOpen /></span>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-color)', lineHeight: 1 }}>{orders.length}</div>
              <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 600 }}>Total Orders</div>
            </div>
          </div>
        </div>
      )}

      {/* Status legend — REMOVED from here, moved to bottom */}

      {/* Filters + Search */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div className="d-flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: filter === f ? '#ACC8A2' : 'var(--card-bg)',
              color: filter === f ? '#1A2517' : 'var(--color-gray)',
            }}>
              {f}
            </button>
          ))}
        </div>
        <div className="input-group" style={{ maxWidth: 280 }}>
          <span className="input-group-text border-0" style={{ background: 'var(--card-bg)', color: 'var(--color-gray)' }}><FaSearch size={13} /></span>
          <input type="text" className="form-control border-0 shadow-none" placeholder="Search service or link..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'var(--card-bg)', fontSize: 13 }} />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden" style={{ borderRadius: 20 }}>
        <div className="table-responsive">
          <table className="table mb-0" style={{ color: 'var(--text-color)' }}>
            <thead style={{ background: '#1A2517' }}>
              <tr>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Order ID</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Date</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Service</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Link</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Qty</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Price</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 11, textTransform: 'uppercase', color: '#ACC8A2', fontWeight: 800, letterSpacing: 1 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5" style={{ color: 'var(--color-gray)' }}>Loading your orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-5" style={{ color: 'var(--color-gray)' }}>
                  <FaBoxOpen size={32} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.3 }} />
                  No orders found
                </td></tr>
              ) : filtered.map(o => {
                const s = getStatus(o.status);
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)', verticalAlign: 'middle' }}>
                    <td className="px-4 py-3 border-0">
                      <span style={{ fontWeight: 800, color: '#ACC8A2', fontSize: 13 }}>#{o.apiOrderId || o._id.slice(-5).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 border-0" style={{ fontSize: 12, color: 'var(--color-gray)', whiteSpace: 'nowrap' }}>
                      {new Date(o.created).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-0">
                      <div style={{ fontSize: 13, fontWeight: 700, maxWidth: 180, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{o.serviceName || o.serviceId}</div>
                    </td>
                    <td className="px-4 py-3 border-0" style={{ maxWidth: 180 }}>
                      <a href={o.link} target="_blank" rel="noreferrer" style={{ color: '#ACC8A2', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                        <FaLink size={10} /> {o.link}
                      </a>
                    </td>
                    <td className="px-4 py-3 border-0" style={{ fontSize: 14, fontWeight: 700 }}>
                      {(o.quantity || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 border-0">
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#ACC8A2' }}>Rs {(parseFloat(o.price || 0) * 280).toFixed(2)}</div>
                    </td>
                    <td className="px-4 py-3 border-0">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StatusBadge status={o.status} />
                        <span
                          onMouseEnter={() => setTooltip(o._id)}
                          onMouseLeave={() => setTooltip(null)}
                          style={{ color: 'var(--color-gray)', cursor: 'pointer', position: 'relative' }}
                        >
                          <FaInfoCircle size={13} />
                          {tooltip === o._id && (
                            <div style={{ position: 'absolute', bottom: '120%', right: 0, background: '#1A2517', color: '#F5F0E8', padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, width: 220, zIndex: 99, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', lineHeight: 1.5 }}>
                              {s.desc}
                            </div>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Guide — 4 boxes */}
      <div className="mt-4">
        <div style={{ fontSize: 13, color: 'var(--color-gray)', fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaInfoCircle /> Order Status Guide
        </div>
        <div className="row g-3">
          {[
            { label: 'Pending',     color: '#e8a838', bg: 'rgba(232,168,56,0.08)',   icon: <FaClock size={22}/>,              desc: 'Your order is in the queue waiting to start. No action needed — it will begin shortly.' },
            { label: 'In Progress', color: '#4299e1', bg: 'rgba(66,153,225,0.08)',   icon: <FaSyncAlt size={22}/>,            desc: 'Order is actively being processed. Followers, likes or views are currently being delivered to your link.' },
            { label: 'Partial',     color: '#9f7aea', bg: 'rgba(159,122,234,0.08)',  icon: <FaExclamationTriangle size={22}/>, desc: 'Only part of the order was delivered — usually due to account privacy. A partial refund may apply.' },
            { label: 'Completed',   color: '#ACC8A2', bg: 'rgba(172,200,162,0.08)', icon: <FaCheckCircle size={22}/>,        desc: 'Order fully delivered. All the requested quantity has been successfully sent to your link.' },
          ].map(s => (
            <div key={s.label} className="col-12 col-sm-6 col-xl-3">
              <div style={{ padding: '20px 22px', borderRadius: 18, background: s.bg, border: `1px solid ${s.color}25`, height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 900, color: s.color }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-gray)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};

export default MyOrdersPage;
