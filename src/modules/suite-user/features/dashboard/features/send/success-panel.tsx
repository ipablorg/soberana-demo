/**
 * SuccessPanel
 *
 * Terminal step of the inline send flow. Under dispersion v2 the
 * submission debits the wallet immediately but the payout is settled
 * manually by operations, so the default frame reports the PENDING
 * state honestly ("En proceso") instead of pretending the money
 * arrived. Only a COMPLETED status from the backend renders the
 * settled frame.
 *
 * Both frames surface the `transaction_id` so the user can copy it
 * for support/reconciliation.
 *
 * Two affordances:
 *   1. "Enviar otro" — resets the flow to `select-beneficiary` via the
 *      DI store, keeping the user inside the flow for a second send.
 *   2. "Cerrar" — dismisses the flow entirely, returning to the idle
 *      dashboard. Same semantic as the in-card X / outside-click /
 *      Escape, exposed as an explicit CTA so the final frame has two
 *      clear paths forward.
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Check, CheckCircle, Clock, Copy } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { cn } from '@/shared/lib/utils';

export interface SuccessPanelProps {
  transactionId: string;
  /** Raw dispersion status from transactions_createDispersion. */
  status?: string | null;
  onSendAnother: () => void;
  onClose?: () => void;
}

export const SuccessPanel: React.FC<SuccessPanelProps> = ({
  transactionId,
  status,
  onSendAnother,
  onClose,
}) => {
  const { t } = useLingui();
  const { copied, copy } = useCopyToClipboard();

  const isSettled = (status ?? 'PENDING').toUpperCase() === 'COMPLETED';

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div
        className={cn(
          'mb-4 flex h-14 w-14 items-center justify-center rounded-full',
          isSettled ? 'bg-success/10' : 'bg-warning/10',
        )}
      >
        {isSettled ? (
          <CheckCircle className="h-7 w-7 text-success" aria-hidden />
        ) : (
          <Clock className="h-7 w-7 text-warning" aria-hidden />
        )}
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground">
        {isSettled ? <Trans>Listo.</Trans> : <Trans>En proceso.</Trans>}
      </h3>
      <p className="mt-2 max-w-[320px] text-sm text-muted-foreground">
        {isSettled ? (
          <Trans>Tu envío está en camino.</Trans>
        ) : (
          <Trans>
            El equipo de operaciones está procesando tu dispersión. Te avisamos
            cuando se complete.
          </Trans>
        )}
      </p>

      {transactionId && (
        <div className="mt-5 w-full rounded-lg border border-border p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
            <Trans>ID de transacción</Trans>
          </p>
          <div className="flex items-center justify-center gap-2">
            <code className="font-mono tabular-nums text-sm text-foreground">
              {transactionId}
            </code>
            <button
              type="button"
              onClick={() => copy(transactionId)}
              aria-label={copied ? t`Copiado` : t`Copiar ID`}
              className={cn(
                'text-muted-foreground',
                'hover:text-foreground',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md',
              )}
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <span className="sr-only" aria-live="polite">
            {copied ? t`Copiado` : ''}
          </span>
        </div>
      )}

      <div className="mt-6 flex w-full gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose} className="flex-1">
            <Trans>Cerrar</Trans>
          </Button>
        )}
        <Button
          variant="gradient"
          onClick={onSendAnother}
          className="flex-1"
        >
          <Trans>Enviar otro</Trans>
        </Button>
      </div>
    </div>
  );
};
