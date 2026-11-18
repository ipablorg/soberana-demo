import { cn } from '@/shared/lib/utils';

interface LiveBadgeProps {
  isLive?: boolean;
  label?: string;
  className?: string;
}

export function LiveBadge({ isLive = true, label, className }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide',
        isLive
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          isLive ? 'animate-pulse bg-success' : 'bg-muted-foreground',
        )}
      />
      {label ?? (isLive ? 'LIVE' : 'OFFLINE')}
    </span>
  );
}
