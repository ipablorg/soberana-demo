import { ArrowUpRight, ArrowDownRight } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import type { InvestorPortfolio } from '../types/vault.types';

interface PortfolioSummaryHeroProps {
  portfolio: InvestorPortfolio | undefined;
  isLoading: boolean;
}

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PortfolioSummaryHero({ portfolio, isLoading }: PortfolioSummaryHeroProps) {
  if (isLoading) {
    return (
      <div className="border border-border rounded-xl">
        <Card className="p-6 bg-card rounded-xl">
          <div className="space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!portfolio) return null;

  const isPositive = portfolio.totalUnrealizedPnlUsd >= 0;
  const PnlIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="border border-border rounded-xl">
      <Card className="p-6 bg-card rounded-xl">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
              <h2 className="text-4xl font-heading font-bold text-foreground font-mono tabular-nums">
                ${formatUsd(portfolio.totalValueUsd)}
              </h2>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <PnlIcon className={cn('w-4 h-4', isPositive ? 'text-success' : 'text-destructive')} />
                  <span className={cn('font-semibold font-mono tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
                    {isPositive ? '+' : ''}{portfolio.totalUnrealizedPnlPct.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground">unrealized P&L</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="text-muted-foreground">
                  {portfolio.positions.length} active position{portfolio.positions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-lg font-bold font-mono tabular-nums">${formatUsd(portfolio.totalCostBasisUsd)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
              <p className={cn('text-lg font-bold font-mono tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? '+' : ''}${formatUsd(Math.abs(portfolio.totalUnrealizedPnlUsd))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Positions</p>
              <p className="text-lg font-bold">{portfolio.positions.length}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
