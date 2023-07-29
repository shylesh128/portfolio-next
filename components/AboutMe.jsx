// components/AboutMe.js
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const AboutMe = ({ description }) => {
  return (
    <section>
      <motion.div
        className="about-me-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <p>{description}</p>
      </motion.div>
    </section>
  );
};

export default AboutMe;
