import { motion } from "framer-motion";
import { Badge } from "@/shared/components/ui/badge";
import { Check } from "lucide-react";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function AskSlide() {
  const { content, lang } = useDeckContent();
  const d = content.ask;

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
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h2>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-5"
        >
          <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-background/50">
            {lang === "es" ? "Por Qué Ahora" : "Why Now"}
          </h3>
          {d.whyNow.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-background/10 bg-background/5">
                  <Icon className="h-4 w-4 text-background/70" />
                </div>
                <p className="text-sm leading-relaxed text-background/80">{item.text}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-5"
        >
          <h3 className="font-mono text-sm uppercase tracking-[0.2em] text-background/50">
            {lang === "es" ? "Qué Desbloquea la Inversión" : "What the Investment Unlocks"}
          </h3>
          {d.unlocks.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-background/50" />
              <span className="text-sm text-background/80">{item}</span>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 rounded-lg border border-background/10 bg-background/5 p-4"
          >
            <Badge variant="outline" className="border-background/20 text-background/60">
              {d.financialPlaceholder}
            </Badge>
          </motion.div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}
