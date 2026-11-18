/**
 * SplashScreen — Phase 2 of the post-login transition.
 *
 * All variants share the SAME typographic scaffolding — the only
 * thing that changes is the wordmark inside the `<Trans>`:
 *
 *   `soberana` (default) — "Bienvenido a <Soberana>"
 *   `elements`           — "Bienvenido a <Elements>"
 *
 * The wordmark itself uses the `text-gradient-loopay` brand-moment
 * utility (CLAUDE.md §6 — gradient utilities are restricted to
 * brand moments; the welcome splash qualifies). No images, no
 * monograms — typography IS the splash.
 *
 * Motion exception (documented per CLAUDE.md §3.5): the dismiss fade
 * runs up to ~700ms with a `blur(0)→blur(12px)` filter, exceeding the
 * normal ≤300ms UI ceiling. This is intentional — the splash is a
 * deliberate hand-off frame, not a UI transition. It uses `easeInOut`
 * and animates only `opacity` + `filter` (no scale, no spring). When
 * `prefers-reduced-motion` is active we skip the blur and shorten the
 * fade to 200ms per the same section's accessibility contract.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trans } from '@lingui/react/macro';
import { cn } from '@/shared/lib/utils';

export type SplashVariant = 'soberana' | 'elements';

export interface SplashScreenProps {
  /** Fired once the exit animation completes and the splash is unmounted. */
  onDismiss: () => void;
  /** How long the splash stays fully visible before fading out. Default 900ms. */
  visibleMs?: number;
  /** Duration of the fade+blur exit. Default 700ms. */
  fadeMs?: number;
  /** Optional className passthrough. */
  className?: string;
  /**
   * Brand variant. Defaults to `'soberana'` — keeps every existing
   * call site (post-login transition) unchanged.
   */
  variant?: SplashVariant;
}

export function SplashScreen({
  onDismiss,
  visibleMs = 900,
  fadeMs = 700,
  className,
  variant = 'soberana',
}: SplashScreenProps) {
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), visibleMs);
    return () => clearTimeout(timer);
  }, [visibleMs]);

  const exitDurationSec = reduceMotion ? 0.2 : fadeMs / 1000;

  return (
    <AnimatePresence onExitComplete={onDismiss}>
      {isVisible && (
        <motion.div
          key={`splash-${variant}`}
          role="status"
          aria-live="polite"
          className={cn(
            'fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-background',
            className,
          )}
          initial={{ opacity: 0, filter: reduceMotion ? 'none' : 'blur(0px)' }}
          animate={{ opacity: 1, filter: reduceMotion ? 'none' : 'blur(0px)' }}
          exit={{
            opacity: 0,
            filter: reduceMotion ? 'none' : 'blur(12px)',
          }}
          transition={{ duration: exitDurationSec, ease: 'easeInOut' }}
        >
          {variant === 'elements' ? (
            <h1 className="font-heading text-4xl font-light tracking-tight text-foreground md:text-5xl">
              <Trans>
                Bienvenido a <span className="text-gradient-loopay">Elements</span>
              </Trans>
            </h1>
          ) : (
            <h1 className="font-heading text-4xl font-light tracking-tight text-foreground md:text-5xl">
              <Trans>
                Bienvenido a <span className="text-gradient-loopay">Soberana</span>
              </Trans>
            </h1>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
