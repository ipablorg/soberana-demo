/**
 * BridgeRightSidebar Component
 * 
 * Right sidebar showing:
 * - Large current rate display
 * - List of all available currency pairs for quick selection
 * Desktop only component
 */

import { motion } from 'framer-motion';
import { TrendingUp, Clock } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { CurrencyPair } from '../types/bridge';
import { getCurrencyFlag } from '../utils/currency-flags';

interface BridgeRightSidebarProps {
  selectedPair: CurrencyPair | null;
  availablePairs: CurrencyPair[];
  onSelectPair: (from: string, to: string) => void;
  countdown?: string;
  isActive?: boolean;
}

export function BridgeRightSidebar({
  selectedPair,
  availablePairs,
  onSelectPair,
  countdown,
  isActive = false,
}: BridgeRightSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Current Rate - Large Display */}
      <div className="p-6 space-y-4">
        {selectedPair && (
          <>
            {/* Currency Pair Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{getCurrencyFlag(selectedPair.to)}</span>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedPair.from}/{selectedPair.to}
                  </h3>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-2 py-0 h-5 font-bold',
                      selectedPair.settlementType === 'SD'
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-warning/10 text-warning border-warning/30'
                    )}
                  >
                    {selectedPair.settlementType}
                  </Badge>
                </div>
              </div>
              
              {/* Live indicator */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 text-success text-xs font-semibold"
                >
                  <div className="w-2 h-2 rounded-full bg-success" />
                  Live
                </motion.div>
              )}
            </div>

            {/* Large Rate Display */}
            <motion.div
              key={selectedPair.rate}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ scale: { duration: 0.2 }, opacity: { duration: 0.2 } }}
              className={cn(
                'rounded-xl p-6 relative overflow-hidden',
                isActive
                  ? 'bg-primary/5 border border-primary/20'
                  : 'bg-muted/30 border border-border'
              )}
            >
              {/* Pulse animation for active state */}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                />
              )}
              
              <div className="relative z-10">
                <div className="flex items-baseline gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground font-medium">Tasa actual</span>
                </div>
                <div className="text-5xl font-bold font-mono tabular-nums text-foreground mb-1">
                  {selectedPair.rate.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  1 {selectedPair.from} = {selectedPair.rate.toFixed(2)} {selectedPair.to}
                </div>
              </div>

              {/* Countdown if active */}
              {countdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-sm"
                >
                  <Clock className="w-4 h-4 text-warning" />
                  <span className="text-muted-foreground">Tiempo restante:</span>
                  <span className="font-mono font-bold text-warning">{countdown}</span>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="px-6">
        <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Available Pairs List */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
          Otros pares disponibles
        </h4>
        
        <ScrollArea className="h-[calc(100vh-500px)]">
          <div className="space-y-2 pr-4">
            {availablePairs
              .filter((pair) => 
                !(pair.from === selectedPair?.from && pair.to === selectedPair?.to)
              )
              .map((pair) => {
                const flag = getCurrencyFlag(pair.to);
                
                return (
                  <button
                    key={`${pair.from}-${pair.to}`}
                    onClick={() => onSelectPair(pair.from, pair.to)}
                    className={cn(
                      'w-full rounded-xl p-3 transition-colors duration-150',
                      'border border-border',
                      'hover:border-primary/30 hover:bg-background/40',
                      'flex items-center justify-between group'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{flag}</span>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {pair.from}/{pair.to}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[9px] px-1 py-0 h-3.5 font-bold',
                              pair.settlementType === 'SD'
                                ? 'bg-success/10 text-success border-success/30'
                                : 'bg-warning/10 text-warning border-warning/30'
                            )}
                          >
                            {pair.settlementType}
                          </Badge>
                        </div>
                        <span className="text-sm font-bold font-mono tabular-nums text-foreground">
                          {pair.rate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

