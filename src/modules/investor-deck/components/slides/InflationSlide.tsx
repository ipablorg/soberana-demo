import { motion } from "framer-motion";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function InflationSlide() {
  const { content } = useDeckContent();
  const d = content.inflationData;

  return (
    <SlideContainer dark>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mb-4 block font-mono text-sm uppercase tracking-[0.2em] text-background/50"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        className="mb-3 whitespace-pre-line font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15, ease: "easeOut" }}
        className="mb-5 max-w-2xl text-sm leading-relaxed text-background/60 md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.2, ease: "easeOut" }}
        className="mb-6 inline-flex items-center gap-3 rounded-lg border border-background/10 bg-background/5 px-4 py-2"
      >
        <span className="font-mono text-2xl font-bold tabular-nums text-background">
          {d.stat.value}
        </span>
        <div className="flex flex-col">
          <span className="text-xs leading-snug text-background/60">{d.stat.label}</span>
          <span className="text-xs text-background/30">— {d.stat.source}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {d.countries.map((country, i) => {
          const raw = parseFloat(country.loss.replace(/[^0-9.]/g, ""));
          const isHigh = raw >= 100 || country.loss.includes("+");
          const isMedium = !isHigh && raw >= 50;
          const lossColor = isHigh
            ? "text-destructive"
            : isMedium
              ? "text-warning"
              : "text-background/70";

          return (
            <motion.div
              key={country.country}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, delay: 0.25 + i * 0.05, ease: "easeOut" }}
              className="flex items-center justify-between rounded-md border border-background/5 bg-background/5 px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">{country.flag}</span>
                <span className="text-xs text-background/70">{country.country}</span>
              </div>
              <span className={`font-mono text-sm font-bold tabular-nums text-right ${lossColor}`}>
                −{country.loss}
              </span>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.9, ease: "easeOut" }}
        className="mt-5 text-center text-xs italic text-background/30"
      >
        {d.punchline}
      </motion.p>
    </SlideContainer>
  );
}
