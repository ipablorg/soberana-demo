import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantWebhook } from '@/graphql/types/tenant';
import { Edit, Trash2 } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ConfirmAction } from '@/modules/suite-tenant/components/molecules/confirm-action';
import { formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface WebhooksListProps {
  webhooks: readonly TenantWebhook[];
  busy: boolean;
  onEdit: (webhook: TenantWebhook) => void;
  onDelete: (webhook: TenantWebhook) => void;
}

/** Webhook configurations: endpoint, label, events, state and masked secret; delete asks first. */
export function WebhooksList({ webhooks, busy, onEdit, onDelete }: WebhooksListProps) {
  const { t } = useLingui();

  return (
    <ul
      className="divide-y divide-border rounded-xl border border-border bg-card"
      data-testid="webhooks-list"
    >
      {webhooks.map((webhook) => (
        <li
          key={webhook.id}
          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <p className="break-all font-mono text-sm text-foreground">{webhook.url}</p>
            <p className="text-xs text-muted-foreground">
              {webhook.description ? `${webhook.description} · ` : ''}
              <Trans>Secret {webhook.secretLastChars}</Trans> ·{' '}
              <Trans>Since {formatDateTime(webhook.createdAt)}</Trans>
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Badge
                variant={webhook.isActive ? 'success' : 'secondary'}
                className="rounded-md text-xs"
              >
                {webhook.isActive ? <Trans>Active</Trans> : <Trans>Paused</Trans>}
              </Badge>
              {webhook.events.length === 0 ? (
                <Badge variant="secondary" className="rounded-md text-xs">
                  <Trans>All events</Trans>
                </Badge>
              ) : (
                webhook.events.map((event) => (
                  <Badge key={event} variant="secondary" className="rounded-md font-mono text-xs">
                    {event}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              data-testid={`edit-webhook-${webhook.id}`}
              onClick={() => onEdit(webhook)}
            >
              <Edit className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>Edit</Trans>
              </span>
            </Button>
            <ConfirmAction
              testId={`delete-webhook-${webhook.id}`}
              icon={Trash2}
              label={t`Delete`}
              title={t`Delete this webhook?`}
              description={t`Events stop reaching ${webhook.url}. Its delivery logs stay.`}
              confirmLabel={t`Delete webhook`}
              disabled={busy}
              onConfirm={() => onDelete(webhook)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
