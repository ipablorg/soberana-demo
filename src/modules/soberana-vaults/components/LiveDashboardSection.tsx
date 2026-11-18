/**
 * Section 6 — Dashboard en Vivo
 * Most complex section: real-time charts + live positions
 * Uses TanStack Query + Recharts
 */

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useVaultsLatestInforme, useVaultsResumen } from '../hooks/useVaultsLiveData';
import { useVaultsHistorico } from '../hooks/useVaultsHistory';
import { MetricCard } from './shared/MetricCard';
import type { TimeSeriesPoint } from '../types/vaults.types';

function fmt(n: number | null | undefined, prefix = '', suffix = '', dec = 2): string {
  if (n == null) return '—';
  return `${prefix}${n.toFixed(dec)}${suffix}`;
}

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

interface ChartData {
  time: string;
  value: number | null;
}

function toChartData(series: TimeSeriesPoint[]): ChartData[] {
  return series.map((p) => ({
    time: formatTimestamp(p.timestamp),
    value: p.value,
  }));
}

interface MiniChartProps {
  data: ChartData[];
  color: string;
  domain?: [number | 'auto', number | 'auto'];
  referenceLine?: number;
  referenceColor?: string;
  unit?: string;
}

function MiniChart({ data, color, domain, referenceLine, referenceColor, unit }: MiniChartProps) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={domain ?? ['auto', 'auto']}
          tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `${unit ?? ''}${typeof v === 'number' ? v.toFixed(0) : v}`}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            fontSize: 11,
            color: 'var(--foreground)',
          }}
          formatter={(v: number) => [`${unit ?? ''}${v.toFixed(2)}`, '']}
          labelStyle={{ color: 'var(--muted-foreground)' }}
        />
        {referenceLine != null && (
          <ReferenceLine
            y={referenceLine}
            stroke={referenceColor ?? 'var(--muted-foreground)'}
            strokeDasharray="4 2"
            strokeWidth={1}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: color }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function LiveDashboardSection() {
  const { data: resumen, isLoading: loadingResumen } = useVaultsResumen();
  const { data: informe, isLoading: loadingInforme } = useVaultsLatestInforme();
  const { data: historico, isLoading: loadingHistorico } = useVaultsHistorico(100);

  const equityData = historico?.equity_total_usd
    ? toChartData(historico.equity_total_usd)
    : [];
  const priceData = historico?.precio_actual_usd
    ? toChartData(historico.precio_actual_usd)
    : [];
  const roiData = historico?.roi_pct ? toChartData(historico.roi_pct) : [];
  const drawdownData = historico?.drawdown_actual_pct
    ? toChartData(historico.drawdown_actual_pct)
    : [];

  const hedgeActivo = informe?.hyperliquid?.hedge_activo;
  const tipoHedge = informe?.hyperliquid?.tipo_hedge;
  const killSwitch = informe?.risk_guard?.kill_switch_activo;

  return (
    <section id="live-dashboard" className="scroll-mt-20 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Tiempo Real
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Dashboard en Vivo
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Datos reales del bot en producción. Auto-actualización cada 60 segundos.
        </p>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {/* Bot state */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${
              resumen?.estado_bot === 'ENCENDIDO' || resumen?.estado_bot === 'RUNNING'
                ? 'bg-success animate-pulse'
                : 'bg-muted-foreground'
            }`}
          />
          <span className="text-xs font-mono text-foreground">
            {resumen?.estado_bot ?? 'Un momento...'}
          </span>
        </div>

        {/* Kill switch */}
        {killSwitch && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-xs font-mono text-destructive">
              KILL SWITCH ACTIVO
            </span>
          </div>
        )}

        {/* Hedge status */}
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 ${
            hedgeActivo
              ? 'border-warning/30 bg-warning/10'
              : 'border-border bg-muted/40'
          }`}
        >
          <span className="text-xs font-mono text-muted-foreground">Hedge:</span>
          <span
            className={`text-xs font-mono font-semibold ${
              hedgeActivo ? 'text-warning' : 'text-muted-foreground'
            }`}
          >
            {loadingInforme
              ? '...'
              : hedgeActivo
                ? tipoHedge ?? 'ACTIVO'
                : 'INACTIVO'}
          </span>
        </div>

        {/* Reports count */}
        <div className="ml-auto flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Informes:</span>
          <span className="text-xs font-mono font-semibold text-foreground">
            {resumen?.total_informes ?? '—'}
          </span>
        </div>
      </motion.div>

      {/* KPI grid — full detail */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <MetricCard
          label="Equity Total"
          value={fmt(resumen?.equity_total_usd, '$')}
          subValue="LP + fees + P&L"
          trend="neutral"
          isLoading={loadingResumen}
        />
        <MetricCard
          label="ROI"
          value={fmt(resumen?.roi_pct, '', '%')}
          subValue="vs inversión inicial"
          trend={
            (resumen?.roi_pct ?? 0) > 0
              ? 'up'
              : (resumen?.roi_pct ?? 0) < 0
                ? 'down'
                : 'neutral'
          }
          isLoading={loadingResumen}
        />
        <MetricCard
          label="Drawdown"
          value={fmt(resumen?.drawdown_actual_pct, '', '%')}
          subValue="desde equity pico"
          trend={
            (resumen?.drawdown_actual_pct ?? 0) > 5
              ? 'down'
              : 'neutral'
          }
          isLoading={loadingResumen}
        />
        <MetricCard
          label="Tiempo operando"
          value={
            resumen?.tiempo_operando_horas != null
              ? `${resumen.tiempo_operando_horas.toFixed(1)}h`
              : '—'
          }
          subValue="desde inicio"
          trend="neutral"
          isLoading={loadingResumen}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* Equity chart */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Equity Total (USD)</p>
            <span className="text-xs font-mono text-muted-foreground">
              {fmt(resumen?.equity_total_usd, '$')}
            </span>
          </div>
          {loadingHistorico ? (
            <Skeleton className="h-[120px] w-full" />
          ) : equityData.length > 0 ? (
            <MiniChart data={equityData} color="var(--foreground)" unit="$" />
          ) : (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Sin datos históricos</p>
            </div>
          )}
        </div>

        {/* Price chart */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Precio SOL (USD)</p>
            <span className="text-xs font-mono text-muted-foreground">
              {fmt(resumen?.ultimo_precio_usd, '$')}
            </span>
          </div>
          {loadingHistorico ? (
            <Skeleton className="h-[120px] w-full" />
          ) : priceData.length > 0 ? (
            <MiniChart
              data={priceData}
              color="var(--chart-1)"
              unit="$"
              referenceLine={informe?.orca_lp?.lower_bound ?? undefined}
              referenceColor="var(--destructive)"
            />
          ) : (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Sin datos históricos</p>
            </div>
          )}
        </div>

        {/* ROI chart */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">ROI (%)</p>
            <span className="text-xs font-mono text-muted-foreground">
              {fmt(resumen?.roi_pct, '', '%')}
            </span>
          </div>
          {loadingHistorico ? (
            <Skeleton className="h-[120px] w-full" />
          ) : roiData.length > 0 ? (
            <MiniChart
              data={roiData}
              color="var(--success)"
              referenceLine={0}
              referenceColor="var(--muted-foreground)"
              unit=""
            />
          ) : (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Sin datos históricos</p>
            </div>
          )}
        </div>

        {/* Drawdown chart */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Drawdown (%)</p>
            <span className="text-xs font-mono text-muted-foreground">
              {fmt(resumen?.drawdown_actual_pct, '', '%')}
            </span>
          </div>
          {loadingHistorico ? (
            <Skeleton className="h-[120px] w-full" />
          ) : drawdownData.length > 0 ? (
            <MiniChart
              data={drawdownData}
              color="var(--destructive)"
              referenceLine={8}
              referenceColor="var(--destructive)"
              unit=""
            />
          ) : (
            <div className="flex h-[120px] items-center justify-center">
              <p className="text-sm text-muted-foreground">Sin datos históricos</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Positions detail */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* LP Position */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Posición LP — Orca Whirlpool</p>
          {loadingInforme ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                { label: 'Valor posición', value: fmt(informe?.orca_lp?.valor_posicion_usd, '$') },
                { label: 'SOL', value: fmt(informe?.orca_lp?.token_a_amount, '', '', 4) },
                { label: 'USDC', value: fmt(informe?.orca_lp?.token_b_amount, '$') },
                { label: 'Fees acumulados', value: fmt(informe?.orca_lp?.fees_acumulados, '$') },
                {
                  label: 'En rango',
                  value: informe?.orca_lp?.en_rango == null
                    ? '—'
                    : informe.orca_lp.en_rango
                      ? 'Sí'
                      : 'No',
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hyperliquid */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Hedge — Hyperliquid</p>
          {loadingInforme ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              {[
                {
                  label: 'Hedge activo',
                  value: informe?.hyperliquid?.hedge_activo == null
                    ? '—'
                    : informe.hyperliquid.hedge_activo
                      ? `SÍ (${informe.hyperliquid.tipo_hedge ?? ''})`
                      : 'NO',
                },
                {
                  label: 'Balance disponible',
                  value: fmt(informe?.hyperliquid?.balance_disponible_usd, '$'),
                },
                {
                  label: 'P&L realizado',
                  value: fmt(informe?.hyperliquid?.pnl_total_realizado_usd, '$'),
                },
                {
                  label: 'P&L no realizado',
                  value: fmt(informe?.hyperliquid?.pnl_no_realizado_usd, '$'),
                },
                {
                  label: 'Posiciones abiertas',
                  value: String(informe?.hyperliquid?.posiciones_abiertas ?? '—'),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Risk Guard status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Risk Guard</p>
        {loadingInforme ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              {
                label: 'Kill Switch',
                value: informe?.risk_guard?.kill_switch_activo ? 'ACTIVO' : 'OK',
                danger: informe?.risk_guard?.kill_switch_activo,
              },
              {
                label: 'Drawdown',
                value: fmt(informe?.risk_guard?.drawdown_actual_pct, '', '%'),
                danger: (informe?.risk_guard?.drawdown_actual_pct ?? 0) > 5,
              },
              {
                label: 'Pérdida acumulada',
                value: fmt(informe?.risk_guard?.perdida_acumulada_pct, '', '%'),
                danger: (informe?.risk_guard?.perdida_acumulada_pct ?? 0) > 3,
              },
              {
                label: 'Equity pico',
                value: fmt(informe?.risk_guard?.equity_pico_usd, '$'),
                danger: false,
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={`font-mono text-sm font-semibold tabular-nums ${
                    item.danger ? 'text-destructive' : 'text-foreground'
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
