import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUserShield, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaChevronRight, FaArrowLeft } from 'react-icons/fa';

const C = { bg: '#F5F0E8', card: '#FDFAF5', border: '#D9D2C5', dark: '#2C2416', accent: '#8B7355', accentLt: '#C4A882', muted: 'rgba(44,36,22,0.45)' };

const AdminLoginPage = ({ onAdminLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      if (data.user?.role !== 'admin') throw new Error('Access denied. Admin accounts only.');
      onAdminLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, position: 'relative', overflow: 'hidden' }}>
      {/* subtle texture */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(#8B7355 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', width: '50%', height: '50%', borderRadius: '50%', background: 'rgba(139,115,85,0.06)', filter: 'blur(80px)', top: '-5%', right: '-5%' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ width: '100%', maxWidth: 480, zIndex: 10, padding: 24 }}>
        <div className="text-center mb-5">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: C.card, padding: '14px 28px', borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(44,36,22,0.08)' }}>
            <FaUserShield color={C.accent} size={28} />
            <span style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 26, color: C.dark }}>
              Get<span style={{ color: C.accent }}>Admin</span>
            </span>
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 32, padding: '52px 48px', boxShadow: '0 20px 60px rgba(44,36,22,0.1)' }}>
          <h2 style={{ color: C.dark, fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ color: C.muted, fontSize: 15, marginBottom: 36 }}>Sign in to your dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label style={{ display: 'block', color: C.muted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: C.accentLt, fontSize: 16 }} />
                <input type="text" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin" style={{ width: '100%', padding: '16px 16px 16px 50px', background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, color: C.dark, fontSize: 16, outline: 'none' }} />
              </div>
            </div>

            <div className="mb-5">
              <label style={{ display: 'block', color: C.muted, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: C.accentLt, fontSize: 16 }} />
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '16px 50px 16px 50px', background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, color: C.dark, fontSize: 16, outline: 'none' }} />
                <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: C.accentLt }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>

            {error && (
              <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 12, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: '#c0392b', fontSize: 14, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', borderRadius: 14, border: 'none', background: C.dark, color: C.accentLt, fontWeight: 800, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 24px rgba(44,36,22,0.2)', transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <> Sign In <FaChevronRight size={13} /> </>}
            </button>
          </form>
        </div>

        <div className="text-center mt-4" style={{ color: C.muted, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          GetReach Admin © 2026
        </div>
        <div className="text-center mt-3">
          <Link to="/" style={{ color: C.accent, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FaArrowLeft size={11} /> Back to User Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
