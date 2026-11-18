import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function SolutionSlide() {
  const d = gtmContent.solution;

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
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-14 max-w-2xl text-sm leading-relaxed text-background/60 md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-8 md:grid-cols-3">
        {d.pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-background/10 bg-background/5">
                <Icon className="h-7 w-7 text-background/80" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-background/40">
                  {pillar.name}
                </span>
                <h3 className="font-heading text-xl font-semibold text-background">
                  {pillar.headline}
                </h3>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-background/60">
                {pillar.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="mt-14 rounded-xl border border-background/10 bg-background/5 p-5"
      >
        <p className="text-center text-sm italic leading-relaxed text-background/50">
          {d.cryptoInvisible}
        </p>
      </motion.div>
    </GtmContainer>
  );
}
