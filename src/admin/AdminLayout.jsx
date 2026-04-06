import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers, FaTicketAlt, FaChartBar, FaCogs,
  FaSignOutAlt, FaBars, FaTimes, FaUserShield, FaBell
} from 'react-icons/fa';
import AdminUsersPage from './AdminUsersPage';
import AdminTicketsPage from './AdminTicketsPage';
import ProfilePage from '../pages/ProfilePage';

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
  { path: '/admin',         label: 'Dashboard',   icon: <FaChartBar />, exact: true },
  { path: '/admin/users',   label: 'User Base',   icon: <FaUsers /> },
  { path: '/admin/tickets', label: 'Support CRM', icon: <FaTicketAlt /> },
  { path: '/admin/settings',label: 'Settings',    icon: <FaCogs /> },
];

const AdminLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

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
            end={item.exact}
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
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F5F0E8', border: '1px solid #E8E2D9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B7355', position: 'relative', cursor: 'pointer' }}>
              <FaBell size={16} />
              <span style={{ position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: '50%', background: '#c0392b' }} />
            </div>
            <div onClick={() => navigate('/admin/profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#2C2416' }}>Master Admin</div>
                <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.45)' }}>Superuser</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1A2517', color: '#ACC8A2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUserShield size={18} />
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }} className="dashboard-main-content">
          <Routes>
            <Route path="/" element={<AdminUsersPage />} />
            <Route path="/users" element={<AdminUsersPage />} />
            <Route path="/tickets" element={<AdminTicketsPage />} />
            <Route path="/profile" element={<ProfilePage user={user} adminMode={true} />} />
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
