import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import type { VaultPosition } from '../types/vault.types';

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface PositionCardProps {
  position: VaultPosition;
  index: number;
  onInvestMore: (position: VaultPosition) => void;
  onRedeem: (position: VaultPosition) => void;
}

export function PositionCard({ position, index, onInvestMore, onRedeem }: PositionCardProps) {
  const isPositive = position.unrealizedPnlUsd >= 0;
  const PnlIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">{position.pair}</Badge>
            </div>
            <h3 className="text-base font-heading font-semibold text-foreground">
              {position.vaultName}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground font-mono tabular-nums">
              ${formatUsd(position.currentValueUsd)}
            </p>
            <div className="flex items-center gap-1 justify-end">
              <PnlIcon className={cn('w-3.5 h-3.5', isPositive ? 'text-success' : 'text-destructive')} />
              <span className={cn('text-sm font-semibold font-mono tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? '+' : ''}${formatUsd(Math.abs(position.unrealizedPnlUsd))} ({isPositive ? '+' : ''}{position.unrealizedPnlPct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Shares</p>
            <p className="font-semibold font-mono tabular-nums">{position.sharesBalance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cost Basis</p>
            <p className="font-semibold font-mono tabular-nums">${formatUsd(position.costBasisUsd)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="font-semibold font-mono tabular-nums">${position.sharePrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Entry</p>
            <p className="font-semibold font-mono tabular-nums">${position.avgEntrySharePrice.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onInvestMore(position)}
          >
            Invest More
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="flex-1"
            onClick={() => onRedeem(position)}
          >
            Redeem
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function PositionCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex justify-between mb-3">
        <div>
          <Skeleton className="h-5 w-20 mb-2" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-28 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 flex-1 rounded-lg" />
      </div>
    </Card>
  );
}
