import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaEdit, FaEyeSlash, FaEye,
  FaTiktok, FaInstagram, FaYoutube, FaFacebook, FaTwitter,
  FaShoppingCart, FaTimes, FaSave, FaUndo, FaSync, FaLayerGroup,
  FaBolt, FaCheck
} from 'react-icons/fa';
import axios from 'axios';

const API = 'http://localhost:5000/api/orders';

const PLATFORM_MAP = [
  { key: 'tiktok',    label: 'TikTok',    icon: <FaTiktok />,    color: '#010101' },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram />, color: '#C13584' },
  { key: 'youtube',   label: 'YouTube',   icon: <FaYoutube />,   color: '#FF0000' },
  { key: 'facebook',  label: 'Facebook',  icon: <FaFacebook />,  color: '#1877F2' },
  { key: 'twitter',   label: 'Twitter/X', icon: <FaTwitter />,   color: '#1DA1F2' },
];

const getPlatform = (category = '') => {
  const c = category.toLowerCase();
  return PLATFORM_MAP.find(p => c.includes(p.key)) || { key: 'other', label: 'Other', icon: <FaShoppingCart size={13} />, color: '#8B7355' };
};

const DiffCell = ({ raw, override }) => {
  const changed = override !== undefined && override !== null && String(override) !== String(raw);
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: changed ? 'rgba(44,36,22,0.3)' : '#2C2416', textDecoration: changed ? 'line-through' : 'none' }}>
        {raw ?? '—'}
      </div>
      {changed && <div style={{ fontSize: 13, fontWeight: 800, color: '#5a8f50', marginTop: 2 }}>{override}</div>}
    </div>
  );
};

