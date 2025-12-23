import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { BiPalette, BiPencil, BiImage } from 'react-icons/bi';

interface InterestsSectionProps {
  interests: string[];
}

const interestIcons: { [key: string]: React.ReactNode } = {
  'Graphic Designing': <BiPalette size={20} />,
  'Charcoal Sketching': <BiPencil size={20} />,
  'Glass Painting': <BiImage size={20} />,
};

const InterestsSection = ({ interests }: InterestsSectionProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section id="interests" style={{ padding: 'var(--section-padding) 0' }}>
      <motion.div
        ref={ref}
        className="interests-content"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={containerVariants}
      >
        <motion.h2 variants={itemVariants}>Interests & Hobbies</motion.h2>

        <motion.ul
          variants={containerVariants}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            listStyle: 'none',
            padding: 0,
            marginTop: '1.5rem',
          }}
        >
          {interests.map((interest, index) => (
            <motion.li
              key={index}
              variants={itemVariants}
              className="interest-item"
              whileHover={{
                y: -5,
                scale: 1.05,
                transition: { type: 'spring', stiffness: 300 },
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 50,
                cursor: 'default',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ color: 'var(--color-interests)' }}>
                {interestIcons[interest] || <BiPalette size={20} />}
              </span>
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {interest}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
};

export default InterestsSection;
