import { cn } from '@/shared/lib/utils';

interface SharesCalculatorProps {
  amountUsd: number;
  sharePrice: number;
  className?: string;
}

export function SharesCalculator({ amountUsd, sharePrice, className }: SharesCalculatorProps) {
  const shares = sharePrice > 0 ? amountUsd / sharePrice : 0;

  return (
    <div className={cn('rounded-xl border border-border bg-muted/30 p-4', className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Estimated shares</span>
        <span className="font-semibold text-foreground font-mono tabular-nums">
          {shares.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm mt-2">
        <span className="text-muted-foreground">Share price</span>
        <span className="text-foreground font-mono tabular-nums">
          ${sharePrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
