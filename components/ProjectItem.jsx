// components/ProjectItem.js
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ProjectItem = ({ title, description, link }) => {
  return (
    <motion.div
      className="project-item"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <h3>{title}</h3>
      <p>{description}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
    </motion.div>
  );
};

export default ProjectItem;
