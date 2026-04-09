import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle, FaChevronDown, FaChevronUp, 
  FaInfoCircle, FaExclamationTriangle, FaLightbulb,
  FaSearch
} from 'react-icons/fa';

const FAQ_DATA = [
  {
    category: 'Please Read Before Submitting an Order',
    icon: '⚠️',
    warning: true,
    questions: [
      {
        q: "This is an automatic server — orders cannot be cancelled after submission",
        a: "Once you submit an order, it is processed automatically and cannot be cancelled, edited, or changed. Please think carefully before placing any order."
      },
      {
        q: "Refill guarantee will be revoked if start count drops after order completes",
        a: "If the start count goes down after an order is completed, the refill guarantee is automatically revoked and we are unable to provide any refill in such cases."
      },
      {
        q: "Order is considered complete if start count drops after placing/starting",
        a: "If the start count goes down after an order is placed or started, the order will be marked as completed. We are unable to cancel or partially refund such orders."
      },
      {
        q: "Order is considered complete if post/page/video is deleted after placing",
        a: "If the post, page, or video you ordered on is deleted or removed after the order is placed, the order will be considered complete and we cannot cancel or refund it."
      }
    ]
  },
  {
    category: 'General Policies',
    questions: [
      {
        q: "Can I cancel my order after submitting?",
        a: "Orders are processed automatically and cannot be cancelled after submission. Please make sure to think and double-check your link before placing an order."
      },
      {
        q: "I placed an order with the wrong link — can you cancel and refund it?",
        a: "This is an automatic server so after placing an order we can't edit, change, or cancel it even if you inserted the wrong link. Sometimes our server can detect a wrong link and cancel it, but this is very rare. If the server considers the order complete without delivery, we cannot refund or refill."
      },
      {
        q: "Why was my order cancelled?",
        a: "Sometimes the server encounters a problem and is unable to process the order, leading to cancellation. If an order is cancelled, the amount is automatically refunded to your account balance — check that the order cost shows 0 and verify your balance. In this case, simply try ordering again."
      }
    ]
  },
  {
    category: 'Status & Definitions',
    questions: [
      {
        q: "What is Partial status?",
        a: "Partial Status is when we partially refund the remaining undelivered amount of an order.\n\nExample: You bought an order with quantity 5000 and charged $5. We delivered 3000 and couldn't deliver the remaining 2000, so we 'Partial' the order and refund you the remaining 2000 ($2 in this example). This refunded amount is automatically added to your user balance.\n\nImportant: Partial orders are never eligible for refill. If an order gets partial, the refill guarantee is automatically revoked and we are unable to refill such orders. If an order got partial, you can order again using another server."
      },
      {
        q: "What is Start Count?",
        a: "Start count is the number of current followers, likes, or views the page/post has at the moment you place the order.\n\nExample: Your Instagram page has 1000 followers now. If you order a followers service, the order start count will be 1000."
      }
    ]
  },
  {
    category: 'Refill & Quality',
    questions: [
      {
        q: "What does Refill / No Refill mean?",
        a: "If a service name includes 'Refill', check the description for how many days the refill guarantee applies. 'No Refill' means the service has no guarantee — it can drop at any time and we are not responsible for it. Do not contact us for a refill after purchasing a No Refill service."
      },
      {
        q: "What does [Non Drop] No Refill mean?",
        a: "This means the service currently has no drop issues, but it is still a No Refill service. We will not be able to refill even a single follower/like even if it drops 100% due to server issues or social media updates.\n\nMake sure to use a Refill Guaranteed service if you want protection against drops."
      },
      {
        q: "When is a refill guarantee revoked?",
        a: "Refill guarantee is revoked if the start count goes down after an order is completed. We are also unable to provide a refill if a post, page, or video is deleted after placing the order."
      }
    ]
  },
  {
    category: 'Advanced Features',
    questions: [
      {
        q: "What is Drip Feed?",
        a: "Drip Feed lets you place the same order multiple times automatically over a set interval.\n\nExample: You want 1000 likes on your Instagram post but want 100 likes every 30 minutes:\n• Link: Your post link\n• Quantity: 100\n• Runs: 10 (10 × 100 = 1000 total)\n• Interval: 30 (minutes between each run)\n\nNote: Never order more total quantity than the service maximum (Quantity × Runs must not exceed the service max). Also never set the Interval below the actual service start time — some services need 60 minutes to start, so setting a lower interval will cause order failures."
      },
      {
        q: "How do I use Mass Order?",
        a: "Put the Service ID, followed by | , followed by the link, followed by | , followed by the quantity — one order per line.\n\nFormat: ID|Link|Quantity\n\nExample — adding 1000 Instagram followers to 3 accounts (service ID 102):\n102|abcd|1000\n102|asdf|1000\n102|qwer|1000\n\nTo find a service ID, check the Services page."
      }
    ]
  }
];

const FAQItem = ({ question, answer, warning }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ 
      marginBottom: 12, borderRadius: 16, overflow: 'hidden', 
      border: `1px solid ${warning ? 'rgba(231,76,60,0.2)' : 'rgba(172,200,162,0.15)'}`,
      background: 'var(--card-bg)',
      transition: 'all 0.3s ease'
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', padding: '20px 24px', border: 'none', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', textAlign: 'left', gap: 16
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 700, color: warning ? '#ff6b7a' : 'var(--text-color)' }}>{question}</span>
        {isOpen ? <FaChevronUp color={warning ? '#ff6b7a' : '#ACC8A2'} style={{ flexShrink: 0 }} /> : <FaChevronDown color="var(--color-gray)" style={{ flexShrink: 0 }} />}
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
              lineHeight: 1.7, whiteSpace: 'pre-line' 
            }}>
              <div style={{ height: 1, background: warning ? 'rgba(231,76,60,0.1)' : 'rgba(0,0,0,0.05)', marginBottom: 16 }} />
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
                fontFamily: 'Poppins', fontWeight: 800, fontSize: 20,
                color: cat.warning ? '#ff6b7a' : '#ACC8A2',
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
                textTransform: 'uppercase', letterSpacing: 1
              }}>
                {cat.warning ? <FaExclamationTriangle size={18} /> : <FaLightbulb size={18} />} {cat.category}
              </h2>
              {cat.warning && (
                <div style={{ background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 14, padding: '12px 18px', marginBottom: 16, fontSize: 14, color: '#ff6b7a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaExclamationTriangle size={14} /> Please read all points below carefully before placing any order.
                </div>
              )}
              {cat.questions.map((item, qIdx) => (
                <FAQItem key={qIdx} question={item.q} answer={item.a} warning={cat.warning} />
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
