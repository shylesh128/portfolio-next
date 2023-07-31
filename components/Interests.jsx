import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
};

const Interests = ({ interests }) => {
  return (
    <section>
      <motion.div
        className="interests-content"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h2>Interests</h2>
        <ul>
          {interests.map((interest, index) => (
            <motion.li
              key={index}
              variants={listItemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {interest}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default Interests;
