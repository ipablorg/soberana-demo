/**
 * FloatingRateDisplay Component
 * 
 * Sticky/Fixed component showing the current rate prominently
 * Always visible while scrolling, with animations and large typography
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { getCurrencyFlag } from '../utils/currency-flags';
import { CurrencyPair } from '../types/bridge';
import { useMobile } from '@/shared/hooks/use-mobile';

interface FloatingRateDisplayProps {
  pair: CurrencyPair | null;
  rate: number;
  countdown?: string;
  isActive?: boolean;
  className?: string;
}

export function FloatingRateDisplay({
  pair,
  rate,
  countdown,
  isActive = false,
  className,
}: FloatingRateDisplayProps) {
  const isMobile = useMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  if (!pair) return null;
  
  const flag = getCurrencyFlag(pair.to);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={cn(
            'fixed z-30',
            isMobile
              ? 'top-16 left-1/2 -translate-x-1/2'
              : 'top-20 right-4',
            className
          )}
        >
          <motion.div
            key={rate}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'rounded-xl border border-border shadow-sm',
              'bg-background/80 backdrop-blur-2xl',
              isActive
                ? 'border-primary/30'
                : 'border-border',
              isMobile ? 'p-4' : 'p-6'
            )}
          >
            {/* Header: Pair + Flag */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className={cn(
                'font-semibold text-muted-foreground',
                isMobile ? 'text-xs' : 'text-sm'
              )}>
                {pair.from}/{pair.to}
              </span>
              <span className={isMobile ? 'text-2xl' : 'text-3xl'}>{flag}</span>
            </div>
            
            {/* Main Rate - VERY LARGE */}
            <div className="text-center">
              <motion.div
                key={rate}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'font-bold font-mono tabular-nums text-foreground',
                  isMobile ? 'text-5xl' : 'text-7xl'
                )}
              >
                {rate.toFixed(2)}
              </motion.div>
            </div>
            
            {/* Footer: Timer/Countdown + Settlement */}
            <div className="flex items-center justify-between mt-2 gap-2">
              {/* Timer or Lock */}
              <div className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full',
                'bg-background/40 backdrop-blur-sm',
                isActive && 'border border-primary/30'
              )}>
                {isActive && countdown ? (
                  <>
                    <Clock className={cn(
                      'text-primary',
                      isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )} />
                    <span className={cn(
                      'font-medium text-primary',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}>
                      {countdown}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className={cn(
                      'text-muted-foreground',
                      isMobile ? 'w-3 h-3' : 'w-3.5 h-3.5'
                    )} />
                    <span className={cn(
                      'text-muted-foreground',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}>
                      Live
                    </span>
                  </>
                )}
              </div>
              
              {/* Settlement Badge */}
              <Badge
                variant="outline"
                className={cn(
                  'font-bold',
                  isMobile ? 'text-xs px-2 py-0.5' : 'text-sm',
                  pair.settlementType === 'SD'
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-warning/10 text-warning border-warning/30'
                )}
              >
                {pair.settlementType}
              </Badge>
            </div>
            
            {/* Pulse animation when active */}
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-xl border border-primary/30 pointer-events-none"
                animate={{
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

