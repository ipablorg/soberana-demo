/**
 * ReceiveFlow
 *
 * Inline section rendered between the VirtualCard and the action
 * buttons on the conversational home, shown whenever the Dynamic
 * Island `mode === 'receive'`.
 *
 * Receive shows the customer's virtual accounts ONLY. Nothing is
 * requested or registered from here: requesting a virtual account is a
 * Comercial action in the backoffice, and LoopayApp payment links are
 * not live yet.
 *
 *  Phase A — picker. One chip per account that exists (active or
 *  pending). Rails that were never requested, and payment-link rails,
 *  are not listed. An existing account on a maintenance rail (Colombia,
 *  Ecuador, Peru) stays visible with an "En mantenimiento" badge.
 *
 *  Phase B — selected account focus:
 *    - `active`  → `AccountDetails` (deposit instructions + copy).
 *    - `pending` → `VaRequestStatus` (lifecycle: ops review →
 *                  onboarding → active, with blocker info). No forms.
 *  A compact "← Otra moneda" button returns to Phase A.
 *
 *  Empty state (no account at all): business customers are told their
 *  commercial executive enables the accounts; individuals are told
 *  virtual accounts are business-only.
 *
 *  Close: the global X on the home (DI store reset, no per-card X).
 *
 * Data: `wallets_depositInstructions`, `customers_listEndorsements`
 * and `rails_list`, composed by `useUserAccounts`.
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { ChevronLeft, X } from '@/shared/components/animated-icons';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { useDynamicIslandStore } from '../../stores/useDynamicIslandStore';
import { useUserAccounts } from './hooks/use-user-accounts';
import {
  CurrencySelector,
  getCurrencyLabel,
  resolveFlag,
} from './currency-selector';
import { AccountDetails } from './account-details';
import { VaRequestStatus } from './va-request-status';
import { useKYC } from '@/shared/hooks/useKYC';
import { getReceiveRailLabel } from '@/shared/lib/receive-presentation';
import { useReceiveWallet } from '@/shared/hooks/use-receive-wallet';

export interface ReceiveFlowProps {
  className?: string;
  /**
   * Optional close handler. When provided, a small X is rendered in
   * the panel's top-right corner. The conversational home also wires
   * outside-click + Escape to the same handler — the in-card X is the
   * explicit affordance, the outside-click is the shortcut.
   */
  onClose?: () => void;
}

