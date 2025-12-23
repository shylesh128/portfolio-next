import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import useMousePosition from '@/hooks/useMousePosition';

const CustomCursor: React.FC = () => {
  const { x, y } = useMousePosition();
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Spring physics for smooth cursor movement
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Outer ring with more lag
  const ringConfig = { damping: 20, stiffness: 150 };
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  const ringXSpring = useSpring(ringX, ringConfig);
  const ringYSpring = useSpring(ringY, ringConfig);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || 
                   navigator.maxTouchPoints > 0);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    cursorX.set(x);
    cursorY.set(y);
    ringX.set(x);
    ringY.set(y);
  }, [x, y, cursorX, cursorY, ringX, ringY]);

  useEffect(() => {
    const handleMouseEnter = () => setIsHidden(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.matches(
        'a, button, [role="button"], input, textarea, select, [data-cursor="pointer"]'
      );
      setIsHovering(isInteractive);
    };

    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleElementHover);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleElementHover);
    };
  }, []);

  // Don't render on mobile devices
  if (isMobile) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringXSpring,
          top: ringYSpring,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
        }}
        animate={{
          width: isHovering ? 60 : 40,
          height: isHovering ? 60 : 40,
          x: isHovering ? -30 : -20,
          y: isHovering ? -30 : -20,
          opacity: isHidden ? 0 : 1,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          width: { duration: 0.2 },
          height: { duration: 0.2 },
          scale: { duration: 0.1 },
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            transition: 'background-color 0.2s ease',
          }}
        />
      </motion.div>

      {/* Inner dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: cursorXSpring,
          top: cursorYSpring,
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
        }}
        animate={{
          width: isClicking ? 12 : 8,
          height: isClicking ? 12 : 8,
          x: isClicking ? -6 : -4,
          y: isClicking ? -6 : -4,
          opacity: isHidden ? 0 : 1,
        }}
        transition={{
          duration: 0.1,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          }}
        />
      </motion.div>

      {/* Glow trail effect */}
      <motion.div
        style={{
          position: 'fixed',
          left: ringXSpring,
          top: ringYSpring,
          pointerEvents: 'none',
          zIndex: 9998,
        }}
        animate={{
          width: 80,
          height: 80,
          x: -40,
          y: -40,
          opacity: isHidden ? 0 : 0.3,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            filter: 'blur(10px)',
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;


