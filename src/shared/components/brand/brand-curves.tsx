import * as React from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Single source of truth for the Loopay brand curves composition.
 *
 * These curves originated inside the VirtualCard (hero asset, §6 brand
 * moment). They were extracted here so that the same composition can be
 * reused as an ambient wallpaper (BrandCurvesBackdrop) without forking
 * the constants — editing the composition in one place updates every
 * surface that renders it. Matches the REUSE, NEVER REINVENT rule in
 * CLAUDE.md §0.
 *
 * Each curve records:
 *  - `d`: SVG path data (authored against a 850×480 viewBox).
 *  - `w`: stroke width in viewBox units.
 *  - `o`: per-path opacity multiplier. Combines multiplicatively with
 *         the wrapper `opacity` passed to BrandCurvesSvg, so the
 *         wallpaper's low master opacity still respects the hero/
 *         medium/thin texture weighting inside the composition.
 *  - `g`: gradient key — references the three `<linearGradient>` defs
 *         rendered by BrandCurvesDefs. `a` is diagonal warm→cool,
 *         `b` is horizontal warm→cool, `c` is the reverse diagonal.
 */
export const BRAND_CURVES: ReadonlyArray<{
  d: string;
  w: number;
  o: number;
  g: 'a' | 'b' | 'c';
}> = [
  // Hero — dominant strokes that anchor the composition
  { d: 'M-50,120 Q200,60 450,160 T900,140', w: 1.8, o: 0.7, g: 'a' },
  { d: 'M-30,310 C200,280 450,360 720,300 S900,310 900,310', w: 1.6, o: 0.6, g: 'b' },
  { d: 'M-20,420 Q300,450 550,390 T900,405', w: 1.5, o: 0.55, g: 'a' },

  // Medium — chromatic support, fills mid-height bands
  { d: 'M-30,260 C180,220 400,320 680,270 S900,290 900,290', w: 1.2, o: 0.5, g: 'b' },
  { d: 'M-30,170 Q260,140 540,185 T900,170', w: 1.1, o: 0.45, g: 'a' },
  { d: 'M-30,380 Q300,420 580,350 T900,370', w: 1.0, o: 0.5, g: 'b' },
  { d: 'M-20,60 Q220,100 480,75 T900,90', w: 0.9, o: 0.4, g: 'a' },
  { d: 'M-30,450 Q240,480 490,450 T900,465', w: 1.0, o: 0.4, g: 'b' },

  // Thin texture — fine weave that turns "placed lines" into "card art"
  { d: 'M-30,40 Q200,80 430,55 T880,70', w: 0.5, o: 0.3, g: 'a' },
  { d: 'M-20,90 Q220,130 500,100 T900,115', w: 0.5, o: 0.3, g: 'b' },
  { d: 'M-40,150 C180,120 400,180 650,150 S900,160 900,160', w: 0.4, o: 0.25, g: 'a' },
  { d: 'M-30,210 Q250,180 520,220 T900,200', w: 0.5, o: 0.3, g: 'b' },
  { d: 'M-30,290 C150,270 380,315 620,285 S900,300 900,300', w: 0.4, o: 0.25, g: 'a' },
  { d: 'M-40,340 Q270,380 540,320 T900,335', w: 0.5, o: 0.3, g: 'b' },
  { d: 'M-30,400 Q220,430 480,400 T900,420', w: 0.4, o: 0.25, g: 'a' },

  // Diagonal accents — cut the horizontality, vary the rhythm
  { d: 'M500,-20 Q680,100 800,220 T880,380', w: 0.9, o: 0.4, g: 'c' },
  { d: 'M-30,100 Q100,250 250,350 T480,470', w: 0.9, o: 0.4, g: 'a' },
  { d: 'M700,-20 Q820,60 880,120', w: 0.7, o: 0.35, g: 'c' },
];

/** The viewBox the curves are authored against. Exposed so consumers
 *  (e.g. the wallpaper backdrop) can compose multiple SVGs that share
 *  the same coordinate system without magic numbers. */
export const BRAND_CURVES_VIEWBOX = { width: 850, height: 480 } as const;

export interface BrandCurvesDefsProps {
  /** Base id used for the three `<linearGradient>` elements. Consumers
   *  must pass a per-instance id (via `React.useId()`) so that multiple
   *  BrandCurvesSvg mounted on one page don't collide on `<linearGradient>`
   *  references. */
  idBase: string;
}

