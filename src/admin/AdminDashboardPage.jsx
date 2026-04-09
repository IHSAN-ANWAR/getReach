import React, { useEffect, useState } from 'react';
import { FaUsers, FaShoppingCart, FaTicketAlt, FaBell, FaUserPlus, FaBoxOpen, FaWallet, FaSync } from 'react-icons/fa';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CARDS = [
  { key: 'totalUsers',   label: 'Total Users',   color: '#ACC8A2', bg: '#1A2517', icon: <FaUsers size={20} /> },
  { key: 'totalOrders',  label: 'Total Orders',  color: '#9B8FE8', bg: '#1C1A2E', icon: <FaShoppingCart size={20} /> },
  { key: 'totalRevenue', label: 'Total Revenue', color: '#E8C08F', bg: '#2A1F10', icon: <span style={{fontWeight:900, fontSize:18}}>Rs</span> },
  { key: 'totalTickets', label: 'Open Tickets',  color: '#8FC5E8', bg: '#101E2A', icon: <FaTicketAlt size={20} /> },
];

function fillDays(data) {
  const map = {};
  data.forEach(d => { map[d._id] = d.count; });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: map[key] || 0 };
  });
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiBalance, setApiBalance] = useState(null);
  const [apiBalanceLoading, setApiBalanceLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/admin/stats`)
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fetchApiBalance = () => {
    setApiBalanceLoading(true);
    fetch(`${API}/api/orders/balance`)
      .then(r => r.json())
      .then(data => { setApiBalance(data); setApiBalanceLoading(false); })
      .catch(() => setApiBalanceLoading(false));
  };

  useEffect(() => { fetchApiBalance(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#ACC8A2', fontSize: 16 }}>
      Loading dashboard...
    </div>
  );
  if (!stats) return <div style={{ padding: 32, color: '#E88F8F' }}>Failed to load stats.</div>;

  const cardValues = {
    totalUsers:   stats.totalUsers,
    totalOrders:  stats.totalOrders,
    totalRevenue: `Rs ${Number(stats.totalRevenue).toFixed(2)}`,
    totalTickets: `${stats.openTickets} / ${stats.totalTickets}`,
  };

  return (
    <div style={{ padding: '28px 24px', background: '#F5F0E8', minHeight: '100%' }}>

      {/* Notification */}
      {stats.openTickets > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(232,143,143,0.12)', border: '1px solid rgba(232,143,143,0.3)', borderRadius: 12, padding: '12px 18px', marginBottom: 24, color: '#c0392b', fontWeight: 700, fontSize: 13 }}>
          <FaBell size={14} />
          {stats.openTickets} open support ticket{stats.openTickets !== 1 ? 's' : ''} need attention
        </div>
      )}

      {/* API Credit Balance */}
      <div style={{ background: '#1A2517', borderRadius: 16, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, border: '1px solid rgba(172,200,162,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(172,200,162,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaWallet color="#ACC8A2" size={20} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(172,200,162,0.5)', textTransform: 'uppercase', letterSpacing: 1 }}>API Credit</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#ACC8A2', lineHeight: 1.2 }}>
              {apiBalanceLoading ? '...' : apiBalance?.balance != null
                ? `Rs ${(Number(apiBalance.balance) * 315).toFixed(2)}`
                : 'Unavailable'}
            </div>
            {apiBalance?.balance != null && (
              <div style={{ fontSize: 12, color: 'rgba(172,200,162,0.4)', fontWeight: 600 }}>
                ${Number(apiBalance.balance).toFixed(4)} USD · Used to fulfill user orders
              </div>
            )}
          </div>
        </div>
        <button onClick={fetchApiBalance} disabled={apiBalanceLoading}
          style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(172,200,162,0.2)', background: 'rgba(172,200,162,0.08)', color: '#ACC8A2', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
          <FaSync size={12} style={apiBalanceLoading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {CARDS.map(card => (
          <div key={card.key} style={{ background: card.bg, borderRadius: 16, padding: '22px 20px', boxShadow: '0 4px 18px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{card.label}</span>
              <span style={{ color: card.color }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: card.color, lineHeight: 1 }}>{cardValues[card.key]}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
        <ChartCard title="New Registrations — Last 7 Days" color="#ACC8A2" bg="#1A2517">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={fillDays(stats.usersLast7 || [])}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A2517', border: 'none', borderRadius: 8, color: '#ACC8A2', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#ACC8A2" strokeWidth={2.5} dot={{ fill: '#ACC8A2', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders Placed — Last 7 Days" color="#9B8FE8" bg="#1C1A2E">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fillDays(stats.ordersLast7 || [])}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1C1A2E', border: 'none', borderRadius: 8, color: '#9B8FE8', fontSize: 12 }} />
              <Bar dataKey="count" fill="#9B8FE8" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Activity Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>

        {/* Recent Users */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(44,36,22,0.07)', border: '1px solid #E8E2D9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaUserPlus size={14} color="#ACC8A2" />
            <span style={{ fontWeight: 800, fontSize: 13, color: '#2C2416' }}>Recent Registrations</span>
          </div>
          {(stats.recentUsers || []).length === 0 && <div style={{ color: '#aaa', fontSize: 13 }}>No users yet</div>}
          {(stats.recentUsers || []).map((u, i) => (
            <div key={u._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.recentUsers.length - 1 ? '1px solid #F0EBE3' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#1A2517', color: '#ACC8A2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13 }}>
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2C2416' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.45)' }}>{u.email}</div>
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(44,36,22,0.35)', whiteSpace: 'nowrap' }}>{timeAgo(u.created)}</span>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(44,36,22,0.07)', border: '1px solid #E8E2D9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FaBoxOpen size={14} color="#9B8FE8" />
            <span style={{ fontWeight: 800, fontSize: 13, color: '#2C2416' }}>Recent Orders</span>
          </div>
          {(stats.recentOrders || []).length === 0 && <div style={{ color: '#aaa', fontSize: 13 }}>No orders yet</div>}
          {(stats.recentOrders || []).map((o, i) => (
            <div key={o._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < stats.recentOrders.length - 1 ? '1px solid #F0EBE3' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#1C1A2E', color: '#9B8FE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaShoppingCart size={13} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2C2416', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.serviceName || `Service #${o.serviceId}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.45)' }}>
                    {o.userId?.name || 'Unknown'} · {o.quantity} units
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#E8C08F' }}>Rs {Number(o.price || 0).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'rgba(44,36,22,0.35)' }}>{timeAgo(o.created)}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ChartCard({ title, color, bg, children }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '20px 18px', boxShadow: '0 4px 18px rgba(0,0,0,0.15)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color, marginBottom: 14, letterSpacing: 0.3 }}>{title}</div>
      {children}
    </div>
  );
}

