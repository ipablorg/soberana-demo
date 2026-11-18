/**
 * SwipeableBalanceCard Component
 * 
 * Simplified wallet-style card with swipe functionality to toggle between Fiat and Crypto views
 * Shows only consolidated balance per wallet type
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wallet, Coins } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const PANEL_CLASS = 'relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm';

interface SwipeableBalanceCardProps {
  fiatBalance: number;
  cryptoBalance: number;
  fiatCurrency?: string;
  cryptoCurrency?: string;
}

type ViewMode = 'fiat' | 'crypto';

export function SwipeableBalanceCard({
  fiatBalance,
  cryptoBalance,
  fiatCurrency = 'USD',
  cryptoCurrency = 'USDT',
}: SwipeableBalanceCardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('fiat');
  
  const isFiat = viewMode === 'fiat';
  const currentBalance = isFiat ? fiatBalance : cryptoBalance;
  const currentCurrency = isFiat ? fiatCurrency : cryptoCurrency;
  
  const formatCurrency = (amount: number) => {
    if (isFiat) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: fiatCurrency,
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return `${amount.toLocaleString()} ${cryptoCurrency}`;
  };
  
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setViewMode('crypto');
    } else {
      setViewMode('fiat');
    }
  };
  
  const toggleView = () => {
    setViewMode(prev => prev === 'fiat' ? 'crypto' : 'fiat');
  };
  
  return (
    <Card className="relative overflow-hidden rounded-xl border border-border backdrop-blur-2xl shadow-sm bg-card">
      <CardContent className="relative p-0 z-10">
        <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-background/40 backdrop-blur-sm flex items-center justify-center">
                  {isFiat ? (
                    <Wallet className="w-5 h-5 text-foreground" />
                  ) : (
                    <Coins className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    Loopay {isFiat ? 'Wallet' : 'Crypto'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    ID: LOOPAY-9201
                  </p>
                </div>
              </div>
              
              {/* View toggle badges */}
              <div className="flex gap-1 p-1 rounded-xl bg-background/20 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode('fiat')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150',
                    isFiat
                      ? 'bg-primary/20 text-foreground backdrop-blur-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Fiat
                </button>
                <button
                  onClick={() => setViewMode('crypto')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150',
                    !isFiat
                      ? 'bg-primary/20 text-foreground backdrop-blur-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Crypto
                </button>
              </div>
            </div>
            
            {/* Main Balance - Animated */}
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, x: isFiat ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isFiat ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <p className="text-4xl md:text-6xl font-bold font-mono tabular-nums text-foreground">
                  {formatCurrency(currentBalance)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Balance consolidado
                </p>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSwipe('right')}
                disabled={isFiat}
                className={cn(
                  'rounded-xl',
                  isFiat && 'opacity-30 cursor-not-allowed'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="ml-1 text-xs">Fiat</span>
              </Button>
              
              <button
                onClick={toggleView}
                className="px-4 py-2 rounded-xl bg-muted/50 backdrop-blur-sm hover:bg-muted transition-colors"
              >
                <p className="text-xs text-muted-foreground">
                  Desliza para cambiar
                </p>
              </button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSwipe('left')}
                disabled={!isFiat}
                className={cn(
                  'rounded-xl',
                  !isFiat && 'opacity-30 cursor-not-allowed'
                )}
              >
                <span className="mr-1 text-xs">Crypto</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}

