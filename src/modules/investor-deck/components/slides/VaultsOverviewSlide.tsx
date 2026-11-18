import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Quote, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function VaultsOverviewSlide() {
  const { content, lang } = useDeckContent();
  const d = content.vaultsOverview;

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

      <div className="mb-6 flex flex-wrap items-end gap-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading text-4xl font-bold tracking-tight md:text-5xl"
        >
          {d.headline}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Button variant="outline" size="sm" className="gap-1.5 text-sm" asChild>
            <a href="/api/vaults-live/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {lang === "es" ? "Ver en vivo" : "See it live"}
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-6 py-5"
      >
        <Quote className="mt-0.5 h-5 w-5 shrink-0 text-primary/60" />
        <p className="text-base leading-relaxed text-foreground/80 italic">
          {d.analogy}
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {d.steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-mono text-base font-bold text-primary-foreground">
              {step.step}
            </div>
            <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
            {i < d.steps.length - 1 && (
              <ArrowRight className="absolute top-1/2 -right-3.5 hidden h-5 w-5 -translate-y-1/2 text-muted-foreground md:block" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="mt-10 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="mb-4 font-mono text-sm uppercase tracking-[0.15em] text-muted-foreground">
          {lang === "es" ? "Comparación de Rendimiento" : "Yield Comparison"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground">
                  {lang === "es" ? "Instrumento" : "Instrument"}
                </th>
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground">
                  {lang === "es" ? "Rendimiento" : "Yield"}
                </th>
                <th className="pb-3 text-sm font-medium text-muted-foreground">
                  {lang === "es" ? "Riesgo" : "Risk"}
                </th>
              </tr>
            </thead>
            <tbody>
              {d.yieldComparison.map((row) => (
                <tr
                  key={row.instrument}
                  className={row.highlight ? "bg-primary/5" : ""}
                >
                  <td className="py-3 pr-6 text-sm">
                    <span className={row.highlight ? "font-semibold text-primary" : ""}>
                      {row.instrument}
                    </span>
                    {row.highlight && (
                      <Badge variant="default" className="ml-2 text-xs">
                        {lang === "es" ? "Nosotros" : "Us"}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 pr-6 font-mono text-sm font-semibold">{row.yield}</td>
                  <td className="py-3 text-sm text-muted-foreground">{row.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.9 }}
        className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-6 py-4"
      >
        <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-base font-medium text-foreground/80">{d.philosophy}</span>
      </motion.div>
    </SlideContainer>
  );
}
