import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaCheck, FaTimes, FaClock, FaSearch, FaSync, FaMobileAlt, FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const API = API_BASE;

const STATUS = {
  pending:  { label: 'Pending',  color: '#e8a838', bg: 'rgba(232,168,56,0.12)',  icon: FaClock },
  approved: { label: 'Approved', color: '#5a8f50', bg: 'rgba(90,143,80,0.12)',   icon: FaCheck },
  rejected: { label: 'Rejected', color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',   icon: FaTimes },
};

export default function AdminFundRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [acting, setActing]     = useState(null);
  const [note, setNote]         = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { request, action }

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/fund-requests`);
      setRequests(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handle = async (id, status) => {
    setActing(id);
    try {
      await axios.patch(`${API}/api/fund-requests/${id}`, { status, note });
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status, note } : r));
      setConfirmModal(null);
      setNote('');
    } catch (e) { alert(e.response?.data?.error || e.message); }
    finally { setActing(null); }
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.tid?.toLowerCase().includes(q)
      || r.userId?.name?.toLowerCase().includes(q)
      || r.userId?.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts = { pending: 0, approved: 0, rejected: 0 };
  requests.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px', background: '#F5F0E8', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 28, color: '#2C2416', marginBottom: 4 }}>Fund Requests</h1>
          <p style={{ color: 'rgba(44,36,22,0.5)', fontSize: 14, margin: 0 }}>Review and approve user deposit requests</p>
        </div>
        <button onClick={load} style={{ padding: '10px 18px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: '#FDFAF5', color: '#8B7355', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaSync size={12} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    value: requests.length, color: '#ACC8A2', filter: 'all' },
          { label: 'Pending',  value: counts.pending,  color: '#e8a838', filter: 'pending' },
          { label: 'Approved', value: counts.approved, color: '#5a8f50', filter: 'approved' },
          { label: 'Rejected', value: counts.rejected, color: '#e74c3c', filter: 'rejected' },
        ].map(s => (
          <div key={s.label} onClick={() => setFilter(s.filter)}
            style={{ background: filter === s.filter ? `${s.color}18` : '#FDFAF5', border: `1.5px solid ${filter === s.filter ? s.color : '#E8E2D9'}`, borderRadius: 14, padding: '14px 22px', minWidth: 120, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(44,36,22,0.45)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B7355' }} />
        <input type="text" placeholder="Search by name, email or TID..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: '#FDFAF5', fontSize: 14, outline: 'none', color: '#2C2416' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#FDFAF5', borderRadius: 20, border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(44,36,22,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2C2416' }}>
            <thead>
              <tr style={{ background: '#ACC8A2' }}>
                {['User', 'Method', 'Amount', 'Transaction ID', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#1A2517', whiteSpace: 'nowrap', textAlign: h === 'Actions' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: '#ACC8A2', fontWeight: 700 }}>Loading...</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'rgba(44,36,22,0.35)', fontWeight: 600 }}>No requests found.</td></tr>
              )}
              {!loading && filtered.map((r, i) => {
                const st = STATUS[r.status] || STATUS.pending;
                const Icon = st.icon;
                return (
                  <tr key={r._id} style={{ borderBottom: '1px solid #F0EBE3', background: i % 2 === 0 ? 'transparent' : 'rgba(172,200,162,0.02)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#2C2416' }}>{r.userId?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.45)' }}>{r.userId?.email}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                        {r.method === 'easypaisa' ? <FaMobileAlt color="#1ebc61" /> : <FaMoneyBillWave color="#f5c614" />}
                        {r.method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 900, fontSize: 16, color: '#5a8f50' }}>Rs {Number(r.amount).toFixed(0)}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <code style={{ fontSize: 13, background: 'rgba(44,36,22,0.06)', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{r.tid}</code>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 12, color: 'rgba(44,36,22,0.5)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created).toLocaleDateString()}<br />
                      <span style={{ fontSize: 11 }}>{new Date(r.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color, textTransform: 'uppercase' }}>
                        <Icon size={10} /> {st.label}
                      </span>
                      {r.note && <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.4)', marginTop: 4, fontStyle: 'italic' }}>{r.note}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {r.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => { setConfirmModal({ request: r, action: 'approved' }); setNote(''); }}
                            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: 'rgba(90,143,80,0.15)', color: '#5a8f50', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FaCheck size={11} /> Approve
                          </button>
                          <button onClick={() => { setConfirmModal({ request: r, action: 'rejected' }); setNote(''); }}
                            style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <FaTimes size={11} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'rgba(44,36,22,0.3)', fontWeight: 600 }}>Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid #F0EBE3', fontSize: 12, color: 'rgba(44,36,22,0.4)', fontWeight: 600 }}>
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,22,0.5)', zIndex: 500, backdropFilter: 'blur(6px)' }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 501, width: '90%', maxWidth: 440, background: '#FDFAF5', borderRadius: 24, padding: 32, boxShadow: '0 24px 60px rgba(44,36,22,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: confirmModal.action === 'approved' ? 'rgba(90,143,80,0.12)' : 'rgba(231,76,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {confirmModal.action === 'approved' ? <FaCheck color="#5a8f50" size={18} /> : <FaTimes color="#e74c3c" size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: '#2C2416' }}>
                    {confirmModal.action === 'approved' ? 'Approve Request' : 'Reject Request'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.45)', marginTop: 2 }}>
                    {confirmModal.request.userId?.name} · Rs {confirmModal.request.amount}
                  </div>
                </div>
              </div>

              {/* Request details */}
              <div style={{ background: 'rgba(172,200,162,0.08)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(44,36,22,0.5)', fontWeight: 600 }}>Method</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{confirmModal.request.method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: 'rgba(44,36,22,0.5)', fontWeight: 600 }}>Amount</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#5a8f50' }}>Rs {confirmModal.request.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'rgba(44,36,22,0.5)', fontWeight: 600 }}>TID</span>
                  <code style={{ fontSize: 13, fontWeight: 700 }}>{confirmModal.request.tid}</code>
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(44,36,22,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                  Note (optional)
                </label>
                <input type="text" value={note} onChange={e => setNote(e.target.value)}
                  placeholder={confirmModal.action === 'rejected' ? 'Reason for rejection...' : 'e.g. Verified manually'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D9D2C5', background: '#F5F0E8', fontSize: 14, outline: 'none', color: '#2C2416' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmModal(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: 'transparent', color: '#8B7355', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button onClick={() => handle(confirmModal.request._id, confirmModal.action)} disabled={acting === confirmModal.request._id}
                  style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: confirmModal.action === 'approved' ? 'linear-gradient(135deg, #ACC8A2, #7aad6e)' : '#e74c3c', color: confirmModal.action === 'approved' ? '#1A2517' : '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14, opacity: acting ? 0.7 : 1 }}>
                  {acting ? 'Processing...' : confirmModal.action === 'approved' ? '✓ Approve & Add Balance' : '✗ Reject Request'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
