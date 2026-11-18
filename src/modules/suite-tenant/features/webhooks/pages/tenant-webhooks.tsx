import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantWebhook, TenantWebhookTestResult } from '@/graphql/types/tenant';
import { FileText, Send } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { WebhookForm } from '@/modules/suite-tenant/features/webhooks/components/webhook-form';
import { WebhookSecretReveal } from '@/modules/suite-tenant/features/webhooks/components/webhook-secret-reveal';
import { WebhookTestResultCard } from '@/modules/suite-tenant/features/webhooks/components/webhook-test-result';
import { WebhooksList } from '@/modules/suite-tenant/features/webhooks/components/webhooks-list';
import {
  useCreateTenantWebhook,
  useDeleteTenantWebhook,
  useTenantWebhookEventTypes,
  useTenantWebhooks,
  useTestTenantWebhook,
  useUpdateTenantWebhook,
} from '@/modules/suite-tenant/features/webhooks/hooks/use-tenant-webhooks';
import {
  EMPTY_WEBHOOK_FORM,
  toCreateWebhookInput,
  toUpdateWebhookInput,
  webhookFormOf,
  type WebhookFormValues,
} from '@/modules/suite-tenant/features/webhooks/lib/webhook-form';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';

/**
 * Container: the client's webhook endpoints. Create (the signing secret is
 * shown once and then forgotten), edit, pause, delete behind a confirmation,
 * and a test delivery to the first active endpoint.
 */
export default function TenantWebhooks() {
  const { t } = useLingui();
  const webhooks = useTenantWebhooks();
  const eventTypes = useTenantWebhookEventTypes();
  const [editing, setEditing] = useState<TenantWebhook | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [secret, setSecret] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TenantWebhookTestResult | null>(null);

  const resetForm = () => {
    setEditing(null);
    setFormKey((key) => key + 1);
  };

  const create = useCreateTenantWebhook((result) => {
    // Kept in component state only; dismissing it drops the last copy.
    setSecret(result.tenant_createWebhook.secret ?? null);
    resetForm();
  });
  const update = useUpdateTenantWebhook(() => resetForm());
  const remove = useDeleteTenantWebhook();
  const test = useTestTenantWebhook((result) => setTestResult(result.tenant_testWebhook));

  if (webhooks.isLoading) return <TenantPageSkeleton />;
  if (webhooks.error || !webhooks.data) {
    return <QueryError error={webhooks.error} onRetry={() => void webhooks.refetch()} />;
  }

  const list = webhooks.data.tenant_listWebhooks;
  const submit = (values: WebhookFormValues) => {
    if (editing) update.mutate({ id: editing.id, input: toUpdateWebhookInput(values) });
    else create.mutate({ input: toCreateWebhookInput(values) });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Webhooks.`}
        subtitle={t`Hear about every change the moment it happens.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={TENANT_ROUTES.webhookLogs}>
                <FileText className="h-4 w-4" />
                <span className="ml-1.5">
                  <Trans>Delivery logs</Trans>
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              disabled={test.isPending || !list.some((webhook) => webhook.isActive)}
              data-testid="test-webhook"
              onClick={() => {
                setTestResult(null);
                test.mutate({});
              }}
            >
              <Send className="h-4 w-4" />
              <span className="ml-1.5">
                {test.isPending ? <Trans>Sending…</Trans> : <Trans>Send test event</Trans>}
              </span>
            </Button>
          </div>
        }
      />

      {secret ? <WebhookSecretReveal secret={secret} onDone={() => setSecret(null)} /> : null}
      {testResult ? <WebhookTestResultCard result={testResult} /> : null}

      {list.length === 0 ? (
        <EmptyState
          title={t`No webhooks yet.`}
          description={t`Add an endpoint below to start receiving events.`}
        />
      ) : (
        <WebhooksList
          webhooks={list}
          busy={remove.isPending || update.isPending}
          onEdit={(webhook) => {
            setEditing(webhook);
            setFormKey((key) => key + 1);
          }}
          onDelete={(webhook) => {
            if (editing?.id === webhook.id) resetForm();
            remove.mutate({ id: webhook.id });
          }}
        />
      )}

      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {editing ? <Trans>Edit webhook</Trans> : <Trans>New webhook</Trans>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WebhookForm
            key={formKey}
            initial={editing ? webhookFormOf(editing) : EMPTY_WEBHOOK_FORM}
            editing={editing !== null}
            eventTypes={eventTypes.data?.tenant_webhookEventTypes ?? []}
            pending={create.isPending || update.isPending}
            onSubmit={submit}
            onCancel={editing ? resetForm : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
