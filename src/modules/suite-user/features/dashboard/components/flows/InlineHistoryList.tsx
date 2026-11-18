/**
 * InlineHistoryList
 *
 * Compact list of the 5 most recent wallet transactions, rendered inline
 * inside the Soberana home. Reuses useWalletTransactions.
 */

import { ArrowLeft } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useLingui } from '@lingui/react/macro';
import { useWalletTransactions } from '@/shared/hooks/use-wallet-transactions';

interface WalletTransaction {
  id: string;
  status: string;
  type: string;
  amount: string;
  currency: string;
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-success/10 text-success',
  PENDING: 'bg-warning/10 text-warning',
  PROCESSING: 'bg-warning/10 text-warning',
  FAILED: 'bg-destructive/10 text-destructive',
  REJECTED: 'bg-destructive/10 text-destructive',
  CREATED: 'bg-muted text-muted-foreground',
};

/**
 * Customer-facing status labels. Dispersion v2 sends appear as
 * WITHDRAWAL rows sitting in PENDING until operations settles them —
 * the badge must say "in process", never imply completion.
 */
function statusLabel(
  status: string,
  t: (strings: TemplateStringsArray, ...values: unknown[]) => string,
): string {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return t`Completada`;
    case 'PENDING':
      return t`En proceso`;
    case 'PROCESSING':
      return t`En proceso`;
    case 'FAILED':
      return t`Fallida`;
    case 'REJECTED':
      return t`Rechazada`;
    case 'CREATED':
      return t`Creada`;
    default:
      return status;
  }
}

export interface InlineHistoryListProps {
  walletId: string | undefined;
  onClose?: () => void;
}

export function InlineHistoryList({ walletId, onClose }: InlineHistoryListProps) {
  const { t } = useLingui();
  const { transactions, isLoading } = useWalletTransactions(walletId, { page_size: 5 });
  const rows = transactions as WalletTransaction[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'inline-flex items-center gap-2 text-xs text-muted-foreground',
              'hover:text-foreground transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-2 py-1'
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t`Atrás`}
          </button>
        )}
        {/* "Ver todo" was removed: the BottomDock's Movimientos
            section now plays that role from the dashboard surface,
            so a button leading back to the same shell would be a
            no-op redirect. */}
      </div>

      <h3 className="text-sm tracking-tight">
        <span className="font-semibold text-foreground">{t`Historial.`}</span>
        {' '}
        <span className="font-normal text-muted-foreground">{t`Tus últimos movimientos`}</span>
      </h3>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="rounded-xl bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t`Aún no hay movimientos. Cuando los haya, aparecerán aquí.`}
          </p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="rounded-xl bg-muted/30 p-2">
          <ul className="divide-y divide-border/50">
            {rows.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between py-3 px-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px] shrink-0', STATUS_STYLES[tx.status] ?? STATUS_STYLES.CREATED)}
                  >
                    {statusLabel(tx.status, t)}
                  </Badge>
                  <span className="text-sm text-foreground truncate">{tx.type}</span>
                </div>
                <span className="font-mono tabular-nums text-sm text-foreground text-right">
                  {tx.amount} {tx.currency}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
