import { motion } from "framer-motion";
import Image from "next/image";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

import { Project } from "../types";
import Badge from "@/components/ui/Badge";

const ProjectItem = ({ title, description, link, preview, techStack }: Project) => {
  return (
    <motion.div
      className="project-item"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
      whileHover={{ 
        y: -8,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Image
        src={preview}
        alt={title}
        className="project-preview"
        width={500}
        height={500}
      />
      <div className="project-info">
        <h3>{title}</h3>
        {techStack && techStack.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '0.75rem', 
            marginBottom: '1rem',
            marginTop: '0.5rem',
          }}>
            {techStack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="primary" size="sm">
                {tech}
              </Badge>
            ))}
            {techStack.length > 4 && (
              <Badge variant="default" size="sm">
                +{techStack.length - 4}
              </Badge>
            )}
          </div>
        )}
        <p>{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer">
          View Project →
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectItem;
