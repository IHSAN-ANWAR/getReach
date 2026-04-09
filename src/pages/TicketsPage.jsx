import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaSyncAlt, FaPaperPlane, FaArrowLeft, FaUserShield, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const statusMap = {
  'Open':      { bg: 'rgba(232,168,56,0.15)',  color: '#b07d10' },
  'In Review': { bg: 'rgba(100,149,237,0.15)', color: '#3a5fad' },
  'Resolved':  { bg: 'rgba(172,200,162,0.2)',  color: '#2e7d32' },
  'Closed':    { bg: 'rgba(100,100,100,0.12)', color: '#888' },
};

const StatusBadge = ({ status }) => {
  const s = statusMap[status] || statusMap['Open'];
  return <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</span>;
};

const TicketsPage = ({ user }) => {
  const [tickets, setTickets]   = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [selected, setSelected] = useState(null);
  const selectedRef             = useRef(null);
  const setSelectedSafe = (val) => { selectedRef.current = val; setSelected(val); };
  const [formData, setFormData] = useState({ subject: '', category: 'Order', message: '' });
  const chatEndRef              = useRef(null);

  useEffect(() => { if (user) fetchUserTickets(); }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected]);
  useEffect(() => {
    const interval = setInterval(() => { if (user) fetchUserTickets(); }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUserTickets = async () => {
    try {
      const uid = user._id || user.id;
      if (!uid) return;
      const resp = await axios.get(`${API_BASE}/api/tickets?userId=${uid}`);
      setTickets(resp.data);
      if (selectedRef.current) {
        const updated = resp.data.find(t => t._id === selectedRef.current._id);
        if (updated) setSelectedSafe(updated);
      }
    } catch (err) {
      console.error('Fetch Tickets Error:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uid = user._id || user.id;
      const resp = await axios.post(`${API_BASE}/api/tickets`, {
        userId: uid,
        subject: `[${formData.category}] ${formData.subject}`,
        message: formData.message
      });
      if (resp.data?._id) setTickets(prev => [resp.data, ...prev]);
      setSuccess(true);
      setFormData({ subject: '', category: 'Order', message: '' });
      setTimeout(() => setSuccess(false), 3000);
      fetchUserTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── CHAT VIEW ──
  if (selected) {
    const thread = selected.messages?.length > 0
      ? selected.messages
      : [{ sender: 'user', text: selected.message, sentAt: selected.created }];

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ padding: '32px 28px', maxWidth: 720 }}>
        <button onClick={() => setSelectedSafe(null)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(172,200,162,0.12)', border: '1px solid rgba(172,200,162,0.25)', borderRadius: 12, padding: '10px 18px', color: '#2e7d32', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>
          <FaArrowLeft size={12} /> Back to Tickets
        </button>

        <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--card-bg)', border: '1px solid rgba(172,200,162,0.2)', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-color)', fontSize: 16 }}>{selected.subject}</div>
            <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 3 }}>#{selected._id.slice(-5).toUpperCase()} · {new Date(selected.created).toLocaleDateString()}</div>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 2px' }}>
          {thread.map((msg, i) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', gap: 10 }}>
                {!isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1A2517', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                    <FaUserShield color="#ACC8A2" size={16} />
                  </div>
                )}
                <div style={{ maxWidth: '72%' }}>
                  <div style={{ fontSize: 11, color: 'var(--color-gray)', fontWeight: 600, marginBottom: 4, textAlign: isUser ? 'right' : 'left' }}>
                    {isUser ? 'You' : 'Support Team'} · {new Date(msg.sentAt).toLocaleDateString()} {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? 'linear-gradient(135deg, #ACC8A2, #7aad6e)' : 'var(--card-bg)',
                    border: isUser ? 'none' : '1px solid rgba(0,0,0,0.08)',
                    color: isUser ? '#1A2517' : 'var(--text-color)',
                    fontSize: 14, fontWeight: 600, lineHeight: 1.6
                  }}>
                    {msg.text}
                  </div>
                </div>
                {isUser && (
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(172,200,162,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end' }}>
                    <FaUserCircle color="#ACC8A2" size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {!selected.adminReply && selected.status !== 'Closed' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#1A2517', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FaUserShield color="#ACC8A2" size={16} />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: 'var(--card-bg)', border: '1px dashed rgba(172,200,162,0.3)', color: 'var(--color-gray)', fontSize: 13, fontStyle: 'italic' }}>
                Support team is reviewing your request...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </motion.div>
    );
  }

  // ── LIST VIEW ──
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px' }}>

      <div className="mb-4 p-4" style={{ background: '#ACC8A2', borderRadius: 24 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 36, color: '#1A2517', marginBottom: 4 }}>Support Desk</h1>
        <p style={{ color: 'rgba(26,37,23,0.65)', fontSize: 16, fontWeight: 600, margin: 0 }}>Submit a request and tap any ticket to view the conversation.</p>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 24, padding: '28px' }}>
            <h5 style={{ color: 'var(--text-color)', fontWeight: 800, marginBottom: 20, fontSize: 17 }}>New Ticket</h5>

            {success && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(172,200,162,0.1)', border: '1px solid #ACC8A2', color: '#2e7d32', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <FaCheckCircle /> Ticket submitted!
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label style={{ display: 'block', color: 'var(--color-gray)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Category</label>
                  <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '13px 15px', borderRadius: 12, background: 'var(--bg-color)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: 14 }}>
                    <option value="Order">Orders</option>
                    <option value="Payment">Payments</option>
                    <option value="Technical">Technical / Bug</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-12 col-md-8">
                  <label style={{ display: 'block', color: 'var(--color-gray)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Subject</label>
                  <input required type="text" placeholder="e.g. Order #1023 not delivered" value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '13px 15px', borderRadius: 12, background: 'var(--bg-color)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: 14 }} />
                </div>
              </div>
              <div className="mb-4">
                <label style={{ display: 'block', color: 'var(--color-gray)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Message</label>
                <textarea required rows="4" placeholder="Describe your issue..." value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: '100%', padding: '13px 15px', borderRadius: 12, background: 'var(--bg-color)', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-color)', fontSize: 14, resize: 'vertical' }} />
              </div>
              <button disabled={loading} type="submit" style={{ padding: '15px 40px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, opacity: loading ? 0.7 : 1 }}>
                {loading ? <FaSyncAlt /> : <FaPaperPlane />}
                {loading ? 'Sending...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── TICKET HISTORY ── */}
      <div style={{ marginTop: 36 }}>
        <h5 style={{ color: 'var(--text-color)', fontWeight: 800, fontSize: 17, marginBottom: 16 }}>Ticket History</h5>
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 20, overflow: 'hidden' }}>
          {fetching ? (
            <div className="text-center py-4" style={{ color: 'var(--color-gray)' }}>Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--color-gray)', fontSize: 14 }}>No ticket history yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(172,200,162,0.15)', background: 'rgba(172,200,162,0.06)' }}>
                    {['#ID', 'Subject', 'Category', 'Status', 'Submitted', 'Last Reply'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--color-gray)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, i) => {
                    const catMatch = t.subject.match(/^\[(.+?)\]/);
                    const category = catMatch ? catMatch[1] : 'General';
                    const cleanSubject = t.subject.replace(/^\[.+?\]\s*/, '');
                    return (
                      <tr key={t._id}
                        onClick={() => setSelectedSafe(t)}
                        style={{ borderBottom: i < tickets.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'background 0.15s', opacity: t.status === 'Closed' ? 0.6 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(172,200,162,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', color: 'var(--color-gray)', fontWeight: 700, whiteSpace: 'nowrap' }}>#{t._id.slice(-5).toUpperCase()}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-color)', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.adminReply && <FaUserShield size={10} color="#ACC8A2" style={{ marginRight: 6 }} />}
                          {cleanSubject}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(172,200,162,0.12)', color: '#2e7d32' }}>{category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}><StatusBadge status={t.status} /></td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-gray)', whiteSpace: 'nowrap' }}>{new Date(t.created).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px', color: t.repliedAt ? '#2e7d32' : 'var(--color-gray)', whiteSpace: 'nowrap', fontStyle: t.repliedAt ? 'normal' : 'italic' }}>
                          {t.repliedAt ? new Date(t.repliedAt).toLocaleDateString() : 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default TicketsPage;
