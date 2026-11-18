import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function ProblemSlide() {
  const { content } = useDeckContent();
  const d = content.problem;

  return (
    <SlideContainer dark>
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
        className="mb-16 font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-8 md:grid-cols-3">
        {d.painPoints.map((point, i) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
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
    </SlideContainer>
  );
}
