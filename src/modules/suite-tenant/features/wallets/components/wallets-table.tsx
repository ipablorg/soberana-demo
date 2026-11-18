import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import type { TenantWallet } from '@/graphql/types/tenant';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { tenantWalletRoute } from '@/shared/config/tenant-modes.config';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface WalletsTableProps {
  wallets: readonly TenantWallet[];
}

/** Presentational wallets table; the alias (or id) opens the wallet detail. */
export function WalletsTable({ wallets }: WalletsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="wallets-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Wallet</Trans>
            </TableHead>
            <TableHead>
              <Trans>Currency</Trans>
            </TableHead>
            <TableHead>
              <Trans>Chain</Trans>
            </TableHead>
            <TableHead>
              <Trans>Status</Trans>
            </TableHead>
            <TableHead>
              <Trans>Created</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell>
                <Link
                  to={tenantWalletRoute(wallet.id)}
                  className="font-medium text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {wallet.alias || wallet.id}
                </Link>
                {wallet.address ? (
                  <p className="break-all font-mono text-xs text-muted-foreground">
                    {wallet.address}
                  </p>
                ) : null}
              </TableCell>
              <TableCell className="font-mono text-sm">{wallet.currency}</TableCell>
              <TableCell className="text-sm">{wallet.chain}</TableCell>
              <TableCell>
                <StatusBadge status={wallet.status} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(wallet.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
