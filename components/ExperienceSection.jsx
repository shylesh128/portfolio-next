import { motion } from "framer-motion";
import { Typography } from "@mui/material";
import ExperienceCard from "./ExperienceCard";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ExperienceSection = ({ experiences }) => {
  return (
    <section>
      <motion.div
        className="experience-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Experience</h2>
        {experiences.map((experience, index) => (
          <ExperienceCard key={index} experience={experience} />
        ))}
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
