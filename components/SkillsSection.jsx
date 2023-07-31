import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHtml5,
  FaCss3,
  FaJs,
  FaReact,
  FaNodeJs,
  FaPython,
} from "react-icons/fa";
import { FiDatabase } from "react-icons/fi"; // Feather icons
import { SiNextdotjs, SiExpress, SiMongodb } from "react-icons/si"; // Feather icons

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const iconVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SkillsSection = ({ skills }) => {
  const skillIcons = {
    "HTML/CSS": FaHtml5,
    "NEXT JS": SiNextdotjs,
    "NODE JS": FaNodeJs,
    SQL: FiDatabase,
    "REACT JS": FaReact,
    "EXPRESS JS": SiExpress,
    PYTHON: FaPython,
    "MONGO DB": SiMongodb,
  };

  return (
    <section>
      <motion.div
        className="skills-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Skills</h2>
        <ul className="skill-list">
          <AnimatePresence>
            {skills.map((skill, index) => {
              const IconComponent = skillIcons[skill];
              return (
                <motion.li
                  key={index}
                  className="skill-item"
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <IconComponent size={48} />
                  <p>{skill}</p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </motion.div>
    </section>
  );
};

export default SkillsSection;
