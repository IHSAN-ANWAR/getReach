import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TypewriterText = ({ texts, speed = 100, pause = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const activeText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setDisplayText(activeText.substring(0, displayText.length + 1));
        
        if (displayText.length === activeText.length) {
          setTimeout(() => setIsDeleting(true), pause);
        }
      } else {
        // Deleting
        setDisplayText(activeText.substring(0, displayText.length - 1));
        
        if (displayText.length === 0) {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts, speed, pause]);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        style={{
          display: 'inline-block',
          width: 2,
          height: '0.8em',
          background: 'currentColor',
          marginLeft: 4,
          verticalAlign: 'middle'
        }}
      />
    </span>
  );
};

export default TypewriterText;
