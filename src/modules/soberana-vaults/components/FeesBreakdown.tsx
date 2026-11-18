/**
 * Section 11 — Estructura de Fees
 * What the vault earns (LP fees) vs. what it costs (gas, HL fees, management)
 */

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { FEE_ITEMS } from '../data/static-data';

const whoConfig: Record<string, { classes: string; badge: string }> = {
  'A FAVOR del vault': {
    classes: 'border-success/20 bg-success/5',
    badge: 'bg-success/10 text-success',
  },
  'Costo del vault': {
    classes: 'border-border bg-card',
    badge: 'bg-muted text-muted-foreground',
  },
  'Revenue de Loopay': {
    classes: 'border-border bg-card',
    badge: 'bg-muted text-muted-foreground',
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeesBreakdown() {
  const income = FEE_ITEMS.filter((f) => f.who === 'A FAVOR del vault');
  const costs = FEE_ITEMS.filter((f) => f.who !== 'A FAVOR del vault');

  return (
    <section id="fees-breakdown" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Economía
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Estructura de Fees
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          El vault genera ingresos por fees LP y tiene costos de operación mínimos.
          La diferencia es el rendimiento neto.
        </p>
      </motion.div>

      {/* Income vs Costs split */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {/* Income */}
        <div className="rounded-xl border border-success/20 bg-success/5 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <p className="text-sm font-semibold text-success">Ingresos</p>
          </div>
          {income.map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{f.name}</p>
                <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-mono font-semibold text-success">
                  {f.rate}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.description}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Frecuencia: {f.frequency}
              </p>
            </div>
          ))}
        </div>

        {/* Costs */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">Costos</p>
          </div>
          {costs.map((f) => (
            <div key={f.name} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{f.name}</p>
                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono font-semibold text-foreground">
                  {f.rate}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.description}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Frecuencia: {f.frequency}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* All fees table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        <div className="border-b border-border bg-muted/50 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resumen completo de fees
          </p>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {FEE_ITEMS.map((fee, i) => {
            const config = whoConfig[fee.who] ?? whoConfig['Costo del vault'];
            return (
              <motion.div
                key={fee.name}
                variants={itemVariants}
                className={cn(
                  'flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:gap-4',
                  i < FEE_ITEMS.length - 1 ? 'border-b border-border/50' : '',
                )}
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{fee.name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fee.description}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                    {fee.rate}
                  </span>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[10px] font-semibold',
                      config.badge,
                    )}
                  >
                    {fee.who}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {fee.frequency}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Note on LP fee income */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-muted/40 p-5"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Importante:</span> Los fees LP
          de Orca son ingresos del vault, no costos. Con $1,409 de capital, el vault ha
          acumulado $2.56 en fees LP en sus primeros 4 días de operación — sin contar
          el P&L de hedges ni el capital en Hyperliquid.
        </p>
      </motion.div>
    </section>
  );
}
