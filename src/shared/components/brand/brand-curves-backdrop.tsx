import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { BrandCurvesSvg } from './brand-curves';

/**
 * Ambient dashboard wallpaper — the Loopay brand curves, pinned to the
 * viewport and drifting sub-perceptibly across two independent layers.
 * The goal is a "luxury banking lobby" feel: you register it
 * peripherally, but it never pulls focus from the hero surfaces
 * (VirtualCard, Dynamic Island, action row).
 *
 * Design constraints honored:
 *  - §6 brand gradients are a "brand moment" here — the dashboard is
 *    where the user meets their identity card, so quietly echoing the
 *    same brand curves behind it reinforces the composition without
 *    turning daily operational UI into marketing.
 *  - §3.5 bans interactive transitions outside 150-200ms. This is
 *    **ambient motion**, not an interactive transition: the 40s/55s
 *    eased cycles are intentional and documented as an exception
 *    (same category as the VirtualCard amount breathing).
 *  - Seam-free loop by construction. We don't pan a tiled strip
 *    back to origin (which requires the tile to equal the pan amount
 *    to hide the seam — fragile). Instead each layer drifts by
 *    ±1.5%/±0.5% and mirrors back (`repeatType: 'mirror'`), so the
 *    end state of every cycle IS the start state of the next.
 *  - Curves are rendered hairline-thin — the card is a hero surface
 *    at ~400px, the wallpaper is the full viewport, so canonical
 *    stroke widths feel heavy at that scale. The source composition
 *    is NOT changed: we pass `strokeWidthScale={0.15}` to the
 *    backdrop only, leaving VirtualCard's render untouched.
 *  - Only GPU-friendly transforms are animated (`x`/`y` via Framer).
 *    No `width`/`height`/`left`/`top` loops. No `filter`/`box-shadow`
 *    animation. Whole thing lives on the compositor — no paint, no
 *    layout.
 *  - Respects `prefers-reduced-motion`. When the user opts out of
 *    motion, both layers render in their initial frame with no
 *    animation at all (Framer `useReducedMotion()` flips the
 *    `animate` prop to `undefined`).
 *
 * Theme gating:
 *  - Shared-layer components must not import from `src/app/*` (ESLint
 *    `import/no-restricted-paths`). So instead of a `useTheme()` gate,
 *    we gate with `hidden dark:block` on the wrapper. The SVG body is
 *    mounted in both themes but painted only in dark mode — the DOM
 *    cost is ~30 paths, effectively free.
 *
 * Stacking:
 *  - `fixed inset-0 -z-10 overflow-hidden pointer-events-none`, and —
 *    critically — **portaled into `document.body`**. Rendering inline
 *    inside a page puts the backdrop in the page's subtree, where a
 *    negative-z-index fixed element paints *below* any in-flow,
 *    non-positioned ancestor with an opaque background (per the CSS
 *    stacking-order spec: layer 2 < layer 3). Several layouts in the
 *    app have a `bg-background` wrapper around `<Outlet />`; without
 *    the portal, those wrappers silently occlude the wallpaper. As a
 *    direct child of `<body>`, the backdrop only has `<body>` itself
 *    above it, and `<body>`'s background is the same token — so the
 *    curves are free to paint.
 *  - The VirtualCard's local halo uses `-z-10` **inside** its own
 *    `relative` wrapper (a fresh stacking context), so it stays
 *    visually on top of this backdrop.
 */
export interface BrandCurvesBackdropProps {
  /** Extra classes for the fixed wrapper. Rarely needed — defaults
   *  already pin it to the viewport and gate it on dark mode. */
  className?: string;
}

/** Tunable motion parameters.
 *
 *  Two layers drift independently along X/Y in very small amplitudes
 *  (±1.5% / ±0.5%). The animation is a closed loop via
 *  `repeatType: 'mirror'` — the layer eases from `from` to `to` and
 *  then eases back, guaranteeing the end state of every cycle equals
 *  the start state. No tiling, no wrap-around → zero visible seam by
 *  construction.
 *
 *  The two layers use different durations (40s vs 55s) and opposing
 *  directions so they never re-sync, producing continuously evolving
 *  overlaps without ever exposing a boundary. */
