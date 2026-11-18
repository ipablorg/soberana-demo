import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Wallet, Download, AlertCircle, Link } from '@/shared/components/animated-icons';
import { mapError } from '@/shared/lib/error-mapper';
import { PageTransition } from '@/shared/components/motion/PageTransition';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useAuth } from '@/shared/hooks/use-auth';
import { useKYC } from '@/shared/hooks/useKYC';
import { useReceiveWallet } from '@/shared/hooks/use-receive-wallet';
import { useWalletBalance } from '@/shared/hooks/use-wallet-balance';
import { useDepositInstructions } from '@/shared/hooks/use-deposit-instructions';
import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';
import {
  useEndorsements,
} from '@/shared/hooks/use-endorsements';
import { usePaymentLinkCapabilities } from '@/shared/hooks/use-payment-link-capabilities';
import { useMobile } from '@/shared/hooks/use-mobile';
import { BankTransferGuide } from '@/shared/components/bank-transfer-guide/bank-transfer-guide';
import { DepositInstructionsCard } from '../components/DepositInstructionsCard';
import { DepositInstructionsDialog } from '../components/DepositInstructionsDialog';
import { ReceiveOptionsCard } from '../components/receive-options-card';
import { PaymentLinkForm } from '../components/PaymentLinkForm';
import { getRailFlag, getCurrencyFlag } from '@/shared/lib/currency-flags';
import { EXCLUDED_RAILS } from '@/shared/hooks/use-rails';
import { buildReceiveAccounts } from '@/shared/lib/receive-account-view-model';
import { getReceiveRailLabel } from '@/shared/lib/receive-presentation';
import { getWalletPairLabel } from '@/shared/lib/receive-wallet';
import { WalletSwitcher } from '@/shared/components/wallet-switcher';

