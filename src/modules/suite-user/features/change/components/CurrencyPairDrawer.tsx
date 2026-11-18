/**
 * CurrencyPairDrawer Component
 * 
 * Dropdown list that appears below the currency button
 * Compact list of all available currency pairs
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Check, Search, X } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { getCurrencyFlag } from '../utils/currency-flags';
import { CurrencyPair } from '../types/bridge';

interface CurrencyPairDrawerProps {
  open: boolean;
  onClose: () => void;
  pairs: CurrencyPair[];
  selectedPair: CurrencyPair | null;
  onSelectPair: (from: string, to: string) => void;
}

export function CurrencyPairDrawer({
  open,
  onClose,
  pairs,
  selectedPair,
  onSelectPair,
}: CurrencyPairDrawerProps) {
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPairs = pairs.filter(pair => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pair.to.toLowerCase().includes(query) ||
      pair.from.toLowerCase().includes(query)
    );
  });
  
  const handleSelect = (pair: CurrencyPair) => {
    onSelectPair(pair.from, pair.to);
    onClose();
  };
  
  if (!open) return null;
  
  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      
      {/* Dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 right-0 mt-2 z-50 mx-auto max-w-6xl px-6"
      >
        <div className="rounded-xl border border-border bg-background/95 backdrop-blur-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <div>
              <h3 className="text-lg font-semibold"><Trans>Seleccionar par de moneda</Trans></h3>
              <p className="text-xs text-muted-foreground"><Trans>Elige el par USDT con el que deseas operar</Trans></p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-background/40 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          {pairs.length > 4 && (
            <div className="px-4 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t`Buscar moneda...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 rounded-xl border-none bg-background/40 backdrop-blur-sm text-sm"
                />
              </div>
            </div>
          )}
          
          {/* Pairs List */}
          <ScrollArea className="max-h-[50vh] p-4">
            <div className="space-y-1.5">
            {filteredPairs.map((pair) => {
              const isSelected = selectedPair?.from === pair.from && selectedPair?.to === pair.to;
              const flag = getCurrencyFlag(pair.to);
              
              return (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => handleSelect(pair)}
                  className={cn(
                    'w-full rounded-lg p-2.5 transition-colors duration-150',
                    'flex items-center justify-between',
                    isSelected
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-background/40 border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Flag */}
                    <span className="text-xl">{flag}</span>
                    
                    {/* Pair Info */}
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">
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
                      <span className="text-base font-bold font-mono tabular-nums text-foreground">
                        {pair.rate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-lg bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
            
            {filteredPairs.length === 0 && (
              <div className="py-6 text-center text-muted-foreground">
                <p className="text-sm"><Trans>Sin pares disponibles</Trans></p>
                <p className="text-xs mt-0.5"><Trans>Intenta con otro término</Trans></p>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
}

