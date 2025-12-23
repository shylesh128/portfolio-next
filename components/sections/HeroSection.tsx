import React from "react";
import { motion } from "framer-motion";
import { RevealTextChar } from "@/components/ui/RevealText";
import GlitchText from "@/components/ui/GlitchText";
import { BiChevronDown } from "react-icons/bi";
import { Link } from "react-scroll";

interface HeroSectionProps {
  name: string;
  title: string;
  description: string;
  image?: string; // Now optional since we're not using it
}

const HeroSection: React.FC<HeroSectionProps> = ({
  name,
  title,
  description,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="hero-section" id="Header">
      <motion.div
        className="hero-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Name with glitch effect */}
        <motion.h1
          variants={itemVariants}
          className="hero-title"
          style={{ marginBottom: "0.5rem" }}
        >
          <GlitchText glitchOnHover speed={50}>
            {name}
          </GlitchText>
        </motion.h1>

        {/* Title with character reveal */}
        <motion.div variants={itemVariants} className="hero-subtitle">
          <RevealTextChar delay={0.5} staggerDelay={0.03}>
            {title}
          </RevealTextChar>
        </motion.div>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          style={{
            maxWidth: "600px",
            textAlign: "center",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            lineHeight: 1.8,
            color: "var(--text-secondary)",
            marginTop: "1.5rem",
          }}
        >
          {description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link to="projects" spy smooth duration={500} offset={-80}>
            <motion.button
              className="btn"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Projects
            </motion.button>
          </Link>
          <Link to="contact" spy smooth duration={500} offset={-80}>
            <motion.button
              className="btn btn-outline"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Me
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <span>Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <BiChevronDown size={20} />
        </motion.div>
        <div className="scroll-indicator-line" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
