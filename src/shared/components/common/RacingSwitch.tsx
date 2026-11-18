/**
 * RacingSwitch — two-position toggle inspired by the mode-selector
 * lever of a sports car (Sport / Race). Clicks mechanically between
 * the two positions; no spring, no scale, no elasticity — a single
 * 200ms ease-out slide of the knob along the rail.
 *
 * Two orientations:
 *
 *   vertical (default):
 *     ┌────┐  ← rail (rounded-full, bg-card, border-border)
 *     │ ●  │  ← knob @ A (TOP, optically centered)
 *     │    │
 *     │    │
 *     │ ●  │  ← knob @ B (BOTTOM, optically centered)
 *     └────┘
 *
 *   horizontal:
 *     [labelA] [● ─────] [labelB]   value === 'a' (knob LEFT)
 *     [labelA] [───── ●] [labelB]   value === 'b' (knob RIGHT)
 *
 * The labels sit OUTSIDE the rail (top/bottom for vertical,
 * left/right for horizontal). The compact rail (28×56 inner) keeps
 * the control discreet enough to live in the topbar or just above
 * the VirtualCard without acaparating space.
 *
 * Geometry (knob optically centered in each half — same numbers
 * for both orientations, just rotated 90°):
 *   - rail short axis      :  28 px (w-7 / h-7)
 *   - rail long axis       :  56 px (h-14 / w-14)
 *   - rail border          :   1 px (so inner = 54)
 *   - knob                 :  20×20 px (h-5 w-5)
 *   - resting offset @ A   :   4 px → knob center @ 14 px
 *   - resting offset @ B   :  31 px → knob center @ 41 px
 *   - translate delta      :  27 px (B - A)
 *
 * Direction semantics: `labelA` is ALWAYS the FIRST label and
 * `value === 'a'` parks the knob at the FIRST position (TOP for
 * vertical, LEFT for horizontal). `labelB` is the SECOND label and
 * `value === 'b'` parks the knob at the SECOND position (BOTTOM /
 * RIGHT). The caller decides which label means "on": for the
 * Loopay X switch we set `labelA = 'Loopay X'` and `accentOn = 'a'`
 * so turning the mode ON lands the gradient knob at the brand-
 * moment slot (top for vertical, left for horizontal).
 *
 * `accentOn` (default `'b'`) preserves the prior behavior for any
 * existing consumer where the gradient highlight belongs at the
 * second slot (none today, but the prop keeps the API forward-compat).
 *
 * Accessibility: rendered as `<button role="switch">` with
 * `aria-checked` reflecting the accent position. Space and Enter
 * toggle. Vertical: ArrowUp jumps to A, ArrowDown to B. Horizontal:
 * ArrowLeft jumps to A, ArrowRight to B.
 *
 * Reuses existing tokens:
 *   - `bg-card` / `border-border` — rail substrate.
 *   - `bg-brand-gradient` — gradient accent (§6 brand-moment use).
 *   - `text-foreground` / `text-muted-foreground` — label tones.
 *   - 200ms `ease-out` transition — §3.5 default for state change.
 */

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

export type RacingSwitchValue = 'a' | 'b';
export type RacingSwitchOrientation = 'vertical' | 'horizontal';

export interface RacingSwitchProps {
  value: RacingSwitchValue;
  onChange: (next: RacingSwitchValue) => void;
  /** First label — corresponds to value === 'a' (top for vertical, left for horizontal). */
  labelA: string;
  /** Second label — corresponds to value === 'b' (bottom for vertical, right for horizontal). */
  labelB: string;
  /**
   * `gradient` lights the knob with the Loopay brand gradient when
   * the switch sits in the accent position (controlled by
   * `accentOn`). `default` keeps both positions neutral
   * (knob = `bg-foreground`).
   */
  accent?: 'default' | 'gradient';
  /**
   * Which position carries the brand-moment accent. Defaults to
   * `'b'` to preserve the previous (second-slot) behavior. Loopay X
   * uses `'a'` so the gradient knob sits at the first slot when
   * the mode is on.
   */
  accentOn?: RacingSwitchValue;
  /**
   * Layout direction. Defaults to `'vertical'` (rail taller than
   * wide, labels stacked top/bottom). `'horizontal'` rotates the
   * rail 90° (wider than tall, labels inline left/right) — used
   * when the switch lives in the topbar.
   */
  orientation?: RacingSwitchOrientation;
  /** Accessible label for the whole control. */
  ariaLabel?: string;
  /** Disable the control. */
  disabled?: boolean;
  className?: string;
}

