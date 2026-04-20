import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaLeaf, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaHeadset,
  FaMapMarkerAlt, FaPhone, FaBolt, FaChartLine, FaWallet,
  FaShieldAlt, FaSyncAlt, FaCogs, FaTiktok, FaInstagram,
  FaYoutube, FaFacebook, FaTwitter, FaSnapchatGhost, FaArrowRight,
  FaSearch, FaFilter, FaShoppingCart, FaInfoCircle, FaTimes,
  FaTag, FaLayerGroup, FaSortAmountUp, FaSortAmountDown, FaUserPlus
} from 'react-icons/fa';
import API_BASE from '../config';
import LandingNavbar from './LandingNavbar';

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
    <div style={{ background: 'linear-gradient(145deg, #1A2517 0%, #0d120b 100%)', overflowX: 'hidden' }}>
      <style>{`input::placeholder { color: rgba(255,255,255,0.4) !important; }`}</style>
      <LandingNavbar />

      {/* ── LOGIN SECTION — exactly 100vh ── */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>

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
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{ zIndex: 10, paddingTop: '90px' }}>
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
              <FaPhone size={11} color="rgba(172,200,162,0.5)" />
              <a href="tel:+923276508773" style={{ color: 'rgba(172,200,162,0.5)', textDecoration: 'none' }}>+92 327 650 8773</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <FaEnvelope size={11} color="rgba(172,200,162,0.5)" />
              <a href="mailto:getreach.support@gmail.com" style={{ color: 'rgba(172,200,162,0.5)', textDecoration: 'none' }}>getreach.support@gmail.com</a>
            </div>
          </div>
        </motion.div>
      </div>
      {/* ── ABOUT US SECTION ── */}
      </div>{/* end 100vh login section */}
      <AboutSection />
    </div>
  );
};

