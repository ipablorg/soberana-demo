import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import type { TenantTransaction } from '@/graphql/types/tenant';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { tenantTransactionRoute } from '@/shared/config/tenant-modes.config';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import {
  formatAmount,
  formatDateTime,
  humanizeCode,
} from '@/modules/suite-tenant/lib/tenant-format';

interface TransactionsTableProps {
  transactions: readonly TenantTransaction[];
}

/** Presentational transactions table; the type opens the transaction detail. */
export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="transactions-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Type</Trans>
            </TableHead>
            <TableHead className="text-right">
              <Trans>Amount</Trans>
            </TableHead>
            <TableHead>
              <Trans>Status</Trans>
            </TableHead>
            <TableHead>
              <Trans>Reference</Trans>
            </TableHead>
            <TableHead>
              <Trans>Created</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                <Link
                  to={tenantTransactionRoute(transaction.id)}
                  className="font-medium text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {humanizeCode(transaction.type)}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatAmount(transaction.amount)} {transaction.currency}
              </TableCell>
              <TableCell>
                <StatusBadge status={transaction.status} />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {transaction.reference_code ?? '—'}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(transaction.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
