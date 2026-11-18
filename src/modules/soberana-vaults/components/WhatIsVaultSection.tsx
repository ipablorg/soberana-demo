/**
 * Section 2 — ¿Qué es un Vault?
 * Non-technical explanation for non-crypto investors.
 * Animated flow: Dinero → Vault → LP Position → Fees → Reinversión
 */

import { motion } from 'framer-motion';

const FLOW_STEPS = [
  {
    id: 'capital',
    icon: '💵',
    label: 'Capital',
    description: 'Tu dinero entra al vault como capital de trabajo.',
  },
  {
    id: 'vault',
    icon: '🏦',
    label: 'Vault',
    description: 'El vault lo gestiona automáticamente, 24/7, sin intervención.',
  },
  {
    id: 'lp',
    icon: '🌊',
    label: 'LP Position',
    description: 'El capital se coloca como liquidez concentrada en un pool SOL/USDC.',
  },
  {
    id: 'fees',
    icon: '💎',
    label: 'Fees LP',
    description: 'Cada operación en el pool genera comisiones para la posición.',
  },
  {
    id: 'compound',
    icon: '🔄',
    label: 'Auto-compound',
    description: 'Las comisiones se reinvierten diariamente, generando más liquidez.',
  },
];

const ANALOGIES = [
  {
    icon: '🏢',
    title: 'Como un fondo de inversión',
    body: 'Pero completamente automatizado, on-chain, y sin comisiones de terceros que capturen el rendimiento.',
  },
  {
    icon: '🏪',
    title: 'Como cobrar alquiler de liquidez',
    body: 'Cada vez que alguien intercambia SOL ↔ USDC, paga una comisión. El vault es el "propietario" que la recibe.',
  },
  {
    icon: '🤖',
    title: 'Como un robot financiero',
    body: 'Monitorea el precio cada 30 segundos, actúa solo cuando es necesario, y documenta cada decisión.',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function WhatIsVaultSection() {
  return (
    <section id="what-is-a-vault" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Fundamentos
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          ¿Qué es un Vault?
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Una caja fuerte automatizada que trabaja 24/7 para generar rendimiento
          con tu capital. Sin bancos intermediarios. Sin gestores humanos. Solo código.
        </p>
      </motion.div>

      {/* Flow Diagram */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative"
      >
        <div className="flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="flex flex-1 flex-col items-center"
            >
              {/* Node */}
              <div className="relative flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card text-2xl shadow-sm">
                  {step.icon}
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground">{step.label}</p>
                <p className="mt-1 max-w-[120px] text-center text-[10px] text-muted-foreground leading-snug">
                  {step.description}
                </p>
              </div>

              {/* Arrow between steps */}
              {i < FLOW_STEPS.length - 1 && (
                <div className="hidden sm:flex sm:absolute sm:relative sm:ml-auto">
                  {/* horizontal arrow — rendered via pseudo layout */}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Connector line (desktop) */}
        <div className="pointer-events-none absolute left-[calc(10%)] right-[calc(10%)] top-8 hidden h-px bg-border sm:block" />
      </motion.div>

      {/* Simplified flow — visual bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-card p-4"
        style={{ transformOrigin: 'left' }}
      >
        {FLOW_STEPS.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground whitespace-nowrap">
              {step.label}
            </span>
            {i < FLOW_STEPS.length - 1 && (
              <span className="text-muted-foreground/50 text-xs">→</span>
            )}
          </div>
        ))}
        <span className="ml-auto text-xs font-mono text-success tabular-nums">
          ∞ loop
        </span>
      </motion.div>

      {/* Analogy Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {ANALOGIES.map((a) => (
          <motion.div
            key={a.title}
            variants={itemVariants}
            className="rounded-xl border border-border bg-card p-5 space-y-2"
          >
            <div className="text-2xl">{a.icon}</div>
            <p className="text-sm font-semibold text-foreground">{a.title}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Key distinction — no shares */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-muted/40 p-5"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Nota:</span> Soberana Vaults
          es actualmente un vault propio de Loopay. El capital operando es capital de
          la empresa, no de inversores externos. Esta documentación es pública para
          mostrar transparencia sobre la estrategia y los resultados reales del sistema.
        </p>
      </motion.div>
    </section>
  );
}
