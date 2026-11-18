import { Badge } from '@/shared/components/ui/badge';
import type { VaultStrategyType } from '../types/vault.types';

const strategyConfig: Record<VaultStrategyType, { label: string; className: string }> = {
  HYBRID: {
    label: 'Hybrid',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  CASH_AND_CARRY: {
    label: 'Cash & Carry',
    className: 'bg-success/10 text-success border-success/20',
  },
  LIQUIDITY_PROVISION: {
    label: 'LP',
    className: 'bg-accent/10 text-accent-foreground border-accent/20',
  },
  FUNDING_ARBITRAGE: {
    label: 'Funding Arb',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
};

interface VaultStrategyBadgeProps {
  type: VaultStrategyType;
}

export function VaultStrategyBadge({ type }: VaultStrategyBadgeProps) {
  const config = strategyConfig[type];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
