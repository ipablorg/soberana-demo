/**
 * ActiveRateRequestCard Component
 * 
 * Displays active rate request with:
 * - Countdown timer
 * - Locked rate
 * - Amount (for close/prefund)
 * - Wallet address (with copy)
 * - Unfreeze/Cancel button
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { Clock, Copy, Snowflake, X } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useBridgeStore } from '../stores/useBridgeStore';
import { useRateRequestStore } from '../stores/useRateRequestStore';
import { useRateTimer } from '../hooks/useRateTimer';
import { useRateRequest } from '../hooks/useRateRequest';

const PANEL_CLASS = 'relative overflow-hidden rounded-xl border border-border bg-background/30 backdrop-blur-2xl shadow-sm';

export function ActiveRateRequestCard() {
  const { t } = useLingui();
  const { selectedProduct, selectedPair } = useBridgeStore();
  const { activeRequest } = useRateRequestStore();
  const { timeRemaining, countdownDisplay, isExpired } = useRateTimer();
  const { cancelRequest, isCancelling } = useRateRequest();
  
  if (!activeRequest || !selectedProduct) {
    return null;
  }
  
  const isFreezeProduct = selectedProduct.type === 'freeze';
  const totalTime = selectedProduct.time * 60; // seconds
  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  
  const handleCopyWallet = () => {
    if (activeRequest.walletAddress) {
      navigator.clipboard.writeText(activeRequest.walletAddress);
      toast.success(t`Dirección copiada`);
    }
  };
  
  const handleCancel = async () => {
    await cancelRequest();
  };
  
  return (
    <Card className={cn(
      PANEL_CLASS,
'border',
    isExpired ? 'border-destructive/30' : 'border-primary/30'
    )}>
      <CardContent className="p-6 space-y-6">
        {/* Header with countdown */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isExpired
                ? 'bg-destructive/10 backdrop-blur-sm'
                : 'bg-primary/10 backdrop-blur-sm animate-pulse'
            )}>
              {isExpired ? (
                <X className="w-6 h-6 text-destructive" />
              ) : (
                <Snowflake className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className={cn(
                'text-lg font-semibold',
                isExpired ? 'text-destructive' : 'text-primary'
              )}>
                {isExpired ? t`Solicitud expirada` : isFreezeProduct ? t`Tasa congelada` : t`Tasa cerrada`}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock className={cn(
                  'w-4 h-4',
                  isExpired ? 'text-destructive' : 'text-primary'
                )} />
                <span className={cn(
                  'text-sm font-medium',
                  isExpired ? 'text-destructive' : 'text-primary'
                )}>
                  {countdownDisplay}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress circle (mobile-friendly alternative) */}
          <div className="hidden md:flex w-16 h-16 items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-background/40"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                className={cn(
                  'transition-colors duration-150',
                  isExpired ? 'text-destructive' : 'text-primary'
                )}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        
        {/* Progress bar (mobile) */}
        <div className="md:hidden">
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Locked rate info */}
        <div className="rounded-xl bg-muted/30 backdrop-blur-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground"><Trans>Tasa congelada</Trans></span>
            <span className="text-2xl font-bold font-mono tabular-nums text-foreground">
              {activeRequest.finalRate.toFixed(2)} {selectedPair?.to}
            </span>
          </div>
          
          {/* Show amount for non-freeze products */}
          {!isFreezeProduct && activeRequest.initialAmount > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground"><Trans>Debes enviar</Trans></span>
                <span className="font-semibold font-mono tabular-nums">
                  {activeRequest.initialAmount.toLocaleString()} USDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground"><Trans>Recibirás</Trans></span>
                <span className="font-semibold font-mono tabular-nums">
                  {activeRequest.totalFiat.toLocaleString()} {selectedPair?.to}
                </span>
              </div>
            </>
          )}
        </div>
        
        {/* Freeze product message */}
        {isFreezeProduct && !isExpired && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 p-4"
          >
            <p className="text-sm text-primary font-medium">
              <Trans>Durante los próximos {selectedProduct.time} minutos puedes hacer operaciones con cualquier monto usando esta tasa garantizada.</Trans>
            </p>
          </motion.div>
        )}
        
        {/* Wallet address (if available) */}
        {activeRequest.walletAddress && (
          <div className="rounded-xl bg-muted/30 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1"><Trans>Dirección de wallet</Trans></p>
                <p className="text-sm font-mono truncate">
                  {activeRequest.walletAddress}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyWallet}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Cancel button */}
        {!isExpired && (
          <Button
            onClick={handleCancel}
            disabled={isCancelling}
            variant="outline"
            size="lg"
            className="w-full rounded-lg"
          >
            {isCancelling ? (
              <>
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                <Trans>Un momento...</Trans>
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                {isFreezeProduct ? t`Descongelar` : t`Cancelar solicitud`}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