/**
 * Renders the three `<linearGradient>` defs used by every brand curve.
 *
 * Gradient stops reference CSS custom properties declared in
 * `src/styles/index.css` (`--brand-gradient-mid`, `--brand-gradient-accent`).
 * SVG `<stop>` has no Tailwind equivalent for stop-color, and `var(...)`
 * in `style.stopColor` is the documented pattern (see VirtualCard history).
 */
export const BrandCurvesDefs: React.FC<BrandCurvesDefsProps> = ({ idBase }) => {
  const gradA = `${idBase}-a`;
  const gradB = `${idBase}-b`;
  const gradC = `${idBase}-c`;

  return (
    <defs>
      {/* Diagonal gradient `a` (top-left → bottom-right): warm origin,
          cool terminus — the default chromatic sweep. */}
      <linearGradient id={gradA} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--brand-gradient-mid)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--brand-gradient-accent)' }} />
      </linearGradient>
      {/* Horizontal gradient `b` (left → right): same warm→cool chromatic
          sweep, but horizontal. Keeps sideways curves from sharing the
          exact direction as diagonal ones. */}
      <linearGradient id={gradB} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'var(--brand-gradient-mid)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--brand-gradient-accent)' }} />
      </linearGradient>
      {/* Reverse diagonal `c` (top-right → bottom-left): cool→warm.
          Balances the dominant warm→cool direction in `a` and `b` so
          accents don't all rake the same way. */}
      <linearGradient id={gradC} x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'var(--brand-gradient-accent)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--brand-gradient-mid)' }} />
      </linearGradient>
    </defs>
  );
};

export interface BrandCurvesSvgProps extends React.SVGProps<SVGSVGElement> {
  /** Master opacity for the whole composition. Per-path opacities are
   *  applied on top via the `opacity` attribute, so the effective alpha
   *  of any given stroke is `opacity * curve.o`. Default: 1. */
  opacity?: number;
  /** Multiplier applied to every curve's `w` (stroke width). Default 1
   *  preserves the canonical VirtualCard weighting pixel-identically.
   *  Backdrops pass a value < 1 (e.g. 0.45) to make the composition
   *  feel airier at full-viewport scale without changing the source
   *  composition — relative weighting between hero/medium/thin strokes
   *  is preserved, the whole texture just gets thinner. */
  strokeWidthScale?: number;
  /** How the SVG maps onto its container. Defaults to `'none'` to match
   *  the VirtualCard behaviour (stretches the composition). Use
   *  `'xMidYMid slice'` for full-bleed wallpaper scenarios. */
  preserveAspectRatio?: string;
  className?: string;
}

/**
 * Presentational full-composition SVG. Pure — no hooks, no side effects.
 *
 * The SVG is authored against a fixed viewBox of 850×480 so that any
 * container size (card, wallpaper panel, mobile viewport) scales the
 * composition uniformly. The `opacity` prop is applied to the `<g>`
 * wrapper, not to each `<path>`, so consumers can dial the whole thing
 * up/down without re-balancing the per-path weightings inside
 * BRAND_CURVES.
 */
export const BrandCurvesSvg = React.forwardRef<SVGSVGElement, BrandCurvesSvgProps>(
  (
    { opacity = 1, strokeWidthScale = 1, preserveAspectRatio = 'none', className, ...svgProps },
    ref,
  ) => {
    const idBase = React.useId();
    const gradientFor: Record<'a' | 'b' | 'c', string> = {
      a: `${idBase}-a`,
      b: `${idBase}-b`,
      c: `${idBase}-c`,
    };

    return (
      <svg
        ref={ref}
        aria-hidden
        className={cn('pointer-events-none', className)}
        viewBox={`0 0 ${BRAND_CURVES_VIEWBOX.width} ${BRAND_CURVES_VIEWBOX.height}`}
        preserveAspectRatio={preserveAspectRatio}
        shapeRendering="geometricPrecision"
        {...svgProps}
      >
        <BrandCurvesDefs idBase={idBase} />
        <g opacity={opacity}>
          {BRAND_CURVES.map((c, i) => (
            <path
              key={i}
              d={c.d}
              stroke={`url(#${gradientFor[c.g]})`}
              strokeWidth={c.w * strokeWidthScale}
              fill="none"
              opacity={c.o}
            />
          ))}
        </g>
      </svg>
    );
  },
);
BrandCurvesSvg.displayName = 'BrandCurvesSvg';
