import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaTiktok, FaInstagram, FaYoutube, FaFacebook, FaTwitter, 
  FaSearch, FaFilter, FaShoppingCart, FaInfoCircle, FaTimes,
  FaTag, FaLayerGroup, FaSortAmountUp, FaSortAmountDown
} from 'react-icons/fa';
import axios from 'axios';
import API_BASE from '../config';

const PLATFORMS = [
  { id: 'all',       label: 'All Services', icon: <FaFilter /> },
  { id: 'tiktok',    label: 'TikTok',       icon: <FaTiktok /> },
  { id: 'instagram', label: 'Instagram',    icon: <FaInstagram /> },
  { id: 'youtube',   label: 'YouTube',      icon: <FaYoutube /> },
  { id: 'facebook',  label: 'Facebook',     icon: <FaFacebook /> },
  { id: 'twitter',   label: 'Twitter',      icon: <FaTwitter /> },
];

const getPlatformIcon = (category = '') => {
  const c = category.toLowerCase();
  if (c.includes('tiktok'))    return <FaTiktok />;
  if (c.includes('instagram')) return <FaInstagram />;
  if (c.includes('youtube'))   return <FaYoutube />;
  if (c.includes('facebook'))  return <FaFacebook />;
  if (c.includes('twitter'))   return <FaTwitter />;
  return <FaShoppingCart size={14} />;
};

const ServicesPage = () => {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [search, setSearch]         = useState('');
  const [modalService, setModalService] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    axios.get(`${API_BASE}/api/orders/services`)
      .then(res => setServices(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Failed to load services:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredServices = services.filter(s => {
    const catLower  = (s.category || '').toLowerCase();
    const nameLower = (s.name || '').toLowerCase();
    const matchesPlatform = filter === 'all' || catLower.includes(filter);
    const matchesSearch   = nameLower.includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const handleOrderNow = (s) => {
    setModalService(null);
    navigate('/?service=' + s.service);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 32, color: 'var(--text-color)', marginBottom: 8 }}>
          Our Services
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 16 }}>
          Browse our high-quality growth solutions
        </p>
      </div>

      {/* Toolbar */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8">
          <div className="d-flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button key={p.id} onClick={() => setFilter(p.id)} style={{
                padding: '10px 20px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600,
                background: filter === p.id ? 'var(--color-primary)' : 'var(--card-bg)',
                color: filter === p.id ? 'var(--color-dark)' : 'var(--color-gray)',
                boxShadow: filter === p.id ? '0 4px 15px rgba(172,200,162,0.3)' : '0 4px 10px rgba(0,0,0,0.05)',
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="input-group">
            <span className="input-group-text border-0" style={{ background: 'var(--card-bg)', color: 'var(--color-gray)' }}>
              <FaSearch />
            </span>
            <input
              type="text" className="form-control border-0"
              placeholder="Search services..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--card-bg)', boxShadow: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ color: 'var(--text-color)' }}>
            <thead style={{ background: '#ACC8A2' }}>
              <tr>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', minWidth: 60, fontWeight: 800 }}>ID</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', minWidth: 250, fontWeight: 800 }}>Service Name</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Price/1k</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', fontWeight: 800 }}>Min/Max</th>
                <th className="px-4 py-3 border-0" style={{ fontSize: 13, textTransform: 'uppercase', color: '#1A2517', textAlign: 'right', fontWeight: 800 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5" className="text-center py-4" style={{ color: '#ACC8A2' }}>Loading Services...</td></tr>
              )}
              {!loading && filteredServices.map(s => (
                <tr key={s.service} style={{ verticalAlign: 'middle', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td className="px-4 py-4 border-0" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray)' }}>#{s.service}</td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(172,200,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2', flexShrink: 0 }}>
                        {getPlatformIcon(s.category)}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2 }}>
                          <FaInfoCircle size={10} className="me-1" />{s.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ACC8A2' }}>Rs {parseFloat(s.rate).toFixed(2)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray)' }}>per 1K</div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.min} / {s.max}</div>
                  </td>
                  <td className="px-4 py-4 border-0 text-end">
                    <button
                      onClick={() => setModalService(s)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                        color: '#1A2517', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        boxShadow: '0 4px 10px rgba(172,200,162,0.2)'
                      }}
                    >
                      Order <FaShoppingCart size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredServices.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-5 text-center" style={{ color: 'var(--color-gray)' }}>
                    No services found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Service Detail Modal ── */}
      <AnimatePresence>
        {modalService && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalService(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 500, backdropFilter: 'blur(6px)' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              style={{}}
              className="service-modal-box"
            >
              {/* Modal header */}
              <div style={{ background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(26,37,23,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A2517', fontSize: 20 }}>
                    {getPlatformIcon(modalService.category)}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,37,23,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Service Details</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: '#1A2517', lineHeight: 1.2 }}>#{modalService.service}</div>
                  </div>
                </div>
                <button onClick={() => setModalService(null)} style={{ background: 'rgba(26,37,23,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1A2517' }}>
                  <FaTimes size={15} />
                </button>
              </div>

              {/* Modal body */}
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 18, color: 'var(--text-color)', marginBottom: 6, lineHeight: 1.3 }}>
                  {modalService.name}
                </h3>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(172,200,162,0.1)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 8, padding: '4px 10px', marginBottom: 20 }}>
                  <FaLayerGroup size={11} color="#ACC8A2" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ACC8A2' }}>{modalService.category}</span>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Price per 1K', value: `Rs ${parseFloat(modalService.rate).toFixed(2)}`, icon: <FaTag size={14} /> },
                    { label: 'Min Order',    value: modalService.min, icon: <FaSortAmountDown size={14} /> },
                    { label: 'Max Order',    value: Number(modalService.max).toLocaleString(), icon: <FaSortAmountUp size={14} /> },
                    { label: 'Service ID',   value: `#${modalService.service}`, icon: <FaInfoCircle size={14} /> },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(172,200,162,0.06)', border: '1px solid rgba(172,200,162,0.12)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#ACC8A2' }}>{item.icon}<span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</span></div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-color)', lineHeight: 1 }}>{item.value}</div>
                      {item.sub && <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 3 }}>{item.sub}</div>}
                    </div>
                  ))}
                </div>

                {modalService.dripfeed && (
                  <div style={{ background: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#e8a838', fontWeight: 600 }}>
                    ⚡ Dripfeed enabled — orders delivered gradually over time
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleOrderNow(modalService)}
                  style={{
                    width: '100%', padding: '16px', border: 'none', borderRadius: 14,
                    background: 'linear-gradient(135deg, #ACC8A2 0%, #7aad6e 100%)',
                    color: '#1A2517', fontFamily: 'Poppins', fontWeight: 800, fontSize: 17,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 24px rgba(172,200,162,0.3)',
                  }}
                >
                  <FaShoppingCart size={16} /> Order Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .service-modal-box {
          position: fixed;
          top: 50%;
          left: calc(50% + 125px);
          transform: translate(-50%, -50%);
          z-index: 501;
          width: 90%;
          max-width: 520px;
          background: var(--card-bg);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 80px rgba(0,0,0,0.4);
          border: 1px solid rgba(172,200,162,0.15);
        }
        @media (max-width: 991px) {
          .service-modal-box {
            left: 50%;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ServicesPage;
