import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const ProjectItem = ({ title, description, link, preview }) => {
  return (
    <motion.div
      className="project-item"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <img src={preview} alt={title} className="project-preview" />
      <div className="project-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer">
          View
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectItem;
