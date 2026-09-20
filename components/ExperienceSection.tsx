import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  BiCalendar,
  BiCheck,
  BiBriefcase,
  BiTimeFive,
  BiTrendingUp,
} from "react-icons/bi";

import { Experience } from "../types";
import { calculateExperienceStats, getRoleDuration } from "@/lib/experience";

interface ExperienceSectionProps {
  experiences: Experience[];
}

const ExperienceCard: React.FC<{
  experience: Experience;
  index: number;
  isLeft: boolean;
}> = ({ experience, index, isLeft }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  const duration = useMemo(() => getRoleDuration(experience), [experience]);

  const isIntern = Boolean(
    experience.isInternship ||
    experience.type?.toLowerCase() === "internship" ||
    experience.title.toLowerCase().includes("intern"),
  );

  const isCurrent = Boolean(
    experience.isCurrent || experience.dates.toLowerCase().includes("present"),
  );

  return (
    <motion.div
      ref={ref}
      className="experience-item"
      initial={{
        opacity: 0,
        x: isLeft ? -40 : 40,
      }}
      animate={{
        opacity: inView ? 1 : 0,
        x: inView ? 0 : isLeft ? -40 : 40,
      }}
      transition={{
        type: "spring",
        stiffness: 90,
        damping: 14,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
      layout
    >
      {/* Timeline dot */}
      <motion.div
        style={{
          position: "absolute",
          left: -36,
          top: 24,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: isCurrent ? "#22c55e" : "var(--color-experience)",
          boxShadow: isCurrent
            ? "0 0 16px #22c55e"
            : "0 0 14px var(--color-experience-dim)",
          display: "none", // Hidden on mobile
        }}
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.08 + 0.25, type: "spring" }}
      />

      {/* Header */}
      <div className="experience-header">
        <div className="experience-title-with-logo">
          {experience.logo && (
            <div className="experience-logo-box" title={experience.company}>
              <img
                src={
                  experience.logo.startsWith("/")
                    ? experience.logo
                    : `/logos/${experience.logo}`
                }
                alt={`${experience.company} logo`}
                className="experience-logo-img"
              />
            </div>
          )}
          <div>
            <motion.h3
              initial={{ y: 8 }}
              animate={{ y: inView ? 0 : 8 }}
              transition={{ delay: index * 0.08 + 0.1 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              <span>{experience.title}</span>
              {isCurrent && (
                <span
                  className="experience-live-indicator"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  <span className="experience-pulse-dot" />
                  Active
                </span>
              )}
            </motion.h3>
            <p className="experience-company" style={{ marginTop: "0.35rem" }}>
              {experience.company}
            </p>
          </div>
        </div>

        {/* Badges: Dates, Dynamic Duration & Type */}
        <div className="experience-meta-badges">
          <motion.div
            className="experience-dates"
            initial={{ scale: 0.95 }}
            animate={{ scale: inView ? 1 : 0.95 }}
            transition={{ delay: index * 0.08 + 0.15 }}
          >
            <BiCalendar size={13} />
            <span>{experience.dates}</span>
          </motion.div>

          <span
            className="experience-duration-badge"
            title="Dynamic calculated duration"
          >
            <BiTimeFive
              size={12}
              style={{ color: "var(--color-experience)" }}
            />
            <span>{duration.formatted}</span>
          </span>

          <span
            className={`experience-type-badge ${isIntern ? "internship" : "fulltime"}`}
          >
            {isIntern ? "Internship" : "Full-time"}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="experience-description">{experience.description}</p>

      {/* Work items */}
      <ul className="experience-works">
        {experience.works.map((work, workIndex) => (
          <motion.li
            key={workIndex}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: inView ? 1 : 0, x: inView ? 0 : -15 }}
            transition={{
              delay: index * 0.08 + 0.25 + workIndex * 0.05,
              type: "spring",
              stiffness: 100,
            }}
          >
            <BiCheck
              size={16}
              style={{
                position: "absolute",
                left: 0,
                top: "0.35em",
                color: "var(--color-experience)",
              }}
            />
            <span style={{ paddingLeft: "0.5rem" }}>{work}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  const [filter, setFilter] = useState<"all" | "fulltime">("all");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dynamically compute experience stats (safe for SSR + hydrated with exact date)
  const stats = useMemo(
    () => calculateExperienceStats(experiences),
    [experiences],
  );

  const filteredExperiences = useMemo(() => {
    if (filter === "fulltime") {
      return experiences.filter(
        (exp) =>
          !exp.isInternship &&
          exp.type?.toLowerCase() !== "internship" &&
          !exp.title.toLowerCase().includes("intern"),
      );
    }
    return experiences;
  }, [experiences, filter]);

  return (
    <section id="experiences" style={{ padding: "var(--section-padding) 0" }}>
      <motion.div
        ref={ref}
        className="experience-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: inView ? 0 : 20, opacity: inView ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          Work Experience
        </motion.h2>

        {/* Dynamic Experience Summary Bento Banner */}
        <div className="experience-overview-wrapper">
          <div className="experience-overview-grid">
            {/* Card 1: Full-Time Experience (Without Internship) */}
            <motion.div
              className="experience-stat-card fulltime"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div>
                <div className="experience-stat-header">
                  <div className="experience-stat-title-wrap">
                    <BiBriefcase size={18} style={{ color: "#86efac" }} />
                    <h3 className="experience-stat-title">
                      Full-Time Experience
                    </h3>
                  </div>
                  <span className="experience-stat-pill fulltime">
                    Without Internship
                  </span>
                </div>

                <div className="experience-counter-group">
                  <span className="experience-number">
                    {isMounted ? stats.fullTime.years : stats.fullTime.years}
                  </span>
                  <span className="experience-unit">YRS</span>
                  <span className="experience-number">
                    {isMounted ? stats.fullTime.months : stats.fullTime.months}
                  </span>
                  <span className="experience-unit">MOS</span>
                </div>

                <p className="experience-stat-desc">
                  Professional software engineering at Societe Generale &
                  ansrsource building enterprise-scale applications and
                  microservices.
                </p>
              </div>

              <div className="experience-stat-footer">
                <span className="experience-live-indicator">
                  <span className="experience-pulse-dot" />
                  Software Engineer @ Societe Generale
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  3 Full-Time Roles
                </span>
              </div>
            </motion.div>

            {/* Card 2: Total Career Experience (With Internship) */}
            <motion.div
              className="experience-stat-card total"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <div className="experience-stat-header">
                  <div className="experience-stat-title-wrap">
                    <BiTrendingUp size={19} style={{ color: "#93c5fd" }} />
                    <h3 className="experience-stat-title">
                      Total Career Experience
                    </h3>
                  </div>
                  <span className="experience-stat-pill total">
                    Including Internship
                  </span>
                </div>

                <div className="experience-counter-group">
                  <span className="experience-number">
                    {isMounted
                      ? stats.totalWithInternship.years
                      : stats.totalWithInternship.years}
                  </span>
                  <span className="experience-unit">YRS</span>
                  <span className="experience-number">
                    {isMounted
                      ? stats.totalWithInternship.months
                      : stats.totalWithInternship.months}
                  </span>
                  <span className="experience-unit">MOS</span>
                </div>

                <p className="experience-stat-desc">
                  Total hands-on industry journey including the 6-month
                  foundational full-stack developer internship at ansrsource
                  (Oct 2022 – Mar 2023).
                </p>
              </div>

              <div className="experience-stat-footer">
                <span>Oct 2022 – Present</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  All 4 Roles
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Timeline container */}
        <div
          style={{
            position: "relative",
            marginTop: "1rem",
          }}
        >
          {/* Vertical timeline line - visible on larger screens */}
          <motion.div
            style={{
              position: "absolute",
              left: -30,
              top: 0,
              bottom: 0,
              width: 2,
              background:
                "linear-gradient(to bottom, transparent, var(--color-experience), var(--color-experience), transparent)",
              display: "none",
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Experience cards with animation on filter change */}
          <AnimatePresence mode="popLayout">
            {filteredExperiences.map((experience, index) => (
              <ExperienceCard
                key={`${experience.title}-${experience.dates}`}
                experience={experience}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
