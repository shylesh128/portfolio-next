import { motion } from "framer-motion";
import ProjectItem from "./ProjectItem";
import { AnimationItemRight } from "./AnimationItemRight";
import { AnimationItemLeft } from "./AnimationItemLeft";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Projects = ({ projects }) => {
  return (
    <section className="projects-section">
      <motion.div
        className="projects-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Projects</h2>
        <div className="projects-grid">
          {projects.map((project, index) =>
            index % 2 !== 0 ? (
              <AnimationItemRight key={index}>
                <ProjectItem
                  title={project.title}
                  description={project.description}
                  link={project.link}
                  preview={project.preview}
                />
              </AnimationItemRight>
            ) : (
              <AnimationItemLeft key={index}>
                <ProjectItem
                  title={project.title}
                  description={project.description}
                  link={project.link}
                  preview={project.preview}
                />
              </AnimationItemLeft>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;
