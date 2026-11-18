import { Badge } from '@/shared/components/ui/badge';
import {
  Wallet,
  UserCheck,
  PiggyBank,
  Receipt,
} from '@/shared/components/animated-icons';
import type { WidgetType } from '../../types';
import { cn } from '@/shared/lib/utils';

const SEGMENT_LABELS: Record<string, string> = {
  'gig-economy': 'Gig Economy',
  'saas-b2b': 'SaaS B2B',
  'marketplace': 'Marketplace',
  'generic': 'General',
};

interface WidgetOption {
  type: WidgetType;
  label: string;
  description: string;
  segments: string[];
}

const WIDGET_OPTIONS: WidgetOption[] = [
  {
    type: 'payment-button',
    label: 'Botón de Pago',
    description: 'One-click off-ramp con justificación de tasa por Zentinel.',
    segments: ['gig-economy', 'marketplace'],
  },
  {
    type: 'kyc-module',
    label: 'Módulo KYC',
    description: 'Onboarding híbrido con biometría y validación documental.',
    segments: ['gig-economy', 'marketplace'],
  },
  {
    type: 'wallet-dashboard',
    label: 'Dashboard de Saldo',
    description: 'Billetera embebida multi-currency con historial y retiro.',
    segments: ['saas-b2b', 'marketplace'],
  },
  {
    type: 'invoice-payment',
    label: 'Invoice-to-Payment',
    description: 'Facturas con retenciones SRI/DIAN y asiento contable automático.',
    segments: ['saas-b2b'],
  },
];

const ICONS: Record<WidgetType, React.ComponentType<{ className?: string }>> = {
  'payment-button': Wallet,
  'kyc-module': UserCheck,
  'wallet-dashboard': PiggyBank,
  'invoice-payment': Receipt,
};

interface WidgetTypeSelectorProps {
  selected: WidgetType | null;
  onSelect: (type: WidgetType) => void;
}

export function WidgetTypeSelector({ selected, onSelect }: WidgetTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {WIDGET_OPTIONS.map(option => {
        const Icon = ICONS[option.type];
        const isSelected = selected === option.type;
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onSelect(option.type)}
            className={cn(
              'rounded-xl border p-4 text-left transition-colors duration-150 flex flex-col gap-3',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-card hover:bg-muted/30',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              {isSelected && (
                <div className="h-4 w-4 rounded-full bg-primary border-2 border-primary-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-foreground text-sm">{option.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {option.segments.map(seg => (
                <Badge key={seg} variant="secondary" className="text-xs">
                  {SEGMENT_LABELS[seg] ?? seg}
                </Badge>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
