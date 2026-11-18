import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { CheckCircle, Zap, AlertCircle } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import type { WidgetConfig } from '../../../types';

type HookState = 'idle' | 'selecting' | 'processing' | 'success' | 'failed';

interface HeadlessPaymentPreviewProps {
  config: Partial<WidgetConfig>;
  className?: string;
}

const STATE_LABELS: Record<HookState, string> = {
  idle: 'idle',
  selecting: 'selecting',
  processing: 'processing',
  success: 'success',
  failed: 'failed',
};

const STATE_VARIANT: Record<HookState, 'secondary' | 'success' | 'destructive' | 'outline'> = {
  idle: 'secondary',
  selecting: 'outline',
  processing: 'secondary',
  success: 'success',
  failed: 'destructive',
};

const DEMO_RAILS = ['USDC_BASE', 'FIAT_ACH'];
const DEMO_HASH = '0xa1b2c3d4e5f6deadbeef0000';

export function HeadlessPaymentPreview({ config, className }: HeadlessPaymentPreviewProps) {
  const [hookState, setHookState] = useState<HookState>('idle');
  const [selectedRail, setSelectedRail] = useState<string | null>(null);

  const widgetId = config.id ?? 'wgt_preview';
  const enabledRails = config.enabledRails?.length ? config.enabledRails : DEMO_RAILS;

  const simulate = (next: HookState) => setHookState(next);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          <Trans>usePayment</Trans>
          <span className="text-foreground/40 mx-1">{'{'}</span>
          <span className="text-foreground">widgetId</span>
          <span className="text-foreground/40">: </span>
          <span className="text-success">'{widgetId}'</span>
          <span className="text-foreground/40 ml-1">{'}'}</span>
        </p>
        <Badge variant="secondary" className="text-xs font-mono">
          <Trans>HEADLESS</Trans>
        </Badge>
      </div>

      <Separator />

      {/* State machine */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <Trans>Estado del hook</Trans>
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.keys(STATE_LABELS) as HookState[]).map((s) => (
            <button
              key={s}
              onClick={() => simulate(s)}
              className={cn(
                'text-xs font-mono px-2 py-0.5 rounded-md border transition-colors duration-150',
                hookState === s
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground font-mono">state:</span>
          <Badge variant={STATE_VARIANT[hookState]} className="text-xs font-mono">
            {hookState}
          </Badge>
        </div>
      </div>

      {/* Exposed data */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <Trans>Datos expuestos</Trans>
        </p>
        <div className="font-mono text-xs leading-relaxed space-y-0.5">
          <DataRow label="selectedRail" value={selectedRail ?? 'null'} dim={!selectedRail} />
          <DataRow label="availableRails" value={`[${enabledRails.map(r => `'${r}'`).join(', ')}]`} />
          <DataRow label="amount" value="150" />
          <DataRow label="currency" value="'USD'" />
          {hookState === 'success' && (
            <DataRow label="txHash" value={`'${DEMO_HASH}'`} highlight />
          )}
        </div>
      </div>

      {/* Available actions */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 flex flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          <Trans>Funciones disponibles</Trans>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {enabledRails.map(rail => (
            <Button
              key={rail}
              variant="outline"
              size="sm"
              className="h-6 text-xs font-mono px-2"
              onClick={() => { setSelectedRail(rail); simulate('selecting'); }}
            >
              selectRail('{rail}')
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs font-mono px-2"
            onClick={() => simulate('processing')}
            disabled={hookState !== 'selecting'}
          >
            confirm()
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs font-mono px-2"
            onClick={() => { setSelectedRail(null); simulate('idle'); }}
          >
            cancel()
          </Button>
        </div>
      </div>

      {/* State feedback */}
      <AnimatePresence mode="wait">
        {hookState === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2"
          >
            <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
            <p className="text-xs font-mono text-success">
              {t`onEvent('payment:success', { txHash, amount, currency, railId })`}
            </p>
          </motion.div>
        )}
        {hookState === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
          >
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-xs font-mono text-destructive">
              {t`onEvent('payment:failed', { code, message })`}
            </p>
          </motion.div>
        )}
        {hookState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
          >
            <Zap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs font-mono text-muted-foreground">
              <Trans>isLoading: true — procesando en red seleccionada...</Trans>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DataRow({
  label,
  value,
  dim = false,
  highlight = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      <span className={cn(
        dim && 'text-muted-foreground/50',
        highlight && 'text-success',
        !dim && !highlight && 'text-foreground',
      )}>
        {value}
      </span>
    </div>
  );
}
