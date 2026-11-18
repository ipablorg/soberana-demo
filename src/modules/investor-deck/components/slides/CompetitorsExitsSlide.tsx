import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { CompetitorCard } from "../shared/CompetitorCard";
import { useDeckContent } from "../../data/deck-lang-context";

export function CompetitorsExitsSlide() {
  const { content } = useDeckContent();
  const d = content.exits;

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
        className="mb-10 font-heading text-3xl font-bold tracking-tight md:text-4xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {d.cases.map((c, i) => (
          <CompetitorCard
            key={c.company}
            {...c}
            delay={0.15 + i * 0.08}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 text-center font-heading text-sm font-medium text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>
    </SlideContainer>
  );
}
