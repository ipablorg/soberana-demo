import { cn } from '@/shared/lib/utils';
import { Check } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';

export interface WizardStepperItem {
  title: string;
  helper?: string;
}

interface WizardStepperProps {
  steps: WizardStepperItem[];
  activeIndex: number;
  className?: string;
}

/**
 * Responsive stepper for the KYC/KYB wizard.
 *
 * A row of numbered markers joined by a progress line never overflows, whatever
 * the number of steps; only the active step is named (below the markers), so
 * long titles cannot collide with their neighbours at any width.
 */
export function WizardStepper({ steps, activeIndex, className }: WizardStepperProps) {
  const { t } = useLingui();
  const active = steps[activeIndex];
  const current = activeIndex + 1;
  const total = steps.length;

  return (
    <nav
      aria-label={t`Progreso de la verificación`}
      className={cn('rounded-xl border border-border bg-card p-3 sm:p-4', className)}
    >
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={`${step.title}-${index}`}
              className={cn('flex items-center', !isLast && 'flex-1')}
            >
              <span
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={step.title}
                title={step.title}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs transition-colors duration-150 sm:h-9 sm:w-9',
                  isComplete && 'border border-success/30 bg-success/10 text-success',
                  isCurrent && 'border-2 border-primary bg-card font-semibold text-foreground',
                  !isComplete && !isCurrent && 'border border-border bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-1.5 h-0.5 flex-1 rounded-full sm:mx-2',
                    isComplete ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      {active && (
        <div className="mt-3 min-w-0 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {t`Paso ${current} de ${total}`}
          </p>
          <p className="truncate text-sm font-semibold text-foreground">{active.title}</p>
          {active.helper && (
            <p className="truncate text-xs text-muted-foreground">{active.helper}</p>
          )}
        </div>
      )}
    </nav>
  );
}
