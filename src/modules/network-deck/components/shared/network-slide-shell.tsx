import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SlideBuildProvider } from "./slide-build-context";
import { FitBox } from "./fit-box";

interface NetworkSlideShellProps {
  children: ReactNode;
  /** Declared build steps for this slide (0 or 1 = no build). */
  steps?: number;
  dark?: boolean;
  className?: string;
}

/**
 * Root wrapper for every network-deck slide. Declares `data-steps` (read by
 * the renderer's build engine) and provides the build context to diagram
 * components. Reduced motion and second visits resolve to the final state
 * (handled by the renderer + context).
 *
 * Fix 1/1b: content is padded by the measured chrome bars
 * (--deck-chrome-top/bottom, set by the layout) and vertically centered in
 * the usable area. No per-slide offsets — removed margin/top hacks.
 */
export function NetworkSlideShell({
  children,
  steps = 0,
  dark,
  className,
}: NetworkSlideShellProps) {
  return (
    <SlideBuildProvider step={0} steps={0}>
      <div
        data-steps={steps}
        data-slide-root
        data-slide-dark={dark ? "true" : undefined}
        className={`relative flex h-full w-full justify-center overflow-y-auto bg-background text-foreground ${className ?? ""}`}
      >
        <div
          className="mx-auto flex w-full max-w-6xl flex-col justify-center px-8 md:px-16 lg:px-24"
          style={{
            paddingTop: "calc(var(--deck-chrome-top, 64px) + 32px)",
            paddingBottom: "calc(var(--deck-chrome-bottom, 56px) + 24px)",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </div>
      </div>
    </SlideBuildProvider>
  );
}

/** Section heading: label (≤4 words) + full-sentence headline (≤10 words). */
export function SlideHeading({
  label,
  headline,
  subtitle,
}: {
  label: string;
  headline: string;
  subtitle?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="mb-5 shrink-0">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="font-mono text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
      >
        {label}
      </motion.div>
      <motion.h2
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
        className="mt-2 max-w-4xl text-3xl leading-tight font-semibold tracking-tight text-balance md:text-4xl"
      >
        {headline}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
          className="mt-3 max-w-4xl text-sm leading-relaxed text-muted-foreground md:text-base"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/** Diagram frame: the diagram lives inside ONE inline SVG that FitBox sizes
 *  to the remaining space (Fix 1b). Single viewBox — no second coordinate
 *  system, no HTML positioned over the SVG. Natural height (no flex-1) so
 *  the shell's justify-center centres heading+diagram together. */
export function DiagramFrame({
  children,
  ratio = 1200 / 640,
  className,
}: {
  children: ReactNode;
  ratio?: number;
  className?: string;
}) {
  return (
    <div className={`relative mt-2 w-full ${className ?? ""}`} style={{ minHeight: 0 }}>
      <FitBox ratio={ratio} maxWidth={1024}>
        <svg
          viewBox={`0 0 ${Math.round(1200)} ${Math.round(1200 / ratio)}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
        >
          {children}
        </svg>
      </FitBox>
    </div>
  );
}
