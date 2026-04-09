import React, { useEffect, useState } from 'react';
import { FaRupeeSign, FaChartLine, FaShoppingCart, FaArrowUp } from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fmt = (n) => `${Number(n || 0).toFixed(2)}`;

function fillDays(daily, days) {
  const map = {};
  daily.forEach(d => { map[d._id] = d; });
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      label,
      Revenue: parseFloat((map[key]?.revenue || 0).toFixed(2)),
      'API Cost': parseFloat(((map[key]?.apiCost || 0) * 315).toFixed(2)),
      Profit: parseFloat(((map[key]?.revenue || 0) - ((map[key]?.apiCost || 0) * 315)).toFixed(2)),
    };
  });
}

const PERIODS = [
  { label: '7 Days',  value: '7' },
  { label: '30 Days', value: '30' },
  { label: '90 Days', value: '90' },
];

export default function AdminRevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/admin/revenue?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const margin = data ? (((data.totalRevenue - data.totalApiCost * 315) / (data.totalRevenue || 1)) * 100).toFixed(1) : 0;

  return (
    <div style={{ padding: '28px 24px', background: '#F5F0E8', minHeight: '100%' }}>

      {/* Header + period selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#2C2416' }}>Revenue & Profit</div>
          <div style={{ fontSize: 13, color: 'rgba(44,36,22,0.45)', marginTop: 2 }}>All-time totals · filtered chart by period</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: period === p.value ? '#1A2517' : '#E8E2D9',
              color: period === p.value ? '#ACC8A2' : '#2C2416',
              transition: 'all 0.15s'
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#ACC8A2', fontSize: 16 }}>Loading...</div>
      ) : !data ? (
        <div style={{ color: '#E88F8F', padding: 32 }}>Failed to load revenue data.</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Revenue" value={`Rs ${fmt(data.totalRevenue)}`} color="#E8C08F" bg="#2A1F10" icon={<FaRupeeSign size={18} />} sub="charged to users" />
            <StatCard label="API Cost"      value={`Rs ${fmt(data.totalApiCost * 315)}`}                          color="#E88F8F" bg="#2A1010" icon={<FaChartLine size={18} />} sub="service cost" />
            <StatCard label="Net Profit"    value={`Rs ${fmt(data.totalRevenue - data.totalApiCost * 315)}`}       color="#ACC8A2" bg="#1A2517" icon={<FaArrowUp size={18} />}   sub={`${margin}% margin`} />
            <StatCard label="Total Orders"  value={data.totalOrders}                color="#9B8FE8" bg="#1C1A2E" icon={<FaShoppingCart size={18} />} sub="all time" />
          </div>

          {/* Area Chart — Revenue vs Cost vs Profit */}
          <div style={{ background: '#1A2517', borderRadius: 16, padding: '20px 18px', marginBottom: 20, boxShadow: '0 4px 18px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#ACC8A2', marginBottom: 14 }}>Revenue vs API Cost vs Profit — Last {period} Days</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={fillDays(data.daily || [], parseInt(period))}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8C08F" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8C08F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ACC8A2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ACC8A2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A2517', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }} />
                <Area type="monotone" dataKey="Revenue"  stroke="#E8C08F" strokeWidth={2} fill="url(#gRev)" />
                <Area type="monotone" dataKey="API Cost" stroke="#E88F8F" strokeWidth={2} fill="none" strokeDasharray="4 3" />
                <Area type="monotone" dataKey="Profit"   stroke="#ACC8A2" strokeWidth={2} fill="url(#gProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Services */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '20px', boxShadow: '0 2px 12px rgba(44,36,22,0.07)', border: '1px solid #E8E2D9' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#2C2416', marginBottom: 16 }}>Top Services by Revenue — Last {period} Days</div>
            {(data.topServices || []).length === 0 && <div style={{ color: '#aaa', fontSize: 13 }}>No orders in this period.</div>}
            {(data.topServices || []).map((s, i) => {
              const profit = (s.revenue || 0) - ((s.apiCost || 0) * 315);
              const pct = s.revenue ? ((profit / s.revenue) * 100).toFixed(0) : 0;
              const barW = data.topServices[0]?.revenue ? (s.revenue / data.topServices[0].revenue) * 100 : 0;
              return (
                <div key={s._id || i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2C2416', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s._id || 'Unknown Service'}
                    </span>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                      <span style={{ color: '#E8C08F', fontWeight: 700 }}>Rs {fmt(s.revenue)}</span>
                      <span style={{ color: '#E88F8F', fontWeight: 700 }}>-Rs {fmt((s.apiCost || 0) * 315)}</span>
                      <span style={{ color: '#ACC8A2', fontWeight: 800 }}>Rs {fmt(profit)} <span style={{ opacity: 0.6 }}>({pct}%)</span></span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: '#F0EBE3', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: 'linear-gradient(90deg, #ACC8A2, #E8C08F)', borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg, icon, sub }) {
  return (
    <div style={{ background: bg, borderRadius: 16, padding: '22px 20px', boxShadow: '0 4px 18px rgba(0,0,0,0.15)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
    </div>
  );
}
