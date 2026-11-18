import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Smartphone, Tablet, Monitor, Layers, FileCode } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import type { WidgetConfig, WidgetEvent, WidgetEventType } from '../../types';
import { BORDER_RADIUS_MAP, FONT_FAMILY_MAP } from '../../config/branding-defaults';
import { PaymentButtonWidget } from '../preview/payment-button/PaymentButtonWidget';
import { KycModuleWidget } from '../preview/kyc-module/KycModuleWidget';
import { WalletDashboardWidget } from '../preview/wallet-dashboard/WalletDashboardWidget';
import { InvoicePaymentWidget } from '../preview/invoice-payment/InvoicePaymentWidget';
import { HeadlessPaymentPreview } from '../preview/headless/HeadlessPaymentPreview';
import { HeadlessKycPreview } from '../preview/headless/HeadlessKycPreview';

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface LivePreviewProps {
  config: Partial<WidgetConfig>;
  onEvent?: <T extends WidgetEventType>(event: WidgetEvent<T>) => void;
  className?: string;
}

const DEVICE_FRAME: Record<PreviewDevice, string> = {
  mobile: 'w-[375px] max-h-[600px]',
  tablet: 'w-[640px] max-h-[520px]',
  desktop: 'w-full max-w-2xl max-h-[480px]',
};

const HOOK_LABEL: Record<string, string> = {
  'payment-button': 'usePayment',
  'kyc-module': 'useKyc',
  'wallet-dashboard': 'useWallet',
  'invoice-payment': 'useInvoice',
};

export function LivePreview({ config, onEvent, className }: LivePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('mobile');
  const isHeadless = config.deliveryMode === 'headless';

  const theme = config.theme;
  const themeVars = theme
    ? ({
        '--w-primary': theme.primaryColor,
        '--w-bg': theme.backgroundColor,
        '--w-text': theme.textColor,
        '--w-radius': BORDER_RADIUS_MAP[theme.borderRadius],
        '--w-font': FONT_FAMILY_MAP[theme.fontFamily],
      } as React.CSSProperties)
    : {};

  const previewConfig: WidgetConfig = {
    id: 'preview',
    type: config.type ?? 'payment-button',
    name: config.name ?? 'Preview',
    theme: theme ?? { primaryColor: '#ffffff', backgroundColor: '#09090b', textColor: '#fafafa', borderRadius: 'lg', fontFamily: 'geist', companyName: 'Preview', darkMode: true },
    enabledRails: config.enabledRails ?? ['USDC_BASE'],
    features: config.features ?? {},
    targetSegment: 'generic',
    allowedOrigins: [],
    createdAt: '',
    updatedAt: '',
    status: 'draft',
    deliveryMode: config.deliveryMode,
    complianceRules: config.complianceRules,
  };

  // ── Headless mode: split view ────────────────────────────────
  if (isHeadless) {
    const hookLabel = HOOK_LABEL[config.type ?? 'payment-button'] ?? 'usePayment';
    return (
      <div className={cn('flex flex-col gap-3 w-full', className)}>
        <div className="flex items-center gap-2">
          <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-mono">
            <Trans>SDK Preview</Trans> — <span className="text-foreground">{hookLabel}</span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          {(!config.type || config.type === 'payment-button' || config.type === 'wallet-dashboard' || config.type === 'invoice-payment') && (
            <HeadlessPaymentPreview config={previewConfig} />
          )}
          {config.type === 'kyc-module' && (
            <HeadlessKycPreview config={previewConfig} />
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          <Trans>Tu DOM. Tus estilos. La lógica de Soberana.</Trans>
        </p>
      </div>
    );
  }

  // ── Widget mode: device frame ────────────────────────────────
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Device selector */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
        {([
          { d: 'mobile' as const, Icon: Smartphone },
          { d: 'tablet' as const, Icon: Tablet },
          { d: 'desktop' as const, Icon: Monitor },
        ] as const).map(({ d, Icon }) => (
          <Button
            key={d}
            variant={device === d ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setDevice(d)}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
      </div>

      {/* Device frame */}
      <div
        className={cn(
          'rounded-xl border-2 border-foreground/20 bg-card overflow-auto transition-[width,max-height] duration-200',
          DEVICE_FRAME[device],
        )}
      >
        <div className="p-4" style={themeVars}>
          {config.type
            ? (() => {
                switch (config.type) {
                  case 'payment-button':
                    return <PaymentButtonWidget config={previewConfig} onEvent={onEvent} isPreview />;
                  case 'kyc-module':
                    return <KycModuleWidget config={previewConfig} onEvent={onEvent} isPreview />;
                  case 'wallet-dashboard':
                    return <WalletDashboardWidget config={previewConfig} onEvent={onEvent} isPreview />;
                  case 'invoice-payment':
                    return <InvoicePaymentWidget config={previewConfig} onEvent={onEvent} isPreview />;
                }
              })()
            : (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Layers className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground text-center">
                  <Trans>Selecciona un tipo de widget para ver la vista previa</Trans>
                </p>
              </div>
            )
          }
        </div>
      </div>

      <Separator className="w-full max-w-xs" />

      <p className="text-xs text-muted-foreground">
        <Trans>Vista previa con tu configuración actual</Trans>
      </p>
    </div>
  );
}
