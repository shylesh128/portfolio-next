import { motion } from "framer-motion";
import CertificatesCard from "./CertificatesCard";
import { AnimationItemLeft } from "./AnimationItemLeft";
import { AnimationItemRight } from "./AnimationItemRight";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const CertificatesSection = ({ certificates }) => {
  return (
    <section>
      {/* Use the new class for h2 tag */}
      <motion.h2
        className="section-title"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        Certificates
      </motion.h2>
      <div className="certificate-content">
        {certificates.map((certificate, index) =>
          // Conditional rendering based on index
          index % 2 !== 0 ? ( // Even index, use AnimationItemRight
            <AnimationItemRight key={index}>
              <CertificatesCard certificate={certificate} />
            </AnimationItemRight>
          ) : (
            // Odd index, use AnimationItemLeft
            <AnimationItemLeft key={index}>
              <CertificatesCard certificate={certificate} />
            </AnimationItemLeft>
          )
        )}
      </div>
    </section>
  );
};

export default CertificatesSection;
