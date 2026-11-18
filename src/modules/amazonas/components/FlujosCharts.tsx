/**
 * FlujosCharts — Gráficos financieros del Business Plan.
 * Paleta Soberana/Loopay. Recharts. Replica patrón de TxCharts.
 */

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartTimeSeries, RevenueBreakdownPoint } from '@/modules/amazonas/types/flujos.types';
import { formatCompactValue } from '@/modules/amazonas/data/flujos.data';

const PRIMARY = 'var(--primary)';
const ACCENT = 'var(--accent)';
const SUCCESS = 'var(--success)';
const WARNING = 'var(--warning)';
const MUTED = 'var(--muted-foreground)';
const BORDER = 'var(--border)';

const CHART_COLORS = [
  PRIMARY,
  ACCENT,
  SUCCESS,
  WARNING,
  'color-mix(in oklch, var(--primary) 85%, transparent)',
];

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: `1px solid ${BORDER}`,
  borderRadius: '8px',
};

function formatTooltipValue(value: number): string {
  return formatCompactValue(value);
}

export interface FlujosChartsProps {
  grossProfitSeries: ChartTimeSeries[];
  ebitdaSeries: ChartTimeSeries[];
  transactionVolumeSeries: ChartTimeSeries[];
  revenueBreakdown: RevenueBreakdownPoint[];
}

export function FlujosCharts({
  grossProfitSeries,
  ebitdaSeries,
  transactionVolumeSeries,
  revenueBreakdown,
}: FlujosChartsProps) {
  const filteredGP = grossProfitSeries.filter((d) => d.period.startsWith('Q'));
  const filteredEbitda = ebitdaSeries.filter((d) => d.period.startsWith('Q'));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Breakdown — stacked area */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Revenue por línea de negocio (trimestral)
          </h3>
          <div className="h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueBreakdown} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: MUTED, fontSize: 10 }}
                  interval={3}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11 }}
                  tickFormatter={(v) => formatCompactValue(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [formatTooltipValue(value), name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-muted-foreground text-xs">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="crossBorder"
                  name="Cross-Border"
                  stackId="1"
                  fill={CHART_COLORS[0]}
                  stroke={CHART_COLORS[0]}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="payOut"
                  name="PayOut"
                  stackId="1"
                  fill={CHART_COLORS[1]}
                  stroke={CHART_COLORS[1]}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="baas"
                  name="BaaS"
                  stackId="1"
                  fill={CHART_COLORS[2]}
                  stroke={CHART_COLORS[2]}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="assetManagement"
                  name="Asset Mgmt"
                  stackId="1"
                  fill={CHART_COLORS[3]}
                  stroke={CHART_COLORS[3]}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="payIn"
                  name="PayIn"
                  stackId="1"
                  fill={CHART_COLORS[4]}
                  stroke={CHART_COLORS[4]}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gross Profit trend */}
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Gross Profit (trimestral)
          </h3>
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredGP} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: MUTED, fontSize: 10 }}
                  interval={3}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11 }}
                  tickFormatter={(v) => formatCompactValue(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatTooltipValue(value), 'Gross Profit']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Gross Profit"
                  fill={SUCCESS}
                  stroke={SUCCESS}
                  fillOpacity={0.2}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* EBITDA trend */}
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            EBITDA (trimestral)
          </h3>
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredEbitda} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: MUTED, fontSize: 10 }}
                  interval={3}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11 }}
                  tickFormatter={(v) => formatCompactValue(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatTooltipValue(value), 'EBITDA']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="EBITDA"
                  fill={PRIMARY}
                  stroke={PRIMARY}
                  fillOpacity={0.2}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Volume */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">
            Volumen de transacciones (trimestral)
          </h3>
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transactionVolumeSeries}
                margin={{ top: 8, right: 8, left: 0, bottom: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: MUTED, fontSize: 10 }}
                  interval={3}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fill: MUTED, fontSize: 11 }}
                  tickFormatter={(v) => formatCompactValue(v)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [formatTooltipValue(value), 'Volumen']}
                />
                <Bar
                  dataKey="value"
                  name="Transaction Volume"
                  fill={SUCCESS}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
