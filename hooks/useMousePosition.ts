import { useState, useEffect, useCallback, useRef } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  velocityX: number;
  velocityY: number;
}

export function useMousePosition(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    velocityX: 0,
    velocityY: 0,
  });
  
  const previousPosition = useRef({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const velocityX = clientX - previousPosition.current.x;
      const velocityY = clientY - previousPosition.current.y;
      
      setPosition({
        x: clientX,
        y: clientY,
        normalizedX: (clientX / window.innerWidth) * 2 - 1,
        normalizedY: -(clientY / window.innerHeight) * 2 + 1,
        velocityX,
        velocityY,
      });
      
      previousPosition.current = { x: clientX, y: clientY };
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      updatePosition(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        updatePosition(event.touches[0].clientX, event.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [updatePosition]);

  return position;
}

export default useMousePosition;


