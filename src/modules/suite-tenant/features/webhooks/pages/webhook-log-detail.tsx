import { Link, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { useTenantWebhookLog } from '@/modules/suite-tenant/features/webhooks/hooks/use-tenant-webhooks';
import { KeyValueList } from '@/modules/suite-tenant/components/molecules/key-value-list';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one delivery attempt with the payload sent and the endpoint answer. */
export default function WebhookLogDetail() {
  const { t } = useLingui();
  const { logId = '' } = useParams();
  const log = useTenantWebhookLog(logId);
  const data = log.data?.tenant_webhookLog;

  if (log.isLoading) return <TenantPageSkeleton />;
  if (log.error || !data)
    return <QueryError error={log.error} onRetry={() => void log.refetch()} />;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={data.event_type}
        subtitle={t`Delivery.`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={TENANT_ROUTES.webhookLogs}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>Delivery logs</Trans>
              </span>
            </Link>
          </Button>
        }
      />

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Trans>Attempt {data.attempt}</Trans>
            <Badge
              variant={data.success ? 'success' : 'destructive'}
              className="rounded-md text-xs"
            >
              {data.success ? <Trans>Delivered</Trans> : <Trans>Failed</Trans>}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <KeyValueList
            items={[
              { label: t`Endpoint`, value: data.url, mono: true },
              { label: t`HTTP status`, value: data.http_status ?? '—', mono: true },
              {
                label: t`Duration`,
                value: data.duration_ms === null ? '—' : t`${data.duration_ms} ms`,
                mono: true,
              },
              { label: t`Event ID`, value: data.idempotency_key, mono: true },
              { label: t`Sent`, value: formatDateTime(data.created_at) },
              { label: t`Next retry`, value: formatDateTime(data.next_retry_at) },
              ...(data.error_message ? [{ label: t`Error`, value: data.error_message }] : []),
            ]}
          />
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            <Trans>Payload sent</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre
            className="max-h-96 overflow-auto rounded-lg bg-muted/30 px-3 py-2 font-mono text-xs text-foreground"
            data-testid="webhook-log-payload"
          >
            {JSON.stringify(data.request_payload, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            <Trans>Endpoint answer</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.response_body ? (
            <pre className="max-h-64 overflow-auto rounded-lg bg-muted/30 px-3 py-2 font-mono text-xs text-foreground">
              {data.response_body}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">
              <Trans>No answer body.</Trans>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
