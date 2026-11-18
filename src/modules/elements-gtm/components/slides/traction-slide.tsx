import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { GtmStatCard } from "../shared/gtm-stat-card";
import { gtmContent } from "../../data/gtm-content";

export function TractionSlide() {
  const d = gtmContent.traction;

  return (
    <GtmContainer dark>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-background/50"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-12 max-w-2xl text-sm leading-relaxed text-background/60 md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10 rounded-xl border border-background/10 bg-background/5 p-6"
      >
        <div className="mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-background/40">
            {d.vtexPilot.headline}
          </span>
          <p className="mt-1 text-sm leading-relaxed text-background/60">
            {d.vtexPilot.description}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {d.vtexPilot.results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <span className="font-mono text-3xl font-bold text-background">{result.value}</span>
              <span className="text-sm text-background/60">{result.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-3">
        {d.platformMetrics.map((metric, i) => (
          <GtmStatCard
            key={i}
            value={metric.value}
            label={metric.label}
            delay={0.65 + i * 0.1}
            dark
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.95 }}
        className="mt-8 rounded-xl border border-background/10 bg-background/5 p-4"
      >
        <span className="font-mono text-xs uppercase tracking-wider text-background/40">
          Próximo hito
        </span>
        <p className="mt-1 text-sm font-medium text-background/70">{d.nextMilestone}</p>
      </motion.div>
    </GtmContainer>
  );
}
