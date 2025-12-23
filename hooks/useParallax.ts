import { useRef, useEffect, useState, useCallback } from 'react';
import { useScrollProgress } from './useScrollProgress';

interface ParallaxOptions {
  speed?: number;
  direction?: 'vertical' | 'horizontal';
  easing?: 'linear' | 'easeOut' | 'easeInOut';
}

interface ParallaxReturn {
  ref: React.RefObject<HTMLElement>;
  style: React.CSSProperties;
  offset: number;
}

export function useParallax(options: ParallaxOptions = {}): ParallaxReturn {
  const { speed = 0.5, direction = 'vertical', easing = 'linear' } = options;
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);
  const { scrollY } = useScrollProgress();

  const applyEasing = useCallback((value: number): number => {
    switch (easing) {
      case 'easeOut':
        return 1 - Math.pow(1 - value, 3);
      case 'easeInOut':
        return value < 0.5
          ? 4 * Math.pow(value, 3)
          : 1 - Math.pow(-2 * value + 2, 3) / 2;
      default:
        return value;
    }
  }, [easing]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementCenter = elementTop + rect.height / 2;
    const viewportCenter = scrollY + window.innerHeight / 2;
    
    const distance = viewportCenter - elementCenter;
    const maxDistance = window.innerHeight;
    const normalizedDistance = Math.max(-1, Math.min(1, distance / maxDistance));
    
    const easedDistance = applyEasing(Math.abs(normalizedDistance)) * Math.sign(normalizedDistance);
    const parallaxOffset = easedDistance * speed * 100;
    
    setOffset(parallaxOffset);
  }, [scrollY, speed, applyEasing]);

  const style: React.CSSProperties = {
    transform: direction === 'vertical'
      ? `translateY(${offset}px)`
      : `translateX(${offset}px)`,
    willChange: 'transform',
  };

  return { ref, style, offset };
}

interface MouseParallaxOptions {
  strength?: number;
  inverted?: boolean;
}

export function useMouseParallax(options: MouseParallaxOptions = {}) {
  const { strength = 20, inverted = false } = options;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        let x = ((event.clientX - centerX) / centerX) * strength;
        let y = ((event.clientY - centerY) / centerY) * strength;
        
        if (inverted) {
          x = -x;
          y = -y;
        }
        
        setPosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [strength, inverted]);

  const style: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    willChange: 'transform',
  };

  return { position, style };
}

export function useTiltEffect(maxTilt: number = 15) {
  const ref = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = ((event.clientY - centerY) / (rect.height / 2)) * -maxTilt;
      const y = ((event.clientX - centerX) / (rect.width / 2)) * maxTilt;
      
      setTilt({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setTilt({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [maxTilt]);

  const style: React.CSSProperties = {
    transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
    willChange: 'transform',
  };

  return { ref, style, tilt, isHovering };
}

export default useParallax;


