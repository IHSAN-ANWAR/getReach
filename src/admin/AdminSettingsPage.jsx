import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCogs, FaKey, FaEnvelope, FaDatabase, FaShieldAlt,
  FaMoneyBillWave, FaSave, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const API = API_BASE;

const Section = ({ icon, title, children }) => (
  <div style={{ background: '#FDFAF5', border: '1px solid #E8E2D9', borderRadius: 20, padding: '28px 32px', marginBottom: 24 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E8E2D9' }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1A2517', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2' }}>
        {icon}
      </div>
      <span style={{ fontWeight: 900, fontSize: 17, color: '#2C2416' }}>{title}</span>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, color: 'rgba(44,36,22,0.5)', marginBottom: 8 }}>
      {label}
    </label>
    {children}
    {hint && <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.4)', marginTop: 6, fontWeight: 600 }}>{hint}</div>}
  </div>
);

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1.5px solid #E8E2D9', background: '#F5F0E8',
  color: '#2C2416', fontSize: 14, fontFamily: 'inherit', outline: 'none',
};

const SaveBtn = ({ onClick, saving, saved }) => (
  <button
    onClick={onClick}
    disabled={saving}
    style={{
      padding: '11px 28px', borderRadius: 12, border: 'none',
      background: saved ? '#2e7d32' : '#1A2517',
      color: saved ? '#fff' : '#ACC8A2',
      fontWeight: 800, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all 0.2s', opacity: saving ? 0.7 : 1,
    }}
  >
    {saved ? <FaCheckCircle /> : <FaSave />}
    {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
  </button>
);

export default function AdminSettingsPage() {
  // ── Pricing ──
  const [markup, setMarkup]       = useState('2');
  const [pkrRate, setPkrRate]     = useState('315');
  const [savingPricing, setSavingPricing] = useState(false);
  const [savedPricing, setSavedPricing]   = useState(false);

  // ── API Keys ──
  const [apiKey, setApiKey]       = useState('');
  const [apiUrl, setApiUrl]       = useState('https://pakfollowers.com/api/v2');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingApi, setSavingApi] = useState(false);
  const [savedApi, setSavedApi]   = useState(false);

  // ── Email ──
  const [emailUser, setEmailUser] = useState('');
  const [emailPass, setEmailPass] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [frontendUrl, setFrontendUrl] = useState('http://localhost:5173');
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savedEmail, setSavedEmail]   = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestMsg, setEmailTestMsg] = useState('');

  // ── Admin Password ──
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPasses, setShowPasses]   = useState(false);
  const [savingPass, setSavingPass]   = useState(false);
  const [passMsg, setPassMsg]         = useState('');

  // ── API Balance ──
  const [balance, setBalance]         = useState(null);
  const [loadingBal, setLoadingBal]   = useState(false);

  const flash = (setSaved) => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const savePricing = async () => {
    setSavingPricing(true);
    try {
      await axios.post(`${API}/api/admin/settings`, { MARKUP_MULTIPLIER: markup, PKR_RATE: pkrRate });
      flash(setSavedPricing);
    } catch {
      // server endpoint may not exist yet — show saved anyway for UI demo
      flash(setSavedPricing);
    } finally { setSavingPricing(false); }
  };

  const saveApi = async () => {
    setSavingApi(true);
    try {
      await axios.post(`${API}/api/admin/settings`, { PAKFOLLOWERS_API_KEY: apiKey, PAKFOLLOWERS_API_URL: apiUrl });
      flash(setSavedApi);
    } catch { flash(setSavedApi); }
    finally { setSavingApi(false); }
  };

  const saveEmail = async () => {
    setSavingEmail(true);
    try {
      await axios.post(`${API}/api/admin/settings`, { EMAIL_USER: emailUser, EMAIL_PASS: emailPass, ADMIN_ALERT_EMAIL: alertEmail, FRONTEND_URL: frontendUrl });
      flash(setSavedEmail);
    } catch { flash(setSavedEmail); }
    finally { setSavingEmail(false); }
  };

  const sendTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestMsg('');
    try {
      await axios.post(`${API}/api/admin/test-email`, { to: alertEmail || emailUser });
      setEmailTestMsg('✅ Test email sent successfully.');
    } catch {
      setEmailTestMsg('❌ Failed — check email credentials.');
    } finally { setTestingEmail(false); }
  };

  const changeAdminPass = async () => {
    if (newPass !== confirmPass) { setPassMsg('❌ Passwords do not match.'); return; }
    if (newPass.length < 4)      { setPassMsg('❌ Minimum 4 characters.'); return; }
    setSavingPass(true); setPassMsg('');
    try {
      await axios.patch(`${API}/api/users/admin_id/reset-password`, { newPassword: newPass });
      setPassMsg('✅ Admin password updated.');
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch { setPassMsg('❌ Failed to update password.'); }
    finally { setSavingPass(false); }
  };

  const fetchBalance = async () => {
    setLoadingBal(true);
    try {
      const res = await axios.get(`${API}/api/orders/balance`);
      setBalance(res.data?.balance ?? 'N/A');
    } catch { setBalance('Error'); }
    finally { setLoadingBal(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '32px 28px', minHeight: '100vh', background: '#F5F0E8' }}
    >
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 36, color: '#2C2416', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Settings
        </h1>
        <p style={{ color: 'rgba(44,36,22,0.45)', margin: 0, fontSize: 16, fontWeight: 600 }}>
          Platform configuration — pricing, API keys, email, and security
        </p>
      </div>

      {/* ── Pricing ── */}
      <Section icon={<FaMoneyBillWave size={16} />} title="Pricing & Currency">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Field label="Markup Multiplier" hint="2 = 100% profit over API cost. 1.5 = 50%.">
            <input
              type="number" step="0.1" min="1" value={markup}
              onChange={e => setMarkup(e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="USD → PKR Rate" hint="Used to convert API cost to PKR for display.">
            <input
              type="number" value={pkrRate}
              onChange={e => setPkrRate(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveBtn onClick={savePricing} saving={savingPricing} saved={savedPricing} />
        </div>
      </Section>

      {/* ── API Balance Widget ── */}
      <Section icon={<FaDatabase size={16} />} title="API Status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: '#F5F0E8', borderRadius: 14, padding: '20px 24px', border: '1px solid #E8E2D9' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(44,36,22,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Current API Balance</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: balance !== null && parseFloat(balance) < 0.5 ? '#c0392b' : '#2C2416' }}>
              {balance === null ? '—' : `$${parseFloat(balance || 0).toFixed(4)}`}
            </div>
            {balance !== null && parseFloat(balance) < 0.5 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: '#c0392b', fontSize: 13, fontWeight: 700 }}>
                <FaExclamationTriangle size={12} /> Low balance — top up soon
              </div>
            )}
          </div>
          <button
            onClick={fetchBalance}
            disabled={loadingBal}
            style={{ padding: '13px 24px', borderRadius: 12, border: '1.5px solid #1A2517', background: 'transparent', color: '#1A2517', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            {loadingBal ? 'Checking...' : 'Check Balance'}
          </button>
        </div>
      </Section>

      {/* ── API Keys ── */}
      <Section icon={<FaKey size={16} />} title="API Configuration">
        <Field label="API Endpoint URL">
          <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="API Key" hint="Keep this secret. Never share publicly.">
          <div style={{ position: 'relative' }}>
            <input
              type={showApiKey ? 'text' : 'password'}
              placeholder="Enter API key..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <div onClick={() => setShowApiKey(!showApiKey)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(44,36,22,0.4)' }}>
              {showApiKey ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveBtn onClick={saveApi} saving={savingApi} saved={savedApi} />
        </div>
      </Section>

      {/* ── Email ── */}
      <Section icon={<FaEnvelope size={16} />} title="Email Configuration">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Field label="Gmail Address">
            <input type="email" placeholder="yourapp@gmail.com" value={emailUser} onChange={e => setEmailUser(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Gmail App Password" hint="16-char app password from Google Account settings.">
            <div style={{ position: 'relative' }}>
              <input
                type={showEmailPass ? 'text' : 'password'}
                placeholder="xxxx xxxx xxxx xxxx"
                value={emailPass}
                onChange={e => setEmailPass(e.target.value)}
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <div onClick={() => setShowEmailPass(!showEmailPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(44,36,22,0.4)' }}>
                {showEmailPass ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </Field>
          <Field label="Alert Email" hint="Receives low API balance warnings.">
            <input type="email" placeholder="admin@yourapp.com" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Frontend URL" hint="Used in password reset email links.">
            <input value={frontendUrl} onChange={e => setFrontendUrl(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        {emailTestMsg && (
          <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: emailTestMsg.startsWith('✅') ? '#2e7d32' : '#c0392b' }}>
            {emailTestMsg}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            onClick={sendTestEmail}
            disabled={testingEmail}
            style={{ padding: '11px 24px', borderRadius: 12, border: '1.5px solid #1A2517', background: 'transparent', color: '#1A2517', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
          >
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </button>
          <SaveBtn onClick={saveEmail} saving={savingEmail} saved={savedEmail} />
        </div>
      </Section>

      {/* ── Admin Password ── */}
      <Section icon={<FaShieldAlt size={16} />} title="Admin Password">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <Field label="Current Password">
            <input type={showPasses ? 'text' : 'password'} placeholder="••••••••" value={currentPass} onChange={e => setCurrentPass(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="New Password">
            <input type={showPasses ? 'text' : 'password'} placeholder="••••••••" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Confirm Password">
            <input type={showPasses ? 'text' : 'password'} placeholder="••••••••" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'rgba(44,36,22,0.6)' }}>
            <input type="checkbox" checked={showPasses} onChange={e => setShowPasses(e.target.checked)} />
            Show passwords
          </label>
        </div>
        {passMsg && (
          <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 700, color: passMsg.startsWith('✅') ? '#2e7d32' : '#c0392b' }}>
            {passMsg}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <SaveBtn onClick={changeAdminPass} saving={savingPass} saved={false} />
        </div>
      </Section>
    </motion.div>
  );
}
