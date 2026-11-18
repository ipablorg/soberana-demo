import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { StatsCard } from '@/shared/components/ui/stats-card';
import { BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, DollarSign } from '@/shared/components/animated-icons';
import type { WidgetMetrics, PeriodDataPoint } from '../../types';

interface IntegrationMetricsProps {
  metrics: WidgetMetrics;
  chartData?: PeriodDataPoint[];
}

export function IntegrationMetrics({ metrics, chartData }: IntegrationMetricsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <StatsCard
          title={t`Clics`}
          value={metrics.clicks.toLocaleString()}
          icon={Zap}
          trend={{
            value: Math.abs(metrics.trendImpressions),
            isPositive: metrics.trendImpressions >= 0,
            label: t`vs. mes anterior`,
          }}
        />
        <StatsCard
          title={t`Conversiones`}
          value={`${(metrics.conversionRate * 100).toFixed(1)}%`}
          icon={TrendingUp}
          description={t`${metrics.conversions} totales`}
        />
        <StatsCard
          title={t`Revenue`}
          value={`$${metrics.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{
            value: Math.abs(metrics.trendRevenue),
            isPositive: metrics.trendRevenue >= 0,
            label: t`vs. mes anterior`,
          }}
        />
      </div>

      {chartData && chartData.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            <Trans>Últimos 7 días</Trans>
          </p>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={12}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  tickFormatter={d => d.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value, t`Clics`]}
                />
                <Bar dataKey="clicks" fill="color-mix(in oklch, var(--primary) 100%, transparent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
