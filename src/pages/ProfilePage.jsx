import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaUserCircle, FaEnvelope, FaCheckCircle, FaWallet, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import API_BASE from '../config';

const ProfilePage = ({ user, adminMode }) => {
  const [apiBalance, setApiBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(false);

  const fetchApiBalance = () => {
    if (!adminMode) return;
    setLoadingBal(true);
    fetch(`${API_BASE}/api/orders/balance`)
      .then(r => r.json())
      .then(d => { setApiBalance(d?.balance ?? null); setLoadingBal(false); })
      .catch(() => { setApiBalance('error'); setLoadingBal(false); });
  };

  useEffect(() => { fetchApiBalance(); }, [adminMode]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px 28px' }}
    >
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 28, color: 'var(--text-color)', marginBottom: 4 }}>Account Settings</h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 14 }}>Manage your profile and account details</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card text-center p-5">
            <div className="mx-auto mb-4" style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FaUserCircle size={54} color="#1A2517" />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{user?.name || 'Demo User'}</h2>
            <p style={{ color: '#ACC8A2', fontWeight: 600, fontSize: 13, marginBottom: 20 }}>
              {adminMode ? 'Master Administrator' : 'Verified Member'}
            </p>

            {/* Balance widget */}
            {adminMode ? (
              // Admin — show API credit
              <div style={{ background: 'rgba(172,200,162,0.1)', border: '1px solid rgba(172,200,162,0.25)', borderRadius: 16, padding: '16px 20px', textAlign: 'left' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(172,200,162,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>
                  API Credit Balance
                </div>
                {loadingBal ? (
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#ACC8A2' }}>...</div>
                ) : apiBalance === 'error' ? (
                  <div style={{ fontSize: 13, color: '#ff6b7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FaExclamationTriangle size={12} /> Unavailable
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 22, fontWeight: 900, color: apiBalance !== null && parseFloat(apiBalance) < 0.5 ? '#ff6b7a' : '#ACC8A2' }}>
                      Rs {(parseFloat(apiBalance || 0) * 315).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(172,200,162,0.45)', fontWeight: 600, marginTop: 2 }}>
                      ${parseFloat(apiBalance || 0).toFixed(4)} USD
                    </div>
                    {parseFloat(apiBalance || 0) < 0.5 && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#ff6b7a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FaExclamationTriangle size={10} /> Low — top up soon
                      </div>
                    )}
                  </>
                )}
                <button onClick={fetchApiBalance} disabled={loadingBal}
                  style={{ marginTop: 12, padding: '6px 14px', borderRadius: 9, border: '1px solid rgba(172,200,162,0.2)', background: 'transparent', color: '#ACC8A2', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaSync size={10} style={loadingBal ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
                </button>
              </div>
            ) : (
              // Regular user — show PKR wallet balance
              <div className="mx-auto" style={{
                background: 'rgba(172,200,162,0.15)', padding: '12px 24px', borderRadius: 14, border: '1px solid rgba(172,200,162,0.3)',
                display: 'inline-flex', alignItems: 'center', gap: 10
              }}>
                <FaWallet size={16} color="#ACC8A2" />
                <span style={{ fontSize: 18, fontWeight: 800, color: '#ACC8A2' }}>Rs {(user?.balance ?? 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card p-4">
            <h3 style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Personal Details</h3>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label" style={{ fontSize: 13, color: 'var(--color-gray)' }}>Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-0"><FaEnvelope color="#ACC8A2" /></span>
                  <input type="email" className="form-control bg-transparent border-start-0 border-0 border-bottom rounded-0" readOnly value={user?.email || 'demo@getreach.com'} />
                </div>
              </div>
              <div className="col-12 mt-4 pt-3">
                <h3 style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Change Password</h3>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" style={{ fontSize: 13, color: 'var(--color-gray)' }}>Current Password</label>
                    <input type="password" id="current-password" placeholder="••••••••" className="form-control" />
                  </div>
                  <div className="col-12 col-md-6">
                   <label className="form-label" style={{ fontSize: 13, color: 'var(--color-gray)' }}>New Password</label>
                    <input type="password" id="new-password" placeholder="••••••••" className="form-control" />
                  </div>
                </div>
                <div className="mt-4">
                  <button id="save-profile-btn" style={{
                    padding: '12px 24px', borderRadius: 12, border: 'none', background: '#ACC8A2', color: '#1A2517', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    Update Profile <FaCheckCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;

// spin animation for refresh icon
const _style = document.createElement('style');
_style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(_style);
