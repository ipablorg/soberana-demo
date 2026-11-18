import { selectIsViewingAs, useViewAsStore } from '@/shared/stores/view-as-store';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { mapError } from '@/shared/lib/error-mapper';
import { getIdempotencyErrorKind, useConfirmIntentKey } from '@/shared/lib/idempotency-key';
import { useAuth } from '@/shared/hooks/use-auth';
import { useBeneficiaries } from '@/shared/hooks/use-beneficiaries';
import { useRailCatalogue } from '@/modules/suite-user/features/beneficiaries/hooks/use-rail-catalogue';
import { isBeneficiarySelectable } from '@/modules/suite-user/features/beneficiaries/lib/beneficiary-review';
import { getBeneficiaryRailCode, type BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { useWalletBalance } from '@/shared/hooks/use-wallet-balance';
import { useQuoteRate } from '@/shared/hooks/use-quotes';
import { useCreateDispersion } from '@/shared/hooks/use-create-dispersion';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useActiveWallet } from '@/shared/hooks/use-active-wallet';
import { useIndicativeRate } from '@/shared/hooks/use-indicative-rate';
import {
  getWalletCurrencyLabel,
  getWalletPairLabel,
  resolveWalletSelection,
} from '@/shared/lib/receive-wallet';
import { getLoopayXReferenceOnlyDisplay } from '@/shared/lib/loopayx-reference-only';
import { isLoopayXNoQuoteOutboundRail } from '@/shared/lib/loopayx-send-rails';
import { WalletSwitcher } from '@/shared/components/wallet-switcher';

import { SendDestinationPicker } from '../components/send-destination-picker';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Copy,
  DollarSign,
  Landmark,
  Send,
  Timer,
  User,
  AlertCircle,
  Loader2,
} from '@/shared/components/animated-icons';

type SendBeneficiary = Pick<
  BeneficiaryResponse,
  | 'id'
  | 'customer_id'
  | 'beneficiary_name'
  | 'payment_rail'
  | 'rail'
  | 'bank_name'
  | 'account_number'
  | 'currency'
  | 'verification_status'
> & {
  /** Provider review (IN_REVIEW | APPROVED | REJECTED); only APPROVED can be sent to. */
  review_status?: string | null;
  review_reason?: string | null;
  country?: string | null;
};

const STEP_ANIMATION = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2, ease: 'easeOut' } as const,
};

