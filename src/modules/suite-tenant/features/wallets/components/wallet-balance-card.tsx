import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantWalletBalance } from '@/graphql/types/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatAmount, formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface WalletBalanceCardProps {
  balance: TenantWalletBalance | undefined;
  isLoading: boolean;
}

/** Available / spendable / pending / total of a wallet. */
export function WalletBalanceCard({ balance, isLoading }: WalletBalanceCardProps) {
  const { t } = useLingui();
  const rows = balance
    ? [
        { label: t`Available`, value: balance.balance.available },
        { label: t`Spendable`, value: balance.balance.spendable },
        { label: t`Pending`, value: balance.balance.pending },
        { label: t`Total`, value: balance.balance.total },
      ]
    : [];

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Balance</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading balance…</Trans>
          </p>
        ) : !balance ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Balance unavailable right now.</Trans>
          </p>
        ) : (
          <div className="space-y-3" data-testid="wallet-balance">
            <dl className="grid grid-cols-2 gap-4">
              {rows.map((row) => (
                <div key={row.label} className="space-y-1">
                  <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                  <dd className="font-mono text-lg tabular-nums text-foreground">
                    {formatAmount(row.value)}{' '}
                    <span className="text-xs text-muted-foreground">{balance.currency}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              <Trans>Updated {formatDateTime(balance.updated_at)}</Trans>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
