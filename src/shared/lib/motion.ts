/**
 * Motion configuration and constants
 * Following Halo Lab patterns: 200-260ms springs, ease-out, respects reduced-motion
 */

export const MOTION_DURATION = {
  fast: 0.18,
  base: 0.22,
  slow: 0.3,
  drawer: 0.26,
} as const;

export const MOTION_EASE = {
  out: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  spring: { duration: 0.2, ease: "easeOut" as const },
} as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.inOut },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: MOTION_DURATION.base },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: MOTION_DURATION.base, ease: MOTION_EASE.inOut },
};

export const slideInRight = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
  transition: { duration: MOTION_DURATION.drawer, ease: MOTION_EASE.inOut },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: MOTION_DURATION.fast },
};
