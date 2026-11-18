/**
 * TutorialFinishScreen
 *
 * Closing step of the tutorial. No spotlight, no target element —
 * renders a centered floating card via portal (z-[9999]).
 *
 * Follows Apple Marcom principles (loopay-marcom):
 * - Rule of Three: three proof-points in the body copy.
 * - Distillation: headline is the single core message, no padding words.
 * - Negative space: generous internal padding, minimal visual clutter.
 *
 * Motion: centered card fades + slides up, 200ms ease-out.
 * CTAs: primary "Ir al dashboard" + secondary "Repetir tutorial".
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Check } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { FINISH_STEP_INDEX } from './tutorial-config';

interface TutorialFinishScreenProps {
  currentStep: number;
  onClose: () => void;
  onRepeat: () => void;
}

export const TutorialFinishScreen: React.FC<TutorialFinishScreenProps> = ({
  currentStep,
  onClose,
  onRepeat,
}) => {
  const { t } = useLingui();

  return createPortal(
    <AnimatePresence>
      {currentStep === FINISH_STEP_INDEX && (
        <>
          {/* Full-screen dark backdrop */}
          <motion.div
            key="finish-backdrop"
            aria-hidden
            className="fixed inset-0 z-[9997]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{ background: 'rgba(0,0,0,0.75)' }}
          />

          {/* Centered card */}
          <motion.div
            key="finish-card"
            role="dialog"
            aria-modal="true"
            aria-label={t`Tutorial completado`}
            className={cn(
              'fixed z-[9999]',
              'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[min(360px,calc(100vw-2rem))]',
              'rounded-xl border border-border bg-card shadow-lg',
              'p-8 flex flex-col gap-6 items-center text-center',
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Checkmark icon */}
            <div
              aria-hidden
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full',
                'bg-brand-gradient',
              )}
            >
              <Check className="h-7 w-7 text-white" />
            </div>

            {/* Headline — distilled single message */}
            <div className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold text-foreground leading-snug">
                <Trans>Ya sabes cómo operar.</Trans>
              </h2>

              {/* Rule of Three: three proof-points, parallel structure */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                <Trans>
                  Recibir. Enviar. Conversar con Zentinel. Todo desde aquí.
                </Trans>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="gradient"
                className="w-full"
                onClick={onClose}
                autoFocus
              >
                <Trans>Ir al dashboard</Trans>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={onRepeat}
              >
                <Trans>Repetir tutorial</Trans>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};