/* ─────────────────────────────────────────────
   ABOUT US — full-width section below login
───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.75, delay, ease: 'easeOut' },
});

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.75, delay, ease: 'easeOut' },
});

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 50 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.75, delay, ease: 'easeOut' },
});

const CAPABILITIES = [
  { icon: <FaBolt size={20} />, title: 'Instant Order Processing', desc: 'Place an order and watch it go live in seconds. Our API pipeline runs 24/7 with zero downtime.' },
  { icon: <FaChartLine size={20} />, title: 'Real-Time Tracking', desc: 'Every order has a live status — pending, processing, completed. No guessing, no waiting in the dark.' },
  { icon: <FaWallet size={20} />, title: 'Local Payments', desc: 'EasyPaisa & JazzCash built-in. No foreign cards, no conversion headaches. Pay like a Pakistani.' },
  { icon: <FaShieldAlt size={20} />, title: 'Secure by Design', desc: 'JWT auth, bcrypt passwords, encrypted MongoDB Atlas storage. Your data never leaves our control.' },
  { icon: <FaSyncAlt size={20} />, title: 'Auto-Retry System', desc: 'Failed orders? Our system retries automatically. You never lose a rupee to a dropped connection.' },
  { icon: <FaCogs size={20} />, title: 'Admin Intelligence', desc: 'Full admin panel — manage users, approve payments, set custom pricing, monitor revenue in real time.' },
];

const PLATFORMS = [
  { label: 'TikTok',     icon: <FaTiktok size={16} /> },
  { label: 'Instagram',  icon: <FaInstagram size={16} /> },
  { label: 'YouTube',    icon: <FaYoutube size={16} /> },
  { label: 'Facebook',   icon: <FaFacebook size={16} /> },
  { label: 'Twitter',    icon: <FaTwitter size={16} /> },
  { label: 'Snapchat',   icon: <FaSnapchatGhost size={16} /> },
];

const AboutSection = () => (
  <div style={{ width: '100%', background: '#080e07', borderTop: '1px solid rgba(172,200,162,0.07)', fontFamily: 'Poppins, sans-serif' }}>

    {/* ── HERO STATEMENT ── */}
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
      <motion.div {...fadeUp(0)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 100, background: 'rgba(172,200,162,0.07)', border: '1px solid rgba(172,200,162,0.15)', marginBottom: 32 }}>
        <FaLeaf color="#ACC8A2" size={12} />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#ACC8A2', letterSpacing: 1.5, textTransform: 'uppercase' }}>About GetReach</span>
      </motion.div>

      <motion.h2 {...fadeUp(0.1)} style={{ fontSize: 'clamp(32px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.08, color: '#F5F0E8', marginBottom: 28, letterSpacing: '-1.5px' }}>
        One platform.<br />
        <span style={{ color: '#ACC8A2' }}>Every growth type. Every platform.</span>
      </motion.h2>

      <motion.p {...fadeUp(0.2)} style={{ fontSize: 18, color: 'rgba(245,240,232,0.45)', maxWidth: 620, margin: '0 auto 56px', lineHeight: 1.85 }}>
        GetReach is Pakistan's most reliable social media growth infrastructure — built for agencies, freelancers, and brands who need results, not promises.
      </motion.p>

      {/* Stats row */}
      <motion.div {...fadeUp(0.3)} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        {[
          { n: '1.2M+', l: 'Orders Delivered' },
          { n: '54K+', l: 'Active Partners' },
          { n: '6', l: 'Platforms Covered' },
          { n: '99.9%', l: 'Uptime' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '24px 36px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none', textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#ACC8A2', letterSpacing: '-1px' }}>{s.n}</div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </motion.div>
    </div>

    {/* ── DIVIDER ── */}
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(172,200,162,0.15), transparent)' }} />
    </div>

    {/* ── WHAT WE DO ── */}
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
      <div style={{ marginBottom: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <motion.div {...fadeLeft(0)}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ACC8A2', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>What We Do</div>
          <h3 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, color: '#F5F0E8', margin: 0, letterSpacing: '-0.5px' }}>
            Everything your agency needs.<br />Nothing it doesn't.
          </h3>
        </motion.div>
        <motion.p {...fadeRight(0.1)} style={{ color: 'rgba(245,240,232,0.4)', fontSize: 14, maxWidth: 320, lineHeight: 1.8, margin: 0 }}>
          One platform. Every tool. Built to run itself so you can focus on clients, not infrastructure.
        </motion.p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {CAPABILITIES.map((c, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: i * 0.07, ease: 'easeOut' }}
            whileHover={{ y: -4, borderColor: 'rgba(172,200,162,0.25)' }}
            style={{ padding: '28px 26px', borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'border-color 0.25s, transform 0.25s', cursor: 'default' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(172,200,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2', marginBottom: 16 }}>
              {c.icon}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#F5F0E8', marginBottom: 8 }}>{c.title}</div>
            <div style={{ color: 'rgba(245,240,232,0.45)', fontSize: 13, lineHeight: 1.75 }}>{c.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* ── PLATFORMS ── */}
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(172,200,162,0.1), transparent)', marginBottom: 60 }} />
      <motion.div {...fadeLeft(0)} style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.3)', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Growth Types & Platforms</div>
        <h3 style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', fontWeight: 900, color: '#F5F0E8', margin: 0 }}>
          Followers. Views. Likes. Comments.<br />
          <span style={{ color: '#ACC8A2' }}>All of it. Everywhere.</span>
        </h3>
      </motion.div>
      <motion.div {...fadeRight(0.15)} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {PLATFORMS.map((p, i) => (
          <motion.div key={i}
            whileHover={{ scale: 1.06, borderColor: 'rgba(172,200,162,0.45)', background: 'rgba(172,200,162,0.08)' }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 22px', borderRadius: 100, border: '1px solid rgba(172,200,162,0.14)', background: 'rgba(172,200,162,0.04)', color: 'rgba(245,240,232,0.7)', fontSize: 13, fontWeight: 700, cursor: 'default', transition: 'all 0.2s' }}>
            <span style={{ color: '#ACC8A2' }}>{p.icon}</span> {p.label}
          </motion.div>
        ))}
      </motion.div>
    </div>

    {/* ── SERVICES SECTION ── */}
    <ServicesSection />

    {/* ── SIGMA STATEMENT ── */}
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px 80px' }}>
      <motion.div {...fadeUp(0)} style={{ background: 'linear-gradient(135deg, rgba(172,200,162,0.05) 0%, rgba(122,173,110,0.03) 100%)', border: '1px solid rgba(172,200,162,0.1)', borderRadius: 28, padding: 'clamp(32px, 5vw, 60px)', textAlign: 'center' }}>
        <motion.h3 {...fadeLeft(0.1)} style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 900, color: '#F5F0E8', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
          "While others are still setting up,<br />
          <span style={{ color: '#ACC8A2' }}>your orders are already live."</span>
        </motion.h3>
        <motion.p {...fadeRight(0.2)} style={{ color: 'rgba(245,240,232,0.4)', fontSize: 15, maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.8 }}>
          GetReach is engineered for speed. From the moment you place an order to the second it hits the platform — we move fast, so you look good.
        </motion.p>
        <motion.div {...fadeUp(0.3)}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '15px 34px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: '0 8px 28px rgba(172,200,162,0.2)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Start Growing Today <FaArrowRight size={13} />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>

    {/* ── FOOTER ── */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '32px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 24, marginBottom: 16 }}>
        {[
          { icon: <FaMapMarkerAlt size={12} />, text: 'Islamabad Expressway, Pakistan' },
          { icon: <FaPhone size={12} />, text: '+92 327 650 8773', href: 'tel:+923276508773' },
          { icon: <FaEnvelope size={12} />, text: 'getreach.support@gmail.com', href: 'mailto:getreach.support@gmail.com' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(245,240,232,0.3)', fontSize: 12 }}>
            <span style={{ color: 'rgba(172,200,162,0.5)' }}>{item.icon}</span>
            {item.href
              ? <a href={item.href} style={{ color: 'rgba(245,240,232,0.3)', textDecoration: 'none' }}>{item.text}</a>
              : item.text}
          </div>
        ))}
      </div>
      <div style={{ color: 'rgba(245,240,232,0.15)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>
        © 2026 GetReach — All Rights Reserved
      </div>
    </div>

  </div>
);

/* ─────────────────────────────────────────────
   SERVICES PREVIEW — public listing on login page
───────────────────────────────────────────── */
const PLATFORMS_FILTER = [
  { id: 'all',       label: 'All',       icon: <FaFilter size={12} /> },
  { id: 'tiktok',    label: 'TikTok',    icon: <FaTiktok size={12} /> },
  { id: 'instagram', label: 'Instagram', icon: <FaInstagram size={12} /> },
  { id: 'youtube',   label: 'YouTube',   icon: <FaYoutube size={12} /> },
  { id: 'facebook',  label: 'Facebook',  icon: <FaFacebook size={12} /> },
  { id: 'twitter',   label: 'Twitter',   icon: <FaTwitter size={12} /> },
];

const getPlatformIcon = (category = '') => {
  const c = category.toLowerCase();
  if (c.includes('tiktok'))    return <FaTiktok />;
  if (c.includes('instagram')) return <FaInstagram />;
  if (c.includes('youtube'))   return <FaYoutube />;
  if (c.includes('facebook'))  return <FaFacebook />;
  if (c.includes('twitter'))   return <FaTwitter />;
  return <FaShoppingCart size={13} />;
};

const ServicesSection = () => {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [modal, setModal]           = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/orders/services`)
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter(s => {
    const cat  = (s.category || '').toLowerCase();
    const name = (s.name || '').toLowerCase();
    return (filter === 'all' || cat.includes(filter)) && name.includes(search.toLowerCase());
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
      {/* Section header */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(172,200,162,0.15), transparent)', marginBottom: 60 }} />

      <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 100, background: 'rgba(172,200,162,0.07)', border: '1px solid rgba(172,200,162,0.15)', marginBottom: 20 }}>
          <FaShoppingCart color="#ACC8A2" size={12} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ACC8A2', letterSpacing: 1.5, textTransform: 'uppercase' }}>Our Services</span>
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#F5F0E8', marginBottom: 14, letterSpacing: '-1px' }}>
          Browse Our Growth Catalog
        </h2>
        <p style={{ color: 'rgba(245,240,232,0.45)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          Explore all available services. Create a free account to start ordering instantly.
        </p>
      </motion.div>

      {/* Filters + Search */}
      <motion.div {...fadeUp(0.1)} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 28, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PLATFORMS_FILTER.map(p => (
            <button key={p.id} onClick={() => setFilter(p.id)} style={{
              padding: '8px 16px', borderRadius: 100, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              background: filter === p.id ? 'linear-gradient(135deg, #ACC8A2, #7aad6e)' : 'rgba(255,255,255,0.05)',
              color: filter === p.id ? '#1A2517' : 'rgba(245,240,232,0.55)',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: filter === p.id ? '0 4px 14px rgba(172,200,162,0.25)' : 'none',
            }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(172,200,162,0.5)', fontSize: 13 }} />
          <input
            type="text" placeholder="Search services..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 100, border: '1px solid rgba(172,200,162,0.15)', background: 'rgba(255,255,255,0.04)', color: '#F5F0E8', fontSize: 13, outline: 'none' }}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div {...fadeUp(0.15)} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(172,200,162,0.1)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(172,200,162,0.12)' }}>
                {['#ID', 'Service Name', 'Price / 1K', 'Min / Max', 'Action'].map((h, i) => (
                  <th key={h} style={{ padding: '14px 20px', fontSize: 11, fontWeight: 800, color: '#ACC8A2', textTransform: 'uppercase', letterSpacing: 1.5, textAlign: i === 4 ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(172,200,162,0.5)', fontSize: 15 }}>Loading services...</td></tr>
              )}
              {!loading && filtered.map((s, idx) => (
                <tr key={s.service} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(172,200,162,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 700, color: 'rgba(245,240,232,0.35)', whiteSpace: 'nowrap' }}>#{s.service}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(172,200,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2', flexShrink: 0, fontSize: 14 }}>
                        {getPlatformIcon(s.category)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.3 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)', marginTop: 2 }}>{s.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#ACC8A2' }}>Rs {parseFloat(s.rate).toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.35)' }}>per 1K</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(245,240,232,0.5)', whiteSpace: 'nowrap' }}>
                    {s.min} / {Number(s.max).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button onClick={() => setModal(s)} style={{
                      padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: 'rgba(172,200,162,0.12)', color: '#ACC8A2', fontWeight: 700, fontSize: 13,
                      display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#ACC8A2,#7aad6e)'; e.currentTarget.style.color = '#1A2517'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(172,200,162,0.12)'; e.currentTarget.style.color = '#ACC8A2'; }}
                    >
                      <FaInfoCircle size={12} /> Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(245,240,232,0.3)', fontSize: 14 }}>No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Service count */}
      {!loading && (
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(245,240,232,0.25)', fontWeight: 600 }}>
          Showing {filtered.length} of {services.length} services
        </div>
      )}

      {/* ── SERVICE DETAIL MODAL ── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModal(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1001, width: '90%', maxWidth: 500, background: '#0f1a0d', borderRadius: 24, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.7)', border: '1px solid rgba(172,200,162,0.15)' }}
            >
              {/* Modal header */}
              <div style={{ background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(26,37,23,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A2517', fontSize: 20 }}>
                    {getPlatformIcon(modal.category)}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,37,23,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Service Details</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2517' }}>#{modal.service}</div>
                  </div>
                </div>
                <button onClick={() => setModal(null)} style={{ background: 'rgba(26,37,23,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A2517' }}>
                  <FaTimes size={15} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, color: '#F5F0E8', marginBottom: 8, lineHeight: 1.3 }}>{modal.name}</h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(172,200,162,0.1)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 8, padding: '4px 10px', marginBottom: 20 }}>
                  <FaLayerGroup size={11} color="#ACC8A2" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ACC8A2' }}>{modal.category}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Price per 1K', value: `Rs ${parseFloat(modal.rate).toFixed(2)}`, icon: <FaTag size={13} /> },
                    { label: 'Min Order',    value: modal.min,                                  icon: <FaSortAmountDown size={13} /> },
                    { label: 'Max Order',    value: Number(modal.max).toLocaleString(),          icon: <FaSortAmountUp size={13} /> },
                    { label: 'Service ID',   value: `#${modal.service}`,                        icon: <FaInfoCircle size={13} /> },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(172,200,162,0.06)', border: '1px solid rgba(172,200,162,0.12)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#ACC8A2' }}>{item.icon}<span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</span></div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#F5F0E8' }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* CTA — login to order */}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', padding: '16px', border: 'none', borderRadius: 14,
                    background: 'linear-gradient(135deg, #ACC8A2 0%, #7aad6e 100%)',
                    color: '#1A2517', fontWeight: 900, fontSize: 17, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 24px rgba(172,200,162,0.3)',
                  }}>
                    <FaUserPlus size={16} /> Create Account to Order
                  </button>
                </Link>
                <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>
                  Already have an account? <Link to="/" style={{ color: '#ACC8A2', textDecoration: 'none', fontWeight: 700 }}>Sign In</Link>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
