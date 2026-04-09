import React, { useState } from 'react';
import { FaStar, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaEye, FaEyeSlash, FaChartBar, FaCheckCircle, FaMinusCircle } from 'react-icons/fa';

// Shared source — in a real app this would come from a DB/API
// For now we manage a local copy in localStorage so edits persist across page visits
const INITIAL_REVIEWS = [
  { id: 1,  name: 'Farhan',  rating: 5, service: 'Instagram Followers',  text: 'Bohot acha service hai! Maine 5000 followers order kiye aur 2 din mein aa gaye. Bilkul real lagte hain. GetReach pe trust karta hoon 100%.', date: 'March 2025',     visible: true },
  { id: 2,  name: 'Zara',    rating: 5, service: 'TikTok Views',          text: 'Mera TikTok video viral ho gaya GetReach ki wajah se! Views bahut fast aaye aur price bhi reasonable tha. Highly recommended for all creators.', date: 'February 2025', visible: true },
  { id: 3,  name: 'Ali',     rating: 4, service: 'Facebook Page Likes',   text: 'Service is very good. My Facebook page grew from 200 to 3000 likes in one week. Support team bhi helpful hai. Thoda aur fast hota toh 5 star deta.', date: 'January 2025',  visible: true },
  { id: 4,  name: 'Hamna',   rating: 5, service: 'YouTube Subscribers',   text: 'Mujhe apne YouTube channel ke liye subscribers chahiye the. GetReach ne 3 din mein 1000 subscribers deliver kiye. Ab mera channel monetize ho gaya!', date: 'December 2024', visible: true },
  { id: 5,  name: 'Usman',   rating: 5, service: 'Instagram Likes',       text: 'Best SMM panel without any doubt. Maine kai panels try kiye hain lekin GetReach sabse reliable hai. Payments bhi secure hain aur delivery fast.', date: 'November 2024', visible: true },
  { id: 6,  name: 'Sana',    rating: 4, service: 'TikTok Followers',      text: 'Acha experience raha. TikTok followers real lagte hain aur drop nahi hue abhi tak. Price thoda zyada hai but quality ke liye worth it hai.', date: 'October 2024',  visible: true },
  { id: 7,  name: 'Bilal',   rating: 5, service: 'YouTube Views',         text: 'Ordered 10k YouTube views and they started coming within hours. No drop at all after 2 weeks. Will definitely order again from GetReach.', date: 'March 2025',     visible: true },
  { id: 8,  name: 'Nadia',   rating: 5, service: 'TikTok Likes',          text: 'TikTok likes order kiye the, 1 ghante mein aa gaye. Mera content ab zyada log dekh rahe hain. GetReach ne meri growth mein bahut help ki.', date: 'February 2025', visible: true },
  { id: 9,  name: 'Kamran',  rating: 5, service: 'Instagram Followers',   text: 'I was skeptical at first but GetReach delivered exactly what they promised. 2000 followers in 24 hours. Customer support is also very responsive.', date: 'January 2025',  visible: true },
  { id: 10, name: 'Ayesha',  rating: 5, service: 'Facebook Likes',        text: 'Meri food page ke liye Facebook likes order kiye. Bohot fast delivery thi aur sab likes genuine lagte hain. Highly satisfied with the service!', date: 'December 2024', visible: true },
  { id: 11, name: 'Rehman',  rating: 4, service: 'YouTube Subscribers',   text: 'Gaming channel ke liye subscribers liye. Delivery thodi slow thi but quality acha tha. Overall good experience, will use again for next order.', date: 'November 2024', visible: true },
  { id: 12, name: 'Maira',   rating: 5, service: 'TikTok Views',          text: 'My fashion TikToks are getting so much more reach now. Ordered 50k views and they delivered in less than 6 hours. Amazing speed and quality!', date: 'October 2024',  visible: true },
  { id: 13, name: 'Tariq',   rating: 5, service: 'Instagram Story Views', text: 'Story views order kiye aur results bohot acha tha. Mere business page ki reach kaafi barh gayi. GetReach is the best SMM service I have used.', date: 'September 2024', visible: true },
  { id: 14, name: 'Hira',    rating: 5, service: 'TikTok Followers',      text: 'Makeup tutorials ke liye TikTok followers liye. Bohot genuine lagte hain, engagement bhi barhi hai. GetReach se dobara zaroor order karungi.', date: 'August 2024',   visible: true },
  { id: 15, name: 'Asad',    rating: 5, service: 'Facebook Page Likes',   text: 'My business page needed social proof. GetReach delivered 5000 likes in 2 days. My sales have increased because people trust the page more now.', date: 'July 2024',      visible: true },
  { id: 16, name: 'Sadia',   rating: 4, service: 'YouTube Views',         text: 'YouTube views order kiye the. Delivery time thoda zyada laga but views real lagte hain aur watch time bhi acha tha. Overall satisfied.', date: 'June 2024',      visible: true },
  { id: 17, name: 'Imran',   rating: 5, service: 'Instagram Likes',       text: 'Ordered likes for my photography page. Instant delivery and no drop after weeks. GetReach is my go-to panel for all social media growth needs.', date: 'May 2024',       visible: true },
  { id: 18, name: 'Fatima',  rating: 5, service: 'TikTok Likes',          text: 'Mera blog promote karne ke liye TikTok likes liye. Results bohot acha tha. Mere videos ab explore page pe aa rahe hain. Shukriya GetReach!', date: 'April 2024',     visible: true },
  { id: 19, name: 'Shahid',  rating: 5, service: 'Instagram Followers',   text: 'Fitness page ke liye followers liye. Sab genuine lagte hain aur engagement bhi barhi. GetReach ne meri fitness brand ko grow karne mein help ki.', date: 'March 2024',     visible: true },
  { id: 20, name: 'Rabia',   rating: 5, service: 'TikTok Views',          text: 'Cooking videos ke liye TikTok views order kiye. 100k views 12 ghante mein aa gaye. Mera channel ab grow ho raha hai. Best service ever!', date: 'February 2024', visible: true },
  { id: 21, name: 'Junaid',  rating: 4, service: 'YouTube Subscribers',   text: 'Music channel ke liye subscribers liye. Quality acha tha, thoda slow delivery thi. But overall good value for money. Will order again.', date: 'January 2024',  visible: true },
  { id: 22, name: 'Amna',    rating: 5, service: 'Instagram Story Views', text: 'Travel page ke liye story views liye. Bohot fast delivery thi. Mere stories ab zyada log dekh rahe hain. GetReach is truly reliable!', date: 'December 2023', visible: true },
  { id: 23, name: 'Waqas',   rating: 5, service: 'TikTok Followers',      text: 'Ordered 10k TikTok followers for my comedy page. All delivered within 3 hours. My videos are getting way more organic reach now. Love GetReach!', date: 'November 2023', visible: true },
  { id: 24, name: 'Mehwish', rating: 5, service: 'Facebook Page Likes',   text: 'Art page ke liye Facebook likes liye. Delivery bohot fast thi aur sab likes genuine lagte hain. Meri page ki credibility barh gayi hai.', date: 'October 2023',  visible: true },
  { id: 25, name: 'Saad',    rating: 5, service: 'Instagram Followers',   text: 'Photography portfolio ke liye Instagram followers liye. Real looking profiles, no bots. My client inquiries have doubled since growing my following.', date: 'September 2023', visible: true },
  { id: 26, name: 'Lubna',   rating: 4, service: 'TikTok Views',          text: 'Handmade crafts ke videos ke liye TikTok views liye. Acha result mila. Thoda aur engagement hota toh perfect hota. Overall happy with GetReach.', date: 'August 2023',   visible: true },
  { id: 27, name: 'Hassan',  rating: 5, service: 'YouTube Views',         text: 'Motivational channel ke liye YouTube views order kiye. 50k views 24 ghante mein aa gaye. Channel ki ranking bhi improve hui. Great service!', date: 'July 2023',      visible: true },
  { id: 28, name: 'Noor',    rating: 5, service: 'TikTok Likes',          text: 'Beauty tips ke TikToks ke liye likes order kiye. Instant delivery aur no drop. Mera account ab explore page pe regularly feature hota hai!', date: 'June 2023',      visible: true },
  { id: 29, name: 'Omer',    rating: 5, service: 'Instagram Followers',   text: 'Sports page ke liye followers liye. All genuine, engagement rate improved a lot. GetReach is the most trustworthy SMM panel I have found online.', date: 'May 2023',       visible: true },
  { id: 30, name: 'Sumbul',  rating: 5, service: 'TikTok Followers',      text: 'Lifestyle content ke liye TikTok followers liye. 5000 followers 2 ghante mein aa gaye. Mera account ab verified jaisa lagta hai. Love GetReach!', date: 'April 2023',     visible: true },
];

