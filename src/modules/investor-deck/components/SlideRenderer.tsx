import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlideNavigation } from "./SlideNavigation";

interface SlideRendererProps {
  children: ReactNode[];
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -100 : 100, opacity: 0 }),
};

export function SlideRenderer({ children }: SlideRendererProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  const totalSlides = children.length;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide, totalSlides],
  );

  const next = useCallback(() => goTo(currentSlide + 1), [currentSlide, goTo]);
  const prev = useCallback(() => goTo(currentSlide - 1), [currentSlide, goTo]);

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
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, isFullscreen, toggleFullscreen]);

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

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    touchStartRef.current = e.clientX;
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (touchStartRef.current === null) return;
      const diff = e.clientX - touchStartRef.current;
      const threshold = 50;
      if (diff < -threshold) next();
      else if (diff > threshold) prev();
      touchStartRef.current = null;
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

      <div
        className={`absolute right-4 bottom-3 font-mono text-xs text-muted-foreground transition-opacity duration-300 ${showNav ? "opacity-100" : "opacity-0"}`}
      >
        {currentSlide + 1} / {totalSlides}
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: showNav ? 1 : 0, y: showNav ? 0 : 20 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <div className="pointer-events-auto">
          <SlideNavigation
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
