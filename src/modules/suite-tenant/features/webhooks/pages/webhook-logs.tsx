import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { WebhookLogsTable } from '@/modules/suite-tenant/features/webhooks/components/webhook-logs-table';
import {
  useTenantWebhookEventTypes,
  useTenantWebhookLogs,
} from '@/modules/suite-tenant/features/webhooks/hooks/use-tenant-webhooks';
import {
  toWebhookLogFilters,
  type DeliveryResultFilter,
} from '@/modules/suite-tenant/features/webhooks/lib/webhook-form';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import { PageControls } from '@/modules/suite-tenant/components/molecules/page-controls';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';

/** Container: webhook delivery attempts, filtered by result (a real boolean) and event type. */
export default function WebhookLogs() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<DeliveryResultFilter>('');
  const [eventType, setEventType] = useState('');
  const logs = useTenantWebhookLogs(toWebhookLogFilters(page, result, eventType));
  const eventTypes = useTenantWebhookEventTypes();

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Delivery logs.`}
        subtitle={t`Every event we sent and what your endpoint answered.`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link to={TENANT_ROUTES.webhooks}>
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>Webhooks</Trans>
              </span>
            </Link>
          </Button>
        }
      />

      <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="logs-success" label={t`Result`}>
          <NativeSelect
            id="logs-success"
            value={result}
            placeholder={t`All results`}
            options={[
              { value: 'true', label: t`Delivered` },
              { value: 'false', label: t`Failed` },
            ]}
            onChange={(event) => {
              setResult(event.target.value as DeliveryResultFilter);
              setPage(1);
            }}
          />
        </FormField>
        <FormField id="logs-event" label={t`Event`}>
          <NativeSelect
            id="logs-event"
            value={eventType}
            placeholder={t`All events`}
            options={(eventTypes.data?.tenant_webhookEventTypes ?? []).map((type) => ({
              value: type.event,
              label: type.event,
            }))}
            onChange={(event) => {
              setEventType(event.target.value);
              setPage(1);
            }}
          />
        </FormField>
      </div>

      {logs.isLoading ? (
        <TenantPageSkeleton />
      ) : logs.error || !logs.data ? (
        <QueryError error={logs.error} onRetry={() => void logs.refetch()} />
      ) : logs.data.tenant_webhookLogs.data.length === 0 ? (
        <EmptyState title={t`No deliveries here.`} description={t`Send a test event to see one.`} />
      ) : (
        <>
          <WebhookLogsTable logs={logs.data.tenant_webhookLogs.data} />
          <PageControls
            page={logs.data.tenant_webhookLogs.page}
            totalPages={logs.data.tenant_webhookLogs.total_pages}
            total={logs.data.tenant_webhookLogs.total}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
