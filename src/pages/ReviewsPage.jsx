import React, { useState } from 'react';
import { FaStar, FaUpload, FaCheckCircle } from 'react-icons/fa';

const DUMMY_REVIEWS = [
  { id: 1,  name: 'Farhan_SMM',        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Farhan92&backgroundColor=b6e3f4',         rating: 5, service: 'Instagram Followers',  text: 'Bohot acha service hai! Maine 5000 followers order kiye aur 2 din mein aa gaye. Bilkul real lagte hain. GetReach pe trust karta hoon 100%.', date: 'March 2025' },
  { id: 2,  name: 'Zara_Official',     avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=ZaraOff&backgroundColor=ffd5dc',              rating: 5, service: 'TikTok Views',          text: 'Mera TikTok video viral ho gaya GetReach ki wajah se! Views bahut fast aaye aur price bhi reasonable tha. Highly recommended for all creators.', date: 'February 2025' },
  { id: 3,  name: 'AliDigital',        avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AliDig',                                   rating: 4, service: 'Facebook Page Likes',   text: 'Service is very good. My Facebook page grew from 200 to 3000 likes in one week. Support team bhi helpful hai. Thoda aur fast hota toh 5 star deta.', date: 'January 2025' },
  { id: 4,  name: 'Hamna_Creator',     avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=HamnaCr&backgroundColor=c0aede',            rating: 5, service: 'YouTube Subscribers',   text: 'Mujhe apne YouTube channel ke liye subscribers chahiye the. GetReach ne 3 din mein 1000 subscribers deliver kiye. Ab mera channel monetize ho gaya!', date: 'December 2024' },
  { id: 5,  name: 'Usman_Karachi',     avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=UsmanK&backgroundColor=d1f4d1',          rating: 5, service: 'Instagram Likes',       text: 'Best SMM panel without any doubt. Maine kai panels try kiye hain lekin GetReach sabse reliable hai. Payments bhi secure hain aur delivery fast.', date: 'November 2024' },
  { id: 6,  name: 'Sana_Vlogs',        avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=SanaVlg&backgroundColor=ffd5dc',          rating: 4, service: 'TikTok Followers',      text: 'Acha experience raha. TikTok followers real lagte hain aur drop nahi hue abhi tak. Price thoda zyada hai but quality ke liye worth it hai.', date: 'October 2024' },
  { id: 7,  name: 'BilalTech',         avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BilalT&backgroundColor=b6e3f4',              rating: 5, service: 'YouTube Views',         text: 'Ordered 10k YouTube views and they started coming within hours. No drop at all after 2 weeks. Will definitely order again from GetReach.', date: 'March 2025' },
  { id: 8,  name: 'Nadia_Lifestyle',   avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=NadiaL&backgroundColor=c0aede',               rating: 5, service: 'TikTok Likes',          text: 'TikTok likes order kiye the, 1 ghante mein aa gaye. Mera content ab zyada log dekh rahe hain. GetReach ne meri growth mein bahut help ki.', date: 'February 2025' },
  { id: 9,  name: 'Kamran_Official',   avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KamranO&backgroundColor=d1f4d1',          rating: 5, service: 'Instagram Followers',  text: 'I was skeptical at first but GetReach delivered exactly what they promised. 2000 followers in 24 hours. Customer support is also very responsive.', date: 'January 2025' },
  { id: 10, name: 'Ayesha_Foodie',     avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AyeshaF&backgroundColor=ffd5dc',            rating: 5, service: 'Facebook Likes',        text: 'Meri food page ke liye Facebook likes order kiye. Bohot fast delivery thi aur sab likes genuine lagte hain. Highly satisfied with the service!', date: 'December 2024' },
  { id: 11, name: 'Rehman_Gamer',      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=RehmanG&backgroundColor=b6e3f4',          rating: 4, service: 'YouTube Subscribers',   text: 'Gaming channel ke liye subscribers liye. Delivery thodi slow thi but quality acha tha. Overall good experience, will use again for next order.', date: 'November 2024' },
  { id: 12, name: 'Maira_Fashion',     avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=MairaF&backgroundColor=ffd5dc',          rating: 5, service: 'TikTok Views',          text: 'My fashion TikToks are getting so much more reach now. Ordered 50k views and they delivered in less than 6 hours. Amazing speed and quality!', date: 'October 2024' },
  { id: 13, name: 'Tariq_Lahore',      avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=TariqL2',                                  rating: 5, service: 'Instagram Story Views', text: 'Story views order kiye aur results bohot acha tha. Mere business page ki reach kaafi barh gayi. GetReach is the best SMM service I have used.', date: 'September 2024' },
  { id: 14, name: 'Hira_Makeup',       avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=HiraMk2&backgroundColor=ffd5dc',              rating: 5, service: 'TikTok Followers',      text: 'Makeup tutorials ke liye TikTok followers liye. Bohot genuine lagte hain, engagement bhi barhi hai. GetReach se dobara zaroor order karungi.', date: 'August 2024' },
  { id: 15, name: 'Asad_Entrepreneur', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AsadEn2&backgroundColor=b6e3f4',          rating: 5, service: 'Facebook Page Likes',   text: 'My business page needed social proof. GetReach delivered 5000 likes in 2 days. My sales have increased because people trust the page more now.', date: 'July 2024' },
  { id: 16, name: 'Sadia_Vlogs',       avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=SadiaV2&backgroundColor=c0aede',          rating: 4, service: 'YouTube Views',         text: 'YouTube views order kiye the. Delivery time thoda zyada laga but views real lagte hain aur watch time bhi acha tha. Overall satisfied.', date: 'June 2024' },
  { id: 17, name: 'Imran_Digital',     avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ImranD2&backgroundColor=d1f4d1',             rating: 5, service: 'Instagram Likes',       text: 'Ordered likes for my photography page. Instant delivery and no drop after weeks. GetReach is my go-to panel for all social media growth needs.', date: 'May 2024' },
  { id: 18, name: 'Fatima_Blogger',    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=FatimaB2&backgroundColor=ffd5dc',           rating: 5, service: 'TikTok Likes',          text: 'Mera blog promote karne ke liye TikTok likes liye. Results bohot acha tha. Mere videos ab explore page pe aa rahe hain. Shukriya GetReach!', date: 'April 2024' },
  { id: 19, name: 'Shahid_Fitness',    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=ShahidF2&backgroundColor=d1f4d1',        rating: 5, service: 'Instagram Followers',  text: 'Fitness page ke liye followers liye. Sab genuine lagte hain aur engagement bhi barhi. GetReach ne meri fitness brand ko grow karne mein help ki.', date: 'March 2024' },
  { id: 20, name: 'Rabia_Cooking',     avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=RabiaC2&backgroundColor=ffd5dc',              rating: 5, service: 'TikTok Views',          text: 'Cooking videos ke liye TikTok views order kiye. 100k views 12 ghante mein aa gaye. Mera channel ab grow ho raha hai. Best service ever!', date: 'February 2024' },
  { id: 21, name: 'Junaid_Music',      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=JunaidM2&backgroundColor=b6e3f4',         rating: 4, service: 'YouTube Subscribers',   text: 'Music channel ke liye subscribers liye. Quality acha tha, thoda slow delivery thi. But overall good value for money. Will order again.', date: 'January 2024' },
  { id: 22, name: 'Amna_Travel',       avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AmnaT2&backgroundColor=c0aede',             rating: 5, service: 'Instagram Story Views', text: 'Travel page ke liye story views liye. Bohot fast delivery thi. Mere stories ab zyada log dekh rahe hain. GetReach is truly reliable!', date: 'December 2023' },
  { id: 23, name: 'Waqas_Lahori',      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WaqasL2&backgroundColor=d1f4d1',          rating: 5, service: 'TikTok Followers',      text: 'Ordered 10k TikTok followers for my comedy page. All delivered within 3 hours. My videos are getting way more organic reach now. Love GetReach!', date: 'November 2023' },
  { id: 24, name: 'Mehwish_Art',       avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=MehwishA2&backgroundColor=ffd5dc',        rating: 5, service: 'Facebook Page Likes',   text: 'Art page ke liye Facebook likes liye. Delivery bohot fast thi aur sab likes genuine lagte hain. Meri page ki credibility barh gayi hai.', date: 'October 2023' },
  { id: 25, name: 'Saad_Photographer', avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=SaadPh2',                                  rating: 5, service: 'Instagram Followers',  text: 'Photography portfolio ke liye Instagram followers liye. Real looking profiles, no bots. My client inquiries have doubled since growing my following.', date: 'September 2023' },
  { id: 26, name: 'Lubna_Crafts',      avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=LubnaC2&backgroundColor=c0aede',              rating: 4, service: 'TikTok Views',          text: 'Handmade crafts ke videos ke liye TikTok views liye. Acha result mila. Thoda aur engagement hota toh perfect hota. Overall happy with GetReach.', date: 'August 2023' },
  { id: 27, name: 'Hassan_Motivator',  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=HassanM2&backgroundColor=d1f4d1',        rating: 5, service: 'YouTube Views',         text: 'Motivational channel ke liye YouTube views order kiye. 50k views 24 ghante mein aa gaye. Channel ki ranking bhi improve hui. Great service!', date: 'July 2023' },
  { id: 28, name: 'Noor_Beauty',       avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=NoorB2&backgroundColor=ffd5dc',             rating: 5, service: 'TikTok Likes',          text: 'Beauty tips ke TikToks ke liye likes order kiye. Instant delivery aur no drop. Mera account ab explore page pe regularly feature hota hai!', date: 'June 2023' },
  { id: 29, name: 'Omer_Sports',       avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=OmerSp2&backgroundColor=b6e3f4',             rating: 5, service: 'Instagram Followers',  text: 'Sports page ke liye followers liye. All genuine, engagement rate improved a lot. GetReach is the most trustworthy SMM panel I have found online.', date: 'May 2023' },
  { id: 30, name: 'Sumbul_Lifestyle',  avatar: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=SumbulL2&backgroundColor=ffd5dc',         rating: 5, service: 'TikTok Followers',      text: 'Lifestyle content ke liye TikTok followers liye. 5000 followers 2 ghante mein aa gaye. Mera account ab verified jaisa lagta hai. Love GetReach!', date: 'April 2023' },
];

const COLORS = ['#ACC8A2','#7aad6e','#5a9e52','#8eba83','#6db86a','#4e9e4a','#3d8c3a'];
const getColor = (name) => COLORS[name.charCodeAt(0) % COLORS.length];

const InitialAvatar = ({ name, size = 54 }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: 16, flexShrink: 0,
      background: `linear-gradient(135deg, ${getColor(name)}, #1A2517)`,
      border: '2px solid rgba(172,200,162,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 900, color: '#fff',
      fontFamily: 'Poppins, sans-serif', userSelect: 'none',
    }}>
      {initial}
    </div>
  );
};

const StarRating = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <FaStar
        key={s}
        size={22}
        style={{ cursor: onChange ? 'pointer' : 'default', transition: 'color 0.15s' }}
        color={s <= value ? '#f5c518' : 'rgba(172,200,162,0.2)'}
        onClick={() => onChange && onChange(s)}
      />
    ))}
  </div>
);

export default function ReviewsPage() {
  const [form, setForm] = useState({ name: '', service: '', rating: 5, text: '', screenshot: null });
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setForm(f => ({ ...f, screenshot: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.text || !form.service) return;
    setSubmitted(true);
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid rgba(172,200,162,0.1)',
    borderRadius: 20,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  };

  return (
    <div style={{ padding: '32px 32px', width: '100%', boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 26, color: 'var(--text-color)', margin: 0 }}>
          Customer Reviews
        </h2>
        <p style={{ color: 'var(--color-gray)', marginTop: 6, fontSize: 14 }}>
          Real feedback from our users — see what they're saying about GetReach.
        </p>
      </div>

      {/* Stats bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2517, #243320)',
        borderRadius: 18, padding: '20px 24px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
        border: '1px solid rgba(172,200,162,0.12)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#ACC8A2', lineHeight: 1 }}>4.8</div>
          <StarRating value={5} />
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 4 }}>Average Rating</div>
        </div>
        <div style={{ width: 1, height: 60, background: 'rgba(172,200,162,0.1)' }} />
        <div style={{ flex: 1, minWidth: 160 }}>
          {[5, 4, 3].map(star => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(245,240,232,0.5)', width: 14 }}>{star}</span>
              <FaStar size={11} color="#f5c518" />
              <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: 'linear-gradient(90deg, #ACC8A2, #7aad6e)',
                  width: star === 5 ? '80%' : star === 4 ? '15%' : '5%',
                }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#F5F0E8', lineHeight: 1 }}>1,200+</div>
          <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.4)', marginTop: 4 }}>Happy Customers</div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20, marginBottom: 36,
      }}>
        {DUMMY_REVIEWS.map(r => (
          <div key={r.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <InitialAvatar name={r.name} size={54} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-color)' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#ACC8A2', fontWeight: 600 }}>{r.service}</div>
              </div>
            </div>
            <StarRating value={r.rating} />
            <p style={{ fontSize: 14, color: 'var(--color-gray)', lineHeight: 1.7, margin: 0 }}>{r.text}</p>
            <div style={{ fontSize: 12, color: 'rgba(172,200,162,0.35)', fontWeight: 600, marginTop: 'auto' }}>{r.date}</div>
          </div>
        ))}
      </div>

      {/* Upload Your Review */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid rgba(172,200,162,0.15)',
        borderRadius: 20, padding: '36px 32px',
      }}>
        <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 18, color: 'var(--text-color)', margin: '0 0 6px' }}>
          Share Your Experience
        </h3>
        <p style={{ color: 'var(--color-gray)', fontSize: 13, marginBottom: 22 }}>
          Used our services? Let others know how it went.
        </p>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <FaCheckCircle size={48} color="#ACC8A2" style={{ marginBottom: 14 }} />
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-color)' }}>Review Submitted!</div>
            <div style={{ color: 'var(--color-gray)', fontSize: 13, marginTop: 6 }}>
              Thank you for your feedback. It will be reviewed and published shortly.
            </div>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', service: '', rating: 5, text: '', screenshot: null }); setPreview(null); }}
              style={{ marginTop: 18, background: 'rgba(172,200,162,0.1)', border: '1px solid rgba(172,200,162,0.2)', borderRadius: 10, padding: '10px 22px', color: '#ACC8A2', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Your Name / Username</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Ali_Creator"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Service Used</label>
                    <input
                      style={inputStyle}
                      placeholder="e.g. Instagram Followers"
                      value={form.service}
                      onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Your Rating</label>
                  <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Your Review</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
                    placeholder="Tell us about your experience with GetReach..."
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    required
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)',
                    border: 'none', borderRadius: 12, padding: '14px',
                    color: '#1A2517', fontWeight: 800, fontSize: 15,
                    cursor: 'pointer', transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Submit Review
                </button>
              </div>

              {/* Right column — screenshot upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={labelStyle}>Screenshot (optional)</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('review-file-input').click()}
                  style={{
                    border: `2px dashed ${dragOver ? '#ACC8A2' : 'rgba(172,200,162,0.2)'}`,
                    borderRadius: 16, padding: '32px 20px', textAlign: 'center',
                    cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                    background: dragOver ? 'rgba(172,200,162,0.05)' : 'rgba(172,200,162,0.02)',
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', minHeight: 220,
                  }}
                >
                  {preview ? (
                    <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 12, maxWidth: '100%', objectFit: 'contain' }} />
                  ) : (
                    <>
                      <div style={{
                        width: 64, height: 64, borderRadius: 18,
                        background: 'rgba(172,200,162,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                      }}>
                        <FaUpload size={26} color="#ACC8A2" />
                      </div>
                      <div style={{ fontSize: 15, color: 'var(--text-color)', fontWeight: 700, marginBottom: 6 }}>
                        Upload Screenshot
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-gray)' }}>
                        Drag & drop or <span style={{ color: '#ACC8A2', fontWeight: 700 }}>click to browse</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(172,200,162,0.35)', marginTop: 8 }}>PNG, JPG up to 5MB</div>
                    </>
                  )}
                </div>
                {preview && (
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setForm(f => ({ ...f, screenshot: null })); }}
                    style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.15)', borderRadius: 10, padding: '8px', color: '#ff6b7a', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
                  >
                    Remove Image
                  </button>
                )}
                <input
                  id="review-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files[0])}
                />
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 700,
  color: 'var(--color-gray)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
};

const inputStyle = {
  width: '100%', background: 'rgba(172,200,162,0.05)',
  border: '1px solid rgba(172,200,162,0.15)', borderRadius: 12,
  padding: '11px 14px', color: 'var(--text-color)', fontSize: 14,
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
};
