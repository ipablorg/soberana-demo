/**
 * TxCharts — Gráficos a partir de txdata.csv. Paleta Soberana/Loopay (primary, accent-brand, success, warning).
 * Sin redundancia: un gráfico temporal (volumen por mes), uno por activo y uno por tipo de operación.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { VolumeByMonth, VolumeByAsset } from '@/modules/amazonas/types/txdata.types';

// Paleta Soberana/Loopay: semántica del design system (index.css)
const PRIMARY = 'var(--primary)';
const ACCENT = 'var(--accent)';
const SUCCESS = 'var(--success)';
const WARNING = 'var(--warning)';
const MUTED = 'var(--muted-foreground)';
const BORDER = 'var(--border)';

/** Colores distintos para series/slices; evita monocromía. */
const CHART_COLORS = [
  PRIMARY,
  ACCENT,
  SUCCESS,
  WARNING,
  'color-mix(in oklch, var(--primary) 85%, transparent)',
  'color-mix(in oklch, var(--accent) 85%, transparent)',
  'color-mix(in oklch, var(--success) 85%, transparent)',
  'color-mix(in oklch, var(--warning) 85%, transparent)',
];

function formatTooltipValue(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Top 5 activos + Otros para evitar solapamiento de etiquetas en la torta */
function volumeByAssetForPie(volumeByAsset: VolumeByAsset[]): { asset: string; totalVolume: number }[] {
  const top = 5;
  if (volumeByAsset.length <= top) {
    return volumeByAsset.map(({ asset, totalVolume }) => ({ asset, totalVolume }));
  }
  const head = volumeByAsset.slice(0, top).map(({ asset, totalVolume }) => ({ asset, totalVolume }));
  const otherSum = volumeByAsset.slice(top).reduce((acc, { totalVolume }) => acc + totalVolume, 0);
  if (otherSum > 0) {
    head.push({ asset: 'Otros', totalVolume: otherSum });
  }
  return head;
}

/** Gráfico de volumen por mes: barras con un color por mes (paleta Soberana). Para Detalle y Resumen. */
export interface TxChartVolumeByMonthProps {
  volumeByMonth: VolumeByMonth[];
  /** Si true, layout más compacto para ir arriba de la tabla en Detalle */
  compact?: boolean;
}

export function TxChartVolumeByMonth({ volumeByMonth, compact = false }: TxChartVolumeByMonthProps) {
  const height = compact ? 220 : 280;
  return (
    <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
      <h3 className="font-heading font-semibold text-foreground mb-4">Volumen por mes</h3>
      <div className="w-full min-w-0" style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={volumeByMonth} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatTooltipValue(value), 'Volumen']}
            />
            <Bar
              dataKey="totalVolume"
              radius={[6, 6, 0, 0]}
              name="Volumen"
              animationDuration={800}
              animationBegin={0}
            >
              {volumeByMonth.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export interface OperationCount {
  operation: string;
  count: number;
}

export interface TxChartsProps {
  volumeByMonth: VolumeByMonth[];
  volumeByAsset: VolumeByAsset[];
  operationCounts: OperationCount[];
}

export function TxCharts({ volumeByMonth, volumeByAsset, operationCounts }: TxChartsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volumen por mes — barras con color por mes */}
        <TxChartVolumeByMonth volumeByMonth={volumeByMonth} />

        {/* Volumen por activo — top 5 + Otros, leyenda para evitar solapamiento */}
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">Volumen por activo</h3>
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeByAssetForPie(volumeByAsset)}
                  dataKey="totalVolume"
                  nameKey="asset"
                  cx="50%"
                  cy="45%"
                  innerRadius="20%"
                  outerRadius="75%"
                  paddingAngle={2}
                  animationDuration={800}
                >
                  {volumeByAssetForPie(volumeByAsset).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value) => <span className="text-muted-foreground text-xs">{value}</span>}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatTooltipValue(value), 'Volumen']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operaciones por tipo */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <h3 className="font-heading font-semibold text-foreground mb-4">Transacciones por tipo de operación</h3>
          <div className="h-[180px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={operationCounts}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 80, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} horizontal={false} />
                <XAxis type="number" tick={{ fill: MUTED, fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                <YAxis type="category" dataKey="operation" tick={{ fill: MUTED, fontSize: 11 }} width={72} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [value.toLocaleString(), 'Cantidad']}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  name="Cantidad"
                  animationDuration={800}
                  barSize={36}
                >
                  {operationCounts.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
