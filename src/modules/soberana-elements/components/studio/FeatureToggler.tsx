import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Sparkles, Brain, Shield, Webhook, UserCheck, Zap, Link, DollarSign, ArrowDown } from '@/shared/components/animated-icons';
import type { WidgetFeatures, WidgetType } from '../../types';

interface FeatureDef {
  key: keyof WidgetFeatures;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  availableFor: WidgetType[];
}

const FEATURES: FeatureDef[] = [
  {
    key: 'zentinelTooltips',
    label: 'Zentinel — Justificación de tasa',
    description: 'Tooltips con tipo de cambio interbancario y fee real vs. banco local.',
    icon: Brain,
    badge: 'Zentinel AI',
    availableFor: ['payment-button', 'wallet-dashboard', 'invoice-payment'],
  },
  {
    key: 'complianceChat',
    label: 'Zentinel — Asistente AML',
    description: 'Chat de cumplimiento embebido cuando una transacción es bloqueada.',
    icon: Sparkles,
    badge: 'Zentinel AI',
    availableFor: ['payment-button', 'kyc-module', 'invoice-payment'],
  },
  {
    key: 'retentionCalc',
    label: 'Cálculo de retenciones',
    description: 'SRI / DIAN automático con generación de certificado digital.',
    icon: Shield,
    availableFor: ['invoice-payment'],
  },
  {
    key: 'accountingWebhook',
    label: 'Webhook al ERP',
    description: 'Asiento contable automático y actualización de estado en tu SaaS.',
    icon: Webhook,
    availableFor: ['invoice-payment'],
  },
  {
    key: 'kycBiometric',
    label: 'Captura biométrica',
    description: 'Selfie para validación con Fortress Compliance en tiempo real.',
    icon: UserCheck,
    availableFor: ['kyc-module'],
  },
  {
    key: 'bankValidation',
    label: 'Validación de cuenta',
    description: 'Nium Verify pre-valida la cuenta bancaria antes del pago.',
    icon: DollarSign,
    availableFor: ['payment-button', 'kyc-module', 'wallet-dashboard', 'invoice-payment'],
  },
  {
    key: 'oneClickOffRamp',
    label: 'Off-ramp one-click',
    description: 'El usuario cobra en fiat sin ver la blockchain.',
    icon: Zap,
    availableFor: ['payment-button', 'wallet-dashboard'],
  },
  {
    key: 'oneClickOnRamp',
    label: 'On-ramp one-click',
    description: 'El usuario deposita fiat desde su banco sin ver la blockchain.',
    icon: ArrowDown,
    availableFor: ['wallet-dashboard'],
  },
  {
    key: 'deepLinkPayload',
    label: 'Deep Link de transacción',
    description: 'Botón precargado con invoice_id y amount desde tu ERP.',
    icon: Link,
    availableFor: ['invoice-payment'],
  },
];

interface FeatureTogglerProps {
  features: Partial<WidgetFeatures>;
  widgetType: WidgetType;
  onChange: (features: Partial<WidgetFeatures>) => void;
}

export function FeatureToggler({ features, widgetType, onChange }: FeatureTogglerProps) {
  const visible = FEATURES.filter(f => f.availableFor.includes(widgetType));

  const toggle = (key: keyof WidgetFeatures) => {
    onChange({ [key]: !features[key] });
  };

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((feat, i) => {
        const Icon = feat.icon;
        const enabled = Boolean(features[feat.key]);
        return (
          <div key={feat.key}>
            {i > 0 && <Separator className="mb-3" />}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted mt-0.5">
                  <Icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{feat.label}</p>
                    {feat.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feat.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={() => toggle(feat.key)}
                className="shrink-0 mt-0.5"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
