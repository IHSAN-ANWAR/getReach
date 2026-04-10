import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaLeaf, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheckCircle, FaHeadset, FaGoogle, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios';
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

const POLICY_TEXT = [
  { title: '1. Account Responsibility', body: 'You are solely responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.' },
  { title: '2. Service Usage', body: 'GetReach services are intended for legitimate marketing purposes only. Any misuse, abuse, or fraudulent activity will result in immediate account termination without refund.' },
  { title: '3. Payments & Refunds', body: 'All payments are final. Refunds are only issued at our discretion in cases of verified service failure. Chargebacks or disputes without prior contact will result in permanent account suspension.' },
  { title: '4. Data Privacy', body: 'We collect your name, email, and usage data to operate and improve our services. We do not sell your personal data to third parties. Your data is stored securely on encrypted servers.' },
  { title: '5. Service Delivery', body: 'Delivery times are estimates. GetReach is not liable for delays caused by platform changes, API restrictions, or force majeure events.' },
  { title: '6. Prohibited Content', body: 'You may not use our services to promote illegal content, hate speech, violence, or any content that violates applicable laws or platform terms of service.' },
  { title: '7. Modifications', body: 'GetReach reserves the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.' },
];

const RegisterPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [policyError, setPolicyError] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email address.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    if (!agreed) { setPolicyError(true); return; }
    setPolicyError(false);
    setError('');
    setLoading(true);

    try {
      const resp = await axios.post(`${API_BASE}/api/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      setLoading(false);
      if (onLogin && resp.data?.user && resp.data?.token) {
        onLogin(resp.data.user, resp.data.token);
      } else {
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.error || 'Registration failed. Try again.';
      setError(msg);
    }
  };

  return (
    <div className="login-viewport" style={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
      background: 'linear-gradient(135deg, #1A2517 0%, #0d120b 100%)', 
      overflow: 'hidden', position: 'relative'
    }}>
      {/* 🛡️ In-component style to handle placeholder color for better visibility */}
      <style>
        {`
          input::placeholder {
            color: rgba(255, 255, 255, 0.5) !important;
          }
          input:focus::placeholder {
            color: rgba(255, 255, 255, 0.3) !important;
          }
        `}
      </style>

      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'rgba(172,200,162,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '5%', width: '30%', height: '30%', background: 'rgba(172,200,162,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,37,23,0.95)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}
          >
            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 100, height: 100, borderRadius: 32, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf color="#1A2517" size={50} />
            </motion.div>
            <h3 style={{ color: '#F5F0E8', fontWeight: 800 }}>JOINING GETREACH</h3>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEFT SIDE: Company Info (60%) ── */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{ zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, x: -40 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="d-flex align-items-center gap-3 mb-5"
          >
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaLeaf color="#1A2517" size={28} />
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#F5F0E8', fontFamily: 'Poppins', letterSpacing: '-1px' }}>
              Get<span style={{ color: '#ACC8A2' }}>Reach</span>
            </h2>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            style={{ fontSize: 68, fontWeight: 800, color: '#F5F0E8', lineHeight: 1, marginBottom: 32 }}
          >
            Scale Your Agency <br />
            <span style={{ color: '#ACC8A2' }}>Beyond Limits</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            style={{ fontSize: 22, color: 'rgba(245,240,232,0.6)', maxWidth: 580, marginBottom: 55, lineHeight: 1.6 }}
          >
            Access the industry's most reliable marketing infrastructure. Join over 54,000 professional marketing agencies growing with our secure cluster network.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 1.2 }}
            className="d-flex gap-5"
          >
             <div>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#ACC8A2' }}><CounterTicker value="1245000" suffix="+" /></div>
                <div style={{ fontSize: 14, color: 'rgba(245,240,232,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Service Orders</div>
             </div>
             <div>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#F5F0E8' }}><CounterTicker value="54000" suffix="+" /></div>
                <div style={{ fontSize: 14, color: 'rgba(245,240,232,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>Current Partners</div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 2 }}
            style={{ marginTop: 60, display: 'flex', flexWrap: 'wrap', gap: 20 }}
          >
             <div style={{ padding: '14px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(245,240,232,0.7)', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaCheckCircle color="#ACC8A2" /> Cluster Powered
             </div>
             <div style={{ padding: '14px 28px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(245,240,232,0.7)', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaShieldAlt color="#ACC8A2" /> Atlas Secure
             </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT SIDE: Registration Form (40%) ── */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5" style={{ zIndex: 10, overflowY: 'auto' }}>
        <motion.div 
          initial={{ opacity: 0, x: 40, scale: 0.98 }} 
          animate={{ opacity: 1, x: 0, scale: 1 }} 
          transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: 520 }}
        >

          <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)', border: '2px solid rgba(172,200,162,0.15)', borderRadius: 32, padding: '36px 40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#F5F0E8', marginBottom: 12 }}>Partner Request</h2>
            <p style={{ color: 'rgba(245,240,232,0.5)', marginBottom: 40, fontSize: 17 }}>Secure your spot in our global marketing network</p>

            <div className="mb-4">
              <button 
                type="button" 
                onClick={() => setShowGoogleModal(true)}
                style={{ 
                  width: '100%', padding: '18px', borderRadius: 16, border: '2px solid rgba(255,255,255,0.1)', 
                  background: 'rgba(255,255,255,0.03)', color: '#F5F0E8', fontWeight: 800, fontSize: 16, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer' 
                }}
              >
                <FaGoogle color="#ea4335" size={20} /> Sign up with Google
              </button>
            </div>

            <div className="d-flex align-items-center mb-4">
               <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
               <span style={{ padding: '0 16px', color: 'rgba(245,240,232,0.3)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Or use secure form</span>
               <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontWeight: 700, marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: fieldErrors.name ? '#ff6b7a' : 'rgba(172,200,162,0.7)' }} />
                  <input type="text" placeholder="Agency Owner Name" className="form-control shadow-none" value={formData.name}
                    onChange={(e) => { setFormData({...formData, name: e.target.value}); setFieldErrors(p => ({...p, name: ''})); }}
                    style={{ padding: '18px 18px 18px 54px', background: 'rgba(255,255,255,0.04)', border: `2px solid ${fieldErrors.name ? 'rgba(255,107,122,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, color: '#fff', fontSize: 17 }} />
                </div>
                {fieldErrors.name && <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b7a', fontWeight: 700 }}>⚠ {fieldErrors.name}</div>}
              </div>

              <div className="mb-4">
                <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontWeight: 700, marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FaEnvelope style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: fieldErrors.email ? '#ff6b7a' : 'rgba(172,200,162,0.7)' }} />
                  <input type="text" placeholder="business@agency.com" className="form-control shadow-none" value={formData.email}
                    onChange={(e) => { setFormData({...formData, email: e.target.value}); setFieldErrors(p => ({...p, email: ''})); }}
                    style={{ padding: '18px 18px 18px 54px', background: 'rgba(255,255,255,0.04)', border: `2px solid ${fieldErrors.email ? 'rgba(255,107,122,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, color: '#fff', fontSize: 17 }} />
                </div>
                {fieldErrors.email && <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b7a', fontWeight: 700 }}>⚠ {fieldErrors.email}</div>}
              </div>

              <div className="mb-4">
                <label style={{ display: 'block', color: 'rgba(245,240,232,0.6)', fontWeight: 700, marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5 }}>Account Password</label>
                <div style={{ position: 'relative' }}>
                  <FaLock style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: fieldErrors.password ? '#ff6b7a' : 'rgba(172,200,162,0.7)' }} />
                  <input type={showPass ? "text" : "password"} placeholder="Min 6 characters" className="form-control shadow-none" value={formData.password}
                    onChange={(e) => { setFormData({...formData, password: e.target.value}); setFieldErrors(p => ({...p, password: ''})); }}
                    style={{ padding: '18px 54px 18px 54px', background: 'rgba(255,255,255,0.04)', border: `2px solid ${fieldErrors.password ? 'rgba(255,107,122,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 16, color: '#fff', fontSize: 17 }} />
                  <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(245,240,232,0.4)' }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                {fieldErrors.password && <div style={{ marginTop: 6, fontSize: 12, color: '#ff6b7a', fontWeight: 700 }}>⚠ {fieldErrors.password}</div>}
              </div>

              {/* ── PRIVACY & POLICY ── */}
              <div className="mb-4">
                <div
                  onClick={() => { setAgreed(!agreed); setPolicyError(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                    padding: '14px 18px', borderRadius: 14,
                    background: agreed ? 'rgba(172,200,162,0.08)' : policyError ? 'rgba(220,53,69,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${agreed ? 'rgba(172,200,162,0.4)' : policyError ? 'rgba(220,53,69,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${agreed ? '#ACC8A2' : policyError ? '#dc3545' : 'rgba(255,255,255,0.25)'}`,
                    background: agreed ? '#ACC8A2' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}>
                    {agreed && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1A2517' }} />}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.6)', fontWeight: 600, flex: 1 }}>
                    I agree to the{' '}
                    <span
                      onClick={e => { e.stopPropagation(); setShowPolicy(true); }}
                      style={{ color: '#ACC8A2', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Privacy &amp; Policy
                    </span>
                  </span>
                </div>
                {policyError && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#dc3545', fontWeight: 700 }}>
                    ⚠ You must accept the Privacy &amp; Policy to continue.
                  </div>
                )}
              </div>

              {error && (
                <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(220,53,69,0.08)', border: '1px solid rgba(220,53,69,0.25)', color: '#dc3545', fontSize: 14, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '20px', borderRadius: 16, border: 'none', background: agreed ? 'linear-gradient(135deg, #ACC8A2 0%, #7aad6e 100%)' : 'rgba(255,255,255,0.08)', color: agreed ? '#1A2517' : 'rgba(245,240,232,0.3)', fontWeight: 900, fontSize: 18, boxShadow: agreed ? '0 10px 25px rgba(172,200,162,0.2)' : 'none', cursor: agreed ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                Apply for Access
              </button>
            </form>

            <div className="text-center mt-5">
               <span style={{ color: 'rgba(245,240,232,0.4)', fontSize: 16 }}>Already a partner? </span>
               <Link to="/" style={{ color: '#ACC8A2', textDecoration: 'none', fontWeight: 800, fontSize: 16 }}>Secure Sign In</Link>
            </div>
          </div>
          <div className="text-center mt-4">
             <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: 'rgba(245,240,232,0.2)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>
                <FaHeadset size={14} className="me-2" /> 24/7 Global Onboarding Active
             </div>
          </div>
        </motion.div>
      </div>
      {/* ── GOOGLE COMING SOON MODAL ── */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowGoogleModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(10,16,9,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0f1a0d', border: '1.5px solid rgba(172,200,162,0.2)', borderRadius: 24, padding: '40px 36px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FaGoogle size={28} color="#ea4335" />
              </div>
              <h3 style={{ color: '#F5F0E8', fontWeight: 900, fontSize: 22, marginBottom: 10 }}>Google Login</h3>
              <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Google Sign-In is coming soon. For now, please register with your email and password below.
              </p>
              <button
                onClick={() => setShowGoogleModal(false)}
                style={{ padding: '13px 36px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── POLICY MODAL ── */}
      <AnimatePresence>
        {showPolicy && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPolicy(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(10,16,9,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0f1a0d', border: '1.5px solid rgba(172,200,162,0.2)', borderRadius: 24, padding: '36px 40px', maxWidth: 560, width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ color: '#ACC8A2', fontWeight: 900, fontSize: 20, margin: 0 }}>Privacy &amp; Policy</h3>
                <button onClick={() => setShowPolicy(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(245,240,232,0.5)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
                {POLICY_TEXT.map((item, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ color: '#F5F0E8', fontWeight: 800, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ color: 'rgba(245,240,232,0.55)', fontSize: 13, lineHeight: 1.8 }}>{item.body}</div>
                  </div>
                ))}
                <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: 12, marginTop: 8, fontStyle: 'italic' }}>
                  By registering, you confirm you have read and agree to all of the above terms.
                </div>
              </div>
              <button
                onClick={() => { setAgreed(true); setPolicyError(false); setShowPolicy(false); }}
                style={{ marginTop: 24, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
              >
                I Accept &amp; Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
