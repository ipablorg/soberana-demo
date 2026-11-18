import { cn } from '@/shared/lib/utils';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface MetricCardProps {
  label: string;
  value: string | null | undefined;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  isLoading,
  className,
  valueClassName,
}: MetricCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border border-border bg-card p-4',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p
          className={cn(
            'font-mono text-xl font-bold tabular-nums',
            trendColor,
            valueClassName,
          )}
        >
          {value ?? '—'}
        </p>
      )}
      {subValue && (
        <p className="text-xs text-muted-foreground font-mono">{subValue}</p>
      )}
    </div>
  );
}
