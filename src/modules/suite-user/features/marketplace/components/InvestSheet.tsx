import { useState } from 'react';
import { CheckCircle2, Loader2 } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
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
import { SharesCalculator } from './SharesCalculator';
import { useInvestMutation } from '../hooks/useInvestMutation';
import type { Vault } from '../types/vault.types';
import { Trans, useLingui } from '@lingui/react/macro';

interface InvestSheetProps {
  vault: Vault | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FlowStep = 'input' | 'loading' | 'success';

export function InvestSheet({ vault, open, onOpenChange }: InvestSheetProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<FlowStep>('input');
  const investMutation = useInvestMutation();
  const { t: _t } = useLingui();

  const numericAmount = parseFloat(amount) || 0;
  const isValid = vault ? numericAmount >= vault.minInvestmentUsd : false;

  const handleConfirm = async () => {
    if (!vault || !isValid) return;
    setStep('loading');
    try {
      await investMutation.mutateAsync({
        vaultSlug: vault.slug,
        amountUsd: numericAmount,
        sharePrice: vault.sharePrice,
      });
      setStep('success');
    } catch {
      setStep('input');
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setAmount('');
      setStep('input');
    }
    onOpenChange(isOpen);
  };

  if (!vault) return null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="sm:max-w-md w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">{vault.pair}</Badge>
          </div>
          <SheetTitle className="font-heading">Invest in {vault.name}</SheetTitle>
          <SheetDescription>
            Share price: ${vault.sharePrice.toFixed(2)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Amount (USDC)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg font-mono tabular-nums"
                    min={vault.minInvestmentUsd}
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Min: ${vault.minInvestmentUsd.toLocaleString()}
                  </p>
                </div>

                {numericAmount > 0 && (
                  <SharesCalculator amountUsd={numericAmount} sharePrice={vault.sharePrice} />
                )}

                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">You deposit</span>
                    <span className="font-semibold font-mono tabular-nums">${numericAmount.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated shares</span>
                    <span className="font-mono tabular-nums">
                      {vault.sharePrice > 0 ? (numericAmount / vault.sharePrice).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Management fee</span>
                      <span>{vault.managementFeePct}% annual</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Performance fee</span>
                      <span>{vault.performanceFeePct}% on returns</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  disabled={!isValid}
                  onClick={handleConfirm}
                >
                  Confirm Investment
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
                <p className="text-foreground font-semibold"><Trans>Un momento...</Trans></p>
                <p className="text-sm text-muted-foreground mt-1"><Trans>Un momento...</Trans></p>
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
                <p className="text-lg font-heading font-semibold text-foreground"><Trans>Inversión enviada</Trans></p>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  <Trans>Tus shares se acreditarán una vez completada la liquidación.</Trans>
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => handleClose(false)}
                >
                  <Trans>Listo</Trans>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
