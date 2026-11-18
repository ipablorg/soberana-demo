import { useState, useEffect } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import {
  CheckCircle,
  FileText,
  HelpCircle,
  ArrowRight,
  Zap,
  Webhook,
  AlertCircle,
} from '@/shared/components/animated-icons';
import type { WidgetConfig, WidgetEvent, WidgetEventType } from '../../../types';
import { calculateRetention } from '../../../utils/retention-calculator';

type InvoiceStep = 'loading' | 'review' | 'processing' | 'success' | 'blocked';

interface MockInvoice {
  id: string;
  supplier: string;
  date: string;
  grossAmount: number;
  currency: string;
  description: string;
  country: string;
}

const MOCK_INVOICE: MockInvoice = {
  id: 'INV-2026-089',
  supplier: 'Consultora Andina S.A.S',
  date: '2026-04-29',
  grossAmount: 2500,
  currency: 'USD',
  description: 'Servicios profesionales — Consultoría estratégica Q2 2026',
  country: 'EC',
};

interface InvoicePaymentWidgetProps {
  config: WidgetConfig;
  invoiceId?: string;
  deepLinkPayload?: string;
  isPreview?: boolean;
  onEvent?: <T extends WidgetEventType>(event: WidgetEvent<T>) => void;
}

export function InvoicePaymentWidget({ config, isPreview = false, onEvent }: InvoicePaymentWidgetProps) {
  const [step, setStep] = useState<InvoiceStep>('loading');
  const [progress, setProgress] = useState(0);
  const [txHash, setTxHash] = useState('');

  const showRetention = config.features.retentionCalc;
  const showWebhook = config.features.accountingWebhook;
  const showZentinel = config.features.zentinelTooltips;

  const invoice = MOCK_INVOICE;
  const retention = showRetention
    ? calculateRetention(invoice.grossAmount, invoice.country)
    : null;

  const emit = <T extends WidgetEventType>(type: T, payload: WidgetEvent<T>['payload']) => {
    onEvent?.({
      type,
      widgetId: config.id,
      timestamp: new Date().toISOString(),
      payload,
    } as WidgetEvent<T>);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('review');
      emit('invoice:loaded', {
        invoiceId: invoice.id,
        amount: invoice.grossAmount,
        currency: invoice.currency,
      });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: load invoice once on mount
  }, []);

  const pay = () => {
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
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        const hash = isPreview
          ? `0xa1b2c3d4${config.id.slice(-8).padStart(8, '0')}`
          : `0x${Date.now().toString(16).padStart(16, '0')}`;
        setTxHash(hash);
        setStep('success');
        emit('invoice:paid', {
          invoiceId: invoice.id,
          txHash: hash,
          netAmount: retention?.net ?? invoice.grossAmount,
        });
        if (showRetention) {
          emit('retention:calculated', {
            gross: invoice.grossAmount,
            retention: retention?.retentionAmount ?? 0,
            net: retention?.net ?? invoice.grossAmount,
            rate: retention?.retentionRate ?? 0,
          });
        }
      }
    }, 350);
  };

  return (
    <div className="relative">
      {isPreview && (
        <Badge variant="secondary" className="absolute -top-2 -right-2 z-10 text-xs">
          {t`PREVIEW`}
        </Badge>
      )}

      <AnimatePresence mode="wait">
        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col gap-4"
          >
            {/* Invoice header */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">{invoice.supplier}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{invoice.date}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{invoice.description}</p>
            </div>

            {/* Amount breakdown */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground"><Trans>Valor bruto</Trans></span>
                <span className="font-mono tabular-nums text-right font-medium">
                  {invoice.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                </span>
              </div>

              {showRetention && retention && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">
                        <Trans>Retención {retention.regime}</Trans>
                      </span>
                      {showZentinel && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <HelpCircle className="h-3 w-3 text-muted-foreground/60" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[200px] text-xs">
                            Retención del {(retention.retentionRate * 100).toFixed(0)}% según normativa {retention.regime} para servicios profesionales 2026.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <span className="font-mono tabular-nums text-right text-destructive text-sm">
                      -{retention.retentionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground"><Trans>Neto a pagar</Trans></span>
                    <span className="font-mono tabular-nums text-right text-lg font-bold text-foreground">
                      {retention.net.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs w-fit">
                    <Trans>Certificado de retención generado automáticamente</Trans>
                  </Badge>
                </>
              )}

              {!showRetention && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-medium"><Trans>Total</Trans></span>
                    <span className="font-mono tabular-nums text-right text-lg font-bold">
                      {invoice.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {invoice.currency}
                    </span>
                  </div>
                </>
              )}
            </div>

            {showWebhook && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg bg-muted/30 px-3 py-2">
                <Webhook className="h-3.5 w-3.5 shrink-0" />
                <Trans>Al pagar, se enviará un webhook a tu ERP para actualizar el estado de la factura.</Trans>
              </div>
            )}

            <Button variant="gradient" onClick={pay}>
              <Zap className="mr-2 h-4 w-4" />
              <Trans>Pagar factura</Trans>
              <ArrowRight className="ml-2 h-4 w-4" />
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
            className="flex flex-col items-center gap-4 py-6"
          >
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground animate-pulse">
              <Trans>Procesando pago...</Trans>
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
                <Trans>Pago bloqueado en Preview. En producción se procesaría la factura real y se emitiría el webhook al ERP.</Trans>
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={() => setStep('review')}>
              <Trans>Volver</Trans>
            </Button>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4 py-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground"><Trans>Factura pagada</Trans></p>
              <p className="text-xs text-muted-foreground mt-1 font-mono truncate max-w-full">{txHash}</p>
            </div>
            {showWebhook && (
              <Badge variant="success" className="text-xs">
                <Trans>Webhook enviado al ERP ✓</Trans>
              </Badge>
            )}
            {showRetention && retention && (
              <Badge variant="outline" className="text-xs">
                <Trans>Certificado de retención generado ✓</Trans>
              </Badge>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
