import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaClock, FaCheckCircle, FaSyncAlt, FaTimesCircle,
  FaExclamationTriangle, FaSearch, FaLink, FaBoxOpen,
  FaBan, FaTimes, FaSpinner
} from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const API = API_BASE;
const TERMINAL = ['completed', 'partial', 'cancelled', 'refunded'];

// ── Status config ──
const STATUS_MAP = {
  pending:     { label: 'Pending',     color: '#e8a838', bg: 'rgba(232,168,56,0.13)',   icon: FaClock,                desc: 'Queued and waiting to start.' },
  processing:  { label: 'Processing',  color: '#4299e1', bg: 'rgba(66,153,225,0.13)',   icon: FaSyncAlt,              desc: 'Being processed.' },
  'in progress':{ label: 'In Progress', color: '#4299e1', bg: 'rgba(66,153,225,0.13)',  icon: FaSyncAlt,              desc: 'Delivery is actively underway.' },
  completed:   { label: 'Completed',   color: '#ACC8A2', bg: 'rgba(172,200,162,0.13)', icon: FaCheckCircle,          desc: 'Fully delivered.' },
  partial:     { label: 'Partial',     color: '#9f7aea', bg: 'rgba(159,122,234,0.13)', icon: FaExclamationTriangle,  desc: 'Partially delivered. Refund may apply.' },
  cancelled:   { label: 'Cancelled',   color: '#ff6b7a', bg: 'rgba(255,107,122,0.13)', icon: FaTimesCircle,          desc: 'Order was cancelled.' },
  refunded:    { label: 'Refunded',    color: '#9f7aea', bg: 'rgba(159,122,234,0.13)', icon: FaTimesCircle,          desc: 'Refunded to your balance.' },
};

function getStatus(raw) {
  const key = (raw || 'pending').toLowerCase();
  return STATUS_MAP[key] || STATUS_MAP['pending'];
}

function StatusBadge({ status, pulse }) {
  const s = getStatus(status);
  const Icon = s.icon;
  const isActive = ['processing','in progress'].includes((status||'').toLowerCase());
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 11px', borderRadius: 8, fontSize: 11, fontWeight: 800,
      background: s.bg, color: s.color, textTransform: 'uppercase', whiteSpace: 'nowrap',
      border: `1px solid ${s.color}30`,
    }}>
      <Icon size={11} style={isActive && pulse ? { animation: 'spin 1.4s linear infinite' } : {}} />
      {s.label}
    </span>
  );
}

