// components/Section.js
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const Section = ({ sectionRef, title, content }) => {
  return (
    <section>
      <motion.div
        className={`section-content ${title.toLowerCase()}-content`}
        ref={sectionRef}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        {title && <h2>{title}</h2>}
        {content}
      </motion.div>
    </section>
  );
};

export default Section;
