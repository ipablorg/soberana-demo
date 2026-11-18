import { Link, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { TENANT_ROUTES, tenantWalletRoute } from '@/shared/config/tenant-modes.config';
import { useTenantTransaction } from '@/modules/suite-tenant/features/transactions/hooks/use-tenant-transactions';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import {
  KeyValueList,
  type KeyValueItem,
} from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import {
  formatAmount,
  formatDateTime,
  humanizeCode,
} from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one transaction with its amounts, references and lifecycle dates. */
export default function TransactionDetail() {
  const { t } = useLingui();
  const { transactionId = '' } = useParams<{ transactionId: string }>();
  const { data, isLoading, error, refetch } = useTenantTransaction(transactionId);

  const back = (
    <Button asChild variant="ghost" size="sm">
      <Link to={TENANT_ROUTES.transactions}>
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-1.5">
          <Trans>All transactions</Trans>
        </span>
      </Link>
    </Button>
  );

  if (isLoading) return <TenantPageSkeleton />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {back}
        <QueryError error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const tx = data.tenant_getTransaction;
  const optional: Array<KeyValueItem | null> = [
    tx.fee ? { label: t`Fee`, value: `${formatAmount(tx.fee)} ${tx.currency}`, mono: true } : null,
    tx.exchange_rate ? { label: t`Exchange rate`, value: tx.exchange_rate, mono: true } : null,
    tx.beneficiary_id ? { label: t`Beneficiary`, value: tx.beneficiary_id, mono: true } : null,
    tx.quote_id ? { label: t`Quote`, value: tx.quote_id, mono: true } : null,
    tx.destination_tx_hash
      ? { label: t`Transaction hash`, value: tx.destination_tx_hash, mono: true }
      : null,
    tx.failure_reason ? { label: t`Failure reason`, value: tx.failure_reason } : null,
    tx.completed_at ? { label: t`Completed`, value: formatDateTime(tx.completed_at) } : null,
  ];

  return (
    <div className="space-y-6">
      {back}
      <SectionHeader
        title={`${humanizeCode(tx.type)}.`}
        subtitle={`${formatAmount(tx.amount)} ${tx.currency}`}
      />
      <Card className="rounded-xl shadow-none">
        <CardContent className="pt-6">
          <KeyValueList
            items={[
              { label: t`Status`, value: <StatusBadge status={tx.status} /> },
              { label: t`Amount`, value: `${formatAmount(tx.amount)} ${tx.currency}`, mono: true },
              { label: t`Direction`, value: humanizeCode(tx.direction) },
              { label: t`Purpose`, value: humanizeCode(tx.purpose) },
              { label: t`Reference`, value: tx.reference_code ?? '—', mono: true },
              {
                label: t`Wallet`,
                value: (
                  <Link to={tenantWalletRoute(tx.wallet_id)} className="font-mono text-primary">
                    {tx.wallet_id}
                  </Link>
                ),
              },
              { label: t`Created`, value: formatDateTime(tx.created_at) },
              { label: t`Transaction ID`, value: tx.id, mono: true },
              ...optional.filter((item): item is KeyValueItem => item !== null),
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
