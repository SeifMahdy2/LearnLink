import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function ThemeSwitch() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      className="theme-switch"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '🌞' : '🌙'}
    </motion.button>
  );
}

export default ThemeSwitch; 