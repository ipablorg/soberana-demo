/**
 * ReviewPanel
 *
 * Step 3 of the inline send flow. Shows the final summary (beneficiary
 * chip + "Envías / Tasa") and fires the dispersion mutation
 * (`transactions_createDispersion`) on confirm. The summary is
 * intentionally identical in information to `/suite/send`'s
 * `ConfirmStep` so users who switch between the full page and the
 * inline flow see the same numbers.
 *
 * Dispersion v2 semantics: the submitted amount + currency are
 * source-denominated (wallet currency). The wallet is debited
 * immediately and the dispersion stays PENDING until operations
 * settles the payout — so any rate shown here is indicative only.
 *
 * Island narration:
 *   The parent SendFlow is responsible for the DI state transitions
 *   around the mutation (`sending` / `success` / `error`). This panel
 *   only owns the panel chrome: the summary layout, the destructive
 *   block for mutation errors, and the Atrás/Enviar ahora buttons.
 *
 * Error discipline:
 *   Every mutation failure flows through `mapError()` so the surface
 *   never leaks raw GraphQL internals. The error is rendered inline
 *   inside the panel (not as a toast) because the user is still
 *   committed to this specific action — pushing them to a toast
 *   would scatter attention.
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { AlertCircle, ArrowLeft, Loader2, Send } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { useQuoteRate } from '@/shared/hooks/use-quotes';
import { useIndicativeRate } from '@/shared/hooks/use-indicative-rate';
import { useCreateDispersion } from '@/shared/hooks/use-create-dispersion';
import { getCurrencyFlag } from '@/shared/lib/currency-flags';
import { mapError } from '@/shared/lib/error-mapper';
import { getIdempotencyErrorKind, useConfirmIntentKey } from '@/shared/lib/idempotency-key';
import { isLoopayXNoQuoteOutboundRail } from '@/shared/lib/loopayx-send-rails';
import { getLoopayXReferenceOnlyDisplay } from '@/shared/lib/loopayx-reference-only';
import { getWalletCurrencyLabel } from '@/shared/lib/receive-wallet';
import { cn } from '@/shared/lib/utils';
import {
  useIsViewingAs,
  ViewAsReadOnlyNote,
} from '@/shared/components/common/view-as-read-only-note';
import { getBeneficiaryRailCode, type BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

export interface ReviewPanelProps {
  beneficiary: BeneficiaryResponse;
  amount: string;
  walletId: string;
  stablecoinLabel?: string | null;
  walletCurrency: string;
  onBack: () => void;
  onSubmitStart: () => void;
  onSuccess: (transactionId: string, status: string) => void;
  onError: (message: string) => void;
}

const formatNumber = (value: string, max = 2): string => {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: max,
  });
};

const VIEW_AS_NOTE_ID = 'dashboard-send-view-as-read-only';

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  beneficiary,
  amount,
  walletId,
  stablecoinLabel,
  walletCurrency,
  onBack,
  onSubmitStart,
  onSuccess,
  onError,
}) => {
  const { t } = useLingui();
  const toCurrency = beneficiary.currency || 'USD';
  const fromCurrencyLabel = getWalletCurrencyLabel(stablecoinLabel) ?? 'saldo digital';
  const isNoQuoteOutbound = isLoopayXNoQuoteOutboundRail(beneficiary);

  const quoteInput = React.useMemo(() => {
    const parsed = parseFloat(amount || '0');
    if (!amount || Number.isNaN(parsed) || parsed <= 0) return null;
    return { from_currency: walletCurrency, to_currency: toCurrency, amount };
  }, [amount, walletCurrency, toCurrency]);

  const { quote } = useQuoteRate(isNoQuoteOutbound ? null : quoteInput);
  const shouldFetchIndicativeRate = isNoQuoteOutbound && toCurrency.toUpperCase() === 'COP';
  const { rate: referenceRate } = useIndicativeRate(
    shouldFetchIndicativeRate
      ? {
          fromCurrency: walletCurrency,
          toCurrency,
        }
      : null
  );
  const referenceOnlyDisplay = getLoopayXReferenceOnlyDisplay({
    railCode: getBeneficiaryRailCode(beneficiary),
    amount,
    indicativeRate: referenceRate,
  });

  const createDispersion = useCreateDispersion();
  // One idempotency key per intent: reused on every retry, rotated on success,
  // on IDEMPOTENCY_KEY_REUSED, or when wallet/beneficiary/currency/amount change.
  const intentKey = useConfirmIntentKey(
    [walletId, beneficiary.id, walletCurrency, amount].join('|')
  );
  const [localError, setLocalError] = React.useState<string | null>(null);

  const isPending = createDispersion.isPending;
  const isViewingAs = useIsViewingAs();
  const flag = getCurrencyFlag(toCurrency);
  const name = beneficiary.beneficiary_name || '—';

  const handleConfirm = async () => {
    setLocalError(null);
    onSubmitStart();
    try {
      // Dispersion v2 contract: amount + currency are SOURCE-denominated
      // (the wallet currency). The payout estimate is decided by
      // operations later — any quote shown above is indicative only.
      const result = await createDispersion.mutateAsync({
        input: {
          wallet_id: walletId,
          beneficiary_id: beneficiary.id,
          currency: walletCurrency,
          amount,
          client_reference_id: intentKey.getKey(),
        },
      });
      intentKey.rotate();
      const dispersion = result.transactions_createDispersion;
      onSuccess(dispersion.transaction_id, dispersion.status);
    } catch (err) {
      // 409 IDEMPOTENCY_KEY_REUSED: the key is bound to another payload, so a
      // retry needs a new one. 503 PROVIDER_OUTCOME_UNKNOWN keeps the key so
      // the retry replays the original attempt instead of double-spending.
      if (getIdempotencyErrorKind(err) === 'KEY_REUSED') intentKey.rotate();
      const mapped = mapError(err);
      setLocalError(mapped.message);
      onError(mapped.message);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t`Volver al monto`}
          disabled={isPending}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2',
            'text-xs font-medium text-muted-foreground',
            'hover:bg-muted hover:text-foreground',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:pointer-events-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          <Trans>Editar monto</Trans>
        </button>
        <span
          className={cn(
            'inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5',
            'bg-brand-gradient text-sm font-semibold text-white'
          )}
        >
          <span aria-hidden role="img" className="text-base leading-none">
            {flag}
          </span>
          <span className="truncate">{name}</span>
          <span className="font-mono tabular-nums text-xs text-white/80">{toCurrency}</span>
        </span>
      </header>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            <Trans>Envías</Trans>
          </span>
          <span className="font-mono tabular-nums font-medium text-foreground">
            {formatNumber(amount, 6)} {fromCurrencyLabel}
          </span>
        </div>
        {!isNoQuoteOutbound && quote ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <Trans>Tasa de cambio</Trans>
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {`1 ${fromCurrencyLabel} = `}
                {formatNumber(quote.rate, 4)} {toCurrency}
              </span>
            </div>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Trans>
                Tasa referencial. La tasa final se define cuando operaciones procese tu dispersión.
              </Trans>
            </div>
          </>
        ) : null}
        {isNoQuoteOutbound && referenceOnlyDisplay ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                <Trans>Reference rate</Trans>
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {`1 ${fromCurrencyLabel} = `}
                {referenceOnlyDisplay.rate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                {toCurrency}
              </span>
            </div>
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <Trans>
                Reference rate only. The final payout follows provider execution conditions at
                processing time.
              </Trans>
            </div>
          </>
        ) : isNoQuoteOutbound ? (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <Trans>
              Reference rate only. The final payout follows provider execution conditions at
              processing time.
            </Trans>
          </div>
        ) : null}
      </div>

      {localError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>{localError}</span>
        </div>
      )}

      <ViewAsReadOnlyNote id={VIEW_AS_NOTE_ID} action="send" />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isPending} className="flex-1">
          <ArrowLeft className="h-4 w-4" />
          <Trans>Atrás</Trans>
        </Button>
        <Button
          variant="gradient"
          disabled={isPending || isViewingAs}
          aria-describedby={isViewingAs ? VIEW_AS_NOTE_ID : undefined}
          onClick={handleConfirm}
          className="flex-1"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {isPending ? <Trans>Enviando…</Trans> : <Trans>Enviar ahora</Trans>}
        </Button>
      </div>
    </div>
  );
};
