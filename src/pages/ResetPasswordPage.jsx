import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import API_BASE from '../config';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Reset failed.');
      setDone(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1A2517, #0d120b)' }}>
      <div style={{ color: '#ACC8A2', fontWeight: 700, fontSize: 18 }}>Invalid reset link.</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1A2517 0%, #0d120b 100%)', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460 }}>

        <div className="text-center mb-5">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FaLeaf color="#1A2517" size={28} />
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 28, color: '#F5F0E8' }}>Get<span style={{ color: '#ACC8A2' }}>Reach</span></h2>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', border: '2px solid rgba(172,200,162,0.2)', borderRadius: 28, padding: '48px 44px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
          {done ? (
            <div className="text-center">
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FaCheckCircle color="#1A2517" size={30} />
              </div>
              <h3 style={{ color: '#ACC8A2', fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Password Reset!</h3>
              <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 15 }}>Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <h2 style={{ color: '#F5F0E8', fontWeight: 800, fontSize: 26, marginBottom: 8 }}>Set New Password</h2>
              <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 15, marginBottom: 32 }}>Choose a strong password for your account.</p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label style={{ display: 'block', color: 'rgba(245,240,232,0.5)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <FaLock style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#ACC8A2' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      style={{ width: '100%', padding: '16px 48px 16px 48px', background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 16, outline: 'none' }}
                    />
                    <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(245,240,232,0.35)' }}>
                      {showPass ? <FaEyeSlash /> : <FaEye />}
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.25)', color: '#dc3545', fontSize: 13, fontWeight: 600 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '18px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 16, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Saving...' : 'Save New Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
