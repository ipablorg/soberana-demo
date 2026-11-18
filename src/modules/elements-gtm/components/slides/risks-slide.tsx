import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function RisksSlide() {
  const d = gtmContent.risks;

  return (
    <GtmContainer>
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
        className="mb-4 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-12 max-w-2xl text-sm leading-relaxed text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="flex flex-col gap-6">
        {d.entries.map((entry, i) => (
          <motion.div
            key={entry.risk}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className="grid gap-4 rounded-xl border border-border bg-card p-6 md:grid-cols-[200px_1fr]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <Shield className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
                  Riesgo
                </span>
                <h3 className="mt-0.5 font-heading text-sm font-semibold">{entry.risk}</h3>
              </div>
            </div>
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground/60">
                Mitigación
              </span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {entry.mitigation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </GtmContainer>
  );
}
