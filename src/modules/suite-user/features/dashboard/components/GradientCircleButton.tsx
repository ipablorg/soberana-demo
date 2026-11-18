/**
 * GradientCircleButton
 *
 * Circular CTA used on the Soberana conversational home for the
 * Receive / Send / Zentinel actions.
 *
 * Visual system (CLAUDE.md §3, §6) — matches the Dynamic Island container:
 * - Outer rim: `rounded-full p-0.5 bg-brand-gradient` — 2px gradient border,
 *   same technique as the Dynamic Island.
 * - Inner circle: `rounded-full bg-muted` — secondary surface, reads as
 *   a single family with the rest of the home.
 * - Icon: solid `text-foreground` with `strokeWidth={2.25}`. We intentionally
 *   do NOT use `stroke-gradient-loopay` here: lucide icons with diagonal
 *   paths (ArrowUpRight) have collapsed bounding boxes that can't interpolate
 *   a linearGradient stroke, leaving parts of the stroke invisible. Solid
 *   `text-foreground` keeps the icon legible, and the brand gradient stays
 *   on the rim as the button's brand moment.
 *
 * Ambient motion (opt-in, per-consumer — Zentinel only for now):
 * - `wiggle`: the icon periodically swings left/right/center every ~5s.
 *   Intermittent micro-motion draws attention more effectively than a
 *   constant loop, which the eye tunes out.
 * - `glow`: a soft brand-gradient halo breathes under the rim, gated on
 *   dark mode only (matches the VirtualCard halo language so the hero
 *   stack reads as one family). Reuses `bg-brand-gradient + blur` rather
 *   than a forbidden `shadow-glow*` class.
 *
 * Feature-specific; kept out of shared/ui because it's only consumed by the
 * dashboard home.
 */

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';
import type { IconComponent } from '@/shared/components/animated-icons';

const SIZES = {
  sm: { rim: 'h-14 w-14', icon: 'h-5 w-5' },
  default: { rim: 'h-20 w-20', icon: 'h-6 w-6' },
  lg: { rim: 'h-24 w-24', icon: 'h-7 w-7' },
} as const;

type Size = keyof typeof SIZES;

