import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function PartnersSlide() {
  const d = gtmContent.partners;

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
        className="mb-4 font-heading text-3xl font-bold tracking-tight md:text-4xl"
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {d.targets.map((partner, i) => {
          const Icon = partner.icon;
          return (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.06 }}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-heading text-sm font-semibold">{partner.name}</span>
                  <p className="font-mono text-xs text-muted-foreground/70">{partner.category}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{partner.description}</p>
            </motion.div>
          );
        })}
      </div>
    </GtmContainer>
  );
}
