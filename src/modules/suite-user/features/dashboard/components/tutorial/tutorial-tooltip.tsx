/**
 * TutorialTooltip (coachmark)
 *
 * Anchored step card shown adjacent to the spotlighted element. Renders via
 * a portal so it sits above the TutorialOverlay (z-[9999]).
 *
 * Positioning — preference order:
 *   'right'  → try right of target, fallback left, fallback above/below
 *   'left'   → try left of target, fallback right, fallback above/below
 *   'auto'   → try right, then left, then above/below (default)
 *   'above'  → above only
 *   'below'  → below only
 *
 * On mobile (< 640px), side placement is skipped — always above/below.
 *
 * Navigation: Siguiente · Atrás · Saltar · Finalizar (on last step)
 * Accessibility: aria-live on content region, auto-focus on primary button.
 */

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { SpotlightRect } from './tutorial-overlay';
import { TUTORIAL_STEPS, FINISH_STEP_INDEX } from './tutorial-config';

const TOOLTIP_WIDTH = 300;
const TOOLTIP_GAP = 18;
const SPOTLIGHT_PADDING = 12;
// Generous height estimate for vertical centering when placed to the side.
const ESTIMATED_TOOLTIP_HEIGHT = 260;

interface TutorialTooltipProps {
  currentStep: number;
  visible: boolean;
  targetRect: SpotlightRect | null;
  tooltipSide?: 'auto' | 'right' | 'left' | 'above' | 'below';
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

interface StepContent {
  headline: string;
  body: string;
}

function useStepContent(step: number): StepContent {
  const { t } = useLingui();

  const steps: StepContent[] = [
    // 0 — receive-intro
    {
      headline: t`Tus cuentas. Tuyas.`,
      body: t`Pulsa Recibir para ver tus cuentas virtuales por moneda. El dinero llega en la moneda local del pagador y se convierte a USDC automáticamente.`,
    },
    // 1 — receive-open (real ReceiveFlow is visible)
    {
      headline: t`Comparte estos datos.`,
      body: t`Toca una moneda para ver los datos de transferencia. Copia el número de cuenta y la referencia, y envíaselos a quien te vaya a pagar.`,
    },
    // 2 — virtual-card
    {
      headline: t`Tu saldo. En tiempo real.`,
      body: t`Aquí vive todo lo que has recibido, convertido a USDC. Toca la tarjeta para ver el equivalente en cualquier moneda local.`,
    },
    // 3 — send-intro
    {
      headline: t`Enviar. Así de simple.`,
      body: t`Un beneficiario. Un monto. Una confirmación. El dinero llega en la moneda local del destino. Sin intermediarios innecesarios.`,
    },
    // 4 — send-open (real SendFlow is visible)
    {
      headline: t`Tres pasos. Listo.`,
      body: t`Selecciona el beneficiario, ingresa el monto en USDC y revisa el resumen. Tasa, comisión y tiempo estimado. Sin sorpresas.`,
    },
    // 5 — zentinel
    {
      headline: t`Zentinel. Tu operador inteligente.`,
      body: t`Dile lo que necesitas en tus propias palabras. Activa monedas, crea beneficiarios, proyecta tu flujo de caja. Todo con lenguaje natural.`,
    },
  ];

  return steps[step] ?? { headline: '', body: '' };
}

const ZENTINEL_PROMPTS = [
  'Recibe $500 USD de mis clientes',
  '¿Cuánto vale mi saldo en pesos hoy?',
  'Crea un beneficiario en Colombia',
  'Proyecta mi flujo los próximos 30 días',
];

// ── Positioning ────────────────────────────────────────────────────────────────

function computeTooltipStyle(
  targetRect: SpotlightRect | null,
  side: 'auto' | 'right' | 'left' | 'above' | 'below' = 'auto',
): React.CSSProperties {
  if (!targetRect) {
    return { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 640;

  const spotLeft   = targetRect.left - SPOTLIGHT_PADDING;
  const spotTop    = targetRect.top  - SPOTLIGHT_PADDING;
  const spotRight  = targetRect.left + targetRect.width  + SPOTLIGHT_PADDING;
  const spotBottom = targetRect.top  + targetRect.height + SPOTLIGHT_PADDING;

  // ── Side placement (right / left) — skipped on mobile ─────────────
  if (!isMobile && side !== 'above' && side !== 'below') {
    const vertCenter = Math.max(
      16,
      Math.min(
        spotTop + (spotBottom - spotTop) / 2 - ESTIMATED_TOOLTIP_HEIGHT / 2,
        vh - ESTIMATED_TOOLTIP_HEIGHT - 16,
      ),
    );

    const canFitRight = spotRight + TOOLTIP_GAP + TOOLTIP_WIDTH + 16 <= vw;
    const canFitLeft  = spotLeft  - TOOLTIP_GAP - TOOLTIP_WIDTH       >= 16;

    const tryRight = side === 'right' || side === 'auto';
    const tryLeft  = side === 'left'  || side === 'auto' || side === 'right';

    if (tryRight && canFitRight) {
      return { position: 'fixed', width: TOOLTIP_WIDTH, left: spotRight + TOOLTIP_GAP, top: vertCenter };
    }
    if (tryLeft && canFitLeft) {
      return { position: 'fixed', width: TOOLTIP_WIDTH, left: spotLeft - TOOLTIP_WIDTH - TOOLTIP_GAP, top: vertCenter };
    }
    // Neither side fits — fall through to above/below.
  }

  // ── Above / below placement ────────────────────────────────────────
  const spotCenterY = spotTop + (spotBottom - spotTop) / 2;
  const placeAbove  = side === 'above' || (side !== 'below' && spotCenterY > vh / 2);
  const spotCenterX = spotLeft + (spotRight - spotLeft) / 2;
  const rawLeft     = spotCenterX - TOOLTIP_WIDTH / 2;
  const left        = Math.max(16, Math.min(rawLeft, vw - TOOLTIP_WIDTH - 16));

  const style: React.CSSProperties = { position: 'fixed', width: TOOLTIP_WIDTH, left };
  if (placeAbove) {
    style.bottom = vh - spotTop + TOOLTIP_GAP;
  } else {
    style.top = spotBottom + TOOLTIP_GAP;
  }
  return style;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  currentStep,
  visible,
  targetRect,
  tooltipSide = 'auto',
  onNext,
  onPrev,
  onSkip,
}) => {
  const { t } = useLingui();
  const content = useStepContent(currentStep);
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const tooltipStyle = computeTooltipStyle(targetRect, tooltipSide);

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!visible) return;
    const el = tooltipRef.current?.querySelector<HTMLElement>('button');
    el?.focus();
  }, [visible, currentStep]);

  return createPortal(
    <AnimatePresence mode="wait">
      {visible && currentStep < FINISH_STEP_INDEX && (
        <motion.div
          key={`tooltip-${currentStep}`}
          ref={tooltipRef}
          role="dialog"
          aria-modal="false"
          aria-label={t`Paso del tutorial`}
          className={cn(
            'z-[9999]',
            'rounded-xl border border-border bg-card shadow-lg',
            'p-5 flex flex-col gap-4',
          )}
          style={tooltipStyle}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Content */}
          <div aria-live="polite" className="flex flex-col gap-2">
            <p className="text-base font-semibold text-foreground leading-snug">
              {content.headline}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.body}
            </p>
            {/* Zentinel prompt chips (step 5 only) */}
            {currentStep === 5 && (
              <div className="flex flex-wrap gap-1.5 mt-1" aria-hidden>
                {ZENTINEL_PROMPTS.map((prompt) => (
                  <span
                    key={prompt}
                    className="rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {prompt}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Progress + navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              {TUTORIAL_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'inline-block rounded-full transition-colors duration-150',
                    i === currentStep
                      ? 'w-4 h-1.5 bg-foreground'
                      : 'w-1.5 h-1.5 bg-muted-foreground/40',
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {currentStep + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <Trans>Saltar</Trans>
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={onPrev}>
                  <Trans>Atrás</Trans>
                </Button>
              )}
              <Button variant="gradient" size="sm" onClick={onNext}>
                {isLast ? <Trans>Finalizar</Trans> : <Trans>Siguiente</Trans>}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