const buttonVariants = cva(
  [
    'group relative inline-flex flex-col items-center gap-2',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
);

const rimVariants = cva(
  [
    'rounded-full p-0.5 bg-brand-gradient',
    'transition-opacity duration-150',
    'group-hover:opacity-90',
    'group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background',
  ].join(' '),
  {
    variants: {
      active: {
        true: 'opacity-100',
        false: 'opacity-90',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export interface GradientCircleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof rimVariants> {
  icon: IconComponent;
  label: string;
  size?: Size;
  /**
   * When true, the icon periodically swings left → right → center
   * every ~5s (0.7s animation + 4.5s pause). Honors `prefers-reduced-motion`
   * (stays static). Default `false` so non-opt-in buttons keep the
   * original behavior untouched.
   */
  wiggle?: boolean;
  /**
   * When true, a soft brand-gradient halo breathes under the rim.
   * Dark-mode only (uses `hidden dark:block` — light mode stays
   * minimalist). Honors `prefers-reduced-motion` (holds at a
   * mid-opacity, no pulse). Default `false`.
   */
  glow?: boolean;
}

/**
 * Twinkling brand-gradient halo — same visual language as the VirtualCard
 * halo (blur + `bg-brand-gradient`) so the hero surfaces read as one
 * family, but with an irregular pulse instead of a uniform breath. The
 * asymmetric `opacity` + micro `scale` keyframes, paired with
 * non-evenly-spaced `times`, produce a "light catching" effect —
 * closer to a flame catching air than a breathing chest. Intentional:
 * Zentinel is the novel action of the trio, and an irregular rhythm
 * keeps the eye returning (uniform breathing gets tuned out fast).
 *
 * Positioning: `absolute inset-0 -z-10` places it behind the rim within
 * the rim-group's local stacking context. Framer Motion owns the
 * `transform: scale(...)` via the `scale` keyframes below — no
 * `scale-*` Tailwind class, which would compete with the animated
 * value and create a first-frame layout jump.
 *
 * Gated on dark mode via `hidden dark:block`: in light mode the halo
 * would fight the confident-minimalism palette; in dark mode the page
 * background gives the gradient room to breathe.
 */
const GlowLayer = ({ reducedMotion }: { reducedMotion: boolean }) => (
  <motion.span
    aria-hidden
    className={cn(
      'pointer-events-none absolute inset-0 -z-10 rounded-full',
      'bg-brand-gradient blur-xl',
      'hidden dark:block',
    )}
    /* ambient motion — CLAUDE.md §3.5 exception.
       Seven keyframes (6 intervals) over `times` that are deliberately
       NOT evenly spaced: peaks cluster at 0.15 and 0.5, troughs at
       0.35 and 0.65, with softer undulations on either side. Reads as
       "organic flicker" rather than a metronome. Scale micro-varies
       1.22-1.32 to reinforce the luminance change with a subtle size
       pulse — both transforms land on the same element so there's
       only one compositor pass per frame. */
    animate={
      reducedMotion
        ? { opacity: 0.4, scale: 1.25 }
        : {
            opacity: [0.25, 0.7, 0.35, 0.65, 0.3, 0.55, 0.25],
            scale: [1.25, 1.32, 1.22, 1.3, 1.25, 1.3, 1.25],
          }
    }
    transition={
      reducedMotion
        ? { duration: 0 }
        : {
            duration: 2.8,
            ease: 'easeInOut',
            times: [0, 0.15, 0.35, 0.5, 0.65, 0.8, 1],
            repeat: Infinity,
          }
    }
  />
);

export const GradientCircleButton = React.forwardRef<HTMLButtonElement, GradientCircleButtonProps>(
  (
    {
      icon: Icon,
      label,
      size = 'default',
      active = false,
      className,
      disabled,
      wiggle = false,
      glow = false,
      ...props
    },
    ref,
  ) => {
    const s = SIZES[size];
    const reducedMotion = useReducedMotion() ?? false;
    return (
      <button
        ref={ref}
        type="button"
        className={cn(buttonVariants(), className)}
        aria-pressed={active ?? undefined}
        aria-label={label}
        disabled={disabled}
        {...props}
      >
        {/* Rim group: owns the local stacking context for the halo so
            it sits behind the rim but in front of the page. The label
            below is intentionally outside this span so the halo never
            bleeds into the text region. */}
        <span className="relative inline-flex">
          {glow && <GlowLayer reducedMotion={reducedMotion} />}
          <span className={cn(rimVariants({ active }))}>
            <span
              className={cn(
                'flex items-center justify-center rounded-full bg-muted',
                // Override the hardcoded stroke-width="2" baked into the
                // animated-icons SVGs (they don't forward the strokeWidth prop).
                // Arbitrary child selector: every `<svg>` inside this span gets
                // a 2.25px stroke, matching the design spec.
                '[&_svg]:stroke-[2.25]',
                // Subtle icon nudge on hover — all 3 CTAs get the same treatment.
                '[&_svg]:transition-transform [&_svg]:duration-150 group-hover:[&_svg]:scale-110',
                s.rim,
              )}
            >
              {wiggle ? (
                <motion.span
                  /* ambient motion — CLAUDE.md §3.5 exception.
                     `rotate` keyframes (−14°, 12°, −8°, 6°, 0°) produce
                     a dampened swing without a spring; `scale`
                     (1 → 1.2 → 1) rides the same timeline so the
                     icon appears to breathe in as it swings and settle
                     back as it returns to center. Scale peak (1.2) is
                     close to the rotational apex for emphasis, then
                     undershoots past 1.08 on the way back for a
                     natural "recoil" without needing a spring. `times`
                     pins the sharper angular apex near the start and
                     eases into stillness by 1. `repeatDelay` sets the
                     quiet interval between wiggles — intermittence is
                     what keeps the eye returning to this button. */
                  animate={
                    reducedMotion
                      ? undefined
                      : {
                          rotate: [0, -14, 12, -8, 6, 0],
                          scale: [1, 1.15, 1.2, 1.1, 1.08, 1],
                        }
                  }
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          duration: 0.9,
                          ease: 'easeInOut',
                          times: [0, 0.2, 0.45, 0.65, 0.85, 1],
                          repeat: Infinity,
                          repeatDelay: 4.5,
                        }
                  }
                  style={{ display: 'inline-flex', transformOrigin: 'center' }}
                >
                  <Icon className={cn(s.icon, 'text-foreground')} />
                </motion.span>
              ) : (
                <Icon className={cn(s.icon, 'text-foreground')} />
              )}
            </span>
          </span>
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </button>
    );
  },
);
GradientCircleButton.displayName = 'GradientCircleButton';
