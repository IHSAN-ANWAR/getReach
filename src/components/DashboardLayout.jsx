import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLeaf, FaPlusCircle, FaListAlt, FaTicketAlt,
  FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaWallet, FaCloud,
  FaSync, FaQuestionCircle, FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope
} from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';
import DarkModeToggle from './DarkModeToggle';
import NewOrderPage from '../pages/NewOrderPage';
import MyOrdersPage from '../pages/MyOrdersPage';
import TicketsPage from '../pages/TicketsPage';
import ProfilePage from '../pages/ProfilePage';
import ServicesPage from '../pages/ServicesPage';
import AddFundsPage from '../pages/AddFundsPage';
import RefillPage from '../pages/RefillPage';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import FAQPage from '../pages/FAQPage';

const navItems = [
  { path: '/',         label: 'New Order',    icon: <FaPlusCircle />, exact: true },
  { path: '/services', label: 'Services',     icon: <FaCloud /> },
  { path: '/orders',   label: 'My Orders',    icon: <FaListAlt /> },
  { path: '/add-funds',label: 'Add Funds',    icon: <FaWallet /> },
  { path: '/refill',   label: 'Refill',       icon: <FaSync /> },
  { path: '/tickets',  label: 'Support Desk', icon: <FaTicketAlt />, badge: 0 },
  { path: '/faq',      label: 'FAQ',          icon: <FaQuestionCircle /> },
];

const DashboardLayout = ({ user, onLogout, updateBalance }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarInner = (
    <div className="d-flex flex-column h-100">
      <div style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 8px 20px rgba(172,200,162,0.25)',
          }}>
            <FaLeaf color="#1A2517" size={20} />
          </div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 26, color: '#F5F0E8', letterSpacing: '-0.5px' }}>
            Get<span style={{ color: '#ACC8A2' }}>Reach</span>
          </span>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(172,200,162,0.08)', margin: '0 24px 16px' }} />

      <nav style={{ padding: '8px 16px', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 14, marginBottom: 6,
              textDecoration: 'none',
              fontWeight: isActive ? 800 : 600, fontSize: 16,
              color: isActive ? '#1A2517' : '#F5F0E8', 
              background: isActive ? 'linear-gradient(135deg, #ACC8A2, #8eba83)' : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isActive ? 1 : 0.85
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 18, color: isActive ? '#1A2517' : '#ACC8A2' }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span style={{
                    marginLeft: 'auto',
                    background: item.badge > 0 ? '#ff6b7a' : 'rgba(172,200,162,0.15)',
                    color: item.badge > 0 ? '#fff' : 'rgba(245,240,232,0.4)',
                    borderRadius: 20, fontSize: 11, padding: '2px 8px', fontWeight: 800,
                  }}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(172,200,162,0.08)' }}>
        {/* Social Links */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: 'rgba(245,240,232,0.25)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Connect With Us</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { icon: <FaFacebook size={15} />, href: 'https://facebook.com/getreach', color: '#1877f2', label: 'Facebook' },
              { icon: <FaWhatsapp size={15} />, href: 'https://wa.me/923001234567', color: '#25d366', label: 'WhatsApp' },
              { icon: <FaInstagram size={15} />, href: 'https://instagram.com/getreach', color: '#e1306c', label: 'Instagram' },
              { icon: <SiTiktok size={14} />, href: 'https://tiktok.com/@getreach', color: '#F5F0E8', label: 'TikTok' },
              { icon: <FaEnvelope size={14} />, href: 'mailto:getreach.support@gmail.com', color: '#ACC8A2', label: 'Email' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {s.icon}
              </a>
            ))}
          </div>
          <a href="mailto:getreach.support@gmail.com" style={{ display: 'block', marginTop: 8, fontSize: 11, color: 'rgba(245,240,232,0.3)', textDecoration: 'none', fontWeight: 600 }}>
            getreach.support@gmail.com
          </a>
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          style={{
            width: '100%',
            background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.15)',
            borderRadius: 12, padding: '12px', color: '#ff6b7a', fontSize: 14,
            fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: 10, transition: 'all 0.2s'
          }}
        >
          <FaSignOutAlt size={16} /> Logout Account
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>

      <aside style={{
        width: 250, flexShrink: 0,
        background: '#1A2517',
        flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 100, borderRight: '1px solid rgba(255,255,255,0.03)'
      }} className="d-none d-lg-flex">
        {sidebarInner}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(8px)' }}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: 280, position: 'fixed', top: 0, left: 0, bottom: 0,
                background: '#1A2517', zIndex: 201, overflowY: 'auto'
              }}
            >
               <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'absolute', top: 24, right: 16,
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  borderRadius: 10, width: 36, height: 36, color: '#F5F0E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={{
        flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column'
      }} className="main-viewport-container">

        <header style={{
          padding: '16px 32px', 
          background: 'var(--card-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 90,
          borderBottom: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }} className="desktop-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                className="d-lg-none"
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'rgba(172,200,162,0.1)', border: 'none',
                  borderRadius: 12, width: 44, height: 44, color: '#ACC8A2', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <FaBars size={22} />
              </button>
              <DarkModeToggle />
           </div>

           <div className="d-lg-none" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                 <FaLeaf color="#ACC8A2" size={20} />
                 <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: 'var(--text-color)' }}>GetReach</span>
              </div>
           </div>

           <div style={{ flex: 1 }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div 
              style={{
                background: 'rgba(172,200,162,0.1)', 
                border: '1px solid rgba(172,200,162,0.2)',
                borderRadius: 14, padding: '8px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'default'
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ACC8A2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaWallet color="#1A2517" size={14} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: 'var(--color-gray)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#ACC8A2', lineHeight: 1 }}>
                  Rs {(user?.balance ?? 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ width: 1, height: 40, background: 'rgba(0,0,0,0.05)' }} />

            <div 
              onClick={() => navigate('/profile')}
              style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <div className="text-end d-none d-sm-block">
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-color)', lineHeight: 1.2 }}>{user?.name || 'Demo User'}</div>
                <div style={{ fontSize: 11, color: 'var(--color-gray)', fontWeight: 600 }}>Administrator Profile</div>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 15px rgba(172,200,162,0.2)'
              }}>
                <FaUserCircle color="#1A2517" size={24} />
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }} className="dashboard-main-content">
          <Routes>
            <Route path="/" element={<NewOrderPage user={user} updateBalance={updateBalance} />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/add-funds" element={<AddFundsPage updateBalance={updateBalance} />} />
            <Route path="/orders"  element={<MyOrdersPage user={user} />} />
            <Route path="/refill"  element={<RefillPage />} />
            <Route path="/tickets" element={<TicketsPage user={user} />} />
            <Route path="/faq"     element={<FAQPage />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
          </Routes>
        </main>
      </div>
      
      <style>{`
        @media (min-width: 992px) {
          .dashboard-main-content, .desktop-header { margin-left: 250px; }
        }
        .main-viewport-container { background-color: var(--bg-color); }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
