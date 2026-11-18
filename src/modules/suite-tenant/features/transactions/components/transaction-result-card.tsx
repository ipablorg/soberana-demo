import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantPaymentLink, TenantTransactionCommandResult } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { tenantTransactionRoute } from '@/shared/config/tenant-modes.config';
import { CopyButton } from '@/modules/suite-tenant/components/atoms/copy-button';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';

export type TransactionResult = TenantTransactionCommandResult & Partial<TenantPaymentLink>;

interface TransactionResultCardProps {
  result: TransactionResult;
  onAnother: () => void;
}

/** What the command answered: status, link to the transaction, or the payment link to share. */
export function TransactionResultCard({ result, onAnother }: TransactionResultCardProps) {
  const { t } = useLingui();
  const transactionId = result.transaction_id ?? (result.payment_url ? undefined : result.id);

  return (
    <div className="space-y-4 rounded-xl bg-muted/30 p-6" data-testid="transaction-result">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-semibold text-foreground">
          <Trans>Done.</Trans>
        </p>
        {result.status ? <StatusBadge status={result.status} /> : null}
      </div>
      {result.payment_url ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <Trans>Share this link with the payer.</Trans>
          </p>
          <p className="break-all font-mono text-sm text-foreground">{result.payment_url}</p>
          <CopyButton value={result.payment_url} label={t`Copy link`} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {transactionId ? (
          <Button asChild variant="outline" size="sm">
            <Link to={tenantTransactionRoute(transactionId)}>
              <Trans>View transaction</Trans>
            </Link>
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onAnother}>
          <Trans>Start another</Trans>
        </Button>
      </div>
    </div>
  );
}
