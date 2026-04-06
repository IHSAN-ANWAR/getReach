import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle, FaChevronDown, FaChevronUp, 
  FaInfoCircle, FaExclamationTriangle, FaLightbulb,
  FaSearch
} from 'react-icons/fa';

const FAQ_DATA = [
  {
    category: 'General Policies',
    questions: [
      {
        q: "Can I cancel my order after submitting?",
        a: "Orders are processed automatically and cannot be cancelled after submission. Please make sure to think and double-check your link before placing an order."
      },
      {
        q: "What if I used a wrong link?",
        a: "Orders are processed automatically and cannot be edited, changed, or cancelled once placed, even if you insert an incorrect link. Our system might occasionally detect a wrong link and cancel it, but this is rare. If the order is considered complete without delivery due to a wrong link, we cannot refund or refill."
      },
      {
        q: "Why was my order cancelled?",
        a: "Sometimes our system encounters a problem and is unable to process the order, leading to cancellation. If an order is cancelled, the amount is automatically refunded to your account balance. In this case, simply try ordering again."
      }
    ]
  },
  {
    category: 'Status & Definitions',
    questions: [
      {
        q: "What is Partial status?",
        a: "Partial Status is when we partially refund the remains of an order. If we are unable to deliver the full quantity, we refund the undelivered amount to your user balance automatically. Example: You order 5000 units, we deliver 3000, and the remaining 2000 are refunded. Important: Partial orders are never eligible for refill."
      },
      {
        q: "What is Start Count?",
        a: "Start count is the number of followers, likes, or views your page/post has at the moment you place the order. For example, if your Instagram page has 1000 followers when you order, the start count will be 1000."
      }
    ]
  },
  {
    category: 'Refill & Quality',
    questions: [
      {
        q: "What does Refill / No Refill mean?",
        a: "If a service name includes 'Refill', check the description for the guarantee period (e.g., 30 days). 'No Refill' means the service has no guarantee and we are not responsible if the count drops at any time."
      },
      {
        q: "What does [Non Drop] No Refill mean?",
        a: "This means the service currently has no drop issues, but it is still a 'No Refill' service. We will not be able to refill any units even if a drop occurs due to server issues or social media updates. We recommend using 'Refill Guaranteed' services if you want protection against drops."
      },
      {
        q: "When is a refill guarantee revoked?",
        a: "Refill guarantee is revoked if the 'start count' goes down after an order is completed. We are also unable to provide a refill if a post, page, or video is deleted after placing the order."
      }
    ]
  },
  {
    category: 'Advanced Features',
    questions: [
      {
        q: "What is Drip Feed?",
        a: "Drip Feed allows you to split a large order into several smaller runs over time. For example, if you want 1000 likes but want them delivered as 100 likes every 30 minutes, you would set: Quantity: 100, Runs: 10, and Interval: 30. Note: Never set the interval below the actual service start time."
      },
      {
        q: "How do I use Mass Order?",
        a: "Mass Order lets you place multiple orders at once. Use the format: ServiceID|Link|Quantity (one per line). Example: 102|username1|1000 \n 102|username2|1000."
      }
    ]
  }
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ 
      marginBottom: 12, borderRadius: 16, overflow: 'hidden', 
      border: '1px solid rgba(172,200,162,0.15)', background: 'var(--card-bg)',
      transition: 'all 0.3s ease'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '20px 24px', border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-color)', pr: 20 }}>{question}</span>
        {isOpen ? <FaChevronUp color="#ACC8A2" /> : <FaChevronDown color="var(--color-gray)" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ 
              padding: '0 24px 20px', fontSize: 15, color: 'var(--color-gray)', 
              lineHeight: 1.6, whiteSpace: 'pre-line' 
            }}>
              <div style={{ height: 1, background: 'rgba(0,0,0,0.05)', marginBottom: 16 }} />
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = FAQ_DATA.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px 28px' }}
    >
      {/* Header */}
      <div className="mb-5 text-center">
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 36, color: 'var(--text-color)', marginBottom: 12 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ color: 'var(--color-gray)', fontSize: 18, maxWidth: 600, margin: '0 auto 32px' }}>
          Everything you need to know about GetReach services and policies.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: 500, margin: '0 auto', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '14px 14px 14px 50px', borderRadius: 16, 
              border: '2px solid rgba(172,200,162,0.2)', background: 'var(--card-bg)',
              fontSize: 16, outline: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ACC8A2'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(172,200,162,0.2)'}
          />
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-xl-9">
          {filteredData.map((cat, idx) => (
            <div key={idx} className="mb-5">
              <h2 style={{ 
                fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: '#ACC8A2', 
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                textTransform: 'uppercase', letterSpacing: 1
              }}>
                <FaLightbulb size={18} /> {cat.category}
              </h2>
              {cat.questions.map((item, qIdx) => (
                <FAQItem key={qIdx} question={item.q} answer={item.a} />
              ))}
            </div>
          ))}

          {filteredData.length === 0 && (
            <div className="text-center py-5">
              <FaInfoCircle size={48} color="rgba(0,0,0,0.1)" className="mb-3" />
              <p style={{ color: 'var(--color-gray)', fontSize: 16 }}>No questions found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Warning Box */}
      <div className="mt-4 p-4 text-center" style={{ 
        background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.15)', 
        borderRadius: 24, maxWidth: 800, margin: '40px auto 0' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#ff6b7a', marginBottom: 8 }}>
          <FaExclamationTriangle size={20} />
          <strong style={{ fontSize: 18 }}>Important Reminder</strong>
        </div>
        <p style={{ color: 'var(--color-gray)', fontSize: 15, margin: 0, lineHeight: 1.6 }}>
          Always double-check your order details. Once an order is in our system, the automation takes over and manual changes are impossible.
        </p>
      </div>
    </motion.div>
  );
};

export default FAQPage;
