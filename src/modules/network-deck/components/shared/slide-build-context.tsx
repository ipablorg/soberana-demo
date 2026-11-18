import { createContext, useContext, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/* ============================================================
   Slide build engine context.
   Each slide declares its step count via NetworkSlideShell.
   - step: current build step (1..steps); steps = 0 → no build.
   - final: reduced motion, second visit, or print → all visible.
   ============================================================ */

export interface SlideBuildContextValue {
  step: number;
  steps: number;
  final: boolean;
}

const SlideBuildContext = createContext<SlideBuildContextValue | null>(null);

interface SlideBuildProviderProps {
  children: ReactNode;
  step: number;
  steps: number;
}

export function SlideBuildProvider({ children, step, steps }: SlideBuildProviderProps) {
  const reduced = useReducedMotion();
  // Second visit (step > steps can never happen; visited handled by renderer
  // which passes steps=0 and step=0 on revisit) and reduced motion → final.
  const final = reduced || step >= steps;
  return (
    <SlideBuildContext.Provider value={{ step, steps, final }}>
      {children}
    </SlideBuildContext.Provider>
  );
}

/** Step gating for diagram elements. Visible when step >= n or final. */
export function useBuildStep(n: number): boolean {
  const ctx = useContext(SlideBuildContext);
  if (!ctx) return true;
  return ctx.final || ctx.step >= n;
}

/** Draw gating for paths: true when the path should animate drawing. */
export function useBuildDraw(): { active: boolean; final: boolean } {
  const ctx = useContext(SlideBuildContext);
  if (!ctx) return { active: true, final: true };
  return { active: ctx.step >= 1, final: ctx.final };
}

export function useSlideBuild(): SlideBuildContextValue {
  const ctx = useContext(SlideBuildContext);
  if (!ctx) throw new Error("useSlideBuild must be used within SlideBuildProvider");
  return ctx;
}
