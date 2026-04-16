import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaLeaf, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaHeadset, FaMapMarkerAlt } from 'react-icons/fa';
import API_BASE from '../config';

const CounterTicker = ({ value, duration = 3, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);
  useEffect(() => {
    const controls = animate(count, parseFloat(value), { duration });
    return controls.stop;
  }, [value, duration, count]);
  return <motion.span>{rounded}</motion.span>;
};

const LoginPage = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginError, setLoginError]   = useState('');
  const [forgotMode, setForgotMode]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 4) errs.password = 'Password must be at least 4 characters.';
    return errs;
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setLoginError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user, data.token);
    } catch (err) {
      setLoginError(err.message?.includes('fetch') ? 'Unable to connect to server. Please try again.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    background: 'rgba(255,255,255,0.04)',
    border: `2px solid ${hasError ? 'rgba(255,107,122,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 16, color: '#fff', fontSize: 17,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', background: 'linear-gradient(145deg, #1A2517 0%, #0d120b 100%)', overflowY: 'auto', overflowX: 'hidden' }}>
      <style>{`input::placeholder { color: rgba(255,255,255,0.4) !important; }`}</style>

      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'rgba(172,200,162,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '5%', width: '30%', height: '30%', background: 'rgba(172,200,162,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,37,23,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}
              style={{ width: 100, height: 100, borderRadius: 32, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf color="#1A2517" size={50} />
            </motion.div>
            <h3 style={{ color: '#F5F0E8', fontWeight: 800 }}>GETREACH</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left side */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{ zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.5 }}>
          <div className="d-flex align-items-center gap-3 mb-5">
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf color="#1A2517" size={28} />
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#F5F0E8', fontFamily: 'Poppins', letterSpacing: '-1px' }}>
              Get<span style={{ color: '#ACC8A2' }}>Reach</span>
            </h2>
          </div>
          <h1 style={{ fontSize: 62, fontWeight: 800, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 32 }}>
            The Industry Standard <br />
            <span style={{ color: '#ACC8A2' }}>For Premier Growth</span>
          </h1>
          <p style={{ fontSize: 20, color: 'rgba(245,240,232,0.6)', maxWidth: 540, marginBottom: 55, lineHeight: 1.6 }}>
            Empowering over 50,000 brands with high-impact marketing strategies. We build your social authority.
          </p>
          <div className="d-flex gap-5">
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ACC8A2' }}><CounterTicker value="1245000" suffix="+" /></div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Clients Fulfilled</div>
            </div>
            <div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#F5F0E8' }}><CounterTicker value="54000" suffix="+" /></div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Active Clients</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side — form */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5" style={{ zIndex: 10 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 560 }}>
          <div className="d-lg-none text-center mb-5">
            <FaLeaf color="#ACC8A2" size={40} className="mb-3" />
            <h1 style={{ color: '#F5F0E8', fontWeight: 900 }}>GetReach</h1>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)', border: '2px solid rgba(172,200,162,0.25)', borderRadius: 36, padding: '64px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)' }}>

            {forgotMode ? (
              forgotSent ? (
                <div className="text-center">
                  <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <FaEnvelope color="#1A2517" size={30} />
                  </div>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 28, color: '#F5F0E8', marginBottom: 12 }}>Check Your Email</h2>
                  <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 16, marginBottom: 32 }}>
                    If <strong style={{ color: '#ACC8A2' }}>{forgotEmail}</strong> is registered, a reset link has been sent.
                  </p>
                  <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(''); }}
                    style={{ padding: '14px 32px', borderRadius: 14, border: 'none', background: 'rgba(172,200,162,0.15)', color: '#ACC8A2', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                    Back to Login
                  </button>
                </div>
              ) : (
                <div>
                  <button onClick={() => setForgotMode(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(245,240,232,0.4)', cursor: 'pointer', fontSize: 14, fontWeight: 700, marginBottom: 24, padding: 0 }}>
                    ← Back
                  </button>
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 32, color: '#F5F0E8', marginBottom: 10 }}>Forgot Password?</h2>
                  <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 16, marginBottom: 36 }}>Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={handleForgot}>
                    <div className="mb-4">
                      <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1.5 }}>Email Address</label>
                      <div style={{ position: 'relative' }}>
                        <FaEnvelope style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#ACC8A2', fontSize: 18 }} />
                        <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com"
                          className="form-control shadow-none"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '18px 18px 18px 60px', color: '#fff', fontSize: 17 }} />
                      </div>
                    </div>
                    <button type="submit" disabled={forgotLoading}
                      style={{ width: '100%', padding: '18px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 17, cursor: 'pointer', opacity: forgotLoading ? 0.7 : 1 }}>
                      {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </form>
                </div>
              )
            ) : (
              <div>
                <div className="mb-5">
                  <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 38, color: '#F5F0E8', marginBottom: 12 }}>Welcome Back</h2>
                  <p style={{ color: 'rgba(245,240,232,0.5)', fontWeight: 500, fontSize: 17 }}>Enter your credentials to access your marketing suite</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="mb-4">
                    <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1.5 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <FaEnvelope style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: fieldErrors.email ? '#ff6b7a' : '#ACC8A2', fontSize: 18 }} />
                      <input type="text" className="form-control shadow-none" value={email}
                        onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({...p, email: ''})); setLoginError(''); }}
                        placeholder="your@email.com"
                        style={{ ...inputStyle(fieldErrors.email), padding: '18px 18px 18px 60px' }} />
                    </div>
                    {fieldErrors.email && <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b7a', fontWeight: 700 }}>⚠ {fieldErrors.email}</div>}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontSize: 14, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1.5 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: fieldErrors.password ? '#ff6b7a' : '#ACC8A2', fontSize: 18 }} />
                      <input type={showPass ? 'text' : 'password'} className="form-control shadow-none" value={password}
                        onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({...p, password: ''})); setLoginError(''); }}
                        placeholder="••••••••"
                        style={{ ...inputStyle(fieldErrors.password), padding: '18px 64px 18px 60px' }} />
                      <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(245,240,232,0.4)', fontSize: 18 }}>
                        {showPass ? <FaEyeSlash /> : <FaEye />}
                      </div>
                    </div>
                    {fieldErrors.password && <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b7a', fontWeight: 700 }}>⚠ {fieldErrors.password}</div>}
                  </div>

                  <div className="text-end mb-5">
                    <button type="button" onClick={() => setForgotMode(true)}
                      style={{ background: 'transparent', border: 'none', color: '#ACC8A2', fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                      Forgot Password?
                    </button>
                  </div>

                  {loginError && (
                    <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.25)', color: '#ff6b7a', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
                      ⚠ {loginError}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '20px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #ACC8A2 0%, #7aad6e 100%)', color: '#1A2517', fontWeight: 900, fontSize: 18, cursor: 'pointer', boxShadow: '0 15px 35px rgba(172,200,162,0.3)' }}>
                    Sign In Securely
                  </button>
                </form>

                <div className="text-center mt-5">
                  <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 16, fontWeight: 500 }}>
                    Don't have an account? <Link to="/register" style={{ color: '#ACC8A2', textDecoration: 'none', fontWeight: 800 }}>Request Access</Link>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-4" style={{ color: 'rgba(245,240,232,0.2)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
            <FaHeadset size={14} className="me-2" /> 24/7 Premium Support Active
          </div>
          <div className="text-center mt-3" style={{ color: 'rgba(245,240,232,0.25)', fontSize: 12, lineHeight: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FaMapMarkerAlt size={11} color="rgba(172,200,162,0.5)" /> Islamabad Expressway, Islamabad, Pakistan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FaEnvelope size={11} color="rgba(172,200,162,0.5)" />
              <a href="mailto:getreach.support@gmail.com" style={{ color: 'rgba(172,200,162,0.5)', textDecoration: 'none' }}>getreach.support@gmail.com</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