function WalletBalanceHeader({
  walletId,
  currency,
}: {
  walletId: string | undefined;
  currency: string | null | undefined;
}) {
  const { balance, isLoading } = useWalletBalance(walletId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-36" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) return null;

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Wallet className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              <Trans>Balance disponible</Trans>
            </p>
            <p className="text-2xl font-semibold font-mono tabular-nums text-foreground">
              {parseFloat(balance.available_balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">
                {balance.currency ?? currency ?? '—'}
              </span>
            </p>
          </div>
        </div>
        {balance.pending_balance && parseFloat(balance.pending_balance) > 0 && (
          <Badge variant="warning">
            <Trans>Pendiente:</Trans>{' '}
            <span className="font-mono tabular-nums">
              {parseFloat(balance.pending_balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

function DepositInstructionsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
          <Download className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4 text-lg">
          <Trans>Falta un paso antes de recibir.</Trans>
        </CardTitle>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          <Trans>
            Verifica tu identidad y abrimos tus cuentas virtuales.
          </Trans>
        </p>
      </CardContent>
    </Card>
  );
}

function UnresolvedMainWalletState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4 text-lg">
          <Trans>No pudimos resolver tu wallet principal.</Trans>
        </CardTitle>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          <Trans>Tienes wallets visibles, pero ninguna coincide con la principal configurada.</Trans>
        </p>
      </CardContent>
    </Card>
  );
}

function ValueStrip({ stablecoinLabel }: { stablecoinLabel: string | null | undefined }) {
  const { t } = useLingui();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold text-foreground">
            <Trans>Tuyas.</Trans>
          </span>{' '}
          <span className="font-normal text-muted-foreground">
            <Trans>Cada cuenta es única para ti.</Trans>
          </span>
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold text-foreground">
            <Trans>Multi-moneda.</Trans>
          </span>{' '}
          <span className="font-normal text-muted-foreground">
            <Trans>Suma las monedas que necesites.</Trans>
          </span>
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-sm">
          <span className="font-semibold text-foreground">
            <Trans>Auto-convertido.</Trans>
          </span>{' '}
          <span className="font-normal text-muted-foreground">
            {stablecoinLabel ? (
              t`Llega fiat, recibes ${stablecoinLabel} en tu wallet.`
            ) : (
              t`Llega fiat y se acredita en tu wallet.`
            )}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function ReceivePage() {
  const { t } = useLingui();
  const { user } = useAuth();
  const { isReadyForSuite } = useKYC();
  const isMobile = useMobile();
  const [selectedAccount, setSelectedAccount] = useState<VirtualAccount | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const customerId = user?.customer_profile_id;
  const {
    wallets,
    selectedWalletId,
    setSelectedWalletId,
    hasVisibleWallets,
    mainWallet,
    secondaryWallet,
    secondaryWalletCount,
    receiveWalletId,
    receiveWalletCurrency,
    receiveWalletStablecoinLabel,
    receiveWalletPairLabel,
    secondaryWalletPairLabel,
    isLoading: walletsLoading,
    error: walletsError,
  } = useReceiveWallet();
  const {
    endorsements: activeEndorsements,
    isLoading: endorsementsLoading,
  } = useEndorsements();
  const {
    paymentLinkRails,
    isLoading: paymentLinkCapabilitiesLoading,
  } = usePaymentLinkCapabilities();

  const {
    virtualAccounts,
    isLoading: instructionsLoading,
    error: instructionsError,
  } = useDepositInstructions(receiveWalletId, customerId as string | undefined);

  const isLoading =
    walletsLoading ||
    instructionsLoading ||
    endorsementsLoading ||
    paymentLinkCapabilitiesLoading;
  const error = walletsError || instructionsError;

  const receiveAccounts = buildReceiveAccounts({
    virtualAccounts,
    endorsements: activeEndorsements,
    paymentLinkRails,
    excludedRails: EXCLUDED_RAILS,
  });

  const depositAccounts = receiveAccounts.filter(
    (account) => account.deposit && !account.usePaymentLink,
  );
  const waitingAccounts = receiveAccounts.filter(
    (account) => account.receiveMode === 'waiting',
  );
  const paymentLinkAccounts = receiveAccounts.filter(
    (account) => account.receiveMode === 'payment_link',
  );
  const hasReceiveChannels =
    depositAccounts.length > 0 ||
    waitingAccounts.length > 0 ||
    paymentLinkAccounts.length > 0;

  return (
    <PageTransition>
      <div className={isMobile ? 'space-y-2 p-2' : 'mx-auto max-w-6xl p-2 flex flex-col h-[calc(100vh-6rem)]'}>
        {!isMobile && (
          <>
            <PageHeader
              title={t`Recibir dinero`}
              subtitle={t`Tus cuentas virtuales, listas para que cualquiera te pague.`}
              actions={
                <Button variant="outline" onClick={() => setGuideOpen(true)}>
                  <Trans>Instructivos de recarga</Trans>
                </Button>
              }
            />
            <ValueStrip stablecoinLabel={receiveWalletStablecoinLabel} />
            
          </>
        )}

         <WalletBalanceHeader walletId={receiveWalletId} currency={receiveWalletCurrency} />

        {!mainWallet && hasVisibleWallets && (
          <Card className="mt-2 border-border bg-card/60">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                {t`Tienes wallets visibles, pero ninguna coincide con la wallet principal configurada.`}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-2">
          <WalletSwitcher
            wallets={wallets}
            mainWalletId={mainWallet?.id ?? null}
            selectedWalletId={selectedWalletId}
            onSelect={setSelectedWalletId}
            className="justify-start"
          />
        </div>

        {mainWallet && secondaryWallet && (
          <Card className="mt-2 border-border bg-card/60">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                {secondaryWalletCount === 1
                  ? t`Tu wallet principal es ${receiveWalletPairLabel ?? getWalletPairLabel(mainWallet) ?? receiveWalletStablecoinLabel}. También tienes ${secondaryWalletPairLabel ?? getWalletPairLabel(secondaryWallet) ?? secondaryWallet.currency} como wallet secundaria para ciertos rails.`
                  : t`Tu wallet principal es ${receiveWalletPairLabel ?? getWalletPairLabel(mainWallet) ?? receiveWalletStablecoinLabel}. También tienes wallets secundarias para ciertos rails.`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t`Cuando un rail opera sobre esa wallet secundaria, el saldo se sweepea a tu principal con mínimo de 5 USDC.`}
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mt-2">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <CardTitle className="text-base">
                    <Trans>No pudimos cargar tus cuentas.</Trans>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{mapError(error).message}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        <div className={isMobile ? 'space-y-4 mt-2' : 'grid grid-cols-5 gap-6 mt-4 flex-1 min-h-0'}>
          {/* Left column: active channels */}
          <div className={isMobile ? 'space-y-4' : 'col-span-3 flex flex-col min-h-0'}>
            {!isLoading && hasReceiveChannels && (
              <h2 className="text-lg tracking-tight mb-3 shrink-0">
                <span className="font-semibold text-foreground">
                  <Trans>Tus cuentas.</Trans>
                </span>{' '}
                <span className="font-normal text-muted-foreground">
                  <Trans>Toca una para ver los datos bancarios.</Trans>
                </span>
              </h2>
            )}
            <div className={isMobile ? 'space-y-4' : 'flex-1 overflow-y-auto space-y-2 pr-1 min-h-0'}>
              {isLoading ? (
                <>
                  <DepositInstructionsSkeleton />
                  <DepositInstructionsSkeleton />
                </>
               ) : !mainWallet && hasVisibleWallets ? (
                 <UnresolvedMainWalletState />
                ) : !isReadyForSuite ? (
                  <EmptyState />
                ) : !hasReceiveChannels ? (
                  <EmptyState />
                ) : (
                depositAccounts.map((account) => (
                  <DepositInstructionsCard
                    key={account.id}
                    account={account.deposit as VirtualAccount}
                    onClick={() => setSelectedAccount(account.deposit as VirtualAccount)}
                  />
                ))
              )}
            </div>

            {/* Payment link section for endorsed rails without virtual accounts */}
            {!isLoading && waitingAccounts.length > 0 && (
              <div className="mt-4 space-y-3">
                <h2 className="text-lg tracking-tight">
                  <span className="font-semibold text-foreground">
                    <Trans>Estamos terminando de habilitar algunos rails.</Trans>
                  </span>{' '}
                  <span className="font-normal text-muted-foreground">
                    <Trans>No los mostramos como cuentas usables hasta que exista la instrucción real o el siguiente paso correcto.</Trans>
                  </span>
                </h2>
                {waitingAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[1.5rem] leading-none"
                          role="img"
                          aria-label={account.paymentRail}
                        >
                          {getRailFlag(account.paymentRail)}
                        </span>
                        <div>
                          <CardTitle className="text-base">
                            {getReceiveRailLabel({
                              railCode: account.paymentRail,
                              railName: account.railName,
                            })}{' '}
                            · {account.currency}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {account.actionLink ? (
                              <Trans>Falta completar un paso para habilitar este rail.</Trans>
                            ) : (
                              <Trans>Ya está aprobado, pero todavía no tenemos la instrucción final para usar este rail.</Trans>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {account.actionLink && (
                      <CardContent>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            window.open(account.actionLink?.url, '_blank', 'noopener,noreferrer');
                          }}
                        >
                          {account.actionLink.type === 'tos' ? (
                            <Trans>Continuar con términos</Trans>
                          ) : (
                            <Trans>Continuar activación</Trans>
                          )}
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Payment link section for endorsed rails without virtual accounts */}
            {!isLoading && paymentLinkAccounts.length > 0 && receiveWalletId && (
              <div className="mt-4 space-y-3">
                <h2 className="text-lg tracking-tight">
                  <span className="font-semibold text-foreground">
                    <Trans>Recibir por link de pago.</Trans>
                  </span>{' '}
                  <span className="font-normal text-muted-foreground">
                    <Trans>Estos rails cobran mediante link, no con datos bancarios fijos.</Trans>
                  </span>
                </h2>
                {paymentLinkAccounts.map((account) => {
                  const flag = getRailFlag(account.paymentRail) !== '\uD83C\uDF10'
                    ? getRailFlag(account.paymentRail)
                    : getCurrencyFlag(account.currency);

                  return (
                    <Card key={account.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[1.5rem] leading-none" role="img" aria-label={account.paymentRail}>
                            {flag}
                          </span>
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">
                              {getReceiveRailLabel({
                                railCode: account.paymentRail,
                                railName: account.railName,
                              })}{' '}
                              · {account.currency}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                          <PaymentLinkForm
                            receiveWalletId={receiveWalletId}
                            currency={account.currency}
                            paymentMethod={account.paymentRail}
                            walletCurrency={receiveWalletStablecoinLabel}
                          />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {!isLoading && paymentLinkAccounts.length > 0 && !receiveWalletId && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {t`Estos rails existen, pero no podemos generar links hasta resolver una wallet principal válida.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column: activate new channels */}
          <div className={isMobile ? 'space-y-4' : 'col-span-2 flex flex-col min-h-0'}>
            <ReceiveOptionsCard />
          </div>
        </div>

        {/* Deposit Instructions Dialog */}
        <DepositInstructionsDialog
          account={selectedAccount}
          open={!!selectedAccount}
          onOpenChange={(open) => {
            if (!open) setSelectedAccount(null);
          }}
        />

        {/* Bank Transfer Guide (General) */}
        <BankTransferGuide
          open={guideOpen}
          onOpenChange={setGuideOpen}
          account={null}
          accounts={virtualAccounts}
          walletCurrency={receiveWalletStablecoinLabel}
        />
      </div>
    </PageTransition>
  );
}