const LAYERS = {
  back: {
    /* Keep the quiet back layer quiet — it's the support track, the
       front layer carries the read. */
    opacity: 0.28,
    /* Previous `0.15` was too aggressive: source `BRAND_CURVES` strokes
       range 0.4..1.8 viewBox units; at 0.15 scale the thinnest path
       resolved to ~0.07px at viewport scale, deep inside sub-pixel
       territory where the rasterizer drops most of the trace. At 0.35
       the hero strokes render around ~0.8px and the thin texture
       around ~0.17px — still a hairline silhouette, but this time
       actually legible against the near-black body.
       VirtualCard keeps the canonical 1.0 scale (default) so its
       strokes are untouched. */
    strokeWidthScale: 0.35,
    /* Opposing Y direction from `front` + longer cycle keeps the two
       tracks de-synced. Ambient duration > 20s per CLAUDE.md §3.5
       exception for non-interactive decorative loops. */
    duration: 55,
    xFrom: '1%',
    xTo: '-1%',
    yFrom: '-0.5%',
    yTo: '0.5%',
  },
  front: {
    /* Front layer carries the visible silhouette. Slight alpha bump
       over back so the two-layer interplay still reads as depth. */
    opacity: 0.42,
    strokeWidthScale: 0.35,
    duration: 40,
    xFrom: '-1.5%',
    xTo: '1.5%',
    yFrom: '0.3%',
    yTo: '-0.3%',
  },
} as const;

/** Layer container sized slightly larger than the viewport and offset
 *  inward, so the ±1.5% drift never reveals the SVG edge at any phase
 *  of the mirrored cycle. 10% over-bleed is plenty for ±1.5% motion. */
const LAYER_BOX = {
  width: '110vw',
  height: '110vh',
  left: '-5vw',
  top: '-5vh',
} as const;

export const BrandCurvesBackdrop: React.FC<BrandCurvesBackdropProps> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();
  /* We portal the backdrop into `document.body` (see Stacking note in
     the file docstring). `document` is undefined in non-browser
     contexts — guard so the component is safe to import anywhere. */
  const portalTarget = typeof document === 'undefined' ? null : document.body;

  /* Each layer is a single full-viewport (+10% bleed) SVG that drifts
     in place. Because the drift is sub-2% and mirrors back to origin,
     a single copy of the composition is enough — the old 200vw tiled
     strip is gone along with its seam. */
  const renderLayer = (
    layer: typeof LAYERS.back | typeof LAYERS.front,
    key: string,
  ) => {
    const animateProp = prefersReducedMotion
      ? undefined
      : { x: [layer.xFrom, layer.xTo], y: [layer.yFrom, layer.yTo] };

    return (
      <motion.div
        key={key}
        aria-hidden
        className="absolute"
        style={{
          ...LAYER_BOX,
          opacity: layer.opacity,
          willChange: prefersReducedMotion ? undefined : 'transform',
        }}
        initial={{ x: layer.xFrom, y: layer.yFrom }}
        animate={animateProp}
        transition={{
          duration: layer.duration,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'mirror',
        }}
      >
        <BrandCurvesSvg
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          strokeWidthScale={layer.strokeWidthScale}
        />
      </motion.div>
    );
  };

  if (!portalTarget) return null;

  return createPortal(
    <div
      aria-hidden
      className={cn(
        'fixed inset-0 -z-10 overflow-hidden pointer-events-none',
        'hidden dark:block',
        className,
      )}
    >
      {renderLayer(LAYERS.back, 'back')}
      {renderLayer(LAYERS.front, 'front')}
    </div>,
    portalTarget,
  );
};
BrandCurvesBackdrop.displayName = 'BrandCurvesBackdrop';
