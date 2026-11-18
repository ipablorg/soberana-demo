/**
 * Section 1 — Hero
 * Live badge, title, KPI grid, LP range bar, auto-refresh
 */

import { motion } from 'framer-motion';
import { LiveBadge } from './shared/LiveBadge';
import { MetricCard } from './shared/MetricCard';
import { CoverageZoneBar } from './shared/CoverageZoneBar';
import { AutoRefreshIndicator } from './shared/AutoRefreshIndicator';
import { useVaultsResumen, useVaultsLatestInforme } from '../hooks/useVaultsLiveData';
import { Skeleton } from '@/shared/components/ui/skeleton';

function fmt(n: number | null | undefined, prefix = '', suffix = '', dec = 2): string {
  if (n == null) return '—';
  return `${prefix}${n.toFixed(dec)}${suffix}`;
}

export function HeroSection() {
  const { data: resumen, isLoading: loadingResumen } = useVaultsResumen();
  const { data: informe, isLoading: loadingInforme } = useVaultsLatestInforme();

  const isOnline =
    resumen?.estado_bot === 'ENCENDIDO' || resumen?.estado_bot === 'RUNNING';

  const roiTrend: 'up' | 'down' | 'neutral' =
    (resumen?.roi_pct ?? 0) > 0
      ? 'up'
      : (resumen?.roi_pct ?? 0) < 0
        ? 'down'
        : 'neutral';

  return (
    <section id="hero" className="scroll-mt-20 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <LiveBadge isLive={isOnline} />
          {resumen?.modo_ejecucion && (
            <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {resumen.modo_ejecucion}
            </span>
          )}
          <AutoRefreshIndicator
            lastUpdated={resumen?.ultimo_informe_timestamp}
          />
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Soberana Vaults
        </h1>
        <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
          Liquidez concentrada · Cobertura delta-neutral · Auto-compound
        </p>
        <p className="text-sm text-muted-foreground/60">
          Solana × Orca Whirlpool × Hyperliquid — Opera 24/7 con capital real
        </p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
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
          trend={roiTrend}
          isLoading={loadingResumen}
        />
        <MetricCard
          label="Precio SOL"
          value={fmt(resumen?.ultimo_precio_usd, '$')}
          subValue="Orca Whirlpool on-chain"
          trend="neutral"
          isLoading={loadingResumen}
        />
        <MetricCard
          label="Fees LP"
          value={fmt(resumen?.fees_acumulados_usd, '$')}
          subValue="acumulados"
          trend="up"
          isLoading={loadingResumen}
        />
      </motion.div>

      {/* LP Range Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Rango LP Activo</p>
          <span className="text-xs text-muted-foreground">SOL/USDC · Orca Whirlpool</span>
        </div>

        {loadingInforme ? (
          <Skeleton className="h-16 w-full" />
        ) : informe?.coverage_zones &&
          informe.coverage_zones.lower_bound != null ? (
          <>
            <CoverageZoneBar zones={informe.coverage_zones} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
              <div>
                <span className="font-semibold text-foreground">LP Valor: </span>
                {fmt(informe.orca_lp?.valor_posicion_usd, '$')}
              </div>
              <div>
                <span className="font-semibold text-foreground">SOL: </span>
                {fmt(informe.orca_lp?.token_a_amount, '', '', 4)}
              </div>
              <div>
                <span className="font-semibold text-foreground">USDC: </span>
                {fmt(informe.orca_lp?.token_b_amount, '$')}
              </div>
              <div>
                <span className="font-semibold text-foreground">En rango: </span>
                {informe.orca_lp?.en_rango ? '✅' : '⚠️'}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Conectando con la API…
          </p>
        )}
      </motion.div>
    </section>
  );
}
