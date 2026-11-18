/**
 * Section 8 — Technical Deep Dive
 * For technical readers: state machine, risk guard params, auto-compound math
 */

import { motion } from 'framer-motion';
import { useVaultsLatestInforme } from '../hooks/useVaultsLiveData';
import { Skeleton } from '@/shared/components/ui/skeleton';

function fmt(n: number | null | undefined, prefix = '', suffix = '', dec = 2): string {
  if (n == null) return '—';
  return `${prefix}${n.toFixed(dec)}${suffix}`;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ARCHITECTURE = [
  {
    module: 'main.py',
    description: 'Orquestador principal. Inicia el loop, carga configuración, maneja señales de shutdown.',
  },
  {
    module: 'price_monitor.py',
    description: 'Lee sqrt_price de Whirlpool. Fallback Pyth. Cache 120s. Rate limiting.',
  },
  {
    module: 'risk_engine.py',
    description: 'Calcula zonas, evalúa condiciones de hedge, gestiona cooldown, trailing stop.',
  },
  {
    module: 'orca_manager.py',
    description: 'SDK Orca Whirlpool. Lee posición LP on-chain: valor, tokens, fees no reclamados.',
  },
  {
    module: 'hyperliquid_executor.py',
    description: 'Abre/cierra órdenes perpetuas. Verifica ejecución. Trackea P&L y posiciones.',
  },
  {
    module: 'compound_manager.py',
    description: 'Reclama fees LP cada 24h. Reinvierte como liquidez adicional. Registra events.',
  },
  {
    module: 'state_manager.py',
    description: 'SQLite state.db. Persiste estado del hedge, equity histórico, parámetros activos.',
  },
  {
    module: 'reporter.py',
    description: 'Genera informe JSON + TXT cada 30min. 20+ campos. Archivado en informes_vaults/.',
  },
  {
    module: 'api/main.py',
    description: 'FastAPI REST. 5 endpoints. Sirve datos en tiempo real al dashboard.',
  },
];

export function TechnicalDeepDive() {
  const { data: informe, isLoading } = useVaultsLatestInforme();

  return (
    <section id="technical-deep-dive" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Arquitectura
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Deep Dive Técnico
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Para ingenieros y curiosos: la arquitectura interna del bot, los parámetros
          del risk guard, y las matemáticas del auto-compound.
        </p>
      </motion.div>

      {/* Module list */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="border-b border-border px-5 py-3">
          <p className="text-sm font-semibold text-foreground">Módulos del sistema</p>
        </div>
        {ARCHITECTURE.map((m, i) => (
          <motion.div
            key={m.module}
            variants={itemVariants}
            className={`flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-start sm:gap-4 ${
              i < ARCHITECTURE.length - 1 ? 'border-b border-border/50' : ''
            }`}
          >
            <code className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground sm:w-52">
              {m.module}
            </code>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {m.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Risk Guard Parameters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Parámetros del Risk Guard (producción)</p>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            {[
              {
                label: 'Max drawdown permitido',
                value: fmt(informe?.risk_guard?.max_drawdown_permitido_pct, '', '%'),
                description: 'Si el drawdown supera este %, kill switch activa',
              },
              {
                label: 'Kill switch loss limit',
                value: fmt(informe?.risk_guard?.kill_switch_loss_limit_pct, '', '%'),
                description: 'Pérdida acumulada máxima desde inicio',
              },
              {
                label: 'Threshold HEDGE_LONG',
                value: fmt(informe?.coverage_zones?.threshold_upper_pct, '', '%'),
                description: 'Distancia al límite superior para activar LONG',
              },
              {
                label: 'Threshold HEDGE_SHORT',
                value: fmt(informe?.coverage_zones?.threshold_lower_pct, '', '%'),
                description: 'Distancia al límite inferior para activar SHORT',
              },
              {
                label: 'Equity inicial',
                value: fmt(informe?.risk_guard?.equity_inicial_usd, '$'),
                description: 'Capital inicial de referencia para risk guard',
              },
              {
                label: 'Equity pico',
                value: fmt(informe?.risk_guard?.equity_pico_usd, '$'),
                description: 'Máximo equity alcanzado (base para drawdown)',
              },
            ].map((param) => (
              <div
                key={param.label}
                className="rounded-lg border border-border bg-muted/30 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{param.label}</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                    {param.value}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/70">{param.description}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Auto-compound math */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Auto-compound — Matemática</p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                {
                  label: 'Total compounded',
                  value: fmt(informe?.auto_compound?.total_compounded_usd, '$'),
                },
                {
                  label: 'Nº compounds',
                  value: String(informe?.auto_compound?.compound_count ?? '—'),
                },
                {
                  label: 'Fees como % capital',
                  value: fmt(informe?.resumen?.compound_analysis?.fees_como_pct_de_capital, '', '%'),
                },
                {
                  label: 'ROI solo fees',
                  value: fmt(informe?.resumen?.compound_analysis?.roi_solo_fees_pct, '', '%'),
                },
              ].map((kpi) => (
                <div key={kpi.label} className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="font-mono text-lg font-bold tabular-nums text-foreground">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>
            {informe?.resumen?.compound_analysis?.explicacion && (
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
                {informe.resumen.compound_analysis.explicacion}
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Operational metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Métricas operacionales</p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {[
              {
                label: 'Ciclos totales',
                value: String(informe?.metricas?.ciclos_totales ?? '—'),
              },
              {
                label: 'Tasa éxito',
                value: fmt(informe?.metricas?.tasa_exito_pct, '', '%'),
              },
              {
                label: 'Hedges abiertos',
                value: String(informe?.metricas?.hedges_abiertos_total ?? '—'),
              },
              {
                label: 'Hedges cerrados',
                value: String(informe?.metricas?.hedges_cerrados_total ?? '—'),
              },
              {
                label: 'Ciclo prom.',
                value: informe?.metricas?.tiempo_ciclo_promedio_ms != null
                  ? `${informe.metricas.tiempo_ciclo_promedio_ms.toFixed(0)}ms`
                  : '—',
              },
              {
                label: 'Errores críticos',
                value: String(informe?.metricas?.errores_criticos ?? '—'),
              },
              {
                label: 'APR proyectado',
                value: fmt(informe?.resumen?.roi_anualizado_apr_pct, '', '%', 1),
              },
              {
                label: 'APY proyectado',
                value: fmt(informe?.resumen?.roi_anualizado_apy_pct, '', '%', 1),
              },
            ].map((kpi) => (
              <div key={kpi.label} className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="font-mono text-sm font-bold tabular-nums text-foreground">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
