import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { VaultStrategyBadge } from './VaultStrategyBadge';
import type { Vault } from '../types/vault.types';

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

interface VaultCardProps {
  vault: Vault;
  index: number;
  onInvest: (vault: Vault) => void;
}

export function VaultCard({ vault, index, onInvest }: VaultCardProps) {
  const isPaused = vault.status === 'PAUSED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card className={cn('p-5', isPaused && 'opacity-70')}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {vault.pair}
            </Badge>
            <span className="text-xs text-muted-foreground capitalize">{vault.network}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isPaused
                ? 'bg-warning/10 text-warning border-warning/20'
                : 'bg-success/10 text-success border-success/20'
            )}
          >
            {vault.status}
          </Badge>
        </div>

        <h3 className="text-base font-heading font-semibold text-foreground mb-1">
          {vault.name}
        </h3>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-bold text-primary font-mono tabular-nums">
            {vault.estimatedApy.toFixed(1)}%
          </span>
          <span className="text-sm text-muted-foreground">est. APY</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="font-semibold text-foreground font-mono tabular-nums">
              {formatCompact(vault.totalValueLockedUsd)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Share Price</p>
            <p className="font-semibold text-foreground font-mono tabular-nums">
              ${vault.sharePrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <VaultStrategyBadge type={vault.strategy.type} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Min ${vault.minInvestmentUsd.toLocaleString()}
          </span>
          <Button
            variant={isPaused ? 'outline' : 'gradient'}
            size="sm"
            disabled={isPaused}
            onClick={() => onInvest(vault)}
          >
            {isPaused ? 'Paused' : 'Invest'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function VaultCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-5 w-32 mb-2" />
      <Skeleton className="h-9 w-24 mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-5 w-20 mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  );
}
