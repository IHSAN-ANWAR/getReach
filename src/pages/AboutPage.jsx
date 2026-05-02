import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaLeaf, FaRocket, FaShieldAlt, FaUsers, FaHeadset,
  FaMapMarkerAlt, FaEnvelope, FaPhone, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';
import LandingNavbar from '../components/LandingNavbar';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: 'easeOut' },
});

const values = [
  { icon: <FaRocket size={22} />, title: 'Speed & Reliability', desc: 'Orders processed instantly with real-time status tracking. No delays, no excuses.' },
  { icon: <FaShieldAlt size={22} />, title: 'Secure Payments', desc: 'EasyPaisa & JazzCash integration with manual admin verification — your money is always safe.' },
  { icon: <FaUsers size={22} />, title: 'Built for Agencies', desc: 'Designed for marketing professionals who manage multiple clients and need bulk ordering at scale.' },
  { icon: <FaHeadset size={22} />, title: '24/7 Support', desc: 'Real humans behind every ticket. We respond fast and resolve faster.' },
];

const stats = [
  { value: '1.2M+', label: 'Orders Delivered' },
  { value: '54K+', label: 'Active Partners' },
  { value: '99.9%', label: 'Uptime' },
  { value: '< 2min', label: 'Avg. Response' },
];

const AboutPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1A2517 0%, #0d120b 100%)', color: '#F5F0E8', fontFamily: 'Poppins, sans-serif' }}>
      <LandingNavbar />

      {/* Hero */}
      <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(172,200,162,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div {...fade(0.1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 100, background: 'rgba(172,200,162,0.08)', border: '1px solid rgba(172,200,162,0.2)', marginBottom: 28 }}>
          <FaLeaf color="#ACC8A2" size={13} />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ACC8A2', letterSpacing: 1 }}>WHO WE ARE</span>
        </motion.div>

        <motion.h1 {...fade(0.2)} style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
          Pakistan's Most Trusted<br />
          <span style={{ color: '#ACC8A2' }}>Social Growth Platform</span>
        </motion.h1>

        <motion.p {...fade(0.3)} style={{ fontSize: 18, color: 'rgba(245,240,232,0.55)', maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.8 }}>
          GetReach was built by marketers, for marketers. We provide the infrastructure that agencies need to deliver real, measurable social media growth — fast, reliably, and at scale.
        </motion.p>

        {/* Stats Row */}
        <motion.div {...fade(0.4)} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 700, margin: '0 auto' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '20px 32px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(172,200,162,0.1)', textAlign: 'center', minWidth: 140 }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#ACC8A2' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Story */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
          <motion.div {...fade(0.1)}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ACC8A2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Our Story</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 20 }}>
              Started in Islamabad.<br />Growing Globally.
            </h2>
            <p style={{ color: 'rgba(245,240,232,0.55)', lineHeight: 1.9, fontSize: 15, marginBottom: 16 }}>
              GetReach started as a simple idea — Pakistani agencies deserved a local, reliable platform to manage social media growth services without dealing with foreign payment barriers or unreliable providers.
            </p>
            <p style={{ color: 'rgba(245,240,232,0.55)', lineHeight: 1.9, fontSize: 15 }}>
              We built the entire stack from scratch: a clustered Node.js backend, real-time order tracking, EasyPaisa/JazzCash payment flows, and a full admin panel — all designed to run 24/7 without manual intervention.
            </p>
          </motion.div>

          <motion.div {...fade(0.2)}>
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(172,200,162,0.1)', borderRadius: 24, padding: 32 }}>
              {[
                'Islamabad-based team with global reach',
                'EasyPaisa & JazzCash — no foreign cards needed',
                'Auto-retry & self-healing order system',
                'Real-time order status from API',
                'Admin-verified manual payment approval',
                'Encrypted data on MongoDB Atlas',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <FaCheckCircle color="#ACC8A2" size={15} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(245,240,232,0.7)', fontSize: 14, lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '20px 24px 80px' }}>
        <motion.div {...fade(0)} style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ACC8A2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>What Drives Us</div>
          <h2 style={{ fontSize: 36, fontWeight: 900 }}>Our Core Values</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {values.map((v, i) => (
            <motion.div key={i} {...fade(i * 0.1)}
              whileHover={{ y: -4, borderColor: 'rgba(172,200,162,0.3)' }}
              style={{ padding: '28px 24px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(172,200,162,0.08)', transition: 'all 0.3s' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(172,200,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2', marginBottom: 16 }}>
                {v.icon}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{v.title}</div>
              <div style={{ color: 'rgba(245,240,232,0.5)', fontSize: 13, lineHeight: 1.7 }}>{v.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <motion.div {...fade(0)} style={{ background: 'rgba(172,200,162,0.04)', border: '1px solid rgba(172,200,162,0.12)', borderRadius: 28, padding: '48px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ACC8A2', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Get In Touch</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, marginBottom: 16 }}>We're Here to Help</h2>
            <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 14, lineHeight: 1.8 }}>
              Have questions about our services or need help with your account? Reach out — we respond within minutes.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: <FaMapMarkerAlt size={15} />, text: 'Islamabad Expressway, Islamabad, Pakistan' },
              { icon: <FaPhone size={15} />, text: '+92 327 650 8773', href: 'tel:+923276508773' },
              { icon: <FaEnvelope size={15} />, text: 'getreach.support@gmail.com', href: 'mailto:getreach.support@gmail.com' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(172,200,162,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ACC8A2', flexShrink: 0 }}>
                  {item.icon}
                </div>
                {item.href
                  ? <a href={item.href} style={{ color: 'rgba(245,240,232,0.7)', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>{item.text}</a>
                  : <span style={{ color: 'rgba(245,240,232,0.7)', fontSize: 14, fontWeight: 500 }}>{item.text}</span>
                }
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '0 24px 100px' }}>
        <motion.div {...fade(0)}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>Ready to Scale?</h2>
          <p style={{ color: 'rgba(245,240,232,0.5)', marginBottom: 32, fontSize: 16 }}>Join thousands of agencies already growing with GetReach.</p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '16px 36px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 16, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 30px rgba(172,200,162,0.25)' }}
            >
              Get Started Free <FaArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
