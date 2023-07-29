// components/Projects.js
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Projects = ({ projects }) => {
  return (
    <section>
      <motion.div
        className="projects-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Projects</h2>
        {projects.map((project, index) => (
          <div key={index}>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default Projects;
