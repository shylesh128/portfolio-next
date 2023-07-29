// components/StudyItem.js
import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const StudyItem = ({ title, institution, year }) => {
  return (
    <motion.div
      className="study-item"
      initial="hidden"
      animate="visible"
      variants={itemVariants}
    >
      <h3>{title}</h3>
      <p>{institution}</p>
      <p>{year}</p>
    </motion.div>
  );
};

export default StudyItem;
