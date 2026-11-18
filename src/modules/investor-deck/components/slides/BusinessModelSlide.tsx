import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function BusinessModelSlide() {
  const { content } = useDeckContent();
  const d = content.businessModel;
  const tenX = d.tenXPath;

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
        className="mb-14 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
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
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stream.description}
              </p>
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

      {tenX && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-10"
        >
          <h3 className="mb-2 font-heading text-2xl font-bold tracking-tight">
            {tenX.headline}
          </h3>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {tenX.description}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tenX.multipliers.map((m, i) => (
              <motion.div
                key={m.lever}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.95 + i * 0.1 }}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5"
              >
                <span className="font-mono text-2xl font-bold text-primary">
                  {m.multiplier}
                </span>
                <span className="font-heading text-sm font-semibold">{m.lever}</span>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </SlideContainer>
  );
}
