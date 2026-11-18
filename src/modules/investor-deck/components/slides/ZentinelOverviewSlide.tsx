import { motion } from "framer-motion";
import { ExternalLink, Zap, Clock } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

export function ZentinelOverviewSlide() {
  const { content, lang } = useDeckContent();
  const d = content.zentinelOverview;

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
            <a href="https://zentinel-api-vc77ers7bq-uc.a.run.app/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {lang === "es" ? "Ver en vivo" : "See it live"}
            </a>
          </Button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground"
      >
        {d.description}
      </motion.p>

      {/* Core Distinction: Chatbot vs Zentinel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-8 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="mb-5 font-heading text-xl font-bold">
          {d.coreDistinction.headline}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground" />
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground/50">
                  Chatbot
                </th>
                <th className="pb-3 text-sm font-medium text-primary">
                  Zentinel
                </th>
              </tr>
            </thead>
            <tbody>
              {d.coreDistinction.comparison.map((row) => (
                <tr key={row.dimension} className="border-b border-border/50 last:border-0">
                  <td className="py-3.5 pr-6 text-sm font-semibold">{row.dimension}</td>
                  <td className="py-3.5 pr-6 text-sm text-muted-foreground/50 line-through decoration-muted-foreground/20">
                    {row.chatbot}
                  </td>
                  <td className="py-3.5 text-sm font-medium text-foreground">
                    {row.zentinel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Impact Table: Before vs After */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="mb-8 rounded-xl border border-border bg-card p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-xl font-bold">
            {lang === "es" ? "Impacto Real en la Operación" : "Real Operational Impact"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground">
                  {lang === "es" ? "Tarea" : "Task"}
                </th>
                <th className="pb-3 pr-6 text-sm font-medium text-muted-foreground/50">
                  {lang === "es" ? "Antes" : "Before"}
                </th>
                <th className="pb-3 text-sm font-medium text-primary">
                  {lang === "es" ? "Con Zentinel" : "With Zentinel"}
                </th>
              </tr>
            </thead>
            <tbody>
              {d.impactTable.map((row) => (
                <tr key={row.task} className="border-b border-border/50 last:border-0">
                  <td className="py-3.5 pr-6 text-sm font-medium">{row.task}</td>
                  <td className="py-3.5 pr-6 text-sm text-muted-foreground/60">
                    {row.before}
                  </td>
                  <td className="py-3.5">
                    <Badge variant="default" className="font-mono text-xs">
                      <Zap className="mr-1 h-3 w-3" />
                      {row.after}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-wrap gap-2.5"
      >
        {d.capabilities.map((cap, i) => (
          <motion.div
            key={cap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.65 + i * 0.03 }}
          >
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              {cap}
            </Badge>
          </motion.div>
        ))}
      </motion.div>
    </SlideContainer>
  );
}
