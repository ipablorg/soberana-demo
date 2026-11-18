import { motion } from "framer-motion";
import { ExternalLink, ShieldCheck, MessageSquare, Bot } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function ZentinelDeepDiveSlide() {
  const { content, lang } = useDeckContent();
  const d = content.zentinelDeepDive;

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

      <div className="mb-3 flex flex-wrap items-end gap-4">
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
            <a href="https://zentinel-api-vc77ers7bq-uc.a.run.app/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {lang === "es" ? "Ver en vivo" : "See it live"}
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 text-base text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      {/* Computation Cycle Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-8 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="mb-2 font-heading text-xl font-bold">
          {d.computationCycle.headline}
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {d.computationCycle.description}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {d.computationCycle.steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="font-mono text-sm font-bold uppercase tracking-wider text-primary">
                    {step.label}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {step.time}
                </span>
              </div>
              <span className="text-sm leading-snug text-muted-foreground">
                {step.description}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Badge variant="default" className="font-mono text-xs">
            {d.computationCycle.totalTime}
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trust Principles */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-bold">
              {d.trustPrinciples.headline}
            </h3>
          </div>
          <div className="space-y-4">
            {d.trustPrinciples.principles.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.45 + i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <span className="text-sm font-semibold">{p.name}</span>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Live Example */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col gap-5"
        >
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-5 font-mono text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {lang === "es" ? "Ejemplo en Vivo" : "Live Example"}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="rounded-lg rounded-tl-none border border-border bg-muted/50 px-4 py-3">
                  <p className="text-sm text-foreground/80">{d.liveExample.query}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-lg rounded-tl-none border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-medium leading-relaxed text-foreground/90">
                    {d.liveExample.response}
                  </p>
                  <span className="mt-2 block font-mono text-xs text-primary/60">
                    ⚡ {d.liveExample.responseTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Footer */}
          <div className="rounded-lg border border-border bg-muted/30 px-5 py-4">
            <span className="font-mono text-xs leading-relaxed text-muted-foreground">
              {d.techStackLine}
            </span>
          </div>
        </motion.div>
      </div>
    </SlideContainer>
  );
}
