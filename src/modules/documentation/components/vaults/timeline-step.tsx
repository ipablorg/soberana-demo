import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { VaultJourneyStep } from '../../content/vaults-content';

export interface TimelineStepProps {
  step: VaultJourneyStep;
  index: number;
  isLast: boolean;
}

export function TimelineStep({ step, index, isLast }: TimelineStepProps) {
  return (
    <motion.div
      className="relative flex gap-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.15 }}
    >
      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div className="shrink-0 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <span className="text-xs font-bold text-primary-foreground tracking-wide">
            {step.label}
          </span>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-8 bg-linear-to-b from-primary/40 to-primary/10 my-2" />
        )}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-8', isLast && 'pb-0')}>
        <h4 className="text-lg font-bold text-foreground mb-3">{step.title}</h4>
        <div className="space-y-1.5">
          {step.items.map((item, i) => (
            <p
              key={i}
              className={cn(
                'text-sm leading-relaxed',
                i === step.items.length - 1
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground'
              )}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
