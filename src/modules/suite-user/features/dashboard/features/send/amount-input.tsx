/**
 * AmountInput
 *
 * Step 2 of the inline send flow. Captures the amount in USDC and
 * renders a live exchange-rate preview driven by `useQuoteRate`. The
 * quote is debounced (300ms) so every keystroke doesn't fire a new
 * backend round-trip; amounts shorter than the debounce window never
 * hit the wire.
 *
 * Validation surface:
 *   - Non-numeric input is filtered at the `onChange` layer (regex
 *     `^\d*\.?\d*$`) so state never holds an invalid string.
 *   - `exceedsBalance` flips the input border to destructive and
 *     renders an inline "Saldo insuficiente" hint.
 *   - The continue button is disabled until we have a valid amount.
 *
 * Header:
 *   - A back control ("← Otro beneficiario") returns to step 1 (same
 *     visual grammar as ReceiveFlow's "← Otra moneda").
 *   - A gradient pill shows the selected beneficiary (flag + name +
 *     currency) so the user keeps context while typing.
 */

import * as React from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  DollarSign,
} from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useQuoteRate } from '@/shared/hooks/use-quotes';
import { getCurrencyFlag } from '@/shared/lib/currency-flags';
import { getWalletCurrencyLabel } from '@/shared/lib/receive-wallet';
import { cn } from '@/shared/lib/utils';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

export interface AmountInputProps {
  beneficiary: BeneficiaryResponse;
  /** Selected wallet available balance, as returned by `wallets_getBalance`. */
  availableBalance: string;
  isBalanceLoading: boolean;
  stablecoinLabel?: string | null;
  walletCurrency: string;
  showQuote?: boolean;
  contextHint?: React.ReactNode;
  /** Initial amount; used when the user goes back from review and returns. */
  defaultAmount?: string;
  onBack: () => void;
  onContinue: (amount: string) => void;
}

const formatNumber = (value: string, max = 2): string => {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: max,
  });
};

export const AmountInput: React.FC<AmountInputProps> = ({
  beneficiary,
  availableBalance,
  isBalanceLoading,
  stablecoinLabel,
  walletCurrency,
  showQuote = true,
  contextHint,
  defaultAmount = '',
  onBack,
  onContinue,
}) => {
  const { t } = useLingui();
  const [amount, setAmount] = React.useState(defaultAmount);
  const debouncedAmount = useDebounce(amount, 300);

  const parsedBalance = parseFloat(availableBalance || '0');
  const parsedAmount = parseFloat(amount || '0');
  const isAmountValid = parsedAmount > 0 && parsedAmount <= parsedBalance;
  const exceedsBalance = parsedAmount > parsedBalance && parsedAmount > 0;

  const toCurrency = beneficiary.currency || 'USD';
  const fromCurrencyLabel = getWalletCurrencyLabel(stablecoinLabel) ?? 'saldo digital';

  const quoteInput = React.useMemo(() => {
    const parsed = parseFloat(debouncedAmount || '0');
    if (!(parsed > 0 && parsed <= parsedBalance)) return null;
    return {
      from_currency: walletCurrency,
      to_currency: toCurrency,
      amount: debouncedAmount,
    };
  }, [debouncedAmount, walletCurrency, toCurrency, parsedBalance]);

  const { quote } = useQuoteRate(showQuote ? quoteInput : null);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setAmount(value);
      }
    },
    [],
  );

  const canContinue = isAmountValid;

  const flag = getCurrencyFlag(toCurrency);
  const name = beneficiary.beneficiary_name || '—';

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t`Volver a beneficiarios`}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2',
            'text-xs font-medium text-muted-foreground',
            'hover:bg-muted hover:text-foreground',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          <Trans>Otro beneficiario</Trans>
        </button>
        <span
          className={cn(
            'inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5',
            'bg-brand-gradient text-sm font-semibold text-white',
          )}
        >
          <span aria-hidden role="img" className="text-base leading-none">
            {flag}
          </span>
          <span className="truncate">{name}</span>
          <span className="font-mono tabular-nums text-xs text-white/80">
            {toCurrency}
          </span>
        </span>
      </header>

      <div className="space-y-2">
        <label
          htmlFor="send-amount"
          className="text-sm font-medium text-foreground"
        >
          <Trans>¿Cuánto envías?</Trans>
        </label>
        {contextHint ? (
          <div className="text-xs text-muted-foreground">{contextHint}</div>
        ) : null}
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="send-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleChange}
            className={cn(
              'pl-9 text-right font-mono tabular-nums text-lg',
              exceedsBalance &&
                'border-destructive focus-visible:ring-destructive',
            )}
            aria-invalid={exceedsBalance}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          {isBalanceLoading ? (
            <Skeleton className="h-3 w-32" />
          ) : (
            <span className="text-muted-foreground">
              <Trans>Disponible:</Trans>{' '}
              <span className="font-mono tabular-nums text-foreground">
                {formatNumber(availableBalance, 6)}
              </span>{' '}
              {fromCurrencyLabel}
            </span>
          )}
          {exceedsBalance && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" aria-hidden />
              <Trans>Saldo insuficiente</Trans>
            </span>
          )}
        </div>
      </div>

      {showQuote && !!quote && isAmountValid && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <Trans>Tasa de cambio</Trans>
            </span>
            {quote ? (
              <span className="font-mono tabular-nums text-foreground">
                {`1 ${fromCurrencyLabel} = `}{formatNumber(quote.rate, 4)} {toCurrency}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <Trans>Atrás</Trans>
        </Button>
        <Button
          variant="gradient"
          disabled={!canContinue}
          onClick={() => onContinue(amount)}
          className="flex-1"
        >
          <Trans>Continuar</Trans>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
