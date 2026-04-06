import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaWallet, FaMoneyBillWave, FaArrowRight, 
  FaInfoCircle, FaCheckCircle, FaExclamationTriangle,
  FaUniversity, FaCopy, FaMobileAlt, FaShieldVirus, FaTimes
} from 'react-icons/fa';

const PAYMENT_METHODS = [
  { id: 'easypaisa', label: 'EasyPaisa', icon: <FaMobileAlt />, color: '#1ebc61', desc: 'Instant Deposit' },
  { id: 'jazzcash',  label: 'JazzCash',  icon: <FaMoneyBillWave />, color: '#f5c614', desc: 'Instant Deposit' },
];

const PAYMENT_DETAILS = {
  easypaisa: { accountName: 'GetReach Admin', accountNumber: '0300-1234567', instructions: 'Send money to the EasyPaisa account above after which you must enter the Transaction ID below.' },
  jazzcash:  { accountName: 'GetReach Admin', accountNumber: '0300-7654321', instructions: 'Send money to the JazzCash account above after which you must enter the Transaction ID below.' },
};

const AddFundsPage = ({ updateBalance }) => {
  const [method, setMethod] = useState('easypaisa');
  const [amount, setAmount] = useState('');
  const [tid, setTid] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (val < 50) {
      alert('Minimum deposit amount is 50 PKR.');
      return;
    }
    if (val > 50000) {
      alert('Maximum deposit amount per transaction is 50,000 PKR.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);

    // ── Update Global Balance ──
    updateBalance(parseFloat(amount));

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setTid('');
      setAmount('');
    }, 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px 28px' }}
    >
      {/* ── Custom Policy Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '20px'
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              style={{
                position: 'fixed', top: '50%', left: '50%', x: '-50%', y: '-50%',
                zIndex: 10000, width: '100%', maxWidth: '440px',
                background: 'var(--card-bg)', borderRadius: '32px', padding: '40px',
                border: '2px solid rgba(231,76,60,0.3)', textAlign: 'center',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
              }}
            >
              <div style={{
                width: 70, height: 70, borderRadius: '50%', background: 'rgba(231,76,60,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
              }}>
                <FaExclamationTriangle size={32} color="#ff6b7a" />
              </div>
              
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 24, color: 'var(--text-color)', marginBottom: 16 }}>
                Careful! Payment Notice
              </h2>
              <p style={{ color: 'var(--color-gray)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
                Please add payment carefully. Once added, funds **cannot be refunded** back to your bank account under any circumstances.
              </p>

              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #ff6b7a, #e74c3c)',
                  color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(231,76,60,0.3)', transition: 'all 0.2s'
                }}
              >
                I Understand & Accept
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 32, color: 'var(--text-color)', marginBottom: 8 }}>
          Add Funds
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 16 }}>
          Top up your account balance instantly
        </p>
      </div>

      <div className="row g-4">
        {/* Left: Method Selection & Form */}
        <div className="col-12 col-lg-7">
          <div className="card h-100 p-4">
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-color)', marginBottom: 24 }}>
              1. Choose Payment Method
            </h2>
            <div className="d-flex gap-3 mb-4">
              {PAYMENT_METHODS.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setMethod(pm.id)}
                  style={{
                    flex: 1, padding: '16px 12px', borderRadius: 16, border: method === pm.id ? `3px solid ${pm.color}` : '3px solid rgba(0,0,0,0.05)',
                    background: method === pm.id ? `${pm.color}08` : 'var(--bg-color)',
                    color: method === pm.id ? pm.color : 'var(--color-gray)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{pm.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{pm.label}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{pm.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', marginBottom: 32 }} />

            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-color)', marginBottom: 12 }}>
              2. Transaction Details
            </h2>
            <p style={{ color: 'var(--color-gray)', fontSize: 14, marginBottom: 24 }}>
              Enter the amount and Transaction ID (TID) from your deposit. 
              <br />
              <span style={{ color: '#ff6b7a', fontWeight: 700 }}>Limit: 50 PKR - 50,000 PKR</span>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray)', marginBottom: 8, display: 'block' }}>Deposit Amount (PKR)</label>
                <div className="input-group">
                  <span className="input-group-text border-0" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-gray)' }}>PKR</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 500"
                    required
                    min={50}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ fontSize: 16, fontWeight: 600 }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray)', marginBottom: 8, display: 'block' }}>Transaction ID (TID)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 1234567890"
                  required
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  style={{ fontSize: 16, fontWeight: 600 }}
                />
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '16px', borderRadius: 14, background: 'rgba(30,188,97,0.1)', border: '2px solid rgba(30,188,97,0.3)',
                      color: '#1ebc61', textAlign: 'center'
                    }}
                  >
                    <FaCheckCircle size={24} className="mb-2" />
                    <div style={{ fontWeight: 800 }}>Request Submitted!</div>
                    <div style={{ fontSize: 13 }}>Funds will be added to your account after verification.</div>
                  </motion.div>
                ) : (
                  <button
                    id="submit-payment-btn"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #1ebc61, #128c4b)',
                      color: '#fff', fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 20px rgba(30,188,97,0.3)'
                    }}
                  >
                    {loading ? <div className="spinner-border spinner-border-sm" /> : <><FaWallet /> Confirm Deposit</>}
                  </button>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        {/* Right: Payment Instructions */}
        <div className="col-12 col-lg-5">
          <div className="card p-4" style={{ border: '2px dashed rgba(172,200,162,0.5)', background: 'rgba(172,200,162,0.03)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-color)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <FaInfoCircle color="#ACC8A2" /> Instructions
            </h2>
            
            <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '20px', border: '1px solid rgba(0,0,0,0.05)', marginBottom: 20 }}>
              <div className="mb-3">
                <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Account Name</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-color)' }}>{PAYMENT_DETAILS[method].accountName}</div>
              </div>
              <div className="mb-3">
                <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{method.toUpperCase()} Number</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#ACC8A2', fontFamily: 'monospace' }}>{PAYMENT_DETAILS[method].accountNumber}</div>
                  <button 
                    onClick={() => handleCopy(PAYMENT_DETAILS[method].accountNumber)}
                    style={{
                      padding: '8px 12px', borderRadius: 10, border: 'none', background: 'rgba(172,200,162,0.1)', color: '#ACC8A2', fontSize: 14, cursor: 'pointer'
                    }}
                  >
                    {copied ? 'Copied!' : <FaCopy />}
                  </button>
                </div>
              </div>
            </div>

            <div className="alert alert-warning mb-3" style={{ background: 'rgba(232,168,56,0.08)', border: '1px solid rgba(232,168,56,0.2)', borderRadius: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <FaExclamationTriangle color="#e8a838" style={{ marginTop: 4, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#e8a838', marginBottom: 4 }}>Please Note</div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray)', lineHeight: 1.5 }}>
                    {PAYMENT_DETAILS[method].instructions}
                    <br /><br />
                    <strong>1 PKR = 1 Credit.</strong> Verification may take 5-60 minutes depending on server load.
                  </div>
                </div>
              </div>
            </div>

            <div className="alert alert-danger mb-0" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                 <FaShieldVirus color="#ff6b7a" style={{ marginTop: 4, flexShrink: 0 }} />
                 <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ff6b7a', marginBottom: 4 }}>No Refund Policy</div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray)', lineHeight: 1.4 }}>
                       Once funds are added to your GetReach account, they <strong>cannot be refunded</strong> back to your EasyPaisa, JazzCash, or bank account. Credits can only be used for services on our platform.
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, padding: '20px', borderRadius: 16, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-color)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaUniversity size={14} /> Other Options?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-gray)', margin: 0 }}>
              Need to pay via <strong>Bank Transfer</strong> or <strong>Auto-Payment</strong>? Please contact our support team to get our bank details.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AddFundsPage;
