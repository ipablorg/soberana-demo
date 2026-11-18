import { Trans, useLingui } from '@lingui/react/macro';

import { AlertTriangle } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { CopyButton } from '@/modules/suite-tenant/components/atoms/copy-button';

interface ApiKeySecretRevealProps {
  secret: string;
  graceMinutes: number;
  onDone: () => void;
}

/** The new key, shown once: copy it, read the grace warning, then dismiss for good. */
export function ApiKeySecretReveal({ secret, graceMinutes, onDone }: ApiKeySecretRevealProps) {
  const { t } = useLingui();

  return (
    <div
      className="space-y-4 rounded-xl border border-warning/30 bg-warning/10 p-5"
      data-testid="api-key-secret"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {t`Copy your new key now. You won't see it again.`}
          </p>
          <p className="text-sm text-muted-foreground">
            {graceMinutes > 0 ? (
              <Trans>
                The previous key keeps working for {graceMinutes} minutes. Update your integration
                before then.
              </Trans>
            ) : (
              <Trans>The previous key stopped working. Update your integration now.</Trans>
            )}
          </p>
        </div>
      </div>
      <p
        className="break-all rounded-lg bg-background px-3 py-2 font-mono text-sm text-foreground"
        data-testid="api-key-value"
      >
        {secret}
      </p>
      <div className="flex flex-wrap gap-2">
        <CopyButton value={secret} />
        <Button variant="outline" size="sm" onClick={onDone} data-testid="api-key-done">
          <Trans>I saved it</Trans>
        </Button>
      </div>
    </div>
  );
}
