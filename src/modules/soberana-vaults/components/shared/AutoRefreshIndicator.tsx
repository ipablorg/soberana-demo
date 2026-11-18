import { useEffect, useState } from 'react';

interface AutoRefreshIndicatorProps {
  intervalMs?: number;
  lastUpdated?: string | null;
}

export function AutoRefreshIndicator({
  intervalMs = 60_000,
  lastUpdated,
}: AutoRefreshIndicatorProps) {
  const [secondsLeft, setSecondsLeft] = useState(intervalMs / 1000);

  useEffect(() => {
    setSecondsLeft(intervalMs / 1000);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) return intervalMs / 1000;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [intervalMs, lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
      <span>
        Actualiza en{' '}
        <span className="font-mono tabular-nums text-foreground">
          {secondsLeft}s
        </span>
      </span>
    </div>
  );
}
