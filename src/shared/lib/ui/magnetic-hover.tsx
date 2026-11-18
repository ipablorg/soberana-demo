import React, { useRef, useState, useEffect, forwardRef, useCallback } from 'react';

interface MagneticHoverProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticHover = forwardRef<HTMLDivElement, MagneticHoverProps>(
  ({ children, strength = 0.3, className = '' }, forwardedRef) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Check for reduced motion preference
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Combine refs
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [forwardedRef]
    );

    useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !internalRef.current) return;

      const rect = internalRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    return (
      <div
        ref={setRefs}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        style={{
          transform: prefersReducedMotion ? 'none' : `translate(${position.x}px, ${position.y}px)`,
          transition: prefersReducedMotion ? 'none' : isHovered ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    );
  }
);

MagneticHover.displayName = 'MagneticHover';
