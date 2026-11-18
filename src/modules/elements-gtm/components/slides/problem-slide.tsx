import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function ProblemSlide() {
  const d = gtmContent.problem;

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
        className="mb-14 max-w-2xl text-sm leading-relaxed text-background/60 md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-8 md:grid-cols-3">
        {d.painPoints.map((point, i) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
              className="flex flex-col gap-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-background/10 bg-background/5">
                <Icon className="h-5 w-5 text-background/70" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-background">
                {point.headline}
              </h3>
              <p className="text-sm leading-relaxed text-background/60">
                {point.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </GtmContainer>
  );
}
