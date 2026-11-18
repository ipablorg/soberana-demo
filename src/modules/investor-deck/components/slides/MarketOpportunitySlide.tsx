import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { StatCard } from "../shared/StatCard";
import { useDeckContent } from "../../data/deck-lang-context";

export function MarketOpportunitySlide() {
  const { content, lang } = useDeckContent();
  const d = content.market;

  return (
    <SlideContainer>
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
          <StatCard
            key={i}
            value={stat.value}
            label={stat.label}
            source={stat.source}
            delay={0.15 + i * 0.1}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-card p-5"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold">{d.apacGrowth.from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-mono text-2xl font-bold">{d.apacGrowth.to}</span>
          </div>
          <span className="text-sm text-muted-foreground">{d.apacGrowth.label}</span>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
            {d.apacGrowth.period} · {lang === "es" ? "Fuente" : "Source"}: {d.apacGrowth.source}
          </span>
        </div>
      </motion.div>
    </SlideContainer>
  );
}
