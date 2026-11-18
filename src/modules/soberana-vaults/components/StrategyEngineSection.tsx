/**
 * Section 4 — Motor de Estrategia
 * Coverage zones explained: DEAD_ZONE, VIGILANCIA, HEDGE_LONG, HEDGE_SHORT
 * Interactive zone visual + delta-neutral explanation
 */

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { COVERAGE_ZONES } from '../data/static-data';

const zoneColorMap: Record<string, string> = {
  muted: 'border-border bg-muted/50 text-muted-foreground',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  success: 'border-success/30 bg-success/10 text-success',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const zoneBadgeMap: Record<string, string> = {
  muted: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
  destructive: 'bg-destructive/20 text-destructive',
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StrategyEngineSection() {
  return (
    <section id="strategy-engine" className="scroll-mt-20 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Motor de Riesgo
        </p>
        <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Estrategia de Cobertura
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
          El vault no solo genera fees. Cuando el precio se acerca al límite del rango,
          activa una cobertura que protege el capital. La lógica es elegantemente simple.
        </p>
      </motion.div>

      {/* Delta-neutral explainer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">¿Qué es delta-neutral?</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Precio sube → LP vende SOL
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cuando el precio de SOL sube hacia el límite superior, el LP
              convierte SOL en USDC. Pierdes exposición a SOL justo cuando debería
              valer más. El bot abre un <span className="font-semibold text-success">LONG</span> en
              Hyperliquid para compensar.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Precio baja → LP acumula SOL
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cuando el precio baja hacia el límite inferior, el LP convierte USDC
              en SOL. Acumulas un activo que está bajando. El bot abre un{' '}
              <span className="font-semibold text-destructive">SHORT</span> en
              Hyperliquid para protegerte.
            </p>
          </div>
        </div>
        <div className="rounded-md border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Resultado:</span> El P&L
            total depende principalmente de los fees generados, no de la dirección
            del mercado. La estrategia es indiferente al precio — mientras opere dentro
            del rango.
          </p>
        </div>
      </motion.div>

      {/* Visual range bar explainer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Mapa de zonas del rango LP</p>
        <div className="relative h-10 rounded-lg bg-muted overflow-hidden">
          {/* Short zone */}
          <div className="absolute inset-y-0 left-0 w-[18%] bg-destructive/20 rounded-l-lg" />
          {/* Vigilancia left */}
          <div className="absolute inset-y-0 left-[18%] w-[12%] bg-warning/15" />
          {/* Dead zone */}
          <div className="absolute inset-y-0 left-[30%] right-[30%] bg-muted/0" />
          {/* Vigilancia right */}
          <div className="absolute inset-y-0 right-[18%] left-[70%] bg-warning/15" />
          {/* Long zone */}
          <div className="absolute inset-y-0 right-0 w-[18%] bg-success/20 rounded-r-lg" />

          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-[9px] font-semibold text-destructive/80">SHORT</span>
            <span className="text-[9px] font-semibold text-muted-foreground">DEAD ZONE</span>
            <span className="text-[9px] font-semibold text-success/80">LONG</span>
          </div>

          {/* Activation lines */}
          <div className="absolute inset-y-0 w-px bg-destructive/50" style={{ left: '18%' }} />
          <div className="absolute inset-y-0 w-px bg-success/50" style={{ right: '18%' }} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Límite inferior</span>
          <span>Zona segura (fees)</span>
          <span>Límite superior</span>
        </div>
      </motion.div>

      {/* Zone Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {COVERAGE_ZONES.map((zone) => (
          <motion.div
            key={zone.id}
            variants={itemVariants}
            className={cn(
              'rounded-xl border p-5 space-y-3',
              zoneColorMap[zone.color],
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
                  zoneBadgeMap[zone.color],
                )}
              >
                {zone.name}
              </span>
              <span className="text-xs text-muted-foreground">{zone.threshold}</span>
            </div>
            <p className="text-sm leading-relaxed">{zone.description}</p>
            <div className="rounded-md border border-current/20 bg-background/40 px-3 py-2">
              <p className="text-xs font-medium">Acción:</p>
              <p className="text-xs leading-relaxed opacity-90">{zone.action}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Confirmation requirement */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-muted/40 p-5 space-y-2"
      >
        <p className="text-sm font-semibold text-foreground">
          Confirmación de 2 ciclos antes de ejecutar
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para evitar falsas señales, el bot requiere que la zona de riesgo sea
          confirmada en 2 ciclos consecutivos (60 segundos) antes de abrir un hedge.
          Esto reduce el número de hedges falsos sin sacrificar protección real.
        </p>
      </motion.div>
    </section>
  );
}
