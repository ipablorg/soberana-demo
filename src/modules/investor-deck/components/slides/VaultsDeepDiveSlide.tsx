import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, ShieldAlert, Zap } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function VaultsDeepDiveSlide() {
  const { content, lang } = useDeckContent();
  const d = content.vaultsDeepDive;

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

      <div className="mb-4 flex flex-wrap items-end gap-4">
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-10 flex flex-wrap gap-2"
      >
        {d.performanceBadges.map((badge) => (
          <Badge key={badge} variant="secondary" className="font-mono text-xs px-3 py-1">
            {badge}
          </Badge>
        ))}
      </motion.div>

      {/* Hedge Mechanism */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="mb-2 font-heading text-xl font-bold">
          {d.hedgeMechanism.headline}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {d.hedgeMechanism.description}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {d.hedgeMechanism.scenarios.map((s) => (
            <div
              key={s.direction}
              className="rounded-lg border border-border bg-background p-5"
            >
              <div className="mb-3 font-mono text-sm font-bold uppercase tracking-wider text-primary">
                {s.direction}
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{s.poolEffect}</p>
                <p className="font-medium text-foreground">{s.hedgeAction}</p>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Pool</span>
                  <span className="font-mono text-sm font-semibold text-destructive">
                    {s.poolLoss}
                  </span>
                </div>
                <span className="text-lg text-muted-foreground">+</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Hedge</span>
                  <span className="font-mono text-sm font-semibold text-emerald-500">
                    {s.hedgeGain}
                  </span>
                </div>
                <span className="text-lg text-muted-foreground">+</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Fees</span>
                  <span className="font-mono text-sm font-semibold text-emerald-500">
                    {s.feesEarned}
                  </span>
                </div>
                <span className="text-lg text-muted-foreground">=</span>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground">Net</span>
                  <span className="font-mono text-base font-bold text-primary">
                    {s.netResult}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Decision Engine */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-heading text-lg font-bold">{d.decisionEngine.headline}</h3>
          </div>
          <p className="mb-5 text-sm text-muted-foreground italic">
            {d.decisionEngine.description}
          </p>

          <div className="mb-5 flex flex-wrap items-center gap-1.5">
            {d.decisionEngine.steps.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="rounded-md bg-primary/10 px-3 py-1.5 font-mono text-xs font-medium text-primary">
                  {step}
                </span>
                {i < d.decisionEngine.steps.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {d.decisionEngine.regimes.map((r) => (
              <div key={r.regime} className="flex items-baseline gap-2 text-sm">
                <span className="shrink-0 font-mono font-semibold">{r.regime}:</span>
                <span className="text-muted-foreground">{r.behavior}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground italic">
            {d.decisionEngine.steinInsight}
          </p>
        </motion.div>

        {/* Emergency Breakers */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <h3 className="font-heading text-lg font-bold">
              {d.emergencyBreakers.headline}
            </h3>
          </div>
          <p className="mb-5 text-sm text-muted-foreground italic">
            {d.emergencyBreakers.description}
          </p>

          <div className="space-y-3">
            {d.emergencyBreakers.breakers.map((b) => (
              <div key={b.name} className="rounded-lg border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Badge variant={b.color} className="text-xs">
                    {b.name}
                  </Badge>
                  <span className="font-mono text-sm text-muted-foreground">
                    {b.threshold}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{b.action}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {d.emergencyBreakers.additionalProtections.map((p) => (
              <Badge key={p} variant="outline" className="text-xs">
                {p}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expert Agents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="mt-8"
      >
        <h3 className="mb-5 font-heading text-lg font-semibold text-muted-foreground">
          {lang === "es"
            ? "Agentes IA Asesores — Motor de Mejora Continua"
            : "AI Agent Advisors — Continuous Improvement Engine"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {d.expertAgents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06 }}
              className="flex gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xl font-bold text-primary">
                {agent.avatar}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-heading text-sm font-semibold">{agent.name}</span>
                <Badge variant="outline" className="w-fit text-xs">
                  {agent.domain}
                </Badge>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mt-6 rounded-lg border border-primary/20 bg-primary/5 px-5 py-3"
      >
        <span className="font-mono text-sm text-muted-foreground">
          {lang === "es" ? "Invariante Core:" : "Core Invariant:"}
        </span>
        <p className="mt-1 font-mono text-base font-semibold">{d.formula}</p>
      </motion.div>
    </SlideContainer>
  );
}
