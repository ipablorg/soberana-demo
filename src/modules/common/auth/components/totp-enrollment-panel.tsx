import { QRCodeSVG } from 'qrcode.react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Check, Copy } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';

interface TotpEnrollmentPanelProps {
  otpauthUrl: string;
  accountEmail: string;
  /** Base32 shared secret, shown so users can type it into their app manually. */
  manualKey?: string | null;
}

function truncateMiddle(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const half = Math.floor((maxLength - 1) / 2);
  return `${value.slice(0, half)}…${value.slice(-half)}`;
}

/** Group the secret in blocks of 4 chars so it is easier to read and type. */
function formatManualKey(value: string): string {
  return value.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function TotpEnrollmentPanel({
  otpauthUrl,
  accountEmail,
  manualKey,
}: TotpEnrollmentPanelProps) {
  const { t } = useLingui();
  const link = useCopyToClipboard();
  const key = useCopyToClipboard();
  const isMobile = useMobile();

  return (
    <div className="w-full space-y-4">
      <div
        className="flex justify-center rounded-lg bg-background p-4 ring-1 ring-border"
        aria-label={t`QR code for ${accountEmail}`}
      >
        <QRCodeSVG value={otpauthUrl} size={200} />
      </div>

      <div className="h-px w-full bg-border" />

      <div className="w-full space-y-3 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-sm font-medium text-foreground">
          <Trans>Can&apos;t scan the code?</Trans>
        </p>

        {manualKey ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              <Trans>
                In your authenticator app, choose “Enter a setup key” and type this key:
              </Trans>
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 ring-1 ring-border">
              <code className="min-w-0 flex-1 break-all font-mono text-sm tracking-wider text-foreground">
                {formatManualKey(manualKey)}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void key.copy(manualKey)}
                aria-label={key.copied ? t`Copied` : t`Copy setup key`}
                className="shrink-0 gap-1.5"
              >
                {key.copied ? (
                  <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                )}
                <span className={cn(key.copied && 'text-success')}>
                  {key.copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                </span>
              </Button>
            </div>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          <Trans>
            Or copy this link, open it on your phone, and add the Soberana account to your
            authenticator app.
          </Trans>
        </p>

        <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 ring-1 ring-border">
          <code
            className="min-w-0 flex-1 font-mono text-xs text-muted-foreground"
            title={otpauthUrl}
          >
            {truncateMiddle(otpauthUrl, 48)}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void link.copy(otpauthUrl)}
            aria-label={link.copied ? t`Copied` : t`Copy setup link`}
            className="shrink-0 gap-1.5"
          >
            {link.copied ? (
              <Check className="h-3.5 w-3.5 text-success" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            <span className={cn(link.copied && 'text-success')}>
              {link.copied ? <Trans>Copied</Trans> : <Trans>Copy setup link</Trans>}
            </span>
          </Button>
        </div>

        <span aria-live="polite" className="sr-only">
          {link.copied || key.copied ? t`Copied` : ''}
        </span>

        {isMobile ? (
          <Button variant="outline" className="w-full" asChild>
            <a href={otpauthUrl}>
              <Trans>Open in authenticator app</Trans>
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
