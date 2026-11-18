import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { GtmStatCard } from "../shared/gtm-stat-card";
import { gtmContent } from "../../data/gtm-content";

export function MarketSlide() {
  const d = gtmContent.market;

  return (
    <GtmContainer>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {d.stats.map((stat, i) => (
          <GtmStatCard
            key={i}
            value={stat.value}
            label={stat.label}
            source={stat.source}
            delay={0.2 + i * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65 }}
        className="mt-8 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
          <div className="flex shrink-0 items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{d.insight.from}</span>
            <span className="text-sm font-medium">{d.insight.label}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{d.insight.note}</p>
        </div>
        <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
          Fuente: {d.insight.source}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="mt-6 grid gap-4 sm:grid-cols-3"
      >
        {[d.tamSamSom.tam, d.tamSamSom.sam, { value: d.tamSamSom.som.value, label: d.tamSamSom.som.label }].map(
          (item, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-lg border border-border/50 bg-muted/30 px-5 py-4"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
                {i === 0 ? "TAM" : i === 1 ? "SAM" : "SOM"}
              </span>
              <span className="font-mono text-xl font-bold">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ),
        )}
      </motion.div>
    </GtmContainer>
  );
}