const EditModal = ({ service, onClose, onSave }) => {
  const [form, setForm] = useState({
    name:     service.name     || '',
    category: service.category || '',
    rate:     service.displayRate || service._rawRate || '',
    min:      service.min      || '',
    max:      service.max      || '',
    hidden:   service.hidden   || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/services/${service.service}`, form);
      onSave();
      onClose();
    } catch (e) {
      alert('Save failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', hint = null) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(44,36,22,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.35)', marginBottom: 5 }}>API: {hint}</div>}
      <input type={type} value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D9D2C5', background: '#FDFAF5', fontSize: 14, outline: 'none', color: '#2C2416' }}
      />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,22,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        style={{ background: '#FDFAF5', borderRadius: 24, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 24px 60px rgba(44,36,22,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#2C2416' }}>
              {service._hasOverride ? 'Edit' : 'Publish'} Service #{service.service}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.45)', marginTop: 2 }}>
              {service._hasOverride ? 'Update service settings' : 'Add this service to your platform'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#8B7355' }}><FaTimes size={18} /></button>
        </div>

        {/* Raw API snapshot */}
        <div style={{ background: 'rgba(172,200,162,0.08)', border: '1px solid rgba(172,200,162,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#5a8f50', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Live Service Data</div>
          <div style={{ fontSize: 12, color: '#2C2416', lineHeight: 1.9 }}>
            <b>Name:</b> {service._rawName}<br />
            <b>Category:</b> {service._rawCategory} &nbsp;|&nbsp; <b>Rate (API USD):</b> ${service._apiRate}/1k &nbsp;|&nbsp; <b>PKR Rate:</b> Rs {service._rawRate}/1k &nbsp;|&nbsp; <b>Min:</b> {service._rawMin} &nbsp;|&nbsp; <b>Max:</b> {service._rawMax}
          </div>
        </div>

        {field('Service Name', 'name', 'text', service._rawName)}
        {field('Category', 'category', 'text', service._rawCategory)}
        {field('Rate (Rs / 1000)', 'rate', 'text', `Rs ${service._rawRate}`)}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>{field('Min', 'min', 'number', service._rawMin)}</div>
          <div style={{ flex: 1 }}>{field('Max', 'max', 'number', service._rawMax)}</div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 24 }}>
          <input type="checkbox" checked={form.hidden} onChange={e => setForm(f => ({ ...f, hidden: e.target.checked }))} style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#2C2416' }}>Hide from users (keep unpublished)</span>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: 'transparent', color: '#8B7355', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '11px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FaSave size={13} /> {saving ? 'Saving...' : service._hasOverride ? 'Save Changes' : 'Publish to Frontend'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [bulkPublishing, setBulkPublishing] = useState(false);
  const [bulkDone, setBulkDone] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/services`);
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRevert = async (serviceId) => {
    if (!confirm('Remove from frontend? This will unpublish the service.')) return;
    await axios.delete(`${API}/admin/services/${serviceId}`);
    load();
  };

  const handleToggleHide = async (s) => {
    await axios.put(`${API}/admin/services/${s.service}`, { hidden: !s.hidden });
    load();
  };

  const handlePublishAll = async () => {
    const unpublished = services.filter(s => !s._hasOverride);
    if (unpublished.length === 0) return;
    if (!confirm(`Publish all ${unpublished.length} unpublished services to the frontend with default settings?`)) return;
    setBulkPublishing(true);
    try {
      // Publish in batches of 10 to avoid overwhelming the server
      const batchSize = 10;
      for (let i = 0; i < unpublished.length; i += batchSize) {
        const batch = unpublished.slice(i, i + batchSize);
        await Promise.all(batch.map(s =>
          axios.put(`${API}/admin/services/${s.service}`, {
            name:     s._rawName,
            category: s._rawCategory,
            rate:     s._rawRate,
            min:      s._rawMin,
            max:      s._rawMax,
            hidden:   false,
          })
        ));
      }
      setBulkDone(true);
      setTimeout(() => setBulkDone(false), 3000);
      load();
    } catch (e) {
      alert('Bulk publish failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setBulkPublishing(false);
    }
  };

  // Build tab counts dynamically
  const tabCounts = useMemo(() => {
    const counts = { all: services.length };
    PLATFORM_MAP.forEach(p => {
      counts[p.key] = services.filter(s => (s._rawCategory || '').toLowerCase().includes(p.key)).length;
    });
    counts.other = services.filter(s => !PLATFORM_MAP.some(p => (s._rawCategory || '').toLowerCase().includes(p.key))).length;
    return counts;
  }, [services]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter(s => {
      const matchSearch = !q || s._rawName?.toLowerCase().includes(q) || String(s.service).includes(q) || s._rawCategory?.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (activeTab === 'all')         return true;
      if (activeTab === 'live')        return s._hasOverride && !s.hidden;
      if (activeTab === 'unpublished') return !s._hasOverride;
      if (activeTab === 'hidden')      return s.hidden;
      if (activeTab === 'other')       return !PLATFORM_MAP.some(p => (s._rawCategory || '').toLowerCase().includes(p.key));
      return (s._rawCategory || '').toLowerCase().includes(activeTab);
    });
  }, [services, search, activeTab]);

  const liveCount = services.filter(s => s._hasOverride && !s.hidden).length;

  const TAB_LIST = [
    { key: 'all',   label: 'All',    icon: <FaLayerGroup />, color: '#ACC8A2' },
    ...PLATFORM_MAP,
    { key: 'other', label: 'Other',  icon: <FaShoppingCart size={13} />, color: '#8B7355' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 28px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <AnimatePresence>
        {editing && <EditModal service={editing} onClose={() => setEditing(null)} onSave={load} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 28, color: '#2C2416', marginBottom: 4 }}>Services Manager</h1>
          <p style={{ color: 'rgba(44,36,22,0.5)', fontSize: 14, margin: 0 }}>
            Only services you enable here will be visible to users.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Publish All button */}
          {services.filter(s => !s._hasOverride).length > 0 && (
            <button
              onClick={handlePublishAll}
              disabled={bulkPublishing}
              style={{
                padding: '10px 18px', borderRadius: 12, border: 'none',
                background: bulkDone ? 'rgba(172,200,162,0.2)' : 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                color: bulkDone ? '#5a8f50' : '#1A2517',
                fontWeight: 800, fontSize: 13, cursor: bulkPublishing ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: bulkPublishing ? 0.7 : 1, transition: 'all 0.2s',
              }}
            >
              {bulkDone
                ? <><FaCheck size={12} /> All Published</>
                : bulkPublishing
                  ? <><FaSync size={12} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</>
                  : <><FaBolt size={12} /> Publish All ({services.filter(s => !s._hasOverride).length})</>
              }
            </button>
          )}
          <button onClick={load} style={{ padding: '10px 18px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: '#FDFAF5', color: '#8B7355', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaSync size={12} /> Refresh API
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Services',  value: services.length,                                          color: '#ACC8A2', filter: 'all' },
          { label: 'Active',          value: liveCount,                                                color: '#5a8f50', filter: 'live' },
          { label: 'Inactive',        value: services.filter(s => !s._hasOverride).length,             color: 'rgba(44,36,22,0.3)', filter: 'unpublished' },
          { label: 'Hidden',          value: services.filter(s => s.hidden).length,                    color: '#e74c3c', filter: 'hidden' },
        ].map(stat => (
          <div key={stat.label} onClick={() => setActiveTab(stat.filter)}
            style={{ background: activeTab === stat.filter ? `${stat.color}18` : '#FDFAF5', border: `1.5px solid ${activeTab === stat.filter ? stat.color : '#E8E2D9'}`, borderRadius: 14, padding: '14px 22px', minWidth: 140, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(44,36,22,0.45)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Platform Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {TAB_LIST.map(tab => {
          const count = tabCounts[tab.key] || 0;
          if (tab.key !== 'all' && tab.key !== 'other' && count === 0) return null;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, border: 'none',
              background: isActive ? tab.color : '#EDE8DF',
              color: isActive ? (tab.key === 'all' ? '#1A2517' : '#fff') : '#8B7355',
              fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none',
            }}>
              <span style={{ fontSize: 14 }}>{tab.icon}</span>
              {tab.label}
              <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(44,36,22,0.08)', color: isActive ? '#fff' : '#8B7355', fontSize: 11, fontWeight: 800, padding: '1px 7px', borderRadius: 20 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 420 }}>
        <FaSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8B7355' }} />
        <input type="text" placeholder="Search by name, ID or category..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 12, border: '1.5px solid #D9D2C5', background: '#FDFAF5', fontSize: 14, outline: 'none', color: '#2C2416' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#FDFAF5', borderRadius: 20, border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(44,36,22,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2C2416' }}>
            <thead>
              <tr style={{ background: '#ACC8A2' }}>
                {['ID', 'Service Name', 'Category', 'Rate /1k', 'Min / Max', 'Frontend Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '13px 18px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#1A2517', textAlign: h === 'Actions' ? 'right' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#ACC8A2', fontWeight: 700 }}>Loading Services...</td></tr>
              )}
              {!loading && filtered.map((s, i) => {
                const plat = getPlatform(s._rawCategory);
                const isLive = s._hasOverride && !s.hidden;
                return (
                  <tr key={s.service} style={{ borderBottom: '1px solid #F0EBE3', opacity: s.hidden ? 0.45 : 1, background: i % 2 === 0 ? 'transparent' : 'rgba(172,200,162,0.02)' }}>
                    <td style={{ padding: '13px 18px', fontSize: 13, fontWeight: 700, color: '#8B7355', whiteSpace: 'nowrap' }}>#{s.service}</td>

                    <td style={{ padding: '13px 18px', maxWidth: 300 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${plat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: plat.color, flexShrink: 0, marginTop: 1 }}>
                          {plat.icon}
                        </div>
                        <div>
                          <DiffCell raw={s._rawName} override={s._hasOverride && s.name !== s._rawName ? s.name : undefined} />
                          {s._hasOverride && <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(172,200,162,0.2)', color: '#5a8f50', padding: '2px 7px', borderRadius: 6, marginTop: 3, display: 'inline-block' }}>EDITED</span>}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <DiffCell raw={s._rawCategory} override={s._hasOverride && s.category !== s._rawCategory ? s.category : undefined} />
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <DiffCell raw={`Rs ${s._rawRate}`} override={s._hasOverride && s.displayRate !== s._rawRate ? `Rs ${s.displayRate}` : undefined} />
                    </td>

                    <td style={{ padding: '13px 18px' }}>
                      <DiffCell raw={`${s._rawMin} / ${s._rawMax}`} override={s._hasOverride && (s.min !== s._rawMin || s.max !== s._rawMax) ? `${s.min} / ${s.max}` : undefined} />
                    </td>

                    {/* Frontend status */}
                    <td style={{ padding: '13px 18px' }}>
                      {isLive
                        ? <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(172,200,162,0.15)', color: '#5a8f50', padding: '3px 10px', borderRadius: 8 }}>● LIVE</span>
                        : s.hidden
                          ? <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(231,76,60,0.1)', color: '#e74c3c', padding: '3px 10px', borderRadius: 8 }}>HIDDEN</span>
                          : <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(44,36,22,0.06)', color: 'rgba(44,36,22,0.35)', padding: '3px 10px', borderRadius: 8 }}>NOT PUBLISHED</span>
                      }
                    </td>

                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {/* Unpublished: show Publish button */}
                        {!s._hasOverride && (
                          <button onClick={() => setEditing(s)} style={{ padding: '7px 12px', borderRadius: 9, border: 'none', background: 'rgba(172,200,162,0.2)', color: '#5a8f50', cursor: 'pointer', fontSize: 11, fontWeight: 800 }}>
                            + Publish
                          </button>
                        )}
                        {/* Published: show hide/show toggle */}
                        {s._hasOverride && (
                          <button onClick={() => handleToggleHide(s)} title={s.hidden ? 'Make live' : 'Hide from frontend'} style={{ padding: '7px 10px', borderRadius: 9, border: 'none', background: '#F5F0E8', color: '#8B7355', cursor: 'pointer' }}>
                            {s.hidden ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                          </button>
                        )}
                        <button onClick={() => setEditing(s)} title="Edit" style={{ padding: '7px 10px', borderRadius: 9, border: 'none', background: 'rgba(172,200,162,0.15)', color: '#5a8f50', cursor: 'pointer' }}>
                          <FaEdit size={13} />
                        </button>
                        {s._hasOverride && (
                          <button onClick={() => handleRevert(s.service)} title="Unpublish" style={{ padding: '7px 10px', borderRadius: 9, border: 'none', background: 'rgba(231,76,60,0.08)', color: '#e74c3c', cursor: 'pointer' }}>
                            <FaUndo size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'rgba(44,36,22,0.35)', fontWeight: 600 }}>No services found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F0EBE3', fontSize: 12, color: 'rgba(44,36,22,0.4)', fontWeight: 600 }}>
            Showing {filtered.length} of {services.length} services &nbsp;·&nbsp; {liveCount} live on frontend
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminServicesPage;
