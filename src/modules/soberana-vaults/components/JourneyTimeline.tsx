/**
 * Section 7 — Journey Timeline
 * Real dates from production: Design → Sandbox → Seed → Scale → QA
 */

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { JOURNEY_PHASES } from '../data/static-data';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45 } },
};

export function JourneyTimeline() {
  return (
    <section id="journey-timeline" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Historia
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          El Journey
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          De la idea al sistema en producción certificado. Cada fase documentada
          con resultados reales.
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative space-y-0"
      >
        {/* Vertical line */}
        <div className="absolute left-[1.75rem] top-6 bottom-6 w-px bg-border hidden sm:block" />

        {JOURNEY_PHASES.map((phase, i) => (
          <motion.div key={phase.id} variants={itemVariants} className="relative">
            <div className="flex gap-4 sm:gap-6 pb-8 last:pb-0">
              {/* Icon / dot */}
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-2xl">
                {phase.icon}
                {phase.status === 'active' && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  'flex-1 rounded-xl border p-5 space-y-2',
                  phase.status === 'active'
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-card',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                    {phase.date}
                  </span>
                  {phase.status === 'active' && (
                    <span className="rounded-md border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      ACTUAL
                    </span>
                  )}
                  {phase.status === 'completed' && (
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      COMPLETADO
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{phase.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {phase.description}
                </p>
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Resultado: </span>
                    {phase.result}
                  </p>
                </div>
              </div>
            </div>

            {/* Connector between phases */}
            {i < JOURNEY_PHASES.length - 1 && (
              <div className="ml-7 mb-0 h-px bg-border/0" />
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Días en producción', value: '4+' },
          { label: 'Capital actual', value: '$1,409' },
          { label: 'ROI actual', value: '+1.1%' },
          { label: 'QA status', value: 'PASSED' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-4 space-y-1"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground">
              {kpi.value}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
