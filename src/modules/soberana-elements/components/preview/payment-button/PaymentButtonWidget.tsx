import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Progress } from '@/shared/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Separator } from '@/shared/components/ui/separator';
import { CheckCircle, Zap, HelpCircle, AlertCircle } from '@/shared/components/animated-icons';
import type { WidgetConfig, WidgetEvent, WidgetEventType } from '../../../types';
import { PAYMENT_RAILS } from '../../../config/rails-catalog';

type PayStep = 'idle' | 'rail-select' | 'processing' | 'success' | 'failed' | 'blocked';

const ZENTINEL_TIPS: Record<string, string> = {
  USDC_BASE: 'Tipo de cambio interbancario. Fee total: 0.5%. Tu banco local cobra ~3.5% de spread.',
  USDT_POLYGON: 'Activo de liquidación en Polygon. Fee: 0.8%. Sin cargos adicionales del banco.',
  FIAT_PSE: 'Débito directo. Tu banco puede cobrar una comisión adicional de $2–5 COP.',
  FIAT_BRE_B: 'Liquidación instantánea por llave Bre-B. Fee mínimo sin intermediarios.',
  DEFAULT: 'Este riel ofrece las mejores tarifas disponibles para tu región.',
};

interface PaymentButtonWidgetProps {
  config: WidgetConfig;
  amount?: number;
  currency?: string;
  description?: string;
  isPreview?: boolean;
  onEvent?: <T extends WidgetEventType>(event: WidgetEvent<T>) => void;
}

export function PaymentButtonWidget({
  config,
  amount = 150,
  currency = 'USD',
  description,
  isPreview = false,
  onEvent,
}: PaymentButtonWidgetProps) {
  const [step, setStep] = useState<PayStep>('idle');
  const [selectedRail, setSelectedRail] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState('');

  const enabledRails = PAYMENT_RAILS.filter((r) => config.enabledRails.includes(r.id));
  const showZentinel = config.features.zentinelTooltips;

  const emit = <T extends WidgetEventType>(type: T, payload: WidgetEvent<T>['payload']) => {
    onEvent?.({
      type,
      widgetId: config.id,
      timestamp: new Date().toISOString(),
      payload,
    } as WidgetEvent<T>);
  };

  const openModal = () => {
    setStep('rail-select');
    if (enabledRails.length > 0) setSelectedRail(enabledRails[0]?.id ?? null);
    emit('widget:ready', { widgetId: config.id });
  };

  const confirm = () => {
    if (!selectedRail) return;

    if (isPreview) {
      emit('widget:error', {
        code: 'PREVIEW_EXECUTION_BLOCKED',
        message: t`Las transacciones reales solo se ejecutan en producción.`,
      });
      setStep('blocked');
      return;
    }

    setStep('processing');
    setProgress(0);
    emit('payment:initiated', { amount, currency, railId: selectedRail });

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        const hash = isPreview
          ? `0xa1b2c3d4${config.id.slice(-8).padStart(8, '0')}`
          : `0x${Date.now().toString(16).padStart(16, '0')}`;
        setTxHash(hash);
        setStep('success');
        emit('payment:success', { txHash: hash, amount, currency, railId: selectedRail });
      }
    }, 300);
  };

  const reset = () => {
    setStep('idle');
    setProgress(0);
    setTxHash('');
  };

  return (
    <div className="relative">
      {isPreview && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 z-10 text-xs">
          {t`PREVIEW`}
        </Badge>
      )}

      <Button variant="gradient" className="w-full" onClick={openModal}>
        <Zap className="mr-2 h-4 w-4" />
        {description ?? t`Pagar ${amount} ${currency}`}
      </Button>

      <Dialog open={step !== 'idle'} onOpenChange={(open) => !open && reset()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {step === 'success' ? (
                <Trans>Pago exitoso</Trans>
              ) : step === 'failed' ? (
                <Trans>Error en el pago</Trans>
              ) : step === 'blocked' ? (
                <Trans>Vista previa</Trans>
              ) : step === 'processing' ? (
                <Trans>Procesando...</Trans>
              ) : (
                <Trans>Confirmar pago</Trans>
              )}
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 'rail-select' && (
              <motion.div
                key="rail-select"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-4"
              >
                <div className="text-center">
                  <p className="font-mono tabular-nums text-right text-3xl font-bold text-foreground">
                    {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
                  </p>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  )}
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Trans>Método de pago</Trans>
                  </p>
                  {enabledRails.map((rail) => (
                    <button
                      key={rail.id}
                      type="button"
                      onClick={() => setSelectedRail(rail.id)}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors duration-150 text-left ${
                        selectedRail === rail.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full border-2 transition-colors duration-150 ${
                            selectedRail === rail.id
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}
                        />
                        <span className="text-sm font-medium">{rail.label}</span>
                        {rail.recommended && (
                          <Badge variant="success" className="text-xs">
                            <Trans>Recomendado</Trans>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {rail.fee}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rail.estimatedTime}
                        </Badge>
                        {showZentinel && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[220px] text-xs">
                              {ZENTINEL_TIPS[rail.id] ?? ZENTINEL_TIPS.DEFAULT}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Button variant="gradient" onClick={confirm} disabled={!selectedRail}>
                  <Trans>Confirmar pago</Trans>
                </Button>

                {isPreview && (
                  <p className="text-xs text-muted-foreground text-center -mt-1">
                    <Trans>Preview · En producción se ejecutaría el pago real.</Trans>
                  </p>
                )}
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4 py-4"
              >
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  <Trans>Verificando transacción...</Trans>
                </p>
              </motion.div>
            )}

            {step === 'blocked' && (
              <motion.div
                key="blocked"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-3 py-2"
              >
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <Trans>
                      Pago bloqueado en Preview. En producción se ejecutaría el pago real a través
                      del riel seleccionado.
                    </Trans>
                  </AlertDescription>
                </Alert>
                <Button variant="outline" className="w-full" onClick={reset}>
                  <Trans>Cerrar</Trans>
                </Button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <p className="font-mono tabular-nums text-lg font-semibold">
                  {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
                </p>
                <p className="text-xs text-muted-foreground font-mono truncate max-w-full">
                  {txHash}
                </p>
                <Button variant="outline" className="w-full" onClick={reset}>
                  <Trans>Cerrar</Trans>
                </Button>
              </motion.div>
            )}

            {step === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3 py-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  <Trans>No se pudo procesar el pago. Intenta de nuevo.</Trans>
                </p>
                <Button variant="outline" className="w-full" onClick={() => setStep('rail-select')}>
                  <Trans>Reintentar</Trans>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
