/**
 * RateDisplay Component
 * 
 * Displays current rate with:
 * - Rate number (large and prominent)
 * - Settlement type badge (SD/ND)
 * - Timer/elapsed time
 * - Product description
 * - Lock icon
 */

import { Lock, Clock } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateTimer } from '../hooks/useRateTimer';

const PANEL_CLASS = 'relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm';

export function RateDisplay() {
  const { selectedProduct, selectedPair, lastRateUpdate } = useBridgeStore();
  const { elapsedDisplay, countdownDisplay, hasActiveCountdown } = useRateTimer();
  
  if (!selectedProduct || !selectedPair) {
    return (
      <Card className={PANEL_CLASS}>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-12 w-48 bg-background/20 rounded-xl animate-pulse mx-auto" />
              <div className="h-4 w-64 bg-background/20 rounded-lg animate-pulse mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const rate = selectedPair.rate;
  const settlementType = selectedPair.settlementType || 'SD';
  const isExpressProduct = selectedProduct.time === 0;
  
  return (
    <Card className={PANEL_CLASS}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Main rate display */}
          <div className="flex-1 space-y-2">
            {/* Settlement badge and rate */}
            <div className="flex items-center gap-3">
              <Badge
                variant={settlementType === 'SD' ? 'default' : 'secondary'}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-bold',
                  settlementType === 'SD'
                    ? 'bg-success/20 text-success border-success/50'
                    : 'bg-warning/20 text-warning border-warning/50'
                )}
              >
                {settlementType}
              </Badge>
              
              <motion.div
                key={rate}
                initial={{ scale: 1.05, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl md:text-5xl font-bold font-mono tabular-nums text-foreground"
              >
                {rate.toFixed(2)}
              </motion.div>
              
              <div className="text-2xl font-medium text-muted-foreground">
                {selectedPair.to}
              </div>
            </div>
            
            {/* Timer/elapsed display */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full',
                'bg-background/40 backdrop-blur-sm',
                hasActiveCountdown && 'border border-primary/30'
              )}>
                {hasActiveCountdown ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-primary">{countdownDisplay}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {isExpressProduct ? countdownDisplay || 'Actualizando...' : elapsedDisplay}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            {/* Product description */}
            {selectedProduct.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                {selectedProduct.description}
              </p>
            )}
          </div>
          
          {/* Lock icon decoration */}
          <div className="hidden md:flex w-20 h-20 rounded-xl bg-muted/50 backdrop-blur-sm items-center justify-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}

