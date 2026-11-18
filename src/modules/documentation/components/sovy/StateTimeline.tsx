import { motion } from 'framer-motion';
import { Check } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';

export interface TimelineState {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

export interface StateTimelineProps {
  states: TimelineState[];
  className?: string;
}

function Dot({ status }: { status: TimelineState['status'] }) {
  if (status === 'completed') {
    return (
      <div className="shrink-0 w-6 h-6 rounded-full bg-success flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-success-foreground" />
      </div>
    );
  }

  if (status === 'active') {
    return (
      <div className="relative shrink-0 w-6 h-6">
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/40"
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
        <span className="relative block w-6 h-6 rounded-full bg-primary ring-2 ring-background" />
      </div>
    );
  }

  return (
    <span className="shrink-0 w-6 h-6 rounded-full border-2 border-muted-foreground/30 bg-muted" />
  );
}

function Line({ status }: { status: TimelineState['status'] }) {
  return (
    <span
      className={cn(
        'flex-1 min-w-4 h-0.5',
        status === 'pending'
          ? 'border-t-2 border-dashed border-muted-foreground/30'
          : 'bg-success',
      )}
    />
  );
}

export function StateTimeline({ states, className }: StateTimelineProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-y-3',
        className,
      )}
    >
      {states.map((state, i) => (
        <div key={i} className="contents">
          <motion.div
            className="flex flex-col items-center gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.12 }}
          >
            <Dot status={state.status} />
            <span
              className={cn(
                'text-xs font-medium whitespace-nowrap',
                state.status === 'active'
                  ? 'text-primary'
                  : state.status === 'completed'
                    ? 'text-success'
                    : 'text-muted-foreground',
              )}
            >
              {state.label}
            </span>
          </motion.div>

          {i < states.length - 1 && (
            <Line status={states[i + 1].status === 'pending' ? 'pending' : 'completed'} />
          )}
        </div>
      ))}
    </div>
  );
}
