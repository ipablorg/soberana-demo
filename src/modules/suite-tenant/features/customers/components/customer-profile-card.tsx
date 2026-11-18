import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantCustomer } from '@/graphql/types/tenant';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CopyButton } from '@/modules/suite-tenant/components/atoms/copy-button';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import { formatDateTime, humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface CustomerProfileCardProps {
  customer: TenantCustomer;
}

/** Identity, status and the hosted KYC link of a customer. */
export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const { t } = useLingui();

  return (
    <Card className="rounded-xl shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">
          <Trans>Profile</Trans>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <KeyValueList
          items={[
            { label: t`Email`, value: customer.email },
            { label: t`External ID`, value: customer.external_id, mono: true },
            { label: t`Type`, value: humanizeCode(customer.customer_type) },
            { label: t`Country`, value: customer.country ?? '—' },
            {
              label: t`Tax ID`,
              value: [customer.tax_id_type, customer.tax_id].filter(Boolean).join(' · ') || '—',
            },
            { label: t`Created`, value: formatDateTime(customer.created_at) },
            { label: t`KYC`, value: <StatusBadge status={customer.kyc_status} /> },
            { label: t`Status`, value: <StatusBadge status={customer.customer_status} /> },
            { label: t`Customer ID`, value: customer.id, mono: true },
          ]}
        />
        {customer.kyc_link ? (
          <div className="space-y-2 rounded-xl bg-muted/30 p-4" data-testid="customer-kyc-link">
            <p className="text-sm font-medium text-foreground">
              <Trans>Verification link</Trans>
            </p>
            <p className="break-all font-mono text-xs text-muted-foreground">{customer.kyc_link}</p>
            <CopyButton value={customer.kyc_link} label={t`Copy link`} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
