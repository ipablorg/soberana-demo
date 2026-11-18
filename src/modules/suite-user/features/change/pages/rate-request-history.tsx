import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, ChevronLeft, ChevronRight } from '@/shared/components/animated-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { PageTransition } from '@/shared/components/motion/PageTransition';
import { RateRequestHistory } from '../components/RateRequestHistory';
import { BridgeRightSidebar } from '../components/BridgeRightSidebar';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateTimer } from '../hooks/useRateTimer';
import { useMobile } from '@/shared/hooks/use-mobile';
import { cn } from '@/shared/lib/utils';
import { useLingui } from '@lingui/react/macro';

export default function RateRequestHistoryPage() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { t } = useLingui();
  const { loadHistory, activeRequest } = useRateRequestStore();
  const { selectedPair, currencyPairs, selectCurrencyPair } = useBridgeStore();
  const { countdownDisplay } = useRateTimer();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  
  useEffect(() => {
    loadHistory(1, 20);
  }, [loadHistory]);
  
  return (
    <div className={cn('flex', isMobile ? 'flex-col' : 'h-screen')}>
      <div className={cn(
        'flex-1 overflow-y-auto transition-colors duration-150',
        isMobile ? '' : isRightSidebarOpen ? 'pr-[380px]' : 'pr-0'
      )}>
        <PageTransition className={isMobile ? 'space-y-4 p-4' : 'max-w-6xl mx-auto space-y-6 p-6'}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-xl hover:bg-background/40 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <PageHeader
                  title={t`Historial`}
                  subtitle={t`Tus operaciones anteriores.`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/20 backdrop-blur-sm">
              <History className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">{t`Historial completo`}</span>
            </div>
          </div>
          
          <RateRequestHistory showPagination />
        </PageTransition>
      </div>

      {!isMobile && (
        <>
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
