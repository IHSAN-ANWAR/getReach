import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaTicketAlt, FaChartBar, FaCogs,
  FaSignOutAlt, FaBars, FaTimes, FaUserShield, FaBell, FaLayerGroup,
  FaDollarSign, FaWallet, FaUserCog, FaCheckCircle, FaExclamationTriangle, FaStar
} from 'react-icons/fa';
import AdminDashboardPage from './AdminDashboardPage';
import AdminUsersPage from './AdminUsersPage';
import AdminTicketsPage from './AdminTicketsPage';
import AdminServicesPage from './AdminServicesPage';
import AdminRevenuePage from './AdminRevenuePage';
import AdminFundRequestsPage from './AdminFundRequestsPage';
import ProfilePage from '../pages/ProfilePage';
import AdminSettingsPage from './AdminSettingsPage';
import AdminReviewsPage from './AdminReviewsPage';
import API_BASE from '../config';

// Luxury beige palette
const C = {
  bg:        '#F5F0E8',   // warm cream background
  sidebar:   '#EDE8DF',   // slightly darker cream for sidebar
  border:    '#D9D2C5',   // muted beige border
  dark:      '#2C2416',   // deep warm brown (text / accents)
  accent:    '#8B7355',   // warm tan/gold accent
  accentLt:  '#C4A882',   // lighter tan
  white:     '#FDFAF5',   // off-white card
  muted:     'rgba(44,36,22,0.45)',
};

const adminNav = [
  { path: '/admin/dashboard',     label: 'Dashboard',     icon: <FaChartBar /> },
  { path: '/admin/users',         label: 'User Base',     icon: <FaUsers /> },
  { path: '/admin/services',      label: 'Services',      icon: <FaLayerGroup /> },
  { path: '/admin/fund-requests', label: 'Fund Requests', icon: <FaWallet /> },
  { path: '/admin/tickets',       label: 'Support CRM',   icon: <FaTicketAlt /> },
  { path: '/admin/revenue',       label: 'Revenue',       icon: <FaDollarSign /> },
  { path: '/admin/reviews',       label: 'Reviews',       icon: <FaStar /> },
  { path: '/admin/settings',      label: 'Settings',      icon: <FaCogs /> },
];

const NOTIFICATIONS = [
  { id: 1, icon: <FaWallet size={13} />, color: '#3a5fad', text: 'New fund request submitted', time: '2 min ago', unread: true },
  { id: 2, icon: <FaTicketAlt size={13} />, color: '#e8a838', text: 'Support ticket opened', time: '14 min ago', unread: true },
  { id: 3, icon: <FaUsers size={13} />, color: '#2e7d32', text: 'New user registered', time: '1 hr ago', unread: false },
];

const AdminLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [profileOpen, setProfileOpen]     = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const navigate   = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;

  // ── API Balance for header capsule ──
  const [apiBalance, setApiBalance] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/api/orders/balance`)
      .then(r => r.json())
      .then(d => setApiBalance(d?.balance ?? null))
      .catch(() => setApiBalance(null));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));

  const sidebarInner = (
    <div className="d-flex flex-column h-100" style={{ background: '#1A2517', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(172,200,162,0.2)' }}>
            <FaUserShield color="#1A2517" size={20} />
          </div>
          <span style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 22, color: '#F5F0E8', letterSpacing: '-0.5px' }}>
            Get<span style={{ color: '#ACC8A2' }}>Admin</span>
          </span>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {adminNav.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 16px', borderRadius: 14, marginBottom: 6,
              textDecoration: 'none', fontWeight: isActive ? 900 : 600,
              color: isActive ? '#1A2517' : '#F5F0E8',
              background: isActive ? '#ACC8A2' : 'transparent',
              transition: 'all 0.18s',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 17, color: isActive ? '#1A2517' : '#ACC8A2' }}>{item.icon}</span>
                <span style={{ fontSize: 15 }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '20px 12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '13px', borderRadius: 14, border: '1px solid rgba(255,107,122,0.2)', background: 'rgba(255,107,122,0.06)', color: '#ff6b7a', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0E8' }}>
      <aside style={{ width: 240, background: '#1A2517', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }} className="d-none d-lg-flex flex-column">
        {sidebarInner}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,22,0.4)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ width: 240, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201 }}>
              <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: 16, right: 12, background: 'transparent', border: 'none', color: C.dark, cursor: 'pointer', zIndex: 10 }}><FaTimes size={20} /></button>
              {sidebarInner}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="main-viewport-container">
        <header style={{ padding: '14px 32px', background: '#FDFAF5', borderBottom: '1px solid #E8E2D9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 90, boxShadow: '0 2px 12px rgba(44,36,22,0.06)' }} className="desktop-header">
          <button className="d-lg-none" onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#2C2416' }}>
            <FaBars size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            {/* ── Notification Bell ── */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F0E8', border: '1px solid #E8E2D9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B7355', position: 'relative', cursor: 'pointer' }}
              >
                <FaBell size={16} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#c0392b', border: '1.5px solid #FDFAF5' }} />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 320, background: '#FDFAF5', border: '1px solid #E8E2D9', borderRadius: 18, boxShadow: '0 16px 40px rgba(44,36,22,0.12)', zIndex: 999, overflow: 'hidden' }}
                  >
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #E8E2D9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: '#2C2416' }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#8B7355', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FaCheckCircle size={11} /> Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, unread: false } : x))}
                        style={{ padding: '14px 20px', display: 'flex', alignItems: 'flex-start', gap: 12, background: n.unread ? 'rgba(172,200,162,0.08)' : 'transparent', borderBottom: '1px solid #F0EBE3', cursor: 'pointer', transition: 'background 0.15s' }}
                      >
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0, marginTop: 1 }}>
                          {n.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: n.unread ? 800 : 600, color: '#2C2416', lineHeight: 1.4 }}>{n.text}</div>
                          <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.4)', marginTop: 3, fontWeight: 600 }}>{n.time}</div>
                        </div>
                        {n.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c0392b', marginTop: 5, flexShrink: 0 }} />}
                      </div>
                    ))}
                    {notifications.every(n => !n.unread) && (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: 13, color: 'rgba(44,36,22,0.4)', fontWeight: 600 }}>
                        All caught up ✓
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── API Balance Capsule ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 20,
                background: apiBalance !== null && parseFloat(apiBalance) < 0.5
                  ? 'rgba(255,107,122,0.1)' : 'rgba(172,200,162,0.1)',
                border: `1px solid ${apiBalance !== null && parseFloat(apiBalance) < 0.5
                  ? 'rgba(255,107,122,0.3)' : 'rgba(172,200,162,0.25)'}`,
              }}>
                {apiBalance !== null && parseFloat(apiBalance) < 0.5
                  ? <FaExclamationTriangle size={11} color="#ff6b7a" />
                  : <FaWallet size={11} color="#ACC8A2" />
                }
                <span style={{
                  fontSize: 13, fontWeight: 800,
                  color: apiBalance !== null && parseFloat(apiBalance) < 0.5 ? '#ff6b7a' : '#ACC8A2'
                }}>
                  {apiBalance === null ? '...' : `Rs ${(parseFloat(apiBalance) * 315).toFixed(0)}`}
                </span>
              </div>

            {/* ── Admin Profile ── */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 12 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1A2517', color: '#ACC8A2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaUserShield size={18} />
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 200, background: '#FDFAF5', border: '1px solid #E8E2D9', borderRadius: 16, boxShadow: '0 16px 40px rgba(44,36,22,0.12)', zIndex: 999, overflow: 'hidden' }}
                  >
                    <button onClick={() => { navigate('/admin/profile'); setProfileOpen(false); }} style={{ width: '100%', padding: '13px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: '#2C2416', borderBottom: '1px solid #F0EBE3' }}>
                      <FaUserCog size={14} color="#8B7355" /> My Profile
                    </button>
                    <button onClick={() => { navigate('/admin/settings'); setProfileOpen(false); }} style={{ width: '100%', padding: '13px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: '#2C2416', borderBottom: '1px solid #F0EBE3' }}>
                      <FaCogs size={14} color="#8B7355" /> Settings
                    </button>
                    <button onClick={onLogout} style={{ width: '100%', padding: '13px 18px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: '#ff6b7a' }}>
                      <FaSignOutAlt size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        <main style={{ flex: 1 }} className="dashboard-main-content">
          <Routes>
            <Route index element={<AdminDashboardPage />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="revenue"       element={<AdminRevenuePage />} />
            <Route path="fund-requests" element={<AdminFundRequestsPage />} />
            <Route path="profile"       element={<ProfilePage user={user} adminMode={true} />} />
            <Route path="settings"      element={<AdminSettingsPage />} />
            <Route path="reviews"       element={<AdminReviewsPage />} />
          </Routes>
        </main>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-main-content, .desktop-header { margin-left: 240px; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
