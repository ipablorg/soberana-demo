import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function SolutionOverviewSlide() {
  const { content } = useDeckContent();
  const d = content.solution;

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
        className="mb-16 text-center font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-8 md:grid-cols-3">
        {d.pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.15 }}
              className="flex flex-col items-center gap-5 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {pillar.name}
                </span>
                <h3 className="font-heading text-xl font-semibold">
                  {pillar.headline}
                </h3>
              </div>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SlideContainer>
  );
}
