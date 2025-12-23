import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

const RippleEffect: React.FC<RippleEffectProps> = ({
  children,
  className = '',
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 0.6,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, duration * 1000);
  }, [duration]);

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{
              width: 0,
              height: 0,
              opacity: 0.5,
              x: ripple.x,
              y: ripple.y,
            }}
            animate={{
              width: 500,
              height: 500,
              opacity: 0,
              x: ripple.x - 250,
              y: ripple.y - 250,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: color,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RippleEffect;


