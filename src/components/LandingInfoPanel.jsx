import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  FaLeaf, FaRocket, FaShieldAlt, FaChartLine, FaShieldVirus
} from 'react-icons/fa';
import TypewriterText from './TypewriterText';

const CounterTicker = ({ value, duration = 2, suffix = "" }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
     if (typeof value === 'string' && value.includes('.')) {
        return latest.toFixed(1) + suffix;
     }
     return Math.round(latest).toLocaleString() + suffix;
  });

  useEffect(() => {
    const controls = animate(count, parseFloat(value), { duration });
    return controls.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
};

const TrustIndicator = ({ icon, label, value, color }) => (
   <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{
         width: 48, height: 48, borderRadius: 14, background: `${color}15`,
         display: 'flex', alignItems: 'center', justifyContent: 'center', color: color,
         fontSize: 20
      }}>
         {icon}
      </div>
      <div>
         <div style={{ fontSize: 22, fontWeight: 800, color: '#F5F0E8', lineHeight: 1 }}>{value}</div>
         <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.5)', fontWeight: 600, marginTop: 4 }}>{label}</div>
      </div>
   </div>
);

export const LandingInfoPanel = () => (
   <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-center p-5" style={{ 
      background: 'linear-gradient(145deg, #1A2517 0%, #0d120b 100%)', 
      position: 'relative', overflow: 'hidden'
   }}>
      {/* Glow Effects */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(172,200,162,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
      <div style={{ position: 'absolute', bottom: '-5%', right: '0%', width: '30%', height: '30%', background: 'rgba(172,200,162,0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <motion.div
         initial={{ opacity: 0, x: -30 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.8 }}
         style={{ position: 'relative', zIndex: 2 }}
      >
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <FaLeaf color="#1A2517" size={24} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#F5F0E8', fontFamily: 'Poppins', letterSpacing: '-0.5px' }}>
               Get<span style={{ color: '#ACC8A2' }}>Reach</span>
            </span>
         </div>

         <h1 style={{ fontSize: 48, fontWeight: 800, color: '#F5F0E8', lineHeight: 1.1, marginBottom: 24, fontFamily: 'Poppins' }}>
            Elevate Your <br />
            <span style={{ color: '#ACC8A2' }}>
               <TypewriterText texts={['Social Authority.', 'Market Growth.', 'Trust & Success.']} speed={120} pause={3000} />
            </span>
         </h1>
         <p style={{ fontSize: 18, color: 'rgba(245,240,232,0.6)', maxWidth: 480, marginBottom: 48, lineHeight: 1.6 }}>
            The professional standard for accelerating your digital growth. Scale your presence with speed, security, and proven strategies.
         </p>

         <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: '32px', maxWidth: 400 }}>
            <TrustIndicator icon={<FaRocket />} label="Global Orders Fulfilled" value={<CounterTicker value="1245000" suffix="+" />} color="#ACC8A2" />
            <TrustIndicator icon={<FaShieldAlt />} label="Active Secure Accounts" value={<CounterTicker value="54000" suffix="+" />} color="#3498db" />
            <TrustIndicator icon={<FaChartLine />} label="Client Success Rate" value={<CounterTicker value="99.2" suffix="%" />} color="#f1c40f" />
         </div>

         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 40, color: 'rgba(245,240,232,0.4)', fontSize: 14, fontWeight: 600 }}>
            <FaShieldVirus size={18} color="#ACC8A2" />
            Military-grade 256-bit SSL Data Encryption active
         </div>
      </motion.div>
   </div>
);

export default LandingInfoPanel;
