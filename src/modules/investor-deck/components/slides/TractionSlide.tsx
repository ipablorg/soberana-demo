import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function TractionSlide() {
  const { content } = useDeckContent();
  const d = content.traction;

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

      <div className="grid grid-cols-3 gap-6">
        {d.metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
            className="flex flex-col gap-3 rounded-xl border border-background/10 bg-background/5 p-6"
          >
            <span className="font-mono text-5xl font-bold tracking-tight text-background md:text-6xl">
              {m.value}
            </span>
            <span className="text-sm leading-relaxed text-background/70">
              {m.label}
            </span>
          </motion.div>
        ))}
      </div>
    </SlideContainer>
  );
}
