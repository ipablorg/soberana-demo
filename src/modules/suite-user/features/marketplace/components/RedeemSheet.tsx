import { useState } from 'react';
import { CheckCircle2, Info, Loader2 } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useRedeemMutation } from '../hooks/useRedeemMutation';
import { useLingui } from '@lingui/react/macro';
import type { VaultPosition, RedeemMode } from '../types/vault.types';

interface RedeemSheetProps {
  position: VaultPosition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FlowStep = 'input' | 'loading' | 'success';

export function RedeemSheet({ position, open, onOpenChange }: RedeemSheetProps) {
  const { t } = useLingui();
  const [mode, setMode] = useState<RedeemMode>('shares');
  const [value, setValue] = useState('');
  const [step, setStep] = useState<FlowStep>('input');
  const redeemMutation = useRedeemMutation();

  const numericValue = parseFloat(value) || 0;

  const computedShares = mode === 'shares'
    ? numericValue
    : position ? numericValue / position.sharePrice : 0;

  const computedUsd = mode === 'amount'
    ? numericValue
    : position ? numericValue * position.sharePrice : 0;

  const maxShares = position?.sharesBalance ?? 0;
  const maxUsd = position?.currentValueUsd ?? 0;
  const isValid = mode === 'shares'
    ? numericValue > 0 && numericValue <= maxShares
    : numericValue > 0 && numericValue <= maxUsd;

  const handleConfirm = async () => {
    if (!position || !isValid) return;
    setStep('loading');
    try {
      await redeemMutation.mutateAsync({
        vaultSlug: position.vaultSlug,
        mode,
        sharesAmount: mode === 'shares' ? numericValue : undefined,
        amountUsd: mode === 'amount' ? numericValue : undefined,
        sharePrice: position.sharePrice,
      });
      setStep('success');
    } catch {
      setStep('input');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setValue('');
      setMode('shares');
      setStep('input');
    }
    onOpenChange(isOpen);
  };

  if (!position) return null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">{position.pair}</Badge>
          </div>
          <SheetTitle className="font-heading">Redeem from {position.vaultName}</SheetTitle>
          <SheetDescription>
            {position.sharesBalance.toFixed(2)} shares · ${position.currentValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </SheetDescription>
        </SheetHeader>

        <div className="text-center py-3">
          <p className="font-heading text-sm font-semibold text-foreground">
            <TypewriterText
              text={
                step === 'input'
                  ? '¿Cuánto quieres redimir?'
                  : step === 'loading'
                    ? 'Un momento...'
                    : 'Redención completada'
              }
              speed={30}
              delay={0}
            />
          </p>
        </div>

        <div className="mt-3 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="flex rounded-xl border border-border overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`flex-1 py-2 text-sm font-medium rounded-none h-auto transition-colors ${
                      mode === 'shares'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => { setMode('shares'); setValue(''); }}
                  >
                    By Shares
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={`flex-1 py-2 text-sm font-medium rounded-none h-auto transition-colors ${
                      mode === 'amount'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => { setMode('amount'); setValue(''); }}
                  >
                    By Amount
                  </Button>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {mode === 'shares' ? 'Shares to redeem' : 'Amount (USDC)'}
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="text-lg font-mono tabular-nums"
                    min={0}
                    max={mode === 'shares' ? maxShares : maxUsd}
                    step="0.01"
                  />
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      Max: {mode === 'shares' ? maxShares.toFixed(2) : `$${maxUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      className="text-xs text-primary font-medium h-auto p-0"
                      onClick={() => setValue(mode === 'shares' ? maxShares.toString() : maxUsd.toString())}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {numericValue > 0 && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shares to redeem</span>
                      <span className="font-semibold font-mono tabular-nums">{computedShares.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Estimated USDC</span>
                      <span className="font-semibold font-mono tabular-nums">
                        ${computedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Share price</span>
                      <span className="font-mono tabular-nums">${position.sharePrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    If the Vault doesn't have sufficient reserves, your shares will be restored automatically.
                  </p>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={!isValid}
                  onClick={handleConfirm}
                >
                  Confirm Redemption
                </Button>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-foreground font-semibold">{t`Un momento...`}</p>
                <p className="text-sm text-muted-foreground mt-1">{t`Un momento...`}</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <p className="text-lg font-heading font-semibold text-foreground">Redención enviada</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Tus USDC se acreditarán una vez completada la liquidación.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => handleClose(false)}
                >
                  Listo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
