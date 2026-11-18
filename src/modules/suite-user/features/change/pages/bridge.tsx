/**
 * Bridge Page - Simplified UI
 * 
 * Simplified interface with:
 * - Swipeable wallet card for balances
 * - Compact currency pair button with drawer
 * - Floating rate display always visible
 * - Product selection and conversion form
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { History, ChevronLeft, ChevronRight } from '@/shared/components/animated-icons';
import { PackageOpen } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DisabledWrapper } from '@/shared/components/DisabledWrapper';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { PageTransition } from '@/shared/components/motion/PageTransition';
import { useMobile } from '@/shared/hooks/use-mobile';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { useRateTimer } from '../hooks/useRateTimer';
import { ProductSelector } from '../components/ProductSelector';
import { ConversionForm } from '../components/ConversionForm';
import { ActiveRateRequestCard } from '../components/ActiveRateRequestCard';
import { SwipeableBalanceCard } from '../components/SwipeableBalanceCard';
import { CurrencyPairButton } from '../components/CurrencyPairButton';
import { CurrencyPairDrawer } from '../components/CurrencyPairDrawer';
import { FloatingRateDisplay } from '../components/FloatingRateDisplay';
import { BridgeRightSidebar } from '../components/BridgeRightSidebar';
import { HowItWorksDialog } from '../components/HowItWorksDialog';
import { mockAccounts } from '@/shared/lib/mock-data';
import { cn } from '@/shared/lib/utils';

const PANEL_CLASS = 'relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm';

export default function BridgePage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const {
    products,
    isLoadingProducts,
    loadProducts,
    selectedProduct,
    selectedPair,
    currencyPairs,
    selectCurrencyPair,
  } = useBridgeStore();
  
  const {
    activeRequest,
    loadHistory,
    checkActiveRequest,
  } = useRateRequestStore();
  
  const { countdownDisplay } = useRateTimer();
  
  const [isCurrencyDrawerOpen, setIsCurrencyDrawerOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  
  // Load products and history on mount
  useEffect(() => {
    const initialize = async () => {
      await loadProducts();
      await loadHistory(1, 5);
    };
    
    initialize();
  }, [loadProducts, loadHistory]);
  
  // Check for active request when product changes
  useEffect(() => {
    if (selectedProduct) {
      checkActiveRequest(selectedProduct.id);
    }
  }, [selectedProduct, checkActiveRequest]);
  
  // Calculate balances
  const fiatAccounts = mockAccounts.filter(acc => acc.type === 'bank');
  const walletAccounts = mockAccounts.filter(acc => acc.type === 'wallet');
  
  const fiatBalance = fiatAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const cryptoBalance = walletAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  return (
    <div className={cn('flex', isMobile ? 'flex-col' : 'h-screen')}>
      {/* Main Content Area */}
      <div className={cn(
        'flex-1 overflow-y-auto transition-colors duration-150',
        isMobile ? '' : isRightSidebarOpen ? 'pr-[380px]' : 'pr-0'
      )}>
        <PageTransition className={isMobile ? 'space-y-4 p-4' : 'max-w-6xl mx-auto space-y-6 p-6'}>
          <DisabledWrapper feature="bridge-conversion">
            {/* Page Header with Help Button */}
            <div className="flex items-start justify-between gap-4">
              <PageHeader
                title={t`Bridge`}
                subtitle={t`Conecta fiat y crypto con tasas garantizadas.`}
              />
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => navigate('/suite/convert/bridge/history')}
                variant="outline"
                size="sm"
                className="rounded-lg border border-border hover:border-primary/30 transition-colors"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline"><Trans>Historial</Trans></span>
              </Button>
              <HowItWorksDialog />
            </div>
          </div>
          
          {/* Mobile: Currency Pair Button */}
          {isMobile && (
            <div className="relative">
              <CurrencyPairButton
                pair={selectedPair}
                onClick={() => setIsCurrencyDrawerOpen(true)}
              />
              
              {/* Currency Pair Dropdown - renders below button */}
              <AnimatePresence>
                {isCurrencyDrawerOpen && (
                  <CurrencyPairDrawer
                    open={isCurrencyDrawerOpen}
                    onClose={() => setIsCurrencyDrawerOpen(false)}
                    pairs={currencyPairs}
                    selectedPair={selectedPair}
                    onSelectPair={selectCurrencyPair}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
          
          {/* Swipeable Balance Card */}
          <SwipeableBalanceCard
            fiatBalance={fiatBalance}
            cryptoBalance={cryptoBalance}
            fiatCurrency="USD"
            cryptoCurrency="USDT"
          />

          
          {/* Product Selector */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-background/20 backdrop-blur-md animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductSelector />
          ) : (
            <Card className={PANEL_CLASS}>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
                  <div className="text-center space-y-1">
                    <p className="text-lg font-semibold text-foreground"><Trans>Sin productos disponibles.</Trans></p>
                    <p className="text-sm text-muted-foreground"><Trans>Explora los conectores disponibles para habilitar nuevos productos.</Trans></p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/suite/marketplace/connectors')}>
                    <Trans>Explorar conectores</Trans>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Operation Area: Active Request or Conversion Form */}
          {selectedProduct && (
            <div className={cn(
              'transition-colors duration-150',
              isMobile ? 'space-y-4' : 'space-y-6'
            )}>
              {activeRequest ? (
                <ActiveRateRequestCard />
              ) : (
                <ConversionForm />
              )}
            </div>
          )}
          </DisabledWrapper>
        </PageTransition>
      </div>

      {/* Desktop: Right Sidebar with Rates */}
      {!isMobile && (
        <>
          {/* Toggle Button */}
          <motion.div
            className={cn(
              'fixed top-1/2 -translate-y-1/2 z-30',
              isRightSidebarOpen ? 'right-[380px]' : 'right-0'
            )}
            animate={{ right: isRightSidebarOpen ? '380px' : '0px' }}
            transition={{ duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={cn(
                'w-8 h-16 rounded-l-xl',
                'bg-background/80 backdrop-blur-md border border-r-0 border-border',
                'hover:bg-background',
                'shadow-sm'
              )}
            >
              {isRightSidebarOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </motion.div>

          {/* Sidebar */}
          <AnimatePresence>
            {isRightSidebarOpen && (
              <motion.div
                initial={{ x: 380 }}
                animate={{ x: 0 }}
                exit={{ x: 380 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed right-0 top-0 w-[380px] h-screen border-l-[3px] border-border/50 bg-background/40 backdrop-blur-2xl pt-16 z-20"
              >
                <BridgeRightSidebar
                  selectedPair={selectedPair}
                  availablePairs={currencyPairs}
                  onSelectPair={selectCurrencyPair}
                  countdown={activeRequest ? countdownDisplay : undefined}
                  isActive={activeRequest !== null}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
