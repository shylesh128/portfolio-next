import { motion, useInView } from "framer-motion";
import { Typography } from "@mui/material";
import ExperienceCard from "./ExperienceCard";
import { useRef } from "react";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const timelineVariants = {
  hidden: { scaleY: 0 },
  visible: { 
    scaleY: 1, 
    transition: { 
      duration: 1.5, 
      ease: "easeInOut" 
    } 
  },
};

const ExperienceSection = ({ experiences }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref}>
      <motion.div
        className="experience-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Experience</h2>
        <div className="timeline-container">
          <motion.div 
            className="timeline-line"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={timelineVariants}
          />
          {experiences.map((experience, index) => (
            <div key={index} className="timeline-item">
              <motion.div 
                className="timeline-dot"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ 
                  delay: 0.5 + index * 0.2, 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              >
                <motion.div 
                  className="timeline-dot-pulse"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: 1 + index * 0.2
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ delay: 0.7 + index * 0.2, duration: 0.5 }}
                className="timeline-content"
              >
                <ExperienceCard experience={experience} />
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
