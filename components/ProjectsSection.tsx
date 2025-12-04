import * as React from "react";
import { motion } from "framer-motion";
import ProjectItem from "./ProjectItem";
import { AnimationItemRight } from "./AnimationItemRight";
import { AnimationItemLeft } from "./AnimationItemLeft";
import useMediaQuery from "@mui/material/useMediaQuery";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

import { Project } from "../types";

interface ProjectsProps {
  projects: Project[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

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
            isLargeScreen ? (
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
            ) : (
              <AnimationItemRight key={index}>
                <ProjectItem
                  title={project.title}
                  description={project.description}
                  link={project.link}
                  preview={project.preview}
                />
              </AnimationItemRight>
            )
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;
