import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <motion.button
      id="dark-mode-toggle"
      whileTap={{ scale: 0.9 }}
      onClick={toggleDarkMode}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        background: darkMode
          ? 'rgba(172,200,162,0.15)'
          : 'rgba(26,37,23,0.1)',
        border: darkMode
          ? '1px solid rgba(172,200,162,0.3)'
          : '1px solid rgba(26,37,23,0.15)',
        borderRadius: 50,
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: darkMode ? '#ACC8A2' : '#1A2517',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={darkMode ? 'sun' : 'moon'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {darkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

export default DarkModeToggle;
