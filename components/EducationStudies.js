import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const EducationStudies = ({ studies }) => {
  return (
    <motion.section
      className="studies-content"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <h2>Education & Studies</h2>
      <motion.div className="card-container">
        {studies.map((study, index) => (
          <motion.div
            key={index}
            className="study-item"
            variants={cardVariants}
          >
            <h3>{study.degree}</h3>
            <p>{study.institution}</p>
            <p>{study.dates}</p>
            <p>Percentage: {study.percentage}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default EducationStudies;
