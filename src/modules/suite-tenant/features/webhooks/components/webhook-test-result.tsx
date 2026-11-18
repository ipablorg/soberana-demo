import { Trans } from '@lingui/react/macro';

import type { TenantWebhookTestResult } from '@/graphql/types/tenant';
import { CheckCircle, XCircle } from '@/shared/components/animated-icons';

interface WebhookTestResultProps {
  result: TenantWebhookTestResult;
}

/** Outcome of a `webhook.test` delivery: status, time and what the endpoint answered. */
export function WebhookTestResultCard({ result }: WebhookTestResultProps) {
  const duration = result.duration_ms;

  return (
    <div
      className="space-y-2 rounded-xl bg-muted/30 px-4 py-3"
      role="status"
      data-testid="webhook-test-result"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {result.success ? (
          <CheckCircle className="h-4 w-4 text-success" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        {result.success ? <Trans>Delivered</Trans> : <Trans>Not delivered</Trans>}
        <span className="font-mono text-xs font-normal tabular-nums text-muted-foreground">
          HTTP {result.http_status ?? '—'} · <Trans>{duration} ms</Trans>
        </span>
      </p>
      {result.error_message ? (
        <p className="text-xs text-destructive">{result.error_message}</p>
      ) : null}
      {result.response_body ? (
        <pre className="max-h-40 overflow-auto rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
          {result.response_body}
        </pre>
      ) : null}
    </div>
  );
}
