import { useRef, useEffect } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { cn } from '@/shared/lib/utils';

export interface AnimatedMetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

function AnimatedNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals: number;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => v.toFixed(decimals));
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 1.5,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [isInView, motionValue, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function AnimatedMetricCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  className,
}: AnimatedMetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm',
        className,
      )}
    >
      <p className="text-3xl font-bold tabular-nums text-foreground">
        {prefix}
        <AnimatedNumber value={value} decimals={decimals} />
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
