import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaBars, FaTimes, FaRocket, FaInfoCircle, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', icon: <FaRocket size={13} />, to: '/services-info' },
    { label: 'About Us', icon: <FaInfoCircle size={13} />, to: '/about' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)', maxWidth: 960, zIndex: 999,
          background: scrolled
            ? 'rgba(13, 18, 11, 0.85)'
            : 'rgba(13, 18, 11, 0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(172,200,162,0.12)',
          borderRadius: 20,
          padding: '0 24px',
          height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: scrolled
            ? '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(172,200,162,0.08)'
            : '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'background 0.3s, box-shadow 0.3s',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FaLeaf color="#1A2517" size={16} />
          </div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 20, color: '#F5F0E8', letterSpacing: '-0.5px' }}>
            Get<span style={{ color: '#ACC8A2' }}>Reach</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="d-none d-md-flex">
          {navLinks.map(link => (
            <Link key={link.label} to={link.to} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ background: 'rgba(172,200,162,0.1)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 12,
                  color: 'rgba(245,240,232,0.7)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', transition: 'color 0.2s',
                }}
                onHoverStart={e => e.target.style && (e.target.style.color = '#ACC8A2')}
              >
                <span style={{ color: '#ACC8A2' }}>{link.icon}</span>
                {link.label}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="d-none d-md-flex">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 18px', borderRadius: 12,
                border: '1.5px solid rgba(172,200,162,0.25)',
                background: 'transparent', color: 'rgba(245,240,232,0.8)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <FaSignInAlt size={12} /> Sign In
            </motion.button>
          </Link>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 18px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                color: '#1A2517', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 14px rgba(172,200,162,0.25)',
              }}
            >
              <FaUserPlus size={12} /> Get Started
            </motion.button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="d-md-none"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#ACC8A2', cursor: 'pointer', padding: 4 }}
        >
          {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 88, left: 24, right: 24, zIndex: 998,
              background: 'rgba(13,18,11,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(172,200,162,0.12)', borderRadius: 16,
              padding: '16px 20px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {navLinks.map(link => (
              <Link key={link.label} to={link.to} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 8px', color: 'rgba(245,240,232,0.8)',
                  fontSize: 15, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ color: '#ACC8A2' }}>{link.icon}</span> {link.label}
                </div>
              </Link>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <Link to="/" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <button style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1.5px solid rgba(172,200,162,0.25)', background: 'transparent', color: '#F5F0E8', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  Sign In
                </button>
              </Link>
              <Link to="/register" style={{ flex: 1, textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <button style={{ width: '100%', padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingNavbar;
