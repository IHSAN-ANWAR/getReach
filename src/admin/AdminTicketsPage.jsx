import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckDouble, FaHistory, FaSearch, FaUserCircle, FaSyncAlt, FaEnvelopeOpen, FaReply, FaTimes, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const BG    = '#F5F0E8';
const CARD  = '#FDFAF5';
const BORD  = '#E8E2D9';
const DARK  = '#2C2416';
const MUTED = 'rgba(44,36,22,0.45)';
const GREEN = '#1A2517';
const GREENLT = '#ACC8A2';

const statusStyle = {
  'Open':      { bg: 'rgba(232,168,56,0.12)',  color: '#a0720e' },
  'In Review': { bg: 'rgba(100,149,237,0.12)', color: '#3a5fad' },
  'Resolved':  { bg: 'rgba(60,140,60,0.1)',    color: '#2e7d32' },
  'Closed':    { bg: 'rgba(44,36,22,0.06)',    color: MUTED },
};

const AdminTicketsPage = () => {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ticket _id
  const [replyText, setReplyText]   = useState('');
  const [sending, setSending]       = useState(false);

  const fetchTickets = async () => {
    try {
      const resp = await axios.get(`${API_BASE}/api/tickets`);
      setTickets(resp.data);
    } catch (err) {
      console.error('Ticket Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/api/tickets/${id}`, { status });
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status } : t));
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const sendReply = async (id, resolveStatus = 'In Review') => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const resp = await axios.patch(`${API_BASE}/api/tickets/${id}`, {
        adminReply: replyText,
        status: resolveStatus
      });
      setTickets(prev => prev.map(t => t._id === id ? {
        ...t,
        adminReply: resp.data.adminReply,
        status: resp.data.status,
        repliedAt: resp.data.repliedAt,
        messages: resp.data.messages || t.messages
      } : t));
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setSending(false);
    }
  };

  const [page, setPage]       = useState(1);
  const [activeTab, setActiveTab] = useState('Open');
  const PAGE_SIZE = 10;

  const filtered = tickets.filter(t =>
    t.status === activeTab &&
    (t.subject?.toLowerCase().includes(search.toLowerCase()) ||
    t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCount     = tickets.filter(t => t.status === 'Open').length;
  const reviewCount   = tickets.filter(t => t.status === 'In Review').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const closedCount   = tickets.filter(t => t.status === 'Closed').length;

  const statCards = [
    { label: 'Pending',   status: 'Open',      value: openCount,     bg: 'rgba(232,168,56,0.1)',   border: 'rgba(232,168,56,0.3)',   color: '#a0720e',  dot: '#e8a838' },
    { label: 'In Review', status: 'In Review',  value: reviewCount,   bg: 'rgba(100,149,237,0.1)', border: 'rgba(100,149,237,0.3)', color: '#3a5fad',  dot: '#6495ed' },
    { label: 'Resolved',  status: 'Resolved',   value: resolvedCount, bg: 'rgba(60,140,60,0.08)',  border: 'rgba(60,140,60,0.25)',  color: '#2e7d32',  dot: '#3c8c3c' },
    { label: 'Closed',    status: 'Closed',     value: closedCount,   bg: 'rgba(44,36,22,0.05)',   border: BORD,                    color: MUTED,      dot: '#bbb' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '32px 28px', minHeight: '100vh', background: BG }}>

      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 36, color: DARK, marginBottom: 4 }}>Support Tickets</h1>
          <p style={{ color: MUTED, margin: 0, fontSize: 16, fontWeight: 600 }}>Monitor, reply and resolve user support requests</p>
        </div>
        <button onClick={fetchTickets} style={{ padding: '10px 16px', borderRadius: 12, background: CARD, border: `1px solid ${BORD}`, color: DARK, cursor: 'pointer', fontWeight: 700 }}>
          <FaSyncAlt />
        </button>
      </div>

      {/* ── STAT CARDS / TABS ── */}
      <div className="row g-3 mb-4">
        {statCards.map(card => {
          const isActive = activeTab === card.status;
          return (
            <div key={card.label} className="col-6 col-md-3">
              <div onClick={() => { setActiveTab(card.status); setPage(1); setSearch(''); }}
                style={{ background: isActive ? card.bg : 'rgba(44,36,22,0.03)', border: `1.5px solid ${isActive ? card.border : BORD}`, borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', transition: 'all 0.18s', boxShadow: isActive ? `0 4px 18px ${card.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: isActive ? card.dot : '#ccc', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? card.color : MUTED, textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</span>
                </div>
                <div style={{ fontSize: 38, fontWeight: 900, color: isActive ? card.color : MUTED, lineHeight: 1 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: isActive ? card.color : MUTED, opacity: 0.6, fontWeight: 600 }}>ticket{card.value !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderRadius: 24, background: CARD, border: `1px solid ${BORD}`, boxShadow: '0 4px 24px rgba(44,36,22,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, color: DARK, fontSize: 15 }}>
            {statCards.find(c => c.status === activeTab)?.label} Tickets
            <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 700, color: MUTED }}>{filtered.length} total</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: BG, borderRadius: 12, border: `1.5px solid ${BORD}`, padding: '10px 16px', flex: 1, maxWidth: 380 }}>
            <FaSearch color={MUTED} size={14} />
            <input type="text" placeholder="Search by subject, name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ border: 'none', background: 'transparent', outline: 'none', color: DARK, fontSize: 15, fontWeight: 600, width: '100%' }} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ background: GREEN }}>
              <tr>
                <th className="px-4 py-4 border-0" style={{ color: GREENLT, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.5 }}>Ticket</th>
                <th className="px-4 py-4 border-0" style={{ color: GREENLT, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.5 }}>User</th>
                <th className="px-4 py-4 border-0" style={{ color: GREENLT, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.5 }}>Status</th>
                <th className="px-4 py-4 border-0" style={{ color: GREENLT, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.5 }}>Date</th>
                <th className="px-4 py-4 border-0 text-end" style={{ color: GREENLT, fontSize: 12, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1.5 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5" style={{ color: MUTED, fontWeight: 600 }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5" style={{ color: MUTED, fontWeight: 600 }}>No tickets found</td></tr>
              ) : paginated.map(ticket => {
                const s = statusStyle[ticket.status] || statusStyle['Open'];
                const isReplying = replyingTo === ticket._id;
                return (
                  <React.Fragment key={ticket._id}>
                    <tr style={{ borderBottom: isReplying ? 'none' : `1px solid ${BORD}` }}>
                      <td className="px-4 py-4 border-0" style={{ maxWidth: 280 }}>
                        <div style={{ fontWeight: 800, color: DARK, fontSize: 15 }}>{ticket.subject}</div>
                        <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{ticket.message}</div>
                        {/* Show chat thread preview */}
                        {ticket.messages && ticket.messages.length > 1 && (
                          <div style={{ marginTop: 6, fontSize: 12, color: MUTED }}>
                            {ticket.messages.length} messages in thread
                          </div>
                        )}
                        {/* Show existing reply */}
                        {ticket.adminReply && (
                          <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(60,140,60,0.07)', border: '1px solid rgba(60,140,60,0.15)' }}>
                            <div style={{ fontSize: 11, color: '#2e7d32', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Your Last Reply</div>
                            <div style={{ fontSize: 13, color: DARK, fontWeight: 600 }}>{ticket.adminReply}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 border-0">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: BG, border: `1px solid ${BORD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FaUserCircle color={MUTED} size={20} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: DARK, fontSize: 14 }}>{ticket.userId?.name || 'Unknown'}</div>
                            <div style={{ fontSize: 12, color: MUTED }}>{ticket.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-0">
                        <span style={{ padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.8, background: s.bg, color: s.color }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 border-0">
                        <div style={{ fontSize: 13, color: MUTED, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaHistory size={11} /> {new Date(ticket.created).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {/* Reply button */}
                          <button
                            onClick={() => { setReplyingTo(isReplying ? null : ticket._id); setReplyText(ticket.adminReply || ''); }}
                            title="Reply to user"
                            style={{ padding: '7px 13px', borderRadius: 10, background: isReplying ? GREEN : 'rgba(100,149,237,0.1)', color: isReplying ? GREENLT : '#3a5fad', border: `1px solid ${isReplying ? GREEN : 'rgba(100,149,237,0.25)'}`, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                            {isReplying ? <FaTimes /> : <FaReply />}
                          </button>
                          {ticket.status === 'Open' && (
                            <button onClick={() => updateStatus(ticket._id, 'In Review')} title="Mark In Review"
                              style={{ padding: '7px 13px', borderRadius: 10, background: 'rgba(232,168,56,0.1)', color: '#a0720e', border: '1px solid rgba(232,168,56,0.25)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                              <FaEnvelopeOpen />
                            </button>
                          )}
                          {(ticket.status === 'Open' || ticket.status === 'In Review') && (
                            <button onClick={() => updateStatus(ticket._id, 'Resolved')} title="Mark Resolved"
                              style={{ padding: '7px 13px', borderRadius: 10, background: GREEN, color: GREENLT, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                              <FaCheckDouble />
                            </button>
                          )}
                          {ticket.status === 'Resolved' && (
                            <button onClick={() => updateStatus(ticket._id, 'Closed')}
                              style={{ padding: '7px 13px', borderRadius: 10, background: BG, color: MUTED, border: `1px solid ${BORD}`, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline Reply Box with full thread */}
                    <AnimatePresence>
                      {isReplying && (
                        <tr style={{ borderBottom: `1px solid ${BORD}` }}>
                          <td colSpan="5" className="px-4 pb-4 border-0" style={{ background: 'rgba(172,200,162,0.04)' }}>
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                              {/* Full chat thread */}
                              {ticket.messages && ticket.messages.length > 0 && (
                                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto', padding: '4px 0' }}>
                                  {ticket.messages.map((msg, i) => {
                                    const isAdmin = msg.sender === 'admin';
                                    return (
                                      <div key={i} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start', gap: 8 }}>
                                        <div style={{ maxWidth: '70%', padding: '10px 14px', borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: isAdmin ? GREEN : 'rgba(44,36,22,0.06)', color: isAdmin ? GREENLT : DARK, fontSize: 13, fontWeight: 600, lineHeight: 1.5, border: isAdmin ? 'none' : `1px solid ${BORD}` }}>
                                          <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 4 }}>{isAdmin ? 'You (Admin)' : ticket.userId?.name} · {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                          {msg.text}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              <div style={{ fontSize: 13, color: MUTED, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FaReply size={12} /> Reply to <strong style={{ color: DARK }}>{ticket.userId?.name}</strong>
                              </div>
                              <div style={{ display: 'flex', gap: 12 }}>
                                <textarea
                                  rows="3"
                                  placeholder="Write your reply..."
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  style={{ flex: 1, padding: '14px 16px', borderRadius: 14, background: CARD, border: `1.5px solid ${BORD}`, color: DARK, fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'flex-end' }}>
                                  <button onClick={() => sendReply(ticket._id, 'In Review')} disabled={sending || !replyText.trim()}
                                    style={{ padding: '10px 18px', borderRadius: 12, border: `1px solid ${BORD}`, background: CARD, color: DARK, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: sending ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                                    {sending ? <FaSyncAlt /> : <FaPaperPlane />} Reply
                                  </button>
                                  <button onClick={() => sendReply(ticket._id, 'Resolved')} disabled={sending || !replyText.trim()}
                                    style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: GREEN, color: GREENLT, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: sending ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                                    <FaCheckDouble size={12} /> Reply & Resolve
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tickets
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${BORD}`, background: CARD, color: page === 1 ? MUTED : DARK, fontWeight: 700, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                style={{ padding: '8px 14px', borderRadius: 10, border: `1px solid ${n === page ? GREEN : BORD}`, background: n === page ? GREEN : CARD, color: n === page ? GREENLT : DARK, fontWeight: 800, cursor: 'pointer', minWidth: 38 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ padding: '8px 16px', borderRadius: 10, border: `1px solid ${BORD}`, background: CARD, color: page === totalPages ? MUTED : DARK, fontWeight: 700, cursor: page === totalPages ? 'default' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminTicketsPage;