export const RacingSwitch = React.forwardRef<
  HTMLButtonElement,
  RacingSwitchProps
>(
  (
    {
      value,
      onChange,
      labelA,
      labelB,
      accent = 'default',
      accentOn = 'b',
      orientation = 'vertical',
      ariaLabel,
      disabled,
      className,
    },
    ref,
  ) => {
    const isB = value === 'b';
    const isAccent = value === accentOn;
    const isHorizontal = orientation === 'horizontal';

    const handleToggle = () => {
      if (disabled) return;
      onChange(isB ? 'a' : 'b');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        handleToggle();
        return;
      }
      const forwardKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
      const backwardKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === forwardKey && !isB) {
        event.preventDefault();
        onChange('b');
      } else if (event.key === backwardKey && isB) {
        event.preventDefault();
        onChange('a');
      }
    };

    // Knob slides 27px along the long axis of the rail (X for
    // horizontal, Y for vertical). The 27px delta is the difference
    // between the two optically-centered top/left edges (see the
    // geometry table in the file header). We compose the slide
    // with the centering offset on the OTHER axis directly in the
    // inline style — relying on a Tailwind `-translate-y-1/2` /
    // `-translate-x-1/2` would be overridden by `style.transform`.
    const knobOffset = isB ? 27 : 0;
    const knobTransform = isHorizontal
      ? `translate(${knobOffset}px, -50%)`
      : `translate(-50%, ${knobOffset}px)`;

    // Tone for each label slot. The accent label gets the brand
    // gradient text only when the switch sits in its position AND
    // the accent variant is gradient; otherwise it's plain
    // foreground/muted depending on which side is active.
    const labelClass = (isOwnSlot: boolean, isAccentSlot: boolean) =>
      cn(
        'text-[9px] font-semibold uppercase tracking-wider transition-colors duration-150',
        isOwnSlot
          ? accent === 'gradient' && isAccentSlot
            ? 'text-gradient-loopay'
            : 'text-foreground'
          : 'text-muted-foreground',
      );

    return (
      <div
        className={cn(
          'inline-flex select-none',
          isHorizontal
            ? 'flex-row items-center gap-2'
            : 'flex-col items-center gap-1.5',
          className,
        )}
      >
        <span className={labelClass(!isB, accentOn === 'a')}>{labelA}</span>

        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={isAccent}
          aria-label={ariaLabel ?? `${labelA} / ${labelB}`}
          disabled={disabled}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'relative rounded-full',
            // 28×56 short × long, rotated based on orientation.
            isHorizontal ? 'h-7 w-14' : 'h-14 w-7',
            'border border-border bg-card',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'transition-colors duration-150',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-muted cursor-pointer',
          )}
        >
          {/* Track tint — soft brand-gradient wash visible only when
              the switch sits in the accent position. Reinforces the
              brand moment without overpowering the surface. */}
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-0 rounded-full',
              'transition-opacity duration-200 ease-out',
              accent === 'gradient' && isAccent
                ? 'opacity-100 bg-brand-gradient/20'
                : 'opacity-0',
            )}
          />

          {/* Knob — slides 27px between the two optically-centered
              positions along the long axis. For vertical we anchor
              with `top-[4px]` and center horizontally with
              `left-1/2 -translate-x-1/2`; for horizontal we anchor
              with `left-[4px]` and center vertically with
              `top-1/2 -translate-y-1/2`. */}
          <span
            aria-hidden
            className={cn(
              'absolute h-5 w-5 rounded-full',
              // The OTHER-axis centering is encoded directly in the
              // inline `transform` (the -50% half) so the slide and
              // the centering compose cleanly. Anchor edges are set
              // via `top`/`left` so the rest of the math is in px.
              isHorizontal ? 'left-[4px] top-1/2' : 'left-1/2 top-[4px]',
              'transition-[transform,background-color,box-shadow] duration-200 ease-out',
              accent === 'gradient' && isAccent
                ? 'bg-brand-gradient shadow-sm'
                : 'bg-foreground',
            )}
            style={{
              transform: knobTransform,
            }}
          />
        </button>

        <span className={labelClass(isB, accentOn === 'b')}>{labelB}</span>
      </div>
    );
  },
);
RacingSwitch.displayName = 'RacingSwitch';
