import { Trans, useLingui } from '@lingui/react/macro';

import { AlertTriangle } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { CopyButton } from '@/modules/suite-tenant/components/atoms/copy-button';

interface WebhookSecretRevealProps {
  secret: string;
  onDone: () => void;
}

/** The signing secret of a new webhook, shown once: copy it, then dismiss for good. */
export function WebhookSecretReveal({ secret, onDone }: WebhookSecretRevealProps) {
  const { t } = useLingui();

  return (
    <div
      className="space-y-4 rounded-xl border border-warning/30 bg-warning/10 p-5"
      data-testid="webhook-secret"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {t`Copy the signing secret now. You won't see it again.`}
          </p>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Use it to verify that each event comes from Soberana. To change it, delete the webhook
              and create it again.
            </Trans>
          </p>
        </div>
      </div>
      <p
        className="break-all rounded-lg bg-background px-3 py-2 font-mono text-sm text-foreground"
        data-testid="webhook-secret-value"
      >
        {secret}
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyButton value={secret} />
        <Button variant="outline" size="sm" onClick={onDone} data-testid="webhook-secret-done">
          <Trans>I saved it</Trans>
        </Button>
      </div>
    </div>
  );
}