export const ReceiveFlow: React.FC<ReceiveFlowProps> = ({ className, onClose }) => {
  const { t, i18n } = useLingui();
  const locale = i18n.locale || 'es';

  const { customerType } = useKYC();

  const selectedCurrency = useDynamicIslandStore((s) => s.selectedCurrency);
  const selectedReceiveAccountId = useDynamicIslandStore((s) => s.selectedReceiveAccountId);
  const selectedRail = useDynamicIslandStore((s) => s.selectedRail);
  const selectCurrency = useDynamicIslandStore((s) => s.selectCurrency);
  const clearCurrencySelection = useDynamicIslandStore(
    (s) => s.clearCurrencySelection,
  );

  const { accounts: allAccounts, isLoading, error } = useUserAccounts();
  // Only virtual accounts that exist: active or pending, never payment links.
  const accounts = React.useMemo(
    () => allAccounts.filter((a) => a.status !== 'not_requested' && !a.usePaymentLink),
    [allAccounts],
  );
  const setReceiveAccountCount = useDynamicIslandStore((s) => s.setReceiveAccountCount);
  // Keep the island narration in sync with what the picker really shows.
  React.useEffect(() => {
    setReceiveAccountCount(isLoading || error ? null : accounts.length);
  }, [accounts.length, isLoading, error, setReceiveAccountCount]);
  const {
    hasVisibleWallets,
    hasResolvedMainWallet,
    mainWallet,
    receiveWalletStablecoinLabel,
    receiveWalletPairLabel,
    secondaryWalletPairLabel,
    secondaryWallet,
    secondaryWalletCount,
  } = useReceiveWallet();

  const selected = React.useMemo(
    () =>
      accounts.find((a) => a.id === selectedReceiveAccountId) ??
      accounts.find((a) => a.paymentRail === selectedRail) ??
      null,
    [accounts, selectedReceiveAccountId, selectedRail],
  );

  const receiveStablecoin = receiveWalletStablecoinLabel;
  const selectedRailLabel = selected
    ? getReceiveRailLabel({
        railCode: selected.paymentRail,
        railName: selected.railName,
      })
    : null;

  // Drop the selection and return to the picker. `setMode('receive')`
  // would be a no-op here because the mode is already 'receive'; the
  // store's setMode only resets sub-state when the mode actually
  // changes. A dedicated action is clearer and keeps the contract
  // explicit.
  const handleBackToCurrencies = () => {
    clearCurrencySelection();
  };

  return (
    <motion.section
      aria-label={t`Monedas`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        // No extra top margin — the parent stack on the dashboard
        // owns vertical rhythm via its `gap-*`. Adding margin here
        // would compound and make this slot drift away from the
        // others.
        'w-full max-w-[560px] mx-auto',
        // Gradient rim around the panel using the same technique as
        // GradientCircleButton: a 1px brand-gradient wrapper with an
        // inner `bg-card` surface. The border is the only gradient —
        // the panel content sits on a flat card background so long
        // copy stays legible.
        'rounded-xl bg-brand-gradient p-px',
        className,
      )}
    >
      <div className={cn('relative rounded-xl bg-card p-5 md:p-6')}>
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
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
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
        <p className="text-sm text-muted-foreground">
          <Trans>
            No pudimos cargar tus monedas. Intenta de nuevo en un momento.
          </Trans>
        </p>
      ) : !mainWallet ? (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          {hasVisibleWallets
            ? t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`
            : t`Tu wallet principal todavía no está lista.`}
        </div>
      ) : (
        <>
        <AnimatePresence mode="wait" initial={false}>
          {!selected ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <header className="mb-4">
                <h2 className="text-base font-medium text-foreground">
                  <Trans>Tus cuentas para recibir</Trans>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  <Trans>Lo que depositen en estas cuentas se acredita en tu wallet.</Trans>
                </p>
              </header>

              {accounts.length === 0 ? (
                <p className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  {customerType === 'business'
                    ? t`Tus cuentas virtuales las habilita tu ejecutivo comercial. Cuando estén listas aparecerán aquí.`
                    : t`Las cuentas virtuales están disponibles solo para empresas, incluidas las empresas unipersonales.`}
                </p>
              ) : (
                <CurrencySelector
                  accounts={accounts}
                  selectedCurrency={selectedCurrency}
                  selectedAccountId={selectedReceiveAccountId}
                  onSelect={(a) => selectCurrency(a.id, a.currency, a.status, a.paymentRail)}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <header className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToCurrencies}
                  aria-label={t`Volver a monedas`}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-md px-2',
                    'text-xs font-medium text-muted-foreground',
                    'hover:bg-muted hover:text-foreground',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  )}
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                  <Trans>Otra moneda</Trans>
                </button>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1.5',
                    'bg-brand-gradient text-sm font-semibold text-white',
                  )}
                >
                  <span aria-hidden className="text-base leading-none" role="img">
                    {resolveFlag(selected)}
                  </span>
                  <span>{selectedRailLabel ?? getCurrencyLabel(selected.currency, locale)}</span>
                </span>
              </header>

              {selected.status === 'active' && <AccountDetails account={selected} />}

              {selected.status === 'pending' && <VaRequestStatus account={selected} />}
            </motion.div>
          )}
        </AnimatePresence>
        </>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        {secondaryWallet && receiveWalletPairLabel && secondaryWalletPairLabel ? (
          secondaryWalletCount === 1
            ? t`Tu wallet principal es ${receiveWalletPairLabel}. Algunos rails operan sobre ${secondaryWalletPairLabel}; cuando aplica, el saldo se sweepea a la principal desde 5 USDC.`
            : t`Tu wallet principal es ${receiveWalletPairLabel}. Algunos rails operan sobre wallets secundarias; cuando aplica, el saldo se sweepea a la principal desde 5 USDC.`
        ) : hasVisibleWallets && !hasResolvedMainWallet ? (
          t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`
        ) : receiveStablecoin ? (
          t`Estos son datos de tu cuenta en Loopay. Cuando recibes, se acredita ${receiveStablecoin} en tu wallet.`
        ) : (
          t`Estos son datos de tu cuenta en Loopay. Nadie más los usa.`
        )}
      </p>
      </div>
    </motion.section>
  );
};
