import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './admin/AdminLayout';
import AdminLoginPage from './admin/AdminLoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AboutPage from './pages/AboutPage';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gr_user');
      const token = localStorage.getItem('gr_token');
      if (!saved || !token) return null;
      // Set axios default header on app load
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const login = (userData, token) => {
    localStorage.setItem('gr_user', JSON.stringify(userData));
    localStorage.setItem('gr_token', token);
    // Set axios default header on login
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gr_user');
    localStorage.removeItem('gr_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateBalance = (newBalance) => {
    if (!user) return;
    const updatedUser = { ...user, balance: newBalance };
    localStorage.setItem('gr_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ADMIN LOGIN: Dedicated route */}
          <Route
            path="/admin/login"
            element={
              user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage onAdminLogin={login} />
            }
          />

          {/* PASSWORD RESET */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ABOUT PAGE */}
          <Route path="/about" element={<AboutPage />} />

          {/* PUBLIC USER REGISTRATION */}
          <Route
            path="/register"
            element={
              user ? <Navigate to="/" replace /> : <RegisterPage onLogin={login} />
            }
          />

          {/* ADMIN exact path — must be before /admin/* */}
          <Route
            path="/admin"
            element={
              user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/admin/login" replace />
            }
          />

          {/* ADMIN DASHBOARD: Protected by Admin Role */}
          <Route
            path="/admin/*"
            element={
              user?.role === 'admin' ? (
                <AdminLayout user={user} onLogout={logout} />
              ) : (
                <Navigate to="/admin/login" replace />
              )
            }
          />

          {/* PUBLIC ROOT / DASHBOARD: Defaults to User Login if not authenticated */}
          <Route
            path="/*"
            element={
              user ? (
                <DashboardLayout
                  user={user}
                  onLogout={logout}
                  updateBalance={updateBalance}
                />
              ) : (
                <LoginPage onLogin={login} />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