function ProgressBar({ status }) {
  const steps = ['pending','in progress','completed'];
  const key = (status||'pending').toLowerCase();
  const cancelled = key === 'cancelled' || key === 'refunded';
  const partial   = key === 'partial';
  const idx = cancelled ? -1 : partial ? 2 : steps.indexOf(key === 'processing' ? 'in progress' : key);
  const pct = cancelled ? 100 : partial ? 66 : idx === 0 ? 15 : idx === 1 ? 55 : 100;
  const color = cancelled ? '#ff6b7a' : partial ? '#9f7aea' : '#ACC8A2';

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

const FILTERS = ['All','Pending','In Progress','Completed','Partial','Cancelled'];

export default function MyOrdersPage({ user }) {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [refreshing, setRefreshing] = useState({});

  const uid = user?._id || user?.id;

  const fetchOrders = useCallback(async () => {
    if (!uid) return;
    try {
      const res = await axios.get(`${API}/api/orders/user/${uid}`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchOrders();
    // Poll active orders every 30s
    const poll = setInterval(async () => {
      setOrders(prev => {
        const active = prev.filter(o => !TERMINAL.includes((o.status||'').toLowerCase()));
        active.forEach(async o => {
          try {
            const r = await axios.get(`${API}/api/orders/order-status/${o._id}`);
            const ns = r.data?.apiStatus?.status?.toLowerCase();
            if (ns && ns !== (o.status||'').toLowerCase()) {
              setOrders(p => p.map(x => x._id === o._id ? { ...x, status: ns } : x));
            }
          } catch {}
        });
        return prev;
      });
    }, 30000);
    return () => clearInterval(poll);
  }, [fetchOrders]);

  const refreshOne = async (order) => {
    setRefreshing(p => ({ ...p, [order._id]: true }));
    try {
      const r = await axios.get(`${API}/api/orders/order-status/${order._id}`);
      const ns = r.data?.apiStatus?.status?.toLowerCase();
      if (ns) setOrders(p => p.map(x => x._id === order._id ? { ...x, status: ns } : x));
    } catch {}
    setRefreshing(p => ({ ...p, [order._id]: false }));
  };

  const cancelOrder = async (order) => {
    setCancelling(order._id);
    try {
      await axios.post(`${API}/api/orders/cancel/${order._id}`);
      setOrders(p => p.map(x => x._id === order._id ? { ...x, status: 'cancelled' } : x));
    } catch (err) {
      alert(err.response?.data?.error || 'Cancel failed.');
    } finally {
      setCancelling(null);
      setConfirmCancel(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === 'All' || (o.status||'pending').toLowerCase() === filter.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q
      || (o.serviceName||'').toLowerCase().includes(q)
      || (o.link||'').toLowerCase().includes(q)
      || (o.apiOrderId||'').toString().includes(q);
    return matchFilter && matchSearch;
  });

  // Summary counts
  const counts = {};
  orders.forEach(o => { const k = (o.status||'pending').toLowerCase(); counts[k] = (counts[k]||0)+1; });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '28px 24px' }}>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-color)' }}>My Orders</div>
        <div style={{ fontSize: 13, color: 'var(--color-gray)', marginTop: 3 }}>Live status of all your orders</div>
      </div>

      {/* Summary chips */}
      {!loading && orders.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
          <SummaryChip label="Total" value={orders.length} color="#ACC8A2" bg="rgba(172,200,162,0.12)" icon={<FaBoxOpen size={13}/>} />
          {Object.entries(counts).map(([k, v]) => {
            const s = getStatus(k);
            const Icon = s.icon;
            return <SummaryChip key={k} label={s.label} value={v} color={s.color} bg={s.bg} icon={<Icon size={13}/>} />;
          })}
        </div>
      )}

      {/* Filter + Search */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '10px 18px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              background: filter === f ? '#ACC8A2' : 'var(--card-bg)',
              color: filter === f ? '#1A2517' : 'var(--color-gray)',
              transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card-bg)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '8px 14px', minWidth: 220 }}>
          <FaSearch size={12} style={{ opacity: 0.4 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search service or link..." style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-color)', width: '100%' }} />
          {search && <FaTimes size={11} style={{ cursor: 'pointer', opacity: 0.4 }} onClick={() => setSearch('')} />}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card-bg)', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ background: '#1A2517' }}>
                {['Order','Service','Link','Qty','Price','Status','Progress','Action'].map((h, i) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: i >= 3 ? 'center' : 'left', fontSize: 12, fontWeight: 800, color: 'rgba(172,200,162,0.7)', textTransform: 'uppercase', letterSpacing: 1.2, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--color-gray)' }}>Loading orders...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--color-gray)' }}>
                  <FaBoxOpen size={28} style={{ display: 'block', margin: '0 auto 10px', opacity: 0.25 }} />
                  No orders found
                </td></tr>
              ) : filtered.map((o, i) => {
                const key = (o.status||'pending').toLowerCase();
                const isTerminal = TERMINAL.includes(key);
                const isActive = ['processing','in progress'].includes(key);
                const s = getStatus(o.status);

                return (
                  <tr key={o._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', verticalAlign: 'middle', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(172,200,162,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Order ID + date */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#ACC8A2', fontSize: 14 }}>#{o.apiOrderId || o._id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2 }}>{new Date(o.created).toLocaleDateString()}</div>
                    </td>

                    {/* Service */}
                    <td style={{ padding: '13px 16px', maxWidth: 180 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 170 }} title={o.serviceName}>
                        {o.serviceName || o.serviceId}
                      </div>
                    </td>

                    {/* Link */}
                    <td style={{ padding: '13px 16px', maxWidth: 160 }}>
                      <a href={o.link} target="_blank" rel="noreferrer" style={{ color: '#ACC8A2', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }} title={o.link}>
                        <FaLink size={10} style={{ flexShrink: 0 }} />
                        {o.link.replace(/^https?:\/\//, '')}
                      </a>
                    </td>

                    {/* Qty */}
                    <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 800, fontSize: 15, color: 'var(--text-color)' }}>
                      {(o.quantity||0).toLocaleString()}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '13px 16px', textAlign: 'center', fontWeight: 800, fontSize: 15, color: '#ACC8A2', whiteSpace: 'nowrap' }}>
                      Rs {Number(o.price||0).toFixed(2)}
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <StatusBadge status={o.status} pulse />
                      <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 4, fontWeight: 600 }}>{s.desc}</div>
                    </td>

                    {/* Progress bar */}
                    <td style={{ padding: '13px 16px', minWidth: 100 }}>
                      <ProgressBar status={o.status} />
                      <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 4, textAlign: 'center', fontWeight: 600 }}>
                        {key === 'pending' ? 'Queued' : key === 'in progress' || key === 'processing' ? 'Delivering...' : key === 'completed' ? 'Done' : key === 'partial' ? 'Partial' : key === 'cancelled' ? 'Cancelled' : '—'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {/* Refresh status */}
                        {!isTerminal && (
                          <button
                            onClick={() => refreshOne(o)}
                            disabled={refreshing[o._id]}
                            title="Refresh status"
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(66,153,225,0.2)', background: 'rgba(66,153,225,0.08)', color: '#4299e1', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            {refreshing[o._id]
                              ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} />
                              : <FaSyncAlt size={11} />}
                          </button>
                        )}
                        {/* Cancel */}
                        {!isTerminal && (
                          <button
                            onClick={() => setConfirmCancel(o)}
                            disabled={cancelling === o._id}
                            title="Cancel order"
                            style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,107,122,0.2)', background: 'rgba(255,107,122,0.08)', color: '#ff6b7a', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <FaBan size={11} />
                          </button>
                        )}
                        {isTerminal && (
                          <span style={{ fontSize: 11, color: 'var(--color-gray)', fontWeight: 600 }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(0,0,0,0.04)', fontSize: 14, color: 'var(--color-gray)', fontWeight: 600 }}>
            Showing {filtered.length} of {orders.length} orders
          </div>
        )}
      </div>

      {/* Cancel confirm modal */}
      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmCancel(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '28px 32px', maxWidth: 400, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,107,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaBan size={16} color="#ff6b7a" />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-color)' }}>Cancel Order?</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2 }}>This cannot be undone.</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: 'var(--text-color)' }}>
                <div style={{ fontWeight: 700 }}>{confirmCancel.serviceName}</div>
                <div style={{ color: 'var(--color-gray)', marginTop: 3, fontSize: 12 }}>Qty: {confirmCancel.quantity?.toLocaleString()} · Rs {Number(confirmCancel.price||0).toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmCancel(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--color-gray)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Keep Order</button>
                <button onClick={() => cancelOrder(confirmCancel)} disabled={cancelling === confirmCancel._id} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#ff6b7a', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 13, opacity: cancelling ? 0.7 : 1 }}>
                  {cancelling === confirmCancel._id ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Guide */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14 }}>Order Status Guide</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { key: 'pending',      icon: FaClock,               label: 'Pending',      color: '#e8a838', bg: 'rgba(232,168,56,0.08)',   desc: 'Your order is queued and waiting to start. No action needed.' },
            { key: 'in progress',  icon: FaSyncAlt,             label: 'In Progress',  color: '#4299e1', bg: 'rgba(66,153,225,0.08)',   desc: 'Delivery is actively underway — followers/likes are being sent.' },
            { key: 'partial',      icon: FaExclamationTriangle, label: 'Partial',      color: '#9f7aea', bg: 'rgba(159,122,234,0.08)',  desc: 'Only part was delivered, usually due to account privacy. Refund may apply.' },
            { key: 'completed',    icon: FaCheckCircle,         label: 'Completed',    color: '#ACC8A2', bg: 'rgba(172,200,162,0.08)', desc: 'Fully delivered. All requested quantity has been sent.' },
            { key: 'cancelled',    icon: FaTimesCircle,         label: 'Cancelled',    color: '#ff6b7a', bg: 'rgba(255,107,122,0.08)', desc: 'Order was cancelled. Balance has been refunded.' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.key} style={{ padding: '18px 20px', borderRadius: 16, background: s.bg, border: `1px solid ${s.color}22` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 14, color: s.color }}>{s.label}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--color-gray)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function SummaryChip({ label, value, color, bg, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: bg, border: `1px solid ${color}25` }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--color-gray)', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}
