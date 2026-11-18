import { Link, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { useTenantQuote } from '@/modules/suite-tenant/features/quotes/hooks/use-tenant-quotes';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { formatAmount, formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one stored quote (`GET /v1/quotes/:id`). */
export default function QuoteDetail() {
  const { t } = useLingui();
  const { quoteId = '' } = useParams();
  const quote = useTenantQuote(quoteId);
  const data = quote.data?.tenant_getQuote;

  if (quote.isLoading) return <TenantPageSkeleton />;
  if (quote.error || !data)
    return <QueryError error={quote.error} onRetry={() => void quote.refetch()} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={data.pair}
        subtitle={t`Quote.`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={TENANT_ROUTES.quotes}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>Quotes</Trans>
              </span>
            </Link>
          </Button>
        }
      />
      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trans>Rate</Trans>
            <StatusBadge status={data.status} />
          </CardTitle>
          <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
            {formatAmount(data.rate)}
          </p>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              {
                label: t`You send`,
                value: `${formatAmount(data.source.amount)} ${data.source.currency}`,
                mono: true,
              },
              {
                label: t`They receive`,
                value: `${formatAmount(data.destination.amount)} ${data.destination.currency}`,
                mono: true,
              },
              {
                label: t`Fee`,
                value: data.fee ? `${formatAmount(data.fee.total)} ${data.fee.currency}` : '—',
                mono: true,
              },
              { label: t`Expires`, value: formatDateTime(data.expires_at) },
              { label: t`Created`, value: formatDateTime(data.created_at) },
              { label: t`ID`, value: data.id, mono: true },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
