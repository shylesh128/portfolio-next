import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BiBookOpen, BiCalendar } from "react-icons/bi";
import TiltCard from "./ui/TiltCard";

import { Education } from "../types";

interface EducationStudiesProps {
  studies: Education[];
}

const EducationStudies = ({ studies }: EducationStudiesProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30 },
    visible: {
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="studies" style={{ padding: "var(--section-padding) 0" }}>
      <motion.div
        ref={ref}
        className="studies-content"
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Education</motion.h2>

        <motion.div
          className="card-container"
          variants={containerVariants}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "1.5rem",
          }}
        >
          {studies.map((study, index) => (
            <motion.div key={index} variants={itemVariants}>
              <TiltCard
                className="study-item"
                maxTilt={6}
                scale={1.02}
                glare
                glareOpacity={0.1}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  {/* Icon */}
                  <motion.div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "var(--color-education-dim)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <BiBookOpen size={24} color="var(--color-education)" />
                  </motion.div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        marginBottom: "0.5rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {study.degree}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {study.institution}
                    </p>

                    {/* Date and percentage */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <BiCalendar size={14} />
                        {study.dates}
                      </span>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: 50,
                          fontSize: "0.8rem",
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {study.percentage}
                      </span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default EducationStudies;
