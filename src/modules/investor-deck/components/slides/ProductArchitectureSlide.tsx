import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

const layerColors = [
  "border-primary/20 bg-primary/5",
  "border-primary bg-primary text-primary-foreground",
  "border-border bg-card",
  "border-border bg-muted",
];

export function ProductArchitectureSlide() {
  const { content } = useDeckContent();
  const d = content.architecture;
  const wac = d.workflowAsCode;
  const isPaymentRails = (i: number) => i === 3;

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
        className="mb-2 font-heading text-3xl font-bold tracking-tight md:text-4xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 text-base text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="flex flex-col gap-3">
        {d.layers.map((layer, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.12 }}
            className={`rounded-xl border p-5 ${layerColors[i]}`}
          >
            <div className="mb-3 font-mono text-xs uppercase tracking-[0.2em] opacity-70">
              {layer.label}
            </div>
            <div className="flex flex-wrap gap-2">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className={`rounded-lg border font-mono ${
                    isPaymentRails(i)
                      ? "px-2.5 py-1 text-xs"
                      : "px-3 py-1.5 text-sm"
                  } ${
                    i === 1
                      ? "border-primary-foreground/20 bg-primary-foreground/10"
                      : "border-border bg-background"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {wac && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="mt-4 rounded-xl border border-primary bg-primary/5 p-5"
        >
          <div className="mb-3 flex items-center gap-2.5">
            <Workflow className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-base font-semibold">{wac.headline}</h3>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {wac.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {wac.features.map((f) => (
              <Badge key={f} variant="secondary" className="text-xs">
                {f}
              </Badge>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="mt-3 flex items-center justify-center gap-1"
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-4 w-px bg-muted-foreground/30" />
        ))}
      </motion.div>
    </SlideContainer>
  );
}
