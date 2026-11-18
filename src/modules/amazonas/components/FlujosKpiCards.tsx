/**
 * FlujosKpiCards — KPIs financieros del Business Plan de Loopay.
 * Replica el patrón de TxKpiCards con Card + accent colors.
 */

import type { ComponentType } from 'react';
import { TrendingUp, DollarSign, Landmark, BarChart3 } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import type { FlujosKpiSummary } from '@/modules/amazonas/types/flujos.types';
import { formatCompactValue } from '@/modules/amazonas/data/flujos.data';

type IconProp = ComponentType<{ className?: string }>;

export interface FlujosKpiCardsProps {
  summary: FlujosKpiSummary;
}

type CardAccent = 'primary' | 'accent' | 'success' | 'warning';

const accentStyles: Record<CardAccent, { border: string; iconBg: string; iconColor: string }> = {
  primary: {
    border: 'border-l-4 border-l-primary',
    iconBg: 'bg-primary/15',
    iconColor: 'text-primary',
  },
  accent: {
    border: 'border-l-4 border-l-accent',
    iconBg: 'bg-accent/20',
    iconColor: 'text-accent',
  },
  success: {
    border: 'border-l-4 border-l-success',
    iconBg: 'bg-success/15',
    iconColor: 'text-success',
  },
  warning: {
    border: 'border-l-4 border-l-warning',
    iconBg: 'bg-warning/15',
    iconColor: 'text-warning',
  },
};

export function FlujosKpiCards({ summary }: FlujosKpiCardsProps) {
  const cards: {
    accent: CardAccent;
    title: string;
    value: string;
    description: string;
    icon: IconProp;
  }[] = [
    {
      accent: 'primary',
      title: 'Revenue 2030 (proj.)',
      value: formatCompactValue(summary.revenueAnnual2030),
      description: `YoY Growth: +${summary.revenueGrowthYoY.toFixed(1)}%`,
      icon: TrendingUp,
    },
    {
      accent: 'success',
      title: 'EBITDA 2030 (proj.)',
      value: formatCompactValue(summary.ebitdaAnnual2030),
      description: `Margen: ${summary.ebitdaMargin2030.toFixed(1)}%`,
      icon: DollarSign,
    },
    {
      accent: 'accent',
      title: 'Total Assets Q4 2030',
      value: formatCompactValue(summary.totalAssetsQ42030),
      description: `Gross Margin: ${summary.grossMarginQ42030.toFixed(1)}%`,
      icon: Landmark,
    },
    {
      accent: 'warning',
      title: 'Tx Volume Q4 2030',
      value: formatCompactValue(summary.txVolumeQ42030),
      description: 'Volumen de transacciones trimestral',
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map(({ accent, title, value, description, icon: Icon }) => {
        const style = accentStyles[accent];
        return (
          <Card
            key={title}
            className={cn('p-6 hover:bg-muted/50 transition-colors duration-150', style.border)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {title}
                </p>
                <div className="text-sm font-bold text-foreground tracking-tight font-mono tabular-nums">
                  {value}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{description}</p>
              </div>
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  style.iconBg,
                  style.iconColor
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
          </Card>
        );
      })}
    </div>
  );
}
