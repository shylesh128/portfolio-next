import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  children: string;
  className?: string;
  glitchOnHover?: boolean;
  continuous?: boolean;
  speed?: number;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  children,
  className = '',
  glitchOnHover = true,
  continuous = false,
  speed = 100,
}) => {
  const [isGlitching, setIsGlitching] = useState(continuous);
  const [displayText, setDisplayText] = useState(children);
  
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  useEffect(() => {
    if (!isGlitching) {
      setDisplayText(children);
      return;
    }

    let iteration = 0;
    const originalText = children;
    
    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split('')
          .map((char, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            if (char === ' ') return ' ';
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join('')
      );

      if (iteration >= originalText.length) {
        if (!continuous) {
          clearInterval(interval);
          setDisplayText(originalText);
        } else {
          iteration = 0;
        }
      }

      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [isGlitching, children, continuous, speed]);

  return (
    <motion.span
      className={className}
      onMouseEnter={() => glitchOnHover && setIsGlitching(true)}
      onMouseLeave={() => glitchOnHover && !continuous && setIsGlitching(false)}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        position: 'relative',
      }}
    >
      {/* Main text */}
      <span style={{ position: 'relative', zIndex: 1 }}>
        {displayText}
      </span>
      
      {/* Glitch layers */}
      {isGlitching && (
        <>
          <motion.span
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: 'rgba(255, 255, 255, 0.8)',
              clipPath: 'inset(0 0 50% 0)',
              zIndex: 0,
            }}
            animate={{
              x: [0, -2, 2, 0],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {displayText}
          </motion.span>
          <motion.span
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              color: 'rgba(255, 255, 255, 0.5)',
              clipPath: 'inset(50% 0 0 0)',
              zIndex: 0,
            }}
            animate={{
              x: [0, 2, -2, 0],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {displayText}
          </motion.span>
        </>
      )}
    </motion.span>
  );
};

export default GlitchText;


