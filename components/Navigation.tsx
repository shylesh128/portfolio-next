import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useScrollProgress } from '@/hooks/useScrollProgress';

interface NavigationProps {
  isDarkMode: boolean;
  toggleMode: () => void;
}

// Dynamic scroll duration based on distance - shorter for nearby sections, longer for distant
const calculateScrollDuration = (distance: number): number => {
  const absDistance = Math.abs(distance);
  // Min 300ms for short jumps, max 800ms for long jumps
  return Math.min(Math.max(absDistance * 0.5, 300), 800);
};

const Navigation = ({ isDarkMode, toggleMode }: NavigationProps) => {
  const navigationLinks = [
    { id: 'Header', label: 'Home' },
    { id: 'skills', label: 'Skills' },
    { id: 'experiences', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'studies', label: 'Education' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'contact', label: 'Contact' },
  ];

  const [activeLink, setActiveLink] = useState('Header');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY, progress } = useScrollProgress();
  const isScrolled = scrollY > 50;

  const handleNavLinkClick = (targetId: string) => {
    setActiveLink(targetId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <motion.nav
      className={`navigation ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Progress bar */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '1px',
          background: 'rgba(255, 255, 255, 0.3)',
          width: `${progress * 100}%`,
        }}
      />

      <div className="nav-container">
        {/* Logo / Name */}
        <motion.div
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '-0.02em',
            display: 'none',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to="Header"
            spy={true}
            smooth={true}
            duration={calculateScrollDuration}
            style={{ cursor: 'none' }}
          >
            SS
          </Link>
        </motion.div>

        {/* Mobile menu toggle */}
        <motion.button
          className="menu-toggle"
          onClick={toggleMenu}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </motion.button>

        {/* Desktop Navigation Links */}
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {navigationLinks.map(({ id, label }, index) => (
            <motion.li
              key={id}
              className={`nav-link ${activeLink === id ? 'active' : ''}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Link
                to={id}
                spy={true}
                smooth={true}
                duration={calculateScrollDuration}
                offset={-70}
                className="nav-link-text"
                onClick={() => handleNavLinkClick(id)}
                onSetActive={() => setActiveLink(id)}
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ display: 'inline-block' }}
                >
                  {label}
                </motion.span>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Theme Toggle */}
        <motion.button
          onClick={toggleMode}
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            marginLeft: '1rem',
          }}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDarkMode ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDarkMode ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              top: 60,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: -1,
            }}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navigation;
