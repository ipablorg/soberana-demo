import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  ArrowDown,
  ArrowUp,
  HelpCircle,
  Wallet,
  Copy,
  AlertCircle,
} from '@/shared/components/animated-icons';
import { useWalletBalance } from '@/shared/hooks/use-wallet-balance';
import { useWalletTransactions } from '@/shared/hooks/use-wallet-transactions';
import { useDepositInstructions } from '@/shared/hooks/use-deposit-instructions';
import type { WidgetConfig, WidgetEvent, WidgetEventType } from '../../../types';
import { useElementsWidgetContext } from '../../../hooks/use-elements-widget-context';

const ZENTINEL_TIP = 'Tu banco local cobra ~3.5% de spread. Aquí recibes tipo de cambio interbancario con solo 0.8% total.';

interface RawTransaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  description?: string;
  created_at: string;
  status?: string;
}

interface WalletDashboardWidgetProps {
  config: WidgetConfig;
  currency?: string;
  isPreview?: boolean;
  onEvent?: <T extends WidgetEventType>(event: WidgetEvent<T>) => void;
}

export function WalletDashboardWidget({
  config,
  currency = 'USDC',
  isPreview = false,
  onEvent,
}: WalletDashboardWidgetProps) {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawBlocked, setWithdrawBlocked] = useState(false);

  const showZentinel = config.features.zentinelTooltips;
  const showOffRamp = config.features.oneClickOffRamp;
  const showOnRamp = config.features.oneClickOnRamp;

  const { walletId, customerId, isReady, isLoading: ctxLoading } = useElementsWidgetContext();

  const { balance, isLoading: balanceLoading } = useWalletBalance(isReady ? walletId ?? undefined : undefined);
  const { transactions, isLoading: txLoading } = useWalletTransactions(
    isReady ? walletId ?? undefined : undefined,
    { page_size: 5 },
  );
  const { virtualAccounts, isLoading: depositLoading } = useDepositInstructions(
    (showOnRamp && isReady) ? walletId ?? undefined : undefined,
    (showOnRamp && isReady) ? customerId ?? undefined : undefined,
  );

  const emit = <T extends WidgetEventType>(type: T, payload: WidgetEvent<T>['payload']) => {
    onEvent?.({
      type,
      widgetId: config.id,
      timestamp: new Date().toISOString(),
      payload,
    } as WidgetEvent<T>);
  };

  const availableBalance = balance ? parseFloat(balance.available_balance) : null;
  const displayCurrency = balance?.currency ?? currency;

  const handleWithdraw = () => {
    if (isPreview) {
      setWithdrawBlocked(true);
      emit('widget:error', {
        code: 'PREVIEW_EXECUTION_BLOCKED',
        message: t`Las transacciones reales solo se ejecutan en producción.`,
      });
      return;
    }
    // INTEGRATION POINT: call useCreateOffRamp() with walletId + amount + railId
    emit('wallet:loaded', { balance: availableBalance ?? 0, currency: displayCurrency });
  };

  const handleDeposit = () => {
    if (!showOnRamp) return;
    setDepositOpen(true);
    if (isReady && availableBalance !== null) {
      emit('wallet:loaded', { balance: availableBalance, currency: displayCurrency });
    }
  };

  const isLoadingAll = ctxLoading || balanceLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="relative flex flex-col gap-4"
    >
      {/* PREVIEW badge */}
      {isPreview && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 z-10 text-xs">
          {t`PREVIEW`}
        </Badge>
      )}

      {/* Preview-blocked alert */}
      {withdrawBlocked && isPreview && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <Trans>Retiro bloqueado en Preview. En producción se ejecutaría el off-ramp real.</Trans>
          </AlertDescription>
        </Alert>
      )}

      {/* Balance header */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Trans>Saldo disponible</Trans>
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">{displayCurrency}</Badge>
        </div>

        {isLoadingAll ? (
          <Skeleton className="h-9 w-32 mt-1" />
        ) : (
          <>
            <p className="font-mono tabular-nums text-right text-3xl font-bold text-foreground">
              {availableBalance !== null
                ? availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })
                : '—'}
            </p>
            {availableBalance !== null && (
              <p className="text-xs text-muted-foreground text-right mt-0.5">
                ≈ ${(availableBalance * 1.0).toFixed(2)} USD
              </p>
            )}
          </>
        )}

        {(showOffRamp || showOnRamp) && (
          <div className="flex gap-2 mt-4">
            {showOnRamp && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDeposit}
                disabled={isLoadingAll}
              >
                <ArrowDown className="mr-1.5 h-3.5 w-3.5" />
                <Trans>Depositar</Trans>
              </Button>
            )}
            {showOffRamp && (
              showZentinel ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1"
                      onClick={handleWithdraw}
                      disabled={isLoadingAll}
                    >
                      <ArrowUp className="mr-1.5 h-3.5 w-3.5" />
                      <Trans>Retirar</Trans>
                      <HelpCircle className="ml-1.5 h-3 w-3 opacity-60" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[220px] text-xs">{ZENTINEL_TIP}</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  variant="gradient"
                  size="sm"
                  className="flex-1"
                  onClick={handleWithdraw}
                  disabled={isLoadingAll}
                >
                  <ArrowUp className="mr-1.5 h-3.5 w-3.5" />
                  <Trans>Retirar</Trans>
                </Button>
              )
            )}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Trans>Últimas transacciones</Trans>
          </p>
        </div>

        {txLoading ? (
          <div className="divide-y divide-border/50">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-border/50">
            {(transactions as RawTransaction[]).map(tx => {
              const isCredit = tx.type === 'credit' || tx.type === 'DEPOSIT' || tx.type === 'INCOMING';
              const amount = parseFloat(tx.amount ?? '0');
              return (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      isCredit ? 'bg-success/10' : 'bg-muted'
                    }`}>
                      {isCredit
                        ? <ArrowDown className="h-3.5 w-3.5 text-success" />
                        : <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.description ?? tx.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-mono tabular-nums text-right text-sm font-semibold shrink-0 ml-2 ${
                    isCredit ? 'text-success' : 'text-foreground'
                  }`}>
                    {isCredit ? '+' : '-'}{amount.toFixed(2)} {tx.currency ?? displayCurrency}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              {isReady
                ? <Trans>Sin transacciones todavía.</Trans>
                : <Trans>Conecta una cuenta para ver transacciones reales.</Trans>}
            </p>
          </div>
        )}
      </div>

      {/* On-ramp sheet: deposit instructions */}
      {showOnRamp && (
        <Sheet open={depositOpen} onOpenChange={setDepositOpen}>
          <SheetContent side="bottom" className="h-auto max-h-[85vh]">
            <SheetHeader className="mb-4">
              <SheetTitle className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                <Trans>Depositar fondos</Trans>
              </SheetTitle>
            </SheetHeader>

            {depositLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : virtualAccounts.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[60vh] pb-4">
                {virtualAccounts.map(va => (
                  <div key={va.id} className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{va.payment_rail}</Badge>
                      <Badge variant="secondary" className="text-xs">{va.currency}</Badge>
                    </div>
                    <Separator />
                    {va.iban && (
                      <AccountField label="IBAN" value={va.iban} />
                    )}
                    {va.clabe && (
                      <AccountField label="CLABE" value={va.clabe} />
                    )}
                    {va.account_number && (
                      <AccountField label={t`Cuenta`} value={va.account_number} />
                    )}
                    {va.routing_number && (
                      <AccountField label="Routing" value={va.routing_number} />
                    )}
                    {va.bank_name && (
                      <p className="text-xs text-muted-foreground">{va.bank_name}</p>
                    )}
                    {va.beneficiary_name && (
                      <p className="text-xs text-muted-foreground">
                        <Trans>Beneficiario:</Trans> {va.beneficiary_name}
                      </p>
                    )}
                    {va.reference && (
                      <AccountField label={t`Referencia`} value={va.reference} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isReady
                    ? <Trans>No hay cuentas virtuales disponibles para este wallet.</Trans>
                    : <Trans>Inicia sesión para ver las instrucciones de depósito.</Trans>}
                </p>
              </div>
            )}

            {isPreview && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                <Trans>Simulación · En producción se muestran cuentas virtuales reales del wallet.</Trans>
              </p>
            )}
          </SheetContent>
        </Sheet>
      )}
    </motion.div>
  );
}

function AccountField({ label, value }: { label: string; value: string }) {
  const copy = () => navigator.clipboard.writeText(value).catch(() => null);
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span className="font-mono text-xs text-foreground truncate">{value}</span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
