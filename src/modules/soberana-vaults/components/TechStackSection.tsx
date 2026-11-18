/**
 * Section 5 — Stack Tecnológico
 * Price Monitor, Risk Engine, Orca Manager, Hyperliquid Executor
 */

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { TECH_COMPONENTS, type TechComponent } from '../data/static-data';

const colorClasses: Record<TechComponent['color'], { card: string; badge: string }> = {
  primary: {
    card: 'border-border',
    badge: 'bg-muted text-foreground',
  },
  success: {
    card: 'border-success/20',
    badge: 'bg-success/10 text-success',
  },
  warning: {
    card: 'border-warning/20',
    badge: 'bg-warning/10 text-warning',
  },
  destructive: {
    card: 'border-destructive/20',
    badge: 'bg-destructive/10 text-destructive',
  },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const INFRA = [
  { label: 'Runtime', value: 'Python 3.10' },
  { label: 'API', value: 'FastAPI' },
  { label: 'Persistencia', value: 'SQLite' },
  { label: 'Deploy', value: 'Docker + GCP' },
  { label: 'On-chain', value: 'Solana RPC' },
  { label: 'LP Protocol', value: 'Orca Whirlpool' },
  { label: 'Hedge', value: 'Hyperliquid' },
  { label: 'Monitoreo', value: '30s polling' },
];

export function TechStackSection() {
  return (
    <section id="tech-stack" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Infraestructura
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Stack Tecnológico
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Cuatro módulos especializados, cada uno con una responsabilidad única.
          Diseño modular que permite actualizar o reemplazar componentes sin
          afectar al resto del sistema.
        </p>
      </motion.div>

      {/* Component cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {TECH_COMPONENTS.map((comp) => {
          const cls = colorClasses[comp.color];
          return (
            <motion.div
              key={comp.name}
              variants={itemVariants}
              className={cn('rounded-xl border bg-card p-5 space-y-3', cls.card)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{comp.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{comp.name}</p>
                    <p className="text-xs text-muted-foreground">{comp.role}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium',
                    cls.badge,
                  )}
                >
                  {comp.badge}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {comp.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Infrastructure pills */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Infraestructura completa</p>
        <div className="flex flex-wrap gap-2">
          {INFRA.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5"
            >
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
              <span className="text-xs font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Architecture note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            icon: '📡',
            title: 'Precio On-chain',
            body: 'Directo del sqrt_price del pool Whirlpool. No depende de exchanges centralizados. Imposible de manipular sin costo económico real.',
          },
          {
            icon: '💾',
            title: 'Estado Persistido',
            body: 'SQLite state.db guarda cada decisión. Si el servidor reinicia, el bot recupera el estado exacto donde estaba.',
          },
          {
            icon: '📋',
            title: 'Informes Cada 30min',
            body: '20+ campos financieros auditables. JSON + TXT. Historico completo desde el primer día de operación.',
          },
        ].map((item) => (
          <motion.div
            key={item.title}
            variants={itemVariants}
            className="rounded-xl border border-border bg-card p-5 space-y-2"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-sm font-semibold text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
