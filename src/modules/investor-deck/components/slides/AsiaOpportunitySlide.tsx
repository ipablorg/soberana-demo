import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { Badge } from "@/shared/components/ui/badge";
import { useDeckContent } from "../../data/deck-lang-context";

export function AsiaOpportunitySlide() {
  const { content, lang } = useDeckContent();
  const d = content.asia;

  const leaderPrefix = lang === "es" ? "de líderes fintech " : "of fintech leaders ";

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
        className="mb-2 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-12 max-w-2xl text-base text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {d.stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
          >
            <span className="font-mono text-3xl font-bold tracking-tight lg:text-4xl">
              {stat.value}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">
              {leaderPrefix}{stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-wrap gap-2">
          {d.opportunities.map((opp) => (
            <Badge key={opp} variant="secondary">
              {opp}
            </Badge>
          ))}
        </div>
        <p className="text-sm font-medium text-foreground">{d.positioning}</p>
      </motion.div>
    </SlideContainer>
  );
}
