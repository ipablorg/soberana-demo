import { Link, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES, tenantCustomerRoute } from '@/shared/config/tenant-modes.config';
import { DepositInstructionsCard } from '@/modules/suite-tenant/features/wallets/components/deposit-instructions-card';
import { WalletBalanceCard } from '@/modules/suite-tenant/features/wallets/components/wallet-balance-card';
import {
  useTenantWallet,
  useTenantWalletBalance,
  useTenantWalletDepositInstructions,
  useTenantWalletTransactions,
} from '@/modules/suite-tenant/features/wallets/hooks/use-tenant-wallets';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { TransactionsTable } from '@/modules/suite-tenant/components/organisms/transactions-table';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one wallet with its balance, deposit instructions and transactions. */
export default function WalletDetail() {
  const { t } = useLingui();
  const { walletId = '' } = useParams<{ walletId: string }>();
  const wallet = useTenantWallet(walletId);
  const customerId = wallet.data?.tenant_getWallet.customer_id;
  const balance = useTenantWalletBalance(walletId);
  const instructions = useTenantWalletDepositInstructions(walletId, customerId);
  const transactions = useTenantWalletTransactions(walletId);

  const back = (
    <Button asChild variant="ghost" size="sm">
      <Link
        to={
          customerId
            ? `${TENANT_ROUTES.wallets}?customer_id=${encodeURIComponent(customerId)}`
            : TENANT_ROUTES.wallets
        }
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-1.5">
          <Trans>All wallets</Trans>
        </span>
      </Link>
    </Button>
  );

  if (wallet.isLoading) return <TenantPageSkeleton />;
  if (wallet.error || !wallet.data) {
    return (
      <div className="space-y-6">
        {back}
        <QueryError error={wallet.error} onRetry={() => void wallet.refetch()} />
      </div>
    );
  }

  const data = wallet.data.tenant_getWallet;
  const rows = transactions.data?.tenant_walletTransactions.data ?? [];

  return (
    <div className="space-y-6">
      {back}
      <SectionHeader
        title={t`${data.alias || data.currency} wallet.`}
        subtitle={t`Balance, deposits and moves.`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">
              <Trans>Wallet</Trans>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <KeyValueList
              items={[
                { label: t`Status`, value: <StatusBadge status={data.status} /> },
                { label: t`Currency`, value: data.currency, mono: true },
                { label: t`Chain`, value: data.chain },
                { label: t`Address`, value: data.address ?? '—', mono: true },
                {
                  label: t`Customer`,
                  value: (
                    <Link
                      to={tenantCustomerRoute(data.customer_id)}
                      className="font-mono text-primary"
                    >
                      {data.customer_id}
                    </Link>
                  ),
                },
                { label: t`Created`, value: formatDateTime(data.created_at) },
              ]}
            />
          </CardContent>
        </Card>
        <WalletBalanceCard
          balance={balance.data?.tenant_walletBalance}
          isLoading={balance.isLoading}
        />
      </div>

      <DepositInstructionsCard
        instructions={instructions.data?.tenant_walletDepositInstructions}
        isLoading={instructions.isLoading}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          <Trans>Transactions</Trans>
        </h2>
        {transactions.isLoading ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Loading transactions…</Trans>
          </p>
        ) : transactions.error ? (
          <QueryError error={transactions.error} onRetry={() => void transactions.refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={t`No moves yet.`}
            description={t`Deposits and withdrawals show up here.`}
          />
        ) : (
          <TransactionsTable transactions={rows} />
        )}
      </section>
    </div>
  );
}
