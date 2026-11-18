import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { NetworkSlideNavigation } from "./network-slide-navigation";

interface NetworkSlideRendererProps {
  children: ReactNode[];
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
};

/**
 * Slide renderer with optional per-slide builds.
 * A slide declares its step count via `data-steps` on its root element.
 * ArrowRight/Space advances one build step, then the next slide. Shift+Right
 * or End jumps to the slide's final state. Tap on the right half advances.
 * On first entry a build auto-plays once (400ms per step); a second visit
 * shows the final state immediately. `prefers-reduced-motion` shows the final
 * state on entry and disables autoplay.
 */
export function NetworkSlideRenderer({ children }: NetworkSlideRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [step, setStep] = useState(1);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);
  const stepsRef = useRef<number>(0);
  const autoplayedRef = useRef<Set<number>>(new Set());
  const visitedRef = useRef<Set<number>>(new Set());
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useReducedMotion();

  const totalSlides = children.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      setStep(1);
    },
    [currentSlide, totalSlides],
  );

  const next = useCallback(() => {
    if (step < stepsRef.current && !reduced && !autoplayedRef.current.has(currentSlide)) {
      setStep((s) => Math.min(s + 1, stepsRef.current));
      return;
    }
    goTo(currentSlide + 1);
  }, [currentSlide, goTo, step, reduced]);

  const prev = useCallback(() => {
    if (step > 1 && !reduced && !autoplayedRef.current.has(currentSlide)) {
      setStep((s) => Math.max(s - 1, 1));
      return;
    }
    goTo(currentSlide - 1);
  }, [currentSlide, goTo, step, reduced]);

  const finalState = useCallback(() => {
    if (stepsRef.current > 0) setStep(stepsRef.current);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (e.shiftKey) finalState();
        else next();
      } else if (e.key === "End") {
        e.preventDefault();
        finalState();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else keyF(e);
    };
    const keyF = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, finalState, isFullscreen, toggleFullscreen]);

  const resetHideTimer = useCallback(() => {
    setShowNav(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isFullscreen) {
      hideTimerRef.current = setTimeout(() => setShowNav(false), 3000);
    }
  }, [isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      resetHideTimer();
    } else {
      setShowNav(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }
  }, [isFullscreen, resetHideTimer]);

  useEffect(() => {
    const handler = () => resetHideTimer();
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [resetHideTimer]);

  // Read the declared step count from the active slide, then autoplay once.
  useEffect(() => {
    if (autoplayRef.current) clearTimeout(autoplayRef.current);
    const el = containerRef.current?.querySelector<HTMLElement>("[data-steps]");
    stepsRef.current = el ? Number(el.dataset.steps || 0) : 0;
    const revisit = visitedRef.current.has(currentSlide);
    // Second visit or reduced motion → final state on entry.
    if (revisit || reduced) {
      if (stepsRef.current > 0) setStep(stepsRef.current);
      autoplayedRef.current.add(currentSlide);
      return;
    }
    visitedRef.current.add(currentSlide);
    // First visit with motion → autoplay the build, 400ms per step.
    if (!reduced && stepsRef.current > 0) {
      let s = 1;
      setStep(1);
      const tick = () => {
        s += 1;
        if (s > stepsRef.current) {
          autoplayedRef.current.add(currentSlide);
          return;
        }
        setStep(s);
        autoplayRef.current = setTimeout(tick, 400);
      };
      autoplayRef.current = setTimeout(tick, 400);
    } else {
      autoplayedRef.current.add(currentSlide);
    }
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [currentSlide, reduced]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    touchStartRef.current = e.clientX;
    touchYRef.current = e.clientY;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (touchStartRef.current === null || touchYRef.current === null) return;
      const diff = e.clientX - touchStartRef.current;
      const diffY = e.clientY - touchYRef.current;
      const threshold = 50;
      // Horizontal swipe → slide; tap on the right half → advance.
      if (Math.abs(diff) < threshold && Math.abs(diffY) < 20) {
        const half = window.innerWidth / 2;
        if (touchStartRef.current > half) next();
        else prev();
      } else if (diff < -threshold) {
        next();
      } else if (diff > threshold) {
        prev();
      }
      touchStartRef.current = null;
      touchYRef.current = null;
    },
    [next, prev],
  );

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden bg-background"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 overflow-y-auto"
        >
          {children[currentSlide]}
        </motion.div>
      </AnimatePresence>

      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-muted"
        aria-hidden
      >
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute right-4 bottom-3 font-mono text-xs text-muted-foreground transition-opacity duration-300">
        {currentSlide + 1} / {totalSlides}
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: showNav ? 1 : 0, y: showNav ? 0 : 20 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 print:hidden"
      >
        {/* This wrapper is the measured bottom chrome (data-deck-chrome-bottom
            lives in the layout as an anchor; the nav renders inside it via
            absolute positioning to the bottom of the viewport). */}
        <div className="pointer-events-auto bg-background/80 backdrop-blur print:hidden">
          <NetworkSlideNavigation
            currentSlide={currentSlide}
            totalSlides={totalSlides}
            onPrev={prev}
            onNext={next}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
          />
        </div>
      </motion.div>
    </div>
  );
}