const AVATAR_COLORS = ['#ACC8A2','#7aad6e','#6ab5c4','#e8a87c','#c47eb5','#e87c7c','#7cb5e8','#c4b87e','#5a9e52','#8eba83','#7ec4a0','#b87ec4'];

const Avatar = ({ name, id }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length],
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 900, color: '#1A2517', fontFamily: 'Poppins',
  }}>
    {name ? name.charAt(0).toUpperCase() : '?'}
  </div>
);

const Stars = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1,2,3,4,5].map(s => (
      <FaStar key={s} size={16}
        style={{ cursor: onChange ? 'pointer' : 'default' }}
        color={s <= value ? '#f5c518' : '#ddd'}
        onClick={() => onChange && onChange(s)}
      />
    ))}
  </div>
);

const EMPTY = { name: '', rating: 5, service: '', text: '', date: '' };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});
  const [addOpen, setAddOpen] = useState(false);
  const [newReview, setNewReview] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);

  const total    = reviews.length;
  const visible  = reviews.filter(r => r.visible).length;
  const hidden   = total - visible;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);

  const startEdit = (r) => { setEditId(r.id); setEditData({ name: r.name, rating: r.rating, service: r.service, text: r.text, date: r.date }); };
  const saveEdit  = () => { setReviews(rs => rs.map(r => r.id === editId ? { ...r, ...editData } : r)); setEditId(null); };
  const cancelEdit = () => setEditId(null);
  const toggleVisible = (id) => setReviews(rs => rs.map(r => r.id === id ? { ...r, visible: !r.visible } : r));
  const confirmDelete = () => { setReviews(rs => rs.filter(r => r.id !== deleteId)); setDeleteId(null); };

  const addReview = () => {
    if (!newReview.name || !newReview.text) return;
    const id = Math.max(...reviews.map(r => r.id)) + 1;
    setReviews(rs => [{ ...newReview, id, visible: true }, ...rs]);
    setNewReview(EMPTY);
    setAddOpen(false);
  };

  const card = { background: '#FDFAF5', border: '1px solid #E8E2D9', borderRadius: 16, padding: '20px 24px' };

  return (
    <div style={{ padding: '32px', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 24, color: '#2C2416', margin: 0 }}>Reviews Manager</h2>
          <p style={{ color: 'rgba(44,36,22,0.5)', fontSize: 13, marginTop: 4 }}>Edit, hide or delete customer reviews shown on the site.</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{
          background: '#1A2517', color: '#ACC8A2', border: 'none', borderRadius: 12,
          padding: '11px 20px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <FaPlus size={13} /> Add Review
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Reviews', value: total,      color: '#ACC8A2', icon: <FaChartBar size={18} /> },
          { label: 'Visible',       value: visible,    color: '#7aad6e', icon: <FaCheckCircle size={18} /> },
          { label: 'Hidden',        value: hidden,     color: '#e8a87c', icon: <FaMinusCircle size={18} /> },
          { label: 'Avg Rating',    value: avgRating,  color: '#f5c518', icon: <FaStar size={18} color="#f5c518" /> },
        ].map(s => (
          <div key={s.label} style={{ ...card, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(44,36,22,0.5)', fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Reviews Table */}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E8E2D9', fontWeight: 900, fontSize: 15, color: '#2C2416' }}>
          All Reviews ({total})
        </div>
        <div style={{ overflowX: 'auto' }}>
          {reviews.map((r, i) => (
            <div key={r.id} style={{
              padding: '16px 24px',
              borderBottom: i < reviews.length - 1 ? '1px solid #F0EBE3' : 'none',
              background: !r.visible ? 'rgba(0,0,0,0.02)' : 'transparent',
              opacity: !r.visible ? 0.6 : 1,
            }}>
              {editId === r.id ? (
                /* ── Edit Mode ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={lbl}>Name</label>
                      <input style={inp} value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                    </div>
                    <div>
                      <label style={lbl}>Service</label>
                      <input style={inp} value={editData.service} onChange={e => setEditData(d => ({ ...d, service: e.target.value }))} />
                    </div>
                    <div>
                      <label style={lbl}>Date</label>
                      <input style={inp} value={editData.date} onChange={e => setEditData(d => ({ ...d, date: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Rating</label>
                    <Stars value={editData.rating} onChange={v => setEditData(d => ({ ...d, rating: v }))} />
                  </div>
                  <div>
                    <label style={lbl}>Review Text</label>
                    <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={editData.text} onChange={e => setEditData(d => ({ ...d, text: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={saveEdit} style={{ background: '#1A2517', color: '#ACC8A2', border: 'none', borderRadius: 10, padding: '9px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaCheck size={12} /> Save
                    </button>
                    <button onClick={cancelEdit} style={{ background: '#F5F0E8', color: '#8B7355', border: '1px solid #E8E2D9', borderRadius: 10, padding: '9px 18px', fontWeight: 800, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaTimes size={12} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View Mode ── */
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <Avatar name={r.name} id={r.id} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#2C2416' }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: '#8B7355', background: '#F5F0E8', border: '1px solid #E8E2D9', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>{r.service}</span>
                      <Stars value={r.rating} />
                      <span style={{ fontSize: 11, color: 'rgba(44,36,22,0.4)', marginLeft: 'auto' }}>{r.date}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(44,36,22,0.65)', lineHeight: 1.6, margin: 0 }}>{r.text}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => toggleVisible(r.id)} title={r.visible ? 'Hide' : 'Show'} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #E8E2D9', background: r.visible ? 'rgba(172,200,162,0.1)' : '#F5F0E8', color: r.visible ? '#7aad6e' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {r.visible ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                    </button>
                    <button onClick={() => startEdit(r)} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid #E8E2D9', background: '#F5F0E8', color: '#8B7355', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaEdit size={13} />
                    </button>
                    <button onClick={() => setDeleteId(r.id)} style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid rgba(255,107,122,0.2)', background: 'rgba(255,107,122,0.06)', color: '#ff6b7a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,22,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAddOpen(false)}>
          <div style={{ background: '#FDFAF5', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(44,36,22,0.18)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 18, color: '#2C2416', margin: '0 0 20px' }}>Add New Review</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Name</label>
                  <input style={inp} placeholder="e.g. Ahmed" value={newReview.name} onChange={e => setNewReview(d => ({ ...d, name: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Service</label>
                  <input style={inp} placeholder="e.g. TikTok Views" value={newReview.service} onChange={e => setNewReview(d => ({ ...d, service: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input style={inp} placeholder="e.g. April 2025" value={newReview.date} onChange={e => setNewReview(d => ({ ...d, date: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Rating</label>
                  <Stars value={newReview.rating} onChange={v => setNewReview(d => ({ ...d, rating: v }))} />
                </div>
              </div>
              <div>
                <label style={lbl}>Review Text</label>
                <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} placeholder="Write the review..." value={newReview.text} onChange={e => setNewReview(d => ({ ...d, text: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setAddOpen(false)} style={{ background: '#F5F0E8', color: '#8B7355', border: '1px solid #E8E2D9', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button onClick={addReview} style={{ background: '#1A2517', color: '#ACC8A2', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Add Review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(44,36,22,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setDeleteId(null)}>
          <div style={{ background: '#FDFAF5', borderRadius: 20, padding: '28px', width: '100%', maxWidth: 380, textAlign: 'center', boxShadow: '0 24px 60px rgba(44,36,22,0.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.15)', margin: '0 auto 16px' }}>
              <FaTrash size={22} color="#ff6b7a" />
            </div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#2C2416', marginBottom: 8 }}>Delete this review?</div>
            <div style={{ fontSize: 13, color: 'rgba(44,36,22,0.5)', marginBottom: 24 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ background: '#F5F0E8', color: '#8B7355', border: '1px solid #E8E2D9', borderRadius: 10, padding: '10px 22px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ background: 'rgba(255,107,122,0.1)', color: '#ff6b7a', border: '1px solid rgba(255,107,122,0.25)', borderRadius: 10, padding: '10px 22px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'rgba(44,36,22,0.5)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5,
};

const inp = {
  width: '100%', background: '#F5F0E8', border: '1px solid #E8E2D9',
  borderRadius: 10, padding: '9px 12px', color: '#2C2416', fontSize: 13,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
