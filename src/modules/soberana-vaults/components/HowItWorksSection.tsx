/**
 * Section 3 — ¿Cómo funciona?
 * Agentic loop steps: Poll → Distance → Risk → Decision → Execute → Report
 */

import { motion } from 'framer-motion';
import { AGENTIC_LOOP_STEPS } from '../data/static-data';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Mecánica
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          ¿Cómo funciona?
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          El bot ejecuta un ciclo agentico cada 30 segundos. Observa, decide y actúa —
          de forma completamente autónoma.
        </p>
      </motion.div>

      {/* Cycle badge */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5"
      >
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-mono text-muted-foreground">
          Ciclo activo cada{' '}
          <span className="font-semibold text-foreground">30 segundos</span>
          {' '}— 2,880 ciclos/día
        </span>
      </motion.div>

      {/* Loop Steps */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-3"
      >
        {AGENTIC_LOOP_STEPS.map((step, i) => (
          <motion.div key={step.step} variants={itemVariants}>
            <div className="flex gap-4 rounded-xl border border-border bg-card p-5">
              {/* Step number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <span className="font-mono text-sm font-bold text-foreground">
                  {String(step.step).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{step.icon}</span>
                  <p className="text-sm font-semibold text-foreground">{step.name}</p>
                  <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {step.description}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.detail}
                </p>
              </div>

              {/* Arrow to next */}
              {i < AGENTIC_LOOP_STEPS.length - 1 && (
                <div className="hidden items-center md:flex">
                  <span className="text-muted-foreground/40 text-sm">↓</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Back to loop */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4"
      >
        <span className="text-xl">🔁</span>
        <p className="text-sm text-muted-foreground">
          Al completar el paso 6, el ciclo vuelve al paso 1 automáticamente.
          El loop nunca se detiene salvo que el kill switch lo active.
        </p>
      </motion.div>

      {/* Key stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Ciclo', value: '30s' },
          { label: 'Ciclos/día', value: '2,880' },
          { label: 'Éxito sandbox', value: '99.35%' },
          { label: 'Tests unitarios', value: '38' },
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
          </div>
        ))}
      </motion.div>
    </section>
  );
}
