/**
 * SendFlow
 *
 * Inline section rendered between the VirtualCard and the action row on
 * the conversational home, shown whenever the Dynamic Island's
 * `mode === 'send'`. Multi-phase UI orchestrated by `sendStep` on the
 * DI store so every transition (and its DI copy) lives in one place:
 *
 *   select-beneficiary → amount → review → submitting → success
 *                                             │
 *                                             └──────► error (recoverable)
 *
 *   create-beneficiary is an orthogonal sub-state that renders the
 *   inline `CreateBeneficiaryForm` (same gradient-rim card chrome as
 *   every other step — NOT a Radix Dialog) and, on success, auto-
 *   selects the freshly-created row and jumps straight to `amount`.
 *
 * Data: reads through `beneficiaries_list`, `wallets_listByCustomer`,
 * `wallets_getBalance`, `quotes_getIndicativeRate`, `transactions_createDispersion`
 * — the exact same endpoints `/suite/send` + `/suite/beneficiaries`
 * use, so the inline surface can't drift from the standalone pages.
 *
 * Chrome: identical to `ReceiveFlow` (gradient rim + flat card + X).
 * Flow close resets all DI send state via `setMode('idle')`.
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle, ChevronLeft, Plus, User, X } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import {
  useIsViewingAs,
  ViewAsReadOnlyNote,
} from '@/shared/components/common/view-as-read-only-note';
import { getCurrencyFlag } from '@/shared/lib/currency-flags';
import { useDynamicIslandStore } from '../../stores/useDynamicIslandStore';
import { CreateBeneficiaryForm } from '@/modules/suite-user/features/beneficiaries/components/CreateBeneficiaryForm';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';
import { useSendFlow } from './hooks/use-send-flow';
import { BeneficiarySelector } from './beneficiary-selector';
import { AmountInput } from './amount-input';
import { ReviewPanel } from './review-panel';
import { SuccessPanel } from './success-panel';
import { getWalletCurrencyLabel, getWalletPairLabel } from '@/shared/lib/receive-wallet';
import { isLoopayXNoQuoteOutboundRail } from '@/shared/lib/loopayx-send-rails';

export interface SendFlowProps {
  className?: string;
  /**
   * Optional close handler. When provided, a small X is rendered in
   * the panel's top-right corner. The conversational home wires
   * outside-click + Escape to the same handler — the in-card X is
   * the explicit affordance, the outside-click is the shortcut.
   */
  onClose?: () => void;
}

const VIEW_AS_SEND_NOTE_ID = 'send-flow-view-as-send';
const VIEW_AS_BENEFICIARY_NOTE_ID = 'send-flow-view-as-beneficiary';

