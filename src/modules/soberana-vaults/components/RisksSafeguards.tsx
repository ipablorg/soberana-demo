/**
 * Section 10 — Riesgos y Salvaguardas
 * Risk items with their safeguards: IL, Kill Switch, Protocol, Oracle, Infra, Volatility
 */

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { RISK_ITEMS, type RiskItem } from '../data/static-data';

const severityConfig: Record<RiskItem['severity'], { label: string; classes: string }> = {
  low: {
    label: 'BAJO',
    classes: 'border-success/20 bg-success/5',
  },
  medium: {
    label: 'MEDIO',
    classes: 'border-warning/20 bg-warning/5',
  },
  high: {
    label: 'ALTO',
    classes: 'border-destructive/20 bg-destructive/5',
  },
};

const severityBadge: Record<RiskItem['severity'], string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function RisksSafeguards() {
  return (
    <section id="risks-safeguards" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Gestión de Riesgo
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Riesgos y Salvaguardas
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Todo sistema financiero tiene riesgos. Lo que distingue a Soberana Vaults
          es que cada riesgo identificado tiene una mitigación concreta implementada.
        </p>
      </motion.div>

      {/* Risk Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-4"
      >
        {RISK_ITEMS.map((risk) => {
          const sev = severityConfig[risk.severity];
          return (
            <motion.div
              key={risk.title}
              variants={itemVariants}
              className={cn('rounded-xl border p-5', sev.classes)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                {/* Risk side */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{risk.icon}</span>
                    <p className="text-sm font-semibold text-foreground">{risk.title}</p>
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        severityBadge[risk.severity],
                      )}
                    >
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {risk.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden w-px bg-border/50 sm:block" />

                {/* Safeguard side */}
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Salvaguarda
                  </p>
                  <p className="text-sm font-medium text-foreground">{risk.safeguard}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {risk.safeguardDetail}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          {
            label: 'Riesgos identificados',
            value: String(RISK_ITEMS.length),
            sub: 'Todos con mitigación',
          },
          {
            label: 'Kill switch',
            value: '8%',
            sub: 'Drawdown máximo permitido',
          },
          {
            label: 'Stop pérdida acumulada',
            value: '5%',
            sub: 'Desde capital inicial',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-4 space-y-1"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {kpi.value}
            </p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
