import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserEdit, FaTrash, FaPlus, FaSearch, FaHistory, FaLock, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const MOCK_USERS = [
  { id: 1, name: 'Loyal User', email: 'loyal@getreach.pk', balance: 1250, role: 'user', created: '2026-03-15' },
  { id: 2, name: 'Demo User', email: 'demo@getreach.pk', balance: 50, role: 'admin', created: '2026-03-10' },
];

const AdminUsersPage = () => {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [resetTarget, setResetTarget] = useState(null); // { _id, name }
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [resetting, setResetting]   = useState(false);
  const [resetMsg, setResetMsg]     = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/users');
      setUsers(resp.data);
      setLoading(false);
    } catch (err) {
      console.error('Atlas Fetch Error:', err);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 4) {
      setResetMsg('Password must be at least 4 characters.');
      return;
    }
    setResetting(true);
    setResetMsg('');
    try {
      await axios.patch(`http://localhost:5000/api/users/${resetTarget._id}/reset-password`, { newPassword });
      setResetMsg('✓ Password reset successfully.');
      setTimeout(() => { setResetTarget(null); setNewPassword(''); setResetMsg(''); }, 1500);
    } catch (err) {
      setResetMsg(err.response?.data?.error || 'Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  const filtered = users.filter(u => 
     u.name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '32px 28px', minHeight: '100vh', background: '#F5F0E8' }}
    >
      <div className="mb-5 d-flex justify-content-between align-items-center">
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 38, color: '#2C2416', marginBottom: 6, letterSpacing: '-0.5px' }}>
            Account Control Center
          </h1>
          <p style={{ color: 'rgba(44,36,22,0.45)', margin: 0, fontSize: 17, fontWeight: 600 }}>Global status of all registered marketing partners</p>
        </div>
        <button style={{
          padding: '14px 30px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', 
          color: '#1A2517', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 10px 20px rgba(172,200,162,0.1)'
        }}>
          <FaPlus /> Manual Enrollment
        </button>
      </div>

      <div className="card shadow-lg border-0" style={{ borderRadius: 32, background: '#ACC8A2', border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(30px)' }}>
        <div className="p-4 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
           <div className="input-group" style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 16, border: '2px solid #1A2517', padding: '4px' }}>
              <span className="input-group-text border-0 bg-transparent" style={{ color: '#1A2517', paddingLeft: 16 }}><FaSearch /></span>
              <input 
                type="text" 
                className="form-control border-0 bg-transparent shadow-none" 
                placeholder="Lookup partner by name or system ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ color: '#1A2517', fontSize: 16, fontWeight: 700 }}
              />
           </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0" style={{ color: '#1A2517' }}>
            <thead style={{ background: '#1A2517' }}>
              <tr>
                <th className="px-4 py-4 border-0" style={{ color: '#ACC8A2', fontSize: 13, textTransform: 'uppercase', fontWeight: 900, letterSpacing: 2 }}>Partner Identity</th>
                <th className="px-4 py-4 border-0" style={{ color: '#ACC8A2', fontSize: 13, textTransform: 'uppercase', fontWeight: 900, letterSpacing: 2 }}>Security Role</th>
                <th className="px-4 py-4 border-0 text-end" style={{ color: '#ACC8A2', fontSize: 13, textTransform: 'uppercase', fontWeight: 900, letterSpacing: 2 }}>Current Balance</th>
                <th className="px-4 py-4 border-0" style={{ color: '#ACC8A2', fontSize: 13, textTransform: 'uppercase', fontWeight: 900, letterSpacing: 2 }}>Join Date</th>
                <th className="px-4 py-4 border-0 text-end" style={{ color: '#ACC8A2', fontSize: 13, textTransform: 'uppercase', fontWeight: 900, letterSpacing: 2 }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
                  <td className="px-4 py-4 border-0">
                    <div className="d-flex align-items-center gap-3">
                       <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,0,0,0.08)', color: '#1A2517', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>
                          {user.name?.charAt(0)}
                       </div>
                       <div>
                          <div style={{ fontWeight: 900, color: '#1A2517', fontSize: 17 }}>{user.name}</div>
                          <div style={{ fontSize: 13, color: 'rgba(26, 37, 23, 0.6)', fontWeight: 700 }}>{user.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <span style={{ 
                        padding: '6px 14px', borderRadius: 10, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1,
                        background: user.role === 'admin' ? 'rgba(232,168,56,0.1)' : 'rgba(0,0,0,0.04)',
                        color: user.role === 'admin' ? '#c48a24' : '#1A2517',
                        border: `1px solid ${user.role === 'admin' ? 'rgba(232,168,56,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                       {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-0 text-end">
                    <div style={{ fontWeight: 900, color: '#1A2517', fontSize: 18 }}>
                       Rs {user.balance.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div className="d-flex align-items-center gap-2" style={{ fontSize: 14, color: 'rgba(26, 37, 23, 0.6)', fontWeight: 800 }}>
                       <FaHistory size={13} color="#1A2517" /> {new Date(user.created).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0 text-end">
                    <div className="d-flex justify-content-end gap-2">
                       <button onClick={() => { setResetTarget(user); setNewPassword(''); setResetMsg(''); }} className="btn btn-sm" title="Reset Password" style={{ background: 'rgba(0,0,0,0.04)', color: '#3a5fad', padding: '10px 14px', borderRadius: 12 }}><FaLock /></button>
                       <button className="btn btn-sm" style={{ background: 'rgba(0,0,0,0.04)', color: '#1A2517', padding: '10px 14px', borderRadius: 12 }}><FaUserEdit /></button>
                       <button className="btn btn-sm" style={{ background: 'rgba(0,0,0,0.04)', color: '#ff6b7a', padding: '10px 14px', borderRadius: 12 }}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* ── RESET PASSWORD MODAL ── */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setResetTarget(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(44,36,22,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#FDFAF5', border: '1px solid #E8E2D9', borderRadius: 24, padding: '36px 40px', maxWidth: 440, width: '100%', boxShadow: '0 24px 60px rgba(44,36,22,0.15)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(58,95,173,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaLock color="#3a5fad" size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: '#2C2416', fontSize: 17 }}>Reset Password</div>
                    <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.45)', fontWeight: 600 }}>{resetTarget.name} · {resetTarget.email}</div>
                  </div>
                </div>
                <button onClick={() => setResetTarget(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(44,36,22,0.4)', cursor: 'pointer', fontSize: 20 }}><FaTimes /></button>
              </div>

              <div style={{ height: 1, background: '#E8E2D9', margin: '20px 0' }} />

              <label style={{ display: 'block', color: 'rgba(44,36,22,0.5)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>New Password</label>
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <FaLock style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(44,36,22,0.3)', fontSize: 14 }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setResetMsg(''); }}
                  autoFocus
                  style={{ width: '100%', padding: '14px 44px 14px 44px', borderRadius: 12, border: '1.5px solid #E8E2D9', background: '#F5F0E8', color: '#2C2416', fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
                />
                <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(44,36,22,0.35)' }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {resetMsg && (
                <div style={{ marginBottom: 14, fontSize: 13, fontWeight: 700, color: resetMsg.startsWith('✓') ? '#2e7d32' : '#c0392b' }}>
                  {resetMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setResetTarget(null)} style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1.5px solid #E8E2D9', background: 'transparent', color: 'rgba(44,36,22,0.5)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button onClick={handleResetPassword} disabled={resetting || !newPassword.trim()} style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: '#1A2517', color: '#ACC8A2', fontWeight: 800, cursor: 'pointer', fontSize: 14, opacity: resetting ? 0.7 : 1 }}>
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsersPage;