export const SendFlow: React.FC<SendFlowProps> = ({ className, onClose }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const sectionRef = React.useRef<HTMLElement | null>(null);
  const createStepRef = React.useRef<HTMLDivElement | null>(null);

  const sendStep = useDynamicIslandStore((s) => s.sendStep);
  const selectedBeneficiaryId = useDynamicIslandStore((s) => s.selectedBeneficiaryId);
  const sendAmount = useDynamicIslandStore((s) => s.sendAmount);
  const setSendStep = useDynamicIslandStore((s) => s.setSendStep);
  const selectBeneficiary = useDynamicIslandStore((s) => s.selectBeneficiary);
  const setSendAmount = useDynamicIslandStore((s) => s.setSendAmount);
  const clearSendSelection = useDynamicIslandStore((s) => s.clearSendSelection);
  const sendFilterCurrency = useDynamicIslandStore((s) => s.sendFilterCurrency);
  const setSendFilterCurrency = useDynamicIslandStore((s) => s.setSendFilterCurrency);
  const setIslandState = useDynamicIslandStore((s) => s.setIslandState);
  const showError = useDynamicIslandStore((s) => s.showError);

  const { beneficiaries, wallet, secondaryWallets, availableBalance, isLoading, error } =
    useSendFlow();
  const stablecoinLabel = getWalletCurrencyLabel(wallet?.currency) ?? 'saldo digital';
  const secondaryWallet = secondaryWallets[0] ?? null;
  const secondaryWalletCount = secondaryWallets.length;

  const filteredBeneficiaries = React.useMemo(() => {
    if (!sendFilterCurrency) return beneficiaries;
    return beneficiaries.filter((b) => b.currency === sendFilterCurrency);
  }, [beneficiaries, sendFilterCurrency]);

  const selected = React.useMemo(
    () => beneficiaries.find((b) => b.id === selectedBeneficiaryId) ?? null,
    [beneficiaries, selectedBeneficiaryId]
  );
  const isNoQuoteOutbound = isLoopayXNoQuoteOutboundRail(selected);
  // View as customer (#415): read-only, the back refuses every write.
  const isViewingAs = useIsViewingAs();
  const addBeneficiaryDescribedBy = isViewingAs ? VIEW_AS_BENEFICIARY_NOTE_ID : undefined;

  const [transactionId, setTransactionId] = React.useState<string>('');
  const [transactionStatus, setTransactionStatus] = React.useState<string | null>(null);

  // `create-beneficiary` is an inline step — not a portal Dialog — so we
  // don't need the snapshot-diff trick that the previous modal version
  // used: `CreateBeneficiaryForm` hands us the freshly-created row via
  // its `onSuccess` callback, and we just auto-select it.
  const handleOpenCreate = () => {
    if (isViewingAs) return;
    setSendStep('create-beneficiary');
  };

  React.useEffect(() => {
    if (sendStep !== 'create-beneficiary') return;

    // Keep the same behavior used when opening Send from dashboard:
    // scroll just enough to reveal the flow, not to the page bottom.
    const scrollStepIntoViewport = () => {
      const target = sectionRef.current ?? createStepRef.current;
      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    };

    // Trigger once after mount and again after enter animation settles.
    const raf = window.requestAnimationFrame(scrollStepIntoViewport);
    const timer = window.setTimeout(scrollStepIntoViewport, 220);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [sendStep]);

  const handleCancelCreate = () => {
    setSendStep('select-beneficiary');
  };

  const handleCreateSuccess = (created: BeneficiaryResponse) => {
    if (!wallet) {
      return;
    }

    toast.success(t`Guardamos a ${created.beneficiary_name}.`);
    selectBeneficiary(created.id, created.currency);
  };

  const handleSelectBeneficiary = (b: BeneficiaryResponse) => {
    if (!wallet) {
      return;
    }

    selectBeneficiary(b.id, b.currency);
  };

  const handleBackToSelect = () => {
    clearSendSelection();
  };

  const handleAmountContinue = (amount: string) => {
    setSendAmount(amount);
    setSendStep('review');
  };

  const handleBackToAmount = () => {
    setSendStep('amount');
  };

  const handleSubmitStart = () => {
    setSendStep('submitting');
    if (selected) {
      setIslandState('sending', {
        amount: parseFloat(sendAmount || '0'),
        currency: stablecoinLabel,
        recipient: selected.beneficiary_name,
      });
    } else {
      setIslandState('sending');
    }
  };

  const handleSubmitSuccess = (txId: string, status: string) => {
    setTransactionId(txId);
    setTransactionStatus(status);
    setSendStep('success');
    setIslandState('success', {
      amount: parseFloat(sendAmount || '0') || 0,
      currency: 'USDT',
    });
    queryClient.invalidateQueries({ queryKey: ['wallets', 'balance'] });
    queryClient.invalidateQueries({ queryKey: ['wallets', 'transactions'] });
  };

  const handleSubmitError = (message: string) => {
    setSendStep('error');
    showError(message);
    // Keep the review step visible with the error banner — going back
    // to `review` so the user can edit and retry without losing their
    // amount. `error` step is still set so telemetry knows we failed.
    setSendStep('review');
  };

  const handleSendAnother = () => {
    setTransactionId('');
    setTransactionStatus(null);
    clearSendSelection();
    setIslandState('idle');
  };

  return (
    <motion.section
      ref={sectionRef}
      aria-label={t`Enviar`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('w-full max-w-[560px] mx-auto', 'rounded-xl bg-brand-gradient p-px', className)}
    >
      <div className={cn('relative rounded-xl bg-card p-5 md:p-6 flex-1 min-h-0 flex flex-col')}>
        {onClose && (
          <div className="flex items-center justify-end -mx-3 -mt-3 mb-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={t`Cerrar`}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full',
                'text-muted-foreground',
                'hover:bg-muted hover:text-foreground',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              )}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        ) : !wallet ? (
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Trans>
              Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.
              Este flujo no va a inventar otra source wallet.
            </Trans>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {/* Step 1a: pick an existing beneficiary (or bootstrap one). */}
            {sendStep === 'select-beneficiary' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex-1 min-h-0 overflow-y-auto"
              >
                <header className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-medium text-foreground">
                      <Trans>¿A quién le envías?</Trans>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <Trans>Elige un beneficiario guardado o añade uno nuevo.</Trans>
                    </p>
                  </div>
                  {beneficiaries.length > 0 && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={handleOpenCreate}
                      disabled={isViewingAs}
                      aria-describedby={addBeneficiaryDescribedBy}
                      aria-label={t`Añadir beneficiario`}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      <Trans>Añadir</Trans>
                    </Button>
                  )}
                </header>

                {isViewingAs && (
                  <div className="mb-4 space-y-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <ViewAsReadOnlyNote id={VIEW_AS_SEND_NOTE_ID} action="send" />
                    <ViewAsReadOnlyNote id={VIEW_AS_BENEFICIARY_NOTE_ID} action="add-beneficiary" />
                  </div>
                )}

                {sendFilterCurrency && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCurrencyFlag(sendFilterCurrency)}</span>
                      <span className="text-sm text-muted-foreground">
                        <Trans>Beneficiarios en {sendFilterCurrency}</Trans>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSendFilterCurrency(null)}
                      className={cn(
                        'text-xs text-muted-foreground hover:text-foreground',
                        'transition-colors duration-150'
                      )}
                    >
                      <Trans>Ver todos</Trans>
                    </button>
                  </div>
                )}

                {beneficiaries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-center">
                    <div
                      aria-hidden
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
                    >
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      <Trans>Primero, dinos a quién le envías.</Trans>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Trans>Guarda un beneficiario para empezar.</Trans>
                    </p>
                    <Button
                      variant="gradient"
                      className="mt-4"
                      onClick={handleOpenCreate}
                      disabled={isViewingAs}
                      aria-describedby={addBeneficiaryDescribedBy}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      <Trans>Crear beneficiario</Trans>
                    </Button>
                  </div>
                ) : filteredBeneficiaries.length === 0 && sendFilterCurrency ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <span className="text-2xl">{getCurrencyFlag(sendFilterCurrency)}</span>
                    <p className="text-sm text-muted-foreground text-center">
                      <Trans>No tienes beneficiarios en {sendFilterCurrency}</Trans>
                    </p>
                    <Button
                      variant="gradient"
                      onClick={handleOpenCreate}
                      disabled={isViewingAs}
                      aria-describedby={addBeneficiaryDescribedBy}
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                      <Trans>Crear beneficiario</Trans>
                    </Button>
                  </div>
                ) : (
                  <BeneficiarySelector
                    beneficiaries={filteredBeneficiaries}
                    selectedBeneficiaryId={selectedBeneficiaryId}
                    onSelect={handleSelectBeneficiary}
                  />
                )}
              </motion.div>
            )}
            {sendStep === 'create-beneficiary' && (
              <motion.div
                ref={createStepRef}
                key="create"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="mx-auto w-full max-w-[500px] max-h-[52dvh] flex-1 min-h-0 flex flex-col"
              >
                {beneficiaries.length > 0 && (
                  <header className="shrink-0 mb-4">
                    <button
                      type="button"
                      onClick={handleCancelCreate}
                      aria-label={t`Volver a elegir beneficiario`}
                      className={cn(
                        'inline-flex h-8 items-center gap-1.5 rounded-md px-2',
                        'text-xs font-medium text-muted-foreground',
                        'hover:bg-muted hover:text-foreground',
                        'transition-colors duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                      )}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                      <Trans>Volver a elegir</Trans>
                    </button>
                  </header>
                )}

                <CreateBeneficiaryForm
                  className="flex-1 min-h-0"
                  title={<Trans>Agrega a alguien.</Trans>}
                  description={
                    <Trans>
                      Dinos a quién, a dónde y con qué datos. Lo guardamos para la próxima.
                    </Trans>
                  }
                  onSuccess={handleCreateSuccess}
                  onCancel={handleCancelCreate}
                />
              </motion.div>
            )}

            {/* Step 2: amount. Requires a resolved beneficiary + wallet. */}
            {sendStep === 'amount' && selected && wallet && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex-1 min-h-0 overflow-y-auto"
              >
                <AmountInput
                  beneficiary={selected}
                  availableBalance={availableBalance}
                  isBalanceLoading={isLoading}
                  stablecoinLabel={stablecoinLabel}
                  walletCurrency={wallet.currency}
                  showQuote={!isNoQuoteOutbound}
                  defaultAmount={sendAmount}
                  onBack={handleBackToSelect}
                  onContinue={handleAmountContinue}
                />
              </motion.div>
            )}

            {/* Step 3: review + submit. */}
            {(sendStep === 'review' || sendStep === 'submitting' || sendStep === 'error') &&
              selected &&
              wallet && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="flex-1 min-h-0 overflow-y-auto"
                >
                  <ReviewPanel
                    beneficiary={selected}
                    amount={sendAmount}
                    walletId={wallet.id}
                    stablecoinLabel={stablecoinLabel}
                    walletCurrency={wallet.currency}
                    onBack={handleBackToAmount}
                    onSubmitStart={handleSubmitStart}
                    onSuccess={handleSubmitSuccess}
                    onError={handleSubmitError}
                  />
                </motion.div>
              )}

            {/* Step 4: success. */}
            {sendStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex-1 min-h-0 overflow-y-auto"
              >
                <SuccessPanel
                  transactionId={transactionId}
                  status={transactionStatus}
                  onSendAnother={handleSendAnother}
                  onClose={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {wallet && (
          <p className="mt-6 text-xs text-muted-foreground">
            {secondaryWallet
              ? secondaryWalletCount === 1
                ? t`Los envíos salen desde tu wallet principal ${getWalletPairLabel(wallet) ?? stablecoinLabel}. Si un rail usa ${getWalletPairLabel(secondaryWallet) ?? secondaryWallet.currency}, ese saldo se sweepea a la principal desde 5 USDC.`
                : t`Los envíos salen desde tu wallet principal ${getWalletPairLabel(wallet) ?? stablecoinLabel}. Si un rail usa una wallet secundaria, ese saldo se sweepea a la principal desde 5 USDC.`
              : t`Los envíos se originan desde tu wallet en ${stablecoinLabel}; el beneficiario recibe en su moneda local.`}
          </p>
        )}
      </div>
    </motion.section>
  );
};
