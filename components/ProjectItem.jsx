import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ProjectItem = ({ title, description, link, preview }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if it's a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e) => {
    if (isMobile) return; // Disable tilt on mobile
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const calculateTilt = () => {
    if (isMobile) {
      return { transform: "none" }; // No tilt on mobile
    }
    
    const tiltX = (mousePosition.y - 0.5) * 20;
    const tiltY = (mousePosition.x - 0.5) * -20;
    return isHovered
      ? {
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`,
        }
      : { transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)" };
  };

  return (
    <motion.div
      className="project-item"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      style={calculateTilt()}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="project-image-wrapper">
        <Image
          src={preview}
          alt={title}
          className="project-preview"
          width={500}
          height={500}
        />
        <div className="project-overlay">
          <span className="view-project-text">View Project →</span>
        </div>
      </div>
      <div className="project-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="project-link">
          <span>View Live</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectItem;
