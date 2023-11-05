import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHtml5,
  FaCss3,
  FaReact,
  FaNodeJs,
  FaPython,
  FaAws,
} from "react-icons/fa";
import { FiDatabase } from "react-icons/fi";
import { SiNextdotjs, SiExpress, SiMongodb, SiOpenai } from "react-icons/si";
import { RiJavascriptFill } from "react-icons/ri";
import { PiBird } from "react-icons/pi";
import { LinearProgress } from "@mui/material";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const iconVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
};

const SkillsSection = ({ skills }) => {
  const skillIcons = {
    HTML: FaHtml5,
    CSS: FaCss3,
    JavaScript: RiJavascriptFill,
    "NEXT JS": SiNextdotjs,
    "NODE JS": FaNodeJs,
    SQL: FiDatabase,
    "REACT JS": FaReact,
    "EXPRESS JS": SiExpress,
    PYTHON: FaPython,
    "MONGO DB": SiMongodb,
    "OpenAI Customizations": SiOpenai,
    LangChain: PiBird,
    "React Native": FaReact,
    "AWS (S3)": FaAws,
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
              const IconComponent = skillIcons[skill.skill];
              return (
                <motion.li
                  key={index}
                  className="skill-card"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  <div className="skill-icon">
                    <IconComponent size={48} />
                  </div>
                  <div className="skill-details">
                    <div className="skill-content">
                      <p>{skill.skill}</p>
                    </div>
                    <div className="skill-rating">
                      <LinearProgress
                        variant="determinate"
                        value={skill.rating * 10}
                        sx={{
                          width: "200px",
                        }}
                      />
                    </div>
                  </div>
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
