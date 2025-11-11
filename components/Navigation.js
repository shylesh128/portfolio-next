import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { BiUpArrowAlt } from "react-icons/bi";
import { IconButton } from "@mui/material";
import { motion, useScroll, useSpring } from "framer-motion";

const Navigation = ({ isDarkMode, toggleMode }) => {
  const navigationLinks = [
    { id: "Header", label: "Profile" },
    { id: "skills", label: "Skills" },
    { id: "experiences", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "studies", label: "Education" },
    { id: "certificates", label: "Certificates" },
    { id: "interests", label: "Interests" },
    { id: "contact", label: "Contact" },
  ];

  const [activeLink, setActiveLink] = useState("Header");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (targetId) => {
    setActiveLink(targetId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ scaleX }}
      />
      
      <nav className="navigation">
        <div className="nav-container">
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <RiCloseLine /> : <RiMenuLine />}
          </button>
          <button className="menu-toggle" onClick={toggleMode}>
            {isDarkMode ? <MdDarkMode /> : <MdLightMode />}
          </button>
          <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
            {navigationLinks.map(({ id, label }) => (
              <li
                key={id}
                className={`nav-link ${activeLink === id ? "active" : ""}`}
              >
                <Link
                  to={id}
                  spy={true}
                  smooth={true}
                  duration={500}
                  className="nav-link-text"
                  onClick={() => handleNavLinkClick(id)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <IconButton
            className="nav-link-text"
            sx={{
              padding: 0,
              marginLeft: "1rem",
              display: {
                xs: "none",
                sm: "flex",
                md: "flex",
              },
            }}
            onClick={toggleMode}
          >
            {isDarkMode ? (
              <MdDarkMode size={20} color="#FFF" />
            ) : (
              <MdLightMode size={20} color="#2f628a" />
            )}
          </IconButton>
        </div>
      </nav>

      {/* Back to Top Button */}
      <motion.button
        className="back-to-top"
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showBackToTop ? 1 : 0, 
          scale: showBackToTop ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <BiUpArrowAlt size={24} />
      </motion.button>
    </>
  );
};

export default Navigation;
