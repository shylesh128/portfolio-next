import { motion } from "framer-motion";
import CertificatesCard from "./CertificatesCard";
import { AnimationItemLeft } from "./AnimationItemLeft";
import { AnimationItemRight } from "./AnimationItemRight";
import useMediaQuery from "@mui/material/useMediaQuery";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const CertificatesSection = ({ certificates }) => {
  const isLargeScreen = useMediaQuery("(min-width: 768px)");

  return (
    <section>
      <div className="certificate-content">
        <motion.h2
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          Certificates
        </motion.h2>
        {certificates.map((certificate, index) =>
          isLargeScreen ? (
            index % 2 !== 0 ? (
              <AnimationItemRight key={index}>
                <CertificatesCard certificate={certificate} />
              </AnimationItemRight>
            ) : (
              <AnimationItemLeft key={index}>
                <CertificatesCard certificate={certificate} />
              </AnimationItemLeft>
            )
          ) : (
            <AnimationItemRight key={index}>
              <CertificatesCard certificate={certificate} />
            </AnimationItemRight>
          )
        )}
      </div>
    </section>
  );
};

export default CertificatesSection;
