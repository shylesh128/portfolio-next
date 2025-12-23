import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface RevealTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

const RevealText: React.FC<RevealTextProps> = ({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.03,
  once = true,
  as: Component = 'span',
}) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
  });

  const words = children.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: {
      y: 50,
    },
    visible: {
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <Component className={className} style={{ display: 'block' }}>
      <motion.span
        ref={ref}
        style={{ 
          display: 'inline-flex', 
          flexWrap: 'wrap',
          overflow: 'hidden',
        }}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            style={{ 
              display: 'inline-block',
              marginRight: '0.25em',
              overflow: 'hidden',
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

// Character-by-character reveal variant
export const RevealTextChar: React.FC<RevealTextProps> = ({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.02,
  once = true,
  as: Component = 'span',
}) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.1,
  });

  const characters = children.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: {
      y: 20,
    },
    visible: {
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 150,
        damping: 15,
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        ref={ref}
        style={{ display: 'inline-block' }}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            variants={charVariants}
            style={{ 
              display: 'inline-block',
              whiteSpace: char === ' ' ? 'pre' : 'normal',
            }}
          >
            {char}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};

export default RevealText;
