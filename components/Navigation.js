import React, { useState } from "react";
import { Link } from "react-scroll";
import { IconButton, Switch } from "@mui/material";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import { MdDarkMode, MdLightMode } from "react-icons/md";

const Navigation = ({ isDarkMode, toggleMode }) => {
  const navigationLinks = [
    { id: "Header", label: "Profile" },
    { id: "skills", label: "Skills" },
    { id: "experiences", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "studies", label: "Education" },
    { id: "certificates", label: "Certificates" },
    { id: "interests", label: "Interests" },
  ];

  const [activeLink, setActiveLink] = useState("Header");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavLinkClick = (targetId) => {
    setActiveLink(targetId);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevIsMenuOpen) => !prevIsMenuOpen);
  };

  return (
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
          <li>
            <Link className="nav-link-text" onClick={toggleMode}>
              {isDarkMode ? <MdDarkMode /> : <MdLightMode />}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
