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
import { usePortfolioStore } from "@/store/usePortfolioStore";
import ProjectFilters from "@/components/features/ProjectFilters";

interface ProjectsProps {
  projects: Project[];
}

const Projects = ({ projects }: ProjectsProps) => {
  const isLargeScreen = useMediaQuery("(min-width: 768px)");
  const { filters } = usePortfolioStore();

  // Extract unique tech stack from all projects
  const availableTechStack = React.useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.techStack?.forEach((tech) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter projects based on search and tech stack
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const searchQuery = filters?.searchQuery || '';
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tech stack filter
      const selectedTechStack = filters?.selectedTechStack || [];
      if (selectedTechStack.length > 0) {
        const hasTech = selectedTechStack.some((tech) =>
          project.techStack?.includes(tech)
        );
        if (!hasTech) return false;
      }

      return true;
    });
  }, [projects, filters?.searchQuery, filters?.selectedTechStack]);

  return (
    <section className="projects-section">
      <motion.div
        className="projects-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Projects</h2>
        <ProjectFilters availableTechStack={availableTechStack} />
        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--sub-text-color)' }}>
            No projects found matching your filters.
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project, index) =>
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
        )}
      </motion.div>
    </section>
  );
};

export default Projects;
