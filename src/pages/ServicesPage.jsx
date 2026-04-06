import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaTiktok, FaInstagram, FaYoutube, FaFacebook, FaTwitter, 
  FaSearch, FaFilter, FaShoppingCart, FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';

const PLATFORMS = [
  { id: 'all',       label: 'All Services', icon: <FaFilter /> },
  { id: 'tiktok',    label: 'TikTok',       icon: <FaTiktok /> },
  { id: 'instagram', label: 'Instagram',    icon: <FaInstagram /> },
  { id: 'youtube',   label: 'YouTube',      icon: <FaYoutube /> },
  { id: 'facebook',  label: 'Facebook',     icon: <FaFacebook /> },
  { id: 'twitter',   label: 'Twitter',      icon: <FaTwitter /> },
];

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/services');
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = services.filter(s => {
    const catLower = s.category ? s.category.toLowerCase() : '';
    const nameLower = s.name ? s.name.toLowerCase() : '';
    const matchesPlatform = filter === 'all' || catLower.includes(filter);
    const matchesSearch = nameLower.includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px 28px' }}
    >
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
              <button
                key={p.id}
                onClick={() => setFilter(p.id)}
                style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 600,
                  background: filter === p.id ? 'var(--color-primary)' : 'var(--card-bg)',
                  color: filter === p.id ? 'var(--color-dark)' : 'var(--color-gray)',
                  boxShadow: filter === p.id ? '0 4px 15px rgba(172,200,162,0.3)' : '0 4px 10px rgba(0,0,0,0.05)',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
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
              type="text"
              className="form-control border-0"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              {loading && <tr><td colSpan="5" className="text-center py-4" style={{color: '#ACC8A2'}}>Loading Global Services...</td></tr>}
              {!loading && filteredServices.map((s) => (
                <tr key={s.service} style={{ verticalAlign: 'middle', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td className="px-4 py-4 border-0" style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-gray)' }}>#{s.service}</td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: '50%', background: 'rgba(172,200,162,0.1)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2',
                        flexShrink: 0
                      }}>
                        {s.category?.toLowerCase().includes('tiktok') && <FaTiktok />}
                        {s.category?.toLowerCase().includes('instagram') && <FaInstagram />}
                        {s.category?.toLowerCase().includes('youtube') && <FaYoutube />}
                        {s.category?.toLowerCase().includes('facebook') && <FaFacebook />}
                        {s.category?.toLowerCase().includes('twitter') && <FaTwitter />}
                        {!(s.category?.toLowerCase().includes('tiktok') || s.category?.toLowerCase().includes('instagram') || s.category?.toLowerCase().includes('youtube') || s.category?.toLowerCase().includes('facebook') || s.category?.toLowerCase().includes('twitter')) && <FaShoppingCart size={14}/>}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-gray)', marginTop: 2 }}>
                          <FaInfoCircle size={10} className="me-1" /> {s.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#ACC8A2' }}>Rs {(parseFloat(s.rate) * 280).toFixed(2)}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-gray)' }}>${s.rate}</div>
                  </td>
                  <td className="px-4 py-4 border-0">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.min} / {s.max}</div>
                  </td>
                  <td className="px-4 py-4 border-0 text-end">
                    <button 
                      onClick={() => navigate('/?service=' + s.service)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                        color: '#1A2517', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
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
    </motion.div>
  );
};

export default ServicesPage;
