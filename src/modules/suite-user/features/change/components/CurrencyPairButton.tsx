/**
 * CurrencyPairButton Component
 * 
 * Compact button showing current currency pair with flag
 * Opens drawer when clicked
 */

import { ChevronDown } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { getCurrencyFlag } from '../utils/currency-flags';
import { CurrencyPair } from '../types/bridge';

interface CurrencyPairButtonProps {
  pair: CurrencyPair | null;
  onClick: () => void;
  className?: string;
}

export function CurrencyPairButton({ pair, onClick, className }: CurrencyPairButtonProps) {
  if (!pair) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={onClick}
        className={cn(
          'w-full rounded-xl border border-border bg-background/30 backdrop-blur-md h-16',
          className
        )}
      >
        <span className="text-muted-foreground">Seleccionar par de moneda</span>
      </Button>
    );
  }
  
  const flag = getCurrencyFlag(pair.to);
  
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border border-border bg-background/30 backdrop-blur-md h-16 justify-between',
        'hover:bg-background/40 transition-colors duration-150',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Flag */}
        <span className="text-3xl">{flag}</span>
        
        {/* Pair and Rate */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold">
            {pair.from}/{pair.to}
          </span>
          <motion.span
            key={pair.rate}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold font-mono tabular-nums text-foreground"
          >
            {pair.rate.toFixed(2)}
          </motion.span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Settlement Badge */}
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-bold',
            pair.settlementType === 'SD'
              ? 'bg-success/10 text-success border-success/30'
              : 'bg-warning/10 text-warning border-warning/30'
          )}
        >
          {pair.settlementType}
        </Badge>
        
        {/* Chevron */}
        <ChevronDown className="w-5 h-5 text-muted-foreground" />
      </div>
    </Button>
  );
}

