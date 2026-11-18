import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

const opacityMap: Record<number, string> = {
  40: "bg-primary",
  25: "bg-primary/70",
  20: "bg-primary/50",
  15: "bg-primary/30",
};

export function UseOfFundsSlide() {
  const { content } = useDeckContent();
  const d = content.useOfFunds;

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
        className="mb-12 font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {d.allocations.map((alloc, i) => (
          <motion.div
            key={alloc.category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            className="flex flex-col gap-3 rounded-xl border border-background/10 bg-background/5 p-5"
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-background">
                {alloc.percentage}%
              </span>
              <span className="font-mono text-sm text-background/50">{alloc.amount}</span>
            </div>
            <div
              className={`h-1.5 rounded-full ${opacityMap[alloc.percentage] ?? "bg-primary/40"}`}
              style={{ width: `${alloc.percentage * 2.5}%` }}
            />
            <h3 className="font-heading text-sm font-semibold text-background">
              {alloc.category}
            </h3>
            <ul className="flex flex-col gap-1">
              {alloc.items.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-background/60">
                  &middot; {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10"
      >
        <div className="relative flex items-start justify-between">
          <div className="absolute left-0 right-0 top-3 h-px bg-background/20" />
          {d.milestones.map((ms, i) => (
            <div key={i} className="relative z-10 flex max-w-[23%] flex-col items-center text-center">
              <div className="mb-3 h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm leading-snug text-background/60">
                {ms}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </SlideContainer>
  );
}
