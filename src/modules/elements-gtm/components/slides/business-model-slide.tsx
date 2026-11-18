import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function BusinessModelSlide() {
  const d = gtmContent.businessModel;

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
        className="mb-12 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-6 md:grid-cols-3">
        {d.streams.map((stream, i) => {
          const Icon = stream.icon;
          return (
            <motion.div
              key={stream.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{stream.name}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{stream.description}</p>
              <div className="rounded-md border border-border/50 bg-muted/30 px-3 py-2">
                <p className="text-xs leading-relaxed text-muted-foreground/80">{stream.mechanic}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5"
      >
        <p className="text-sm font-medium leading-relaxed">{d.networkEffect}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        className="mt-6 rounded-lg border border-border/50 bg-muted/20 px-5 py-4"
      >
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          {d.unit.headline}
        </span>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d.unit.note}</p>
      </motion.div>
    </GtmContainer>
  );
}