function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors duration-150',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive && 'bg-primary text-primary-foreground',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-xs whitespace-nowrap',
                  isActive || isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {labels[i]}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  'mx-2 h-px w-10 sm:w-16 -translate-y-2.5',
                  step < currentStep ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BeneficiaryStep({
  beneficiaries,
  isLoading,
  isWalletReady,
  hasVisibleWallets,
  onSelect,
}: {
  beneficiaries: SendBeneficiary[];
  isLoading: boolean;
  isWalletReady: boolean;
  hasVisibleWallets: boolean;
  onSelect: (b: SendBeneficiary) => void;
}) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const catalogue = useRailCatalogue();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (!isWalletReady) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">
          {hasVisibleWallets
            ? t`No pudimos resolver una wallet principal válida.`
            : t`Tu wallet principal aún no está lista.`}
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {hasVisibleWallets
            ? t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`
            : t`Cuando terminemos de configurarla vas a poder enviar desde esa wallet, sin inventar una source distinta.`}
        </p>
      </div>
    );
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-foreground font-medium">{t`Primero, dinos a quién le envías.`}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t`Guarda un beneficiario para empezar.`}
        </p>
        <Button
          variant="gradient"
          className="mt-4"
          onClick={() => navigate('/suite/beneficiaries')}
        >
          {t`Agregar beneficiario`}
        </Button>
      </div>
    );
  }

  return (
    <SendDestinationPicker
      beneficiaries={beneficiaries}
      catalogue={catalogue.data}
      catalogueLoading={catalogue.isLoading}
      catalogueError={Boolean(catalogue.error)}
      onSelect={onSelect}
      onAddBeneficiary={() => navigate('/suite/beneficiaries')}
    />
  );
}

function AmountStep({
  beneficiary,
  walletId,
  walletCurrency,
  showQuote = true,
  contextHint,
  onBack,
  onContinue,
}: {
  beneficiary: SendBeneficiary;
  walletId: string;
  walletCurrency: string;
  showQuote?: boolean;
  contextHint?: string;
  onBack: () => void;
  onContinue: (amount: string) => void;
}) {
  const { t } = useLingui();
  const [amount, setAmount] = useState('');
  const debouncedAmount = useDebounce(amount, 300);
  const { balance, isLoading: balanceLoading } = useWalletBalance(walletId);
  const stablecoinLabel = getWalletCurrencyLabel(walletCurrency) ?? 'saldo digital';

  const availableBalance = balance?.spendable_balance ?? '0';
  const parsedBalance = parseFloat(availableBalance);
  const parsedAmount = parseFloat(amount || '0');
  const isAmountValid = parsedAmount > 0 && parsedAmount <= parsedBalance;

  const parsedAmountForQuote = parseFloat(debouncedAmount || '0');
  const isAmountValidForQuote = parsedAmountForQuote > 0 && parsedAmountForQuote <= parsedBalance;

  const toCurrency = beneficiary.currency || 'USD';

  const quoteInput = useMemo(() => {
    if (!isAmountValidForQuote) return null;
    return {
      from_currency: walletCurrency,
      to_currency: toCurrency,
      amount: debouncedAmount,
    };
  }, [isAmountValidForQuote, walletCurrency, toCurrency, debouncedAmount]);

  const { quote } = useQuoteRate(showQuote ? quoteInput : null);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  }, []);

  const exceedsBalance = parsedAmount > parsedBalance && parsedAmount > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{t`¿Cuánto envías?`}</label>
        {contextHint ? <p className="text-xs text-muted-foreground">{contextHint}</p> : null}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className={cn(
              'pl-9 font-mono tabular-nums text-right text-lg',
              exceedsBalance && 'border-destructive focus-visible:ring-destructive'
            )}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          {balanceLoading ? (
            <Skeleton className="h-3 w-32" />
          ) : (
            <span className="text-muted-foreground">
              {t`Disponible:`}{' '}
              <span className="font-mono tabular-nums text-foreground">
                {parseFloat(availableBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </span>
              {` ${stablecoinLabel}`}
            </span>
          )}
          {exceedsBalance && (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {t`Saldo insuficiente`}
            </span>
          )}
        </div>
      </div>

      {showQuote && !!quote && isAmountValid && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t`Tasa de cambio`}</span>
              {quote ? (
                <span className="font-mono tabular-nums text-foreground">
                  {`1 ${stablecoinLabel} = `}
                  {parseFloat(quote.rate).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{' '}
                  {toCurrency}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="h-4 w-4" />
          {t`Atrás`}
        </Button>
        <Button
          variant="gradient"
          disabled={!isAmountValid}
          onClick={() => onContinue(amount)}
          className="flex-1"
        >
          {t`Continuar`}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ConfirmStep({
  beneficiary,
  amount,
  walletId,
  walletCurrency,
  isNoQuoteOutbound,
  onBack,
  onSuccess,
}: {
  beneficiary: SendBeneficiary;
  amount: string;
  walletId: string;
  walletCurrency: string;
  isNoQuoteOutbound: boolean;
  onBack: () => void;
  onSuccess: (transactionId: string, status: string) => void;
}) {
  const { t } = useLingui();
  const isViewingAs = useViewAsStore(selectIsViewingAs);
  const toCurrency = beneficiary.currency || 'USD';
  const stablecoinLabel = getWalletCurrencyLabel(walletCurrency) ?? 'saldo digital';

  const quoteInput = useMemo(() => {
    const parsed = parseFloat(amount || '0');
    if (!amount || Number.isNaN(parsed) || parsed <= 0) return null;
    return {
      from_currency: walletCurrency,
      to_currency: toCurrency,
      amount,
    };
  }, [walletCurrency, toCurrency, amount]);

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
  const railCode = getBeneficiaryRailCode(beneficiary);
  const referenceOnlyDisplay = getLoopayXReferenceOnlyDisplay({
    railCode,
    amount,
    indicativeRate: referenceRate,
  });
  const createDispersion = useCreateDispersion();
  // One idempotency key per intent: reused on every retry, rotated on success,
  // on IDEMPOTENCY_KEY_REUSED, or when wallet/beneficiary/currency/amount change.
  const intentKey = useConfirmIntentKey(
    [walletId, beneficiary.id, walletCurrency, amount].join('|')
  );
  const [error, setError] = useState<string | null>(null);

  const isPending = createDispersion.isPending;
  const displayName = beneficiary.beneficiary_name || '—';

  const handleConfirm = useCallback(async () => {
    setError(null);
    try {
      // Dispersion v2 contract: source-denominated amount + currency
      // (the wallet currency); the payout is settled by operations.
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

      onSuccess(
        result.transactions_createDispersion.transaction_id,
        result.transactions_createDispersion.status
      );
    } catch (err) {
      // 409 IDEMPOTENCY_KEY_REUSED: new key for the next attempt. 503
      // PROVIDER_OUTCOME_UNKNOWN keeps the key so a retry replays the original.
      if (getIdempotencyErrorKind(err) === 'KEY_REUSED') intentKey.rotate();
      const mapped = mapError(err);
      setError(mapped.message);
    }
  }, [amount, beneficiary.id, walletId, createDispersion, onSuccess, walletCurrency, intentKey]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {beneficiary.bank_name || t`Cuenta bancaria`}
              {railCode && (
                <Badge variant="outline" className="inline-flex ml-1">
                  {railCode.toUpperCase()}
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t`Envías`}</span>
            <span className="font-mono tabular-nums font-medium text-foreground">
              {parseFloat(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}{' '}
              {stablecoinLabel}
            </span>
          </div>
          {!isNoQuoteOutbound && quote ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t`Tasa de cambio`}</span>
              <span className="font-mono tabular-nums text-foreground">
                {`1 ${stablecoinLabel} = `}
                {parseFloat(quote.rate).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                {toCurrency}
              </span>
            </div>
          ) : null}
          {isNoQuoteOutbound && referenceOnlyDisplay ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t`Reference rate`}</span>
                <span className="font-mono tabular-nums text-foreground">
                  {`1 ${stablecoinLabel} = `}
                  {referenceOnlyDisplay.rate.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}{' '}
                  {toCurrency}
                </span>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {t`Reference rate only. The final payout follows provider execution conditions at processing time.`}
              </div>
            </>
          ) : isNoQuoteOutbound ? (
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {t`Reference rate only. The final payout follows provider execution conditions at processing time.`}
            </div>
          ) : null}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isViewingAs && (
        <p id="send-view-as-read-only" className="text-sm text-muted-foreground">
          {t`Solo lectura: estás viendo la app como este cliente, no puedes enviar dinero.`}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={isPending} className="flex-1">
          <ArrowLeft className="h-4 w-4" />
          {t`Atrás`}
        </Button>
        <Button
          variant="gradient"
          disabled={isPending || isViewingAs}
          aria-describedby={isViewingAs ? 'send-view-as-read-only' : undefined}
          onClick={handleConfirm}
          className="flex-1"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isPending ? t`Enviando...` : t`Enviar ahora`}
        </Button>
      </div>
    </div>
  );
}

function SuccessView({
  transactionId,
  status,
  onNewSend,
}: {
  transactionId: string;
  status?: string | null;
  onNewSend: () => void;
}) {
  const { t } = useLingui();
  const [copied, setCopied] = useState(false);

  // Dispersion v2: the wallet was debited but the payout is settled by
  // operations — only a COMPLETED status earns the settled frame.
  const isSettled = (status ?? 'PENDING').toUpperCase() === 'COMPLETED';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [transactionId]);

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <div
        className={cn(
          'mb-6 flex h-16 w-16 items-center justify-center rounded-full',
          isSettled ? 'bg-success/10' : 'bg-warning/10'
        )}
      >
        {isSettled ? (
          <CheckCircle className="h-8 w-8 text-success" />
        ) : (
          <Timer className="h-8 w-8 text-warning" />
        )}
      </div>
      <h3 className="text-xl font-heading font-semibold text-foreground">
        {isSettled ? t`Listo.` : t`En proceso.`}
      </h3>
      <p className="mt-2 max-w-[320px] text-sm text-muted-foreground">
        {isSettled
          ? t`Tu envío está en camino.`
          : t`El equipo de operaciones está procesando tu dispersión. Te avisamos cuando se complete.`}
      </p>
      <div className="mt-6 w-full rounded-lg border border-border p-4">
        <p className="text-xs text-muted-foreground mb-1">{t`ID de transacción`}</p>
        <div className="flex items-center justify-center gap-2">
          <code className="font-mono tabular-nums text-sm text-foreground">{transactionId}</code>
          <button
            type="button"
            onClick={handleCopy}
            className="text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button variant="outline" onClick={onNewSend} className="mt-6">
        {t`Enviar otro`}
      </Button>
    </div>
  );
}

export default function SendPage() {
  const { t } = useLingui();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<SendBeneficiary | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  const { beneficiaries, isLoading: beneficiariesLoading } = useBeneficiaries();
  const {
    wallets,
    defaultWallet,
    activeWallet,
    selectedWalletId,
    setSelectedWalletId,
    isLoading: walletsLoading,
  } = useActiveWallet();

  const walletSelection = useMemo(
    () => resolveWalletSelection(wallets, defaultWallet),
    [wallets, defaultWallet]
  );
  const stableWallet = activeWallet ?? walletSelection.mainWallet;
  const secondaryWallet = walletSelection.secondaryWallets[0];
  const secondaryWalletCount = walletSelection.secondaryWallets.length;
  const hasVisibleWallets = wallets.length > 0;
  const walletId = stableWallet?.id;
  const stablecoinLabel = getWalletCurrencyLabel(stableWallet?.currency) ?? 'saldo digital';
  const walletCurrency = stableWallet?.currency ?? '';

  useEffect(() => {
    if (step <= 1 || walletId) {
      return;
    }

    setStep(1);
    setSelectedBeneficiary(null);
    setAmount('');
  }, [step, walletId]);

  const stepLabels = [t`A quién`, t`Cuánto`, t`Revisar`];
  const isNoQuoteOutbound = isLoopayXNoQuoteOutboundRail(selectedBeneficiary);

  const handleSelectBeneficiary = useCallback(
    (b: SendBeneficiary) => {
      // Defence in depth: the picker already disables these rows, and the back
      // refuses them with BENEFICIARY_NOT_APPROVED.
      if (!walletId || !isBeneficiarySelectable(b)) {
        return;
      }

      setSelectedBeneficiary(b);
      setStep(2);
    },
    [walletId]
  );

  const handleAmountContinue = useCallback((value: string) => {
    setAmount(value);
    setStep(3);
  }, []);

  const handleSuccess = useCallback((txId: string, status: string) => {
    setTransactionId(txId);
    setTransactionStatus(status);
  }, []);

  const handleNewSend = useCallback(() => {
    setStep(1);
    setSelectedBeneficiary(null);
    setAmount('');
    setTransactionId(null);
    setTransactionStatus(null);
  }, []);

  if (!user) return null;

  if (transactionId) {
    return (
      <div className="mx-auto max-w-lg py-8 px-4">
        <Card>
          <CardContent className="p-6">
            <SuccessView
              transactionId={transactionId}
              status={transactionStatus}
              onNewSend={handleNewSend}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-heading font-semibold text-foreground">
          <span className="font-semibold text-foreground">{t`Enviar.`}</span>{' '}
          <span className="font-normal text-muted-foreground">{t`Tres pasos. Listo.`}</span>
        </h1>
        {stableWallet && secondaryWallet && (
          <p className="mt-2 text-sm text-muted-foreground">
            {secondaryWalletCount === 1
              ? t`Tu wallet principal es ${getWalletPairLabel(stableWallet) ?? stablecoinLabel}. Algunos rails pueden operar sobre ${getWalletPairLabel(secondaryWallet) ?? secondaryWallet.currency}; cuando aplica, el saldo se sweepea a la principal desde 5 USDC.`
              : t`Tu wallet principal es ${getWalletPairLabel(stableWallet) ?? stablecoinLabel}. Algunos rails pueden operar sobre wallets secundarias; cuando aplica, el saldo se sweepea a la principal desde 5 USDC.`}
          </p>
        )}
        <div className="mt-3 flex justify-center">
          <WalletSwitcher
            wallets={wallets}
            mainWalletId={walletSelection.mainWallet?.id ?? null}
            selectedWalletId={selectedWalletId}
            onSelect={setSelectedWalletId}
            className="justify-center"
          />
        </div>
      </div>

      <StepIndicator currentStep={step} totalSteps={3} labels={stepLabels} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {step === 1 && t`¿A quién le envías?`}
            {step === 2 && t`¿Cuánto?`}
            {step === 3 && t`Revisa y envía.`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletsLoading && step > 1 ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step-1" {...STEP_ANIMATION}>
                  <BeneficiaryStep
                    beneficiaries={beneficiaries as SendBeneficiary[]}
                    isLoading={beneficiariesLoading}
                    isWalletReady={!!walletId}
                    hasVisibleWallets={hasVisibleWallets}
                    onSelect={handleSelectBeneficiary}
                  />
                </motion.div>
              )}
              {step === 2 && selectedBeneficiary && walletId && (
                <motion.div key="step-2" {...STEP_ANIMATION}>
                  <AmountStep
                    beneficiary={selectedBeneficiary}
                    walletId={walletId}
                    walletCurrency={walletCurrency}
                    showQuote={!isNoQuoteOutbound}
                    onBack={() => setStep(1)}
                    onContinue={handleAmountContinue}
                  />
                </motion.div>
              )}
              {step === 3 && selectedBeneficiary && walletId && (
                <motion.div key="step-3" {...STEP_ANIMATION}>
                  <ConfirmStep
                    beneficiary={selectedBeneficiary}
                    amount={amount}
                    walletId={walletId}
                    walletCurrency={walletCurrency}
                    isNoQuoteOutbound={isNoQuoteOutbound}
                    onBack={() => setStep(2)}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              )}
              {step > 1 && !walletId && (
                <motion.div key="step-missing-wallet" {...STEP_ANIMATION}>
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    {wallets.length > 0
                      ? t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`
                      : t`Tu wallet principal aún no está lista.`}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
