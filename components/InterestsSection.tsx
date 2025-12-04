// components/InterestsSection.js
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

interface InterestsSectionProps {
  interests: string[];
}

const InterestsSection = ({ interests }: InterestsSectionProps) => {
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
            <li key={index}>{interest}</li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
};

export default InterestsSection;
