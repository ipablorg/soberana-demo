import { ArrowUpRight, ArrowDownLeft } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
import type { VaultTransaction, VaultTransactionStatus } from '../types/vault.types';

const statusConfig: Record<VaultTransactionStatus, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confirmed', className: 'bg-success/10 text-success border-success/20' },
  PROCESSING: { label: 'Processing', className: 'bg-warning/10 text-warning border-warning/20' },
  PENDING: { label: 'Pending', className: 'bg-muted text-muted-foreground border-border' },
  FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

interface TransactionRowProps {
  transaction: VaultTransaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isInvest = transaction.type === 'INVEST';
  const Icon = isInvest ? ArrowUpRight : ArrowDownLeft;
  const config = statusConfig[transaction.status];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
      <div className={cn(
        'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
        isInvest ? 'bg-success/10' : 'bg-primary/10'
      )}>
        <Icon className={cn('w-4 h-4', isInvest ? 'text-success' : 'text-primary')} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{transaction.type}</span>
          <span className="text-xs text-muted-foreground truncate">{transaction.pair}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {format(new Date(transaction.createdAt), 'MMM d, yyyy · HH:mm')}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold font-mono tabular-nums text-foreground">
          ${transaction.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground font-mono tabular-nums">
          {transaction.sharesAmount.toFixed(2)} shares
        </p>
      </div>

      <Badge variant="outline" className={cn('text-xs shrink-0', config.className)}>
        {config.label}
      </Badge>
    </div>
  );
}
