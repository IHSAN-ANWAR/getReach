import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeadset, FaPaperPlane, FaSpinner, FaHistory, FaCheckCircle, FaStar } from 'react-icons/fa';
import axios from 'axios';

const SupportPage = ({ user }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tickets', {
        userId: user.id || user._id, 
        subject,
        message
      });
      setSubmitted(true);
      setSubject('');
      setMessage('');
    } catch (err) {
      alert('Failed to send support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ padding: '32px 28px', maxWidth: 1000 }}
    >
      <div className="mb-5">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 38, color: '#F5F0E8', marginBottom: 8 }}>
          Strategic <span style={{ color: '#ACC8A2' }}>Support</span>
        </h1>
        <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 18, fontWeight: 500, maxWidth: 650 }}>
          Connect with our growth engineering team for technical assistance or infrastructure optimizations.
        </p>
      </div>

      <div className="row g-5">
        <div className="col-12 col-lg-7">
          <div className="card p-5" style={{ borderRadius: 32, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(40px)' }}>
             {submitted ? (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                 className="text-center py-5"
               >
                  <FaCheckCircle color="#ACC8A2" size={80} className="mb-4" />
                  <h3 style={{ color: '#F5F0E8', fontWeight: 800, fontSize: 28 }}>Request Received</h3>
                  <p style={{ color: 'rgba(245,240,232,0.4)', fontSize: 16, marginBottom: 32 }}>An infrastructure engineer will review your ticket within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn" style={{ padding: '14px 40px', borderRadius: 16, background: 'rgba(172,200,162,0.1)', color: '#ACC8A2', fontWeight: 800, border: '1px solid rgba(172,200,162,0.2)' }}>
                    Open New Ticket
                  </button>
               </motion.div>
             ) : (
               <form onSubmit={handleSubmit}>
                 <div className="mb-4">
                    <label style={{ color: 'rgba(245,240,232,0.6)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'block' }}>Subject Area</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g., Payment Inquiry or API Optimization" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      style={{ width: '100%', padding: '20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 16 }}
                    />
                 </div>
                 <div className="mb-5">
                    <label style={{ color: 'rgba(245,240,232,0.6)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, display: 'block' }}>Detailed Message</label>
                    <textarea 
                      required 
                      rows="6" 
                      placeholder="Describe your request in detail..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ width: '100%', padding: '20px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: 16 }}
                    />
                 </div>
                 <button disabled={loading} type="submit" style={{ width: '100%', padding: '22px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #ACC8A2, #7aad6e)', color: '#1A2517', fontWeight: 900, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                   {loading ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                   {loading ? 'Transmitting Request...' : 'Transmit Support Request'}
                 </button>
               </form>
             )}
          </div>
        </div>

        <div className="col-12 col-lg-5">
           <div style={{ padding: '40px', borderRadius: 32, background: 'rgba(172,200,162,0.05)', border: '1px solid rgba(172,200,162,0.1)' }}>
              <FaHeadset color="#ACC8A2" size={40} className="mb-4" />
              <h4 style={{ color: '#F5F0E8', fontWeight: 800, marginBottom: 16 }}>Live Assistance</h4>
              <p style={{ color: 'rgba(245,240,232,0.5)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
                Our engineers are available globally to ensure your agency infrastructure remains at peak performance. Current average response time is **14 minutes**.
              </p>
              
              <div className="mb-3 d-flex align-items-center gap-3">
                 <FaStar color="#ACC8A2" />
                 <div style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 700 }}>Exclusive Partner Support</div>
              </div>
              <div className="d-flex align-items-center gap-3">
                 <FaHistory color="#ACC8A2" />
                 <div style={{ color: '#F5F0E8', fontSize: 14, fontWeight: 700 }}>24/7 Global Surveillance</div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SupportPage;
