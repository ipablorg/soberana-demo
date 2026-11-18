import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((label, idx) => {
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;
        const isClickable = idx < currentStep;

        return (
          <button
            key={idx}
            onClick={() => isClickable && onStepClick(idx)}
            disabled={!isClickable}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-1 py-1 transition-colors duration-150',
              isClickable && 'cursor-pointer',
              !isClickable && !isActive && 'cursor-default',
            )}
            aria-label={`Paso ${idx + 1}: ${label}`}
          >
            <div className="relative flex h-3 w-3 items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="step-active"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full transition-colors',
                  isActive && 'bg-transparent',
                  isCompleted && 'bg-primary/60',
                  !isActive && !isCompleted && 'bg-muted-foreground/20',
                )}
              />
            </div>

            {isActive && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap text-xs font-medium text-foreground"
              >
                {label}
              </motion.span>
            )}
          </button>
        );
      })}
    </div>
  );
}
