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
        opacity: 0,
        x: isLeft ? -50 : 50,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              x: 0,
            }
          : {}
      }
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
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: index * 0.1 + 0.1 }}
        >
          {experience.title}
        </motion.h3>
        <motion.div
          className="experience-dates"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          <BiCalendar size={14} />
          <span>{experience.dates}</span>
        </motion.div>
      </div>

      {/* Company */}
      <motion.p
        className="experience-company"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.2 }}
      >
        {experience.company}
      </motion.p>

      {/* Description */}
      <motion.p
        className="experience-description"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.1 + 0.3 }}
      >
        {experience.description}
      </motion.p>

      {/* Work items */}
      <ul className="experience-works">
        {experience.works.map((work, workIndex) => (
          <motion.li
            key={workIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
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
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
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
