/**
 * LoadingScreen — Phase 1 of the post-login transition (also used as a
 * full-screen auth bootstrap loader, and Phase 1 of the Loopay X
 * activation transition).
 *
 * Brand moment per CLAUDE.md §6 ("Brand Gradient Utilities — BRAND MOMENTS
 * ONLY"): the Loopay logo + a single progress bar painted with
 * `bg-brand-gradient`. No spinners, no glows, no scale, no springs.
 *
 * Motion exception (documented per CLAUDE.md §3.5): the bar's fill
 * transition runs up to ~1400ms, exceeding the normal ≤300ms UI ceiling.
 * This is intentional — the bar IS the loader; its job is to communicate
 * "we are warming up your session" with a deliberate, calm cadence.
 * It uses `easeOut` (no spring), only animates `width` + `opacity`.
 *
 * Variants:
 *   `soberana` (default) — parent Loopay wordmark (dual light/dark
 *     PNGs with the canonical `dark:hidden` / `hidden dark:block`
 *     pair). Used by `<PostLoginTransition>` and any auth bootstrap
 *     loader. All existing call sites stay on this default.
 *   `elements` — Loopay Elements white wordmark. Same bar, same
 *     timing, same cadence — only the logo block swaps.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import SoberanaLogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import LoopayElementsLogoWhite from '@/shared/assets/loopay_logos/LoopayElements-LogoWhite.svg';

export type LoadingScreenVariant = 'soberana' | 'elements';

export interface LoadingScreenProps {
  /**
   * Externally-controlled progress in the 0–100 range. When provided,
   * the bar follows this value and ignores the internal animation.
   */
  progress?: number;
  /** Fired once the bar reaches 100%. */
  onComplete?: () => void;
  /**
   * Duration of the internal 0→100 animation when `progress` is omitted.
   * Defaults to 1400ms — this is the documented brand-moment exception
   * to the global ≤300ms UI motion budget (CLAUDE.md §3.5).
   */
  durationMs?: number;
  /** Optional className passthrough for layout integration. */
  className?: string;
  /**
   * Brand variant. Defaults to `'soberana'` — keeps every existing
   * call site (post-login, auth bootstrap) unchanged.
   */
  variant?: LoadingScreenVariant;
}

const BAR_WIDTH_PX = 240;
const BAR_HEIGHT_PX = 4;
const COMPLETE_THRESHOLD = 99.5;

export function LoadingScreen({
  progress,
  onComplete,
  durationMs = 1400,
  className,
  variant = 'soberana',
}: LoadingScreenProps) {
  const reduceMotion = useReducedMotion();
  const value = useMotionValue(0);
  const [percent, setPercent] = useState(0);
  const completeFiredRef = useRef(false);
  const widthPercent = useTransform(value, (v) => `${Math.min(100, Math.max(0, v))}%`);

  useEffect(() => {
    const unsubscribe = value.on('change', (v) => {
      const next = Math.round(Math.min(100, Math.max(0, v)));
      setPercent(next);
      if (next >= COMPLETE_THRESHOLD && !completeFiredRef.current) {
        completeFiredRef.current = true;
        onComplete?.();
      }
    });
    return unsubscribe;
  }, [value, onComplete]);

  useEffect(() => {
    if (typeof progress === 'number') {
      const clamped = Math.min(100, Math.max(0, progress));
      const controls = animate(value, clamped, {
        duration: reduceMotion ? 0 : 0.25,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }

    const controls = animate(value, 100, {
      duration: reduceMotion ? 0 : durationMs / 1000,
      ease: 'easeOut',
    });
    return () => controls.stop();
  }, [progress, durationMs, value, reduceMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading ${percent}%`}
      className={cn(
        'fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-background',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-8">
          {variant === 'elements' ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={LoopayElementsLogoWhite}
              alt="Loopay Elements"
              className="h-12 w-auto select-none"
              draggable={false}
            />
          </div>
        ) : (
            <>
            <img
              src={SoberanaLogoCompact}
              alt="Soberana"
              className="h-16 w-auto select-none dark:hidden"
              draggable={false}
            />
            <img
              src={SoberanaLogoCompact}
              alt="Soberana"
              className="hidden h-16 w-auto select-none dark:block"
              draggable={false}
            />
          </>
        )}

        <div className="flex flex-col items-center gap-3">
          <div
            className="overflow-hidden rounded-full bg-muted"
            style={{ width: BAR_WIDTH_PX, height: BAR_HEIGHT_PX }}
          >
            <motion.div
              className="bg-brand-gradient h-full rounded-full"
              style={{ width: widthPercent }}
            />
          </div>
          <span className="font-mono tabular-nums text-xs text-muted-foreground">
            {`Cargando ${percent}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
