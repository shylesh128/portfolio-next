import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BiCalendar, BiCheck } from 'react-icons/bi';

import { Experience } from '../types';

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
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      className="experience-item"
      initial={{
        x: isLeft ? -50 : 50,
      }}
      animate={{
        x: inView ? 0 : (isLeft ? -50 : 50),
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      style={{
        visibility: inView ? 'visible' : 'hidden',
      }}
    >
      {/* Timeline dot */}
      <motion.div
        style={{
          position: 'absolute',
          left: -36,
          top: 24,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--color-experience)',
          boxShadow: '0 0 20px var(--color-experience-dim)',
          display: 'none', // Hidden on mobile
        }}
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
      />

      {/* Header */}
      <div className="experience-header">
        <motion.h3
          initial={{ y: 10 }}
          animate={{ y: inView ? 0 : 10 }}
          transition={{ delay: index * 0.1 + 0.1 }}
        >
          {experience.title}
        </motion.h3>
        <motion.div
          className="experience-dates"
          initial={{ scale: 0.9 }}
          animate={{ scale: inView ? 1 : 0.9 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <BiCalendar size={14} />
          <span>{experience.dates}</span>
        </motion.div>
      </div>

      {/* Company */}
      <p className="experience-company">
        {experience.company}
      </p>

      {/* Description */}
      <p className="experience-description">
        {experience.description}
      </p>

      {/* Work items */}
      <ul className="experience-works">
        {experience.works.map((work, workIndex) => (
          <motion.li
            key={workIndex}
            initial={{ x: -20 }}
            animate={{ x: inView ? 0 : -20 }}
            transition={{
              delay: index * 0.1 + 0.4 + workIndex * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
          >
            <BiCheck
              size={16}
              style={{
                position: 'absolute',
                left: 0,
                top: '0.35em',
                color: 'var(--color-experience)',
              }}
            />
            <span style={{ paddingLeft: '0.5rem' }}>{work}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section id="experiences" style={{ padding: 'var(--section-padding) 0' }}>
      <motion.div
        ref={ref}
        className="experience-content"
        initial={{}}
        animate={{}}
      >
        <motion.h2
          initial={{ y: 20 }}
          animate={{ y: inView ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          Work Experience
        </motion.h2>

        {/* Timeline container */}
        <div
          style={{
            position: 'relative',
            marginTop: '2rem',
          }}
        >
          {/* Vertical timeline line - visible on larger screens */}
          <motion.div
            style={{
              position: 'absolute',
              left: -30,
              top: 0,
              bottom: 0,
              width: 2,
              background:
                'linear-gradient(to bottom, transparent, var(--color-experience), var(--color-experience), transparent)',
              display: 'none', // Hidden by default
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Experience cards */}
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={index}
              experience={experience}
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ExperienceSection;
