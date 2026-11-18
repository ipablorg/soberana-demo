import { useState } from 'react';
import { Vault as VaultIcon, Wallet, ArrowLeftRight } from '@/shared/components/animated-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useMobile } from '@/shared/hooks/use-mobile';
import { Trans, useLingui } from '@lingui/react/macro';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { useVaults } from '../hooks/useVaults';
import { useInvestorPortfolio } from '../hooks/useInvestorPortfolio';
import { useVaultTransactions } from '../hooks/useVaultTransactions';
import { PortfolioSummaryHero } from '../components/PortfolioSummaryHero';
import { VaultCard, VaultCardSkeleton } from '../components/VaultCard';
import { PositionCard, PositionCardSkeleton } from '../components/PositionCard';
import { TransactionRow } from '../components/TransactionRow';
import { InvestSheet } from '../components/InvestSheet';
import { RedeemSheet } from '../components/RedeemSheet';
import type { Vault, VaultPosition } from '../types/vault.types';

export default function Marketplace() {
  const isMobile = useMobile();
  const { t } = useLingui();
  const [activeTab, setActiveTab] = useState('explore');

  const { data: vaults, isLoading: vaultsLoading } = useVaults();
  const { data: portfolio, isLoading: portfolioLoading } = useInvestorPortfolio();
  const { data: transactions, isLoading: txLoading } = useVaultTransactions();

  const [investVault, setInvestVault] = useState<Vault | null>(null);
  const [investOpen, setInvestOpen] = useState(false);
  const [redeemPosition, setRedeemPosition] = useState<VaultPosition | null>(null);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const handleInvest = (vault: Vault) => {
    setInvestVault(vault);
    setInvestOpen(true);
  };

  const handleInvestMore = (position: VaultPosition) => {
    const vault = vaults?.find((v) => v.slug === position.vaultSlug);
    if (vault) handleInvest(vault);
  };

  const handleRedeem = (position: VaultPosition) => {
    setRedeemPosition(position);
    setRedeemOpen(true);
  };

  return (
    <div className={isMobile ? 'p-4 space-y-4' : 'p-6 space-y-6 max-w-7xl mx-auto'}>
      {!isMobile && (
        <PageHeader
          title={t`Vaults`}
          subtitle={t`Rendimiento autónomo, precisión institucional.`}
        />
      )}

      <PortfolioSummaryHero portfolio={portfolio} isLoading={portfolioLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="explore" className="gap-1.5">
            <VaultIcon className="w-4 h-4" />
            {!isMobile && t`Explorar Vaults`}
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5">
            <Wallet className="w-4 h-4" />
            {!isMobile && t`Mi Portafolio`}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1.5">
            <ArrowLeftRight className="w-4 h-4" />
            {!isMobile && t`Transacciones`}
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* ═══════ EXPLORE VAULTS ═══════ */}
          <TabsContent value="explore" className="mt-6" forceMount={activeTab === 'explore' ? true : undefined}>
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {vaultsLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <VaultCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {vaults?.map((vault, i) => (
                      <VaultCard key={vault.slug} vault={vault} index={i} onInvest={handleInvest} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ═══════ MY PORTFOLIO ═══════ */}
          <TabsContent value="portfolio" className="mt-6" forceMount={activeTab === 'portfolio' ? true : undefined}>
            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {portfolioLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <PositionCardSkeleton key={i} />
                    ))}
                  </div>
                ) : portfolio && portfolio.positions.length > 0 ? (
                  <div className="space-y-4">
                    {portfolio.positions.map((pos, i) => (
                      <PositionCard
                        key={pos.vaultSlug}
                        position={pos}
                        index={i}
                        onInvestMore={handleInvestMore}
                        onRedeem={handleRedeem}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <VaultIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-heading font-semibold text-foreground mb-2">
                      <Trans>No tienes posiciones activas</Trans>
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      <Trans>Invierte en Vaults para ver tu portafolio aquí.</Trans>
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('explore')}
                    >
                      <Trans>Explorar Vaults</Trans>
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ═══════ TRANSACTIONS ═══════ */}
          <TabsContent value="transactions" className="mt-6" forceMount={activeTab === 'transactions' ? true : undefined}>
            {activeTab === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {txLoading ? (
                  <Card className="p-5">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-3">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-5 w-20 rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : transactions && transactions.length > 0 ? (
                  <Card className="p-5">
                    {transactions.map((tx) => (
                      <TransactionRow key={tx.id} transaction={tx} />
                    ))}
                  </Card>
                ) : (
                  <Card className="p-12 text-center">
                    <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-heading font-semibold text-foreground mb-2">
                      <Trans>Aún no tienes transacciones</Trans>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Trans>Tu historial de inversiones y redenciones aparecerá aquí.</Trans>
                    </p>
                  </Card>
                )}
              </motion.div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <InvestSheet vault={investVault} open={investOpen} onOpenChange={setInvestOpen} />
      <RedeemSheet position={redeemPosition} open={redeemOpen} onOpenChange={setRedeemOpen} />
    </div>
  );
}
