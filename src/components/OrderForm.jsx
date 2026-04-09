import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle, FaSearch, FaTimes, FaExclamationTriangle, FaWallet
} from 'react-icons/fa';
import confetti from 'canvas-confetti';
import axios from 'axios';

const fireConfetti = () => {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#ACC8A2', '#7aad6e', '#F5F0E8', '#1A2517'] });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 } }), 300);
};

const SectionTitle = ({ step, title }) => (
  <div className="d-flex align-items-center gap-2 mb-3">
    <div style={{
      width: 26, height: 26, borderRadius: '50%',
      background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
      color: '#1A2517', fontWeight: 700, fontSize: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {step}
    </div>
    <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'var(--text-color)' }}>
      {title}
    </span>
  </div>
);

const OrderForm = ({ user, updateBalance }) => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selections
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [link, setLink] = useState('');
  const [qty, setQty] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  useEffect(() => {
    const close = (e) => { if (!e.target.closest('[data-search]')) setShowSearchResults(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/services');
        const data = Array.isArray(res.data) ? res.data : [];
        setServices(data);

        const preselectedId = searchParams.get('service');

        if (preselectedId) {
          const target = data.find(s => String(s.service) === String(preselectedId));
          if (target) {
            setSelectedCategory(target.category);
            setSelectedServiceId(target.service);
            setQty(parseInt(target.min) || 100);
            // Clear the param from URL so it doesn't re-trigger
            setSearchParams({}, { replace: true });
            return;
          }
        }

        if (data.length > 0) {
          const firstCat = data[0].category;
          setSelectedCategory(firstCat);
          const firstServ = data.find(s => s.category === firstCat);
          if (firstServ) {
            setSelectedServiceId(firstServ.service);
            setQty(parseInt(firstServ.min) || 100);
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category));
    return Array.from(cats);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(s => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const selectedService = useMemo(() => {
    return filteredServices.find(s => String(s.service) === String(selectedServiceId));
  }, [filteredServices, selectedServiceId]);

  // Update Qty bounds when service changes
  useEffect(() => {
    if (selectedService) {
      const min = parseInt(selectedService.min) || 100;
      setQty(min);
    }
  }, [selectedServiceId, selectedService]);

  const totalPrice = useMemo(() => {
    if (!selectedService || !qty) return "0.00";
    // rate is stored as PKR/1k
    return ((parseFloat(selectedService.rate) / 1000) * qty).toFixed(2);
  }, [selectedService, qty]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return services.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      String(s.service).includes(q)
    ).slice(0, 8);
  }, [searchQuery, services]);

  const pickService = (s) => {
    setSelectedCategory(s.category);
    setSelectedServiceId(s.service);
    setQty(parseInt(s.min) || 100);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert('You must be logged in to place an order');
      return;
    }
    
    // Verify inputs
    if (!link) {
      alert('Please provide a valid link.');
      return;
    }
    
    const min = parseInt(selectedService?.min) || 0;
    const max = parseInt(selectedService?.max) || 9999999;
    if (qty < min || qty > max) {
      alert(`Quantity must be between ${min} and ${max}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          serviceId: selectedServiceId, 
          link, 
          quantity: qty 
        })
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.error?.toLowerCase().includes('insufficient')) {
          setInsufficientBalance(true);
          return;
        }
        throw new Error(data.error || 'Failed to place order');
      }

      updateBalance(data.newBalance);
      setSuccess(true);
      fireConfetti();
      setTimeout(() => {
        setSuccess(false);
        setLink('');
      }, 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingServices) {
    return <div className="card p-5 text-center" style={{ color: '#ACC8A2' }}>Loading services...</div>;
  }

  return (
    <>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="card">
      <div className="card-body p-4">
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: 'var(--text-color)', marginBottom: 8 }}>
          Place New Order
        </h2>
        <p style={{ color: 'var(--color-gray)', fontSize: 15, marginBottom: 32 }}>
          Choose a service and grow your social presence
        </p>

        <form onSubmit={handleSubmit}>
          {/* ── Search ── */}
          <div className="mb-4" style={{ position: 'relative' }} data-search="true">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaSearch style={{ position: 'absolute', left: 16, color: 'rgba(172,200,162,0.6)', fontSize: 15, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search services by name, category or ID..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
                style={{ width: '100%', padding: '14px 44px', background: 'rgba(172,200,162,0.06)', border: '2px solid rgba(172,200,162,0.2)', borderRadius: 14, color: 'var(--text-color)', fontSize: 15, outline: 'none' }}
              />
              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  style={{ position: 'absolute', right: 14, background: 'transparent', border: 'none', color: 'rgba(172,200,162,0.5)', cursor: 'pointer', padding: 4 }}>
                  <FaTimes size={13} />
                </button>
              )}
            </div>

            {/* Dropdown results */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 6, background: 'var(--card-bg)', border: '1.5px solid rgba(172,200,162,0.2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
                {searchResults.map(s => (
                  <div key={s.service} onClick={() => pickService(s)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(172,200,162,0.07)', transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(172,200,162,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-color)', marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(172,200,162,0.6)', fontWeight: 600 }}>{s.category} · ID {s.service}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#ACC8A2', whiteSpace: 'nowrap' }}>
                        Rs {(parseFloat(s.rate) / 1000).toFixed(4)} / unit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchResults && searchQuery && searchResults.length === 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 6, background: 'var(--card-bg)', border: '1.5px solid rgba(172,200,162,0.2)', borderRadius: 14, padding: '14px 16px', color: 'var(--color-gray)', fontSize: 13, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}>
                No services found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* ── Step 1: Category ── */}
          <div className="mb-4">
            <SectionTitle step="1" title="Select Category" />
            <select 
               className="form-select shadow-none" 
               value={selectedCategory} 
               onChange={(e) => {
                 setSelectedCategory(e.target.value);
                 const firstServ = services.find(s => s.category === e.target.value);
                 if (firstServ) setSelectedServiceId(firstServ.service);
               }}
               style={{ 
                 background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', 
                 color: 'var(--text-color)', padding: '14px', borderRadius: 14, fontSize: 16 
               }}
            >
              {categories.map(cat => <option key={cat} value={cat} style={{ background: '#1A2517', color: '#F5F0E8' }}>{cat}</option>)}
            </select>
          </div>

          {/* ── Step 2: Specific Service ── */}
          <div className="mb-4">
            <SectionTitle step="2" title="Select Specific Service" />
            <select 
               className="form-select shadow-none" 
               value={selectedServiceId} 
               onChange={(e) => setSelectedServiceId(e.target.value)}
               style={{ 
                 background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', 
                 color: 'var(--text-color)', padding: '14px', borderRadius: 14, fontSize: 15 
               }}
            >
              {filteredServices.map(s => {
                const pkrRate = parseFloat(s.rate).toFixed(2);
                return (
                  <option key={s.service} value={s.service} style={{ background: '#1A2517', color: '#F5F0E8' }}>
                    {s.service} - {s.name} (Rs {pkrRate} per 1K)
                  </option>
                );
              })}
            </select>
            
            {selectedService && (
               <div style={{ padding: '12px', background: 'rgba(172,200,162,0.1)', borderRadius: 10, marginTop: 12, border: '1px solid rgba(172,200,162,0.2)', fontSize: 13, color: 'var(--color-gray)' }}>
                  <div className="d-flex justify-content-between mb-1">
                     <span><strong>Min:</strong> {selectedService.min}</span>
                     <span><strong>Max:</strong> {selectedService.max}</span>
                  </div>
                  {selectedService.dripfeed && <div style={{ color: '#e8a838' }}>⚠️ Dripfeed Enabled for this service</div>}
               </div>
            )}
          </div>

          {/* ── Step 3: Link ── */}
          <div className="mb-4">
            <SectionTitle step="3" title="Target Link" />
            <input
              type="url"
              className="form-control shadow-none"
              placeholder="https://"
              required
              value={link}
              onChange={e => setLink(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-color)', padding: '14px', borderRadius: 14 }}
            />
          </div>

          {/* ── Step 4: Quantity ── */}
          <div className="mb-4">
            <SectionTitle step="4" title="Input Quantity" />
            <div className="d-flex align-items-center gap-3">
              <input
                type="number"
                className="form-control text-center shadow-none"
                min={selectedService?.min || 1}
                max={selectedService?.max || 9999999}
                required
                value={qty}
                onChange={e => setQty(parseInt(e.target.value) || '')}
                style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, padding: '10px', maxWidth: 180, background: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-color)', borderRadius: 14 }}
              />
            </div>
          </div>

          {/* ── Step 5: Price Sync ── */}
          <div className="mb-4">
            <SectionTitle step="5" title="Total Projected Cost" />
            <div style={{
                padding: '18px 24px', background: 'linear-gradient(135deg, rgba(172,200,162,0.15), rgba(122,173,110,0.1))',
                border: '2px solid rgba(172,200,162,0.35)', borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: 32, fontWeight: 800, color: '#ACC8A2', margin: 0, lineHeight: 1 }}>
                  Rs {totalPrice}
                </p>
                <p style={{ color: 'var(--color-gray)', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
                  Deducted from your balance
                </p>
              </div>
            </div>
          </div>

          {/* ── Step 6: Submit ── */}
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ padding: '18px', borderRadius: 14, textAlign: 'center', background: 'rgba(172,200,162,0.15)', border: '2px solid rgba(172,200,162,0.4)' }}
              >
                <FaCheckCircle size={32} color="#ACC8A2" />
                <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: '#ACC8A2', margin: '10px 0 4px' }}>Order Placed Successfully!</p>
              </motion.div>
            ) : (
              <motion.button
                type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', padding: '18px', border: 'none', borderRadius: 14,
                  background: loading ? 'rgba(172,200,162,0.5)' : 'linear-gradient(135deg, #ACC8A2 0%, #7aad6e 100%)',
                  color: '#1A2517', fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </div>
    </motion.div>

    {/* ── Insufficient Balance Modal ── */}
    <AnimatePresence>
      {insufficientBalance && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInsufficientBalance(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 500, backdropFilter: 'blur(6px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 501, width: '90%', maxWidth: 420,
              background: 'var(--card-bg)', borderRadius: 24,
              overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,107,122,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #ff6b7a, #e74c3c)', padding: '24px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <FaExclamationTriangle color="#fff" size={26} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Insufficient Balance</div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ color: 'var(--color-gray)', fontSize: 15, textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
                You don't have enough balance to place this order. Please add funds to continue.
              </p>

              <div style={{ background: 'rgba(172,200,162,0.08)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <FaWallet color="#ACC8A2" size={18} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 600 }}>Current Balance</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ACC8A2' }}>Rs {(user?.balance ?? 0).toFixed(2)}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--color-gray)', fontWeight: 600 }}>Order Cost</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#ff6b7a' }}>Rs {totalPrice}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setInsufficientBalance(false)}
                  style={{ flex: 1, padding: '13px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'var(--color-gray)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel
                </button>
                <button onClick={() => { setInsufficientBalance(false); navigate('/add-funds'); }}
                  style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 800, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <FaWallet size={14} /> Add Funds
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};

export default OrderForm;
