import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useBuildStep } from "./slide-build-context";

/* ============================================================
   Diagram motion primitives.
   Spec: 300ms enter (cubic-bezier(.05,.7,.1,1)), 500ms path draw
   (ease-out), 20ms stagger, animate only opacity/transform/
   stroke-dashoffset. Reduced motion → static final state.
   ============================================================ */

const EASE_ENTER: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

interface BuildProps {
  /** Step from which this element is visible. */
  step: number;
  children: ReactNode;
  /** Stagger index within a group (0-based). */
  i?: number;
  className?: string;
}

/** Element entering at build step `step`. */
export function Build({ step, children, i = 0, className }: BuildProps) {
  const visible = useBuildStep(step);
  const reduced = useReducedMotion();
  if (reduced) return <g className={className}>{children}</g>;
  return (
    <motion.g
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: EASE_ENTER, delay: Math.min(i * 0.02, 0.5) }}
    >
      {children}
    </motion.g>
  );
}

interface DrawProps {
  /** Step from which this path draws. */
  step: number;
  d: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  /** Total length for dasharray (path length). */
  length: number;
  /** Stagger index within a group (0-based). */
  i?: number;
  className?: string;
  opacity?: number;
  markerEnd?: string;
}

/** Path that draws itself at build step `step`. */
export function DrawPath({
  step,
  d,
  stroke = "url(#loopay-gradient)",
  strokeWidth = 2,
  fill = "none",
  length,
  i: _i = 0,
  className,
  opacity = 1,
  markerEnd,
}: DrawProps) {
  void _i;
  const active = useBuildStep(step);
  const reduced = useReducedMotion();
  const dash = `${length} ${length}`;
  return (
    <motion.path
      className={className}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      opacity={opacity}
      markerEnd={markerEnd}
      strokeDasharray={dash}
      initial={reduced ? false : { strokeDashoffset: length }}
      animate={active ? { strokeDashoffset: 0 } : { strokeDashoffset: length }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  );
}

/** Text label styled for diagrams (≥22px at 1440 → ~22 units in a 1200 viewBox). */
export function DText({
  x,
  y,
  children,
  size = 22,
  anchor = "start",
  fill = "currentColor",
  weight = 400,
  mono = false,
  opacity = 1,
  className,
}: {
  x: number;
  y: number;
  children: string;
  size?: number;
  anchor?: "start" | "middle" | "end";
  fill?: string;
  weight?: number;
  mono?: boolean;
  opacity?: number;
  className?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor={anchor}
      fill={fill}
      fontWeight={weight}
      opacity={opacity}
      className={className}
      fontFamily={mono ? "var(--font-mono, ui-monospace, monospace)" : undefined}
    >
      {children}
    </text>
  );
}
