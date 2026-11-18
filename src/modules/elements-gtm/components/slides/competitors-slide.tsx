import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { GtmContainer } from "../shared/gtm-container";
import { cn } from "@/shared/lib/utils";
import { gtmContent } from "../../data/gtm-content";

export function CompetitorsSlide() {
  const d = gtmContent.competitors;

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

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="overflow-hidden rounded-xl border border-border"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Competidor
              </th>
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Enfoque
              </th>
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Fortalezas
              </th>
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Debilidades
              </th>
            </tr>
          </thead>
          <tbody>
            {d.entries.map((entry, i) => (
              <motion.tr
                key={entry.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.08 }}
                className={cn(
                  "border-b border-border/50 last:border-0",
                  entry.highlight
                    ? "bg-primary/5"
                    : "hover:bg-muted/30",
                )}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {entry.highlight && (
                      <CheckCircle className="h-4 w-4 shrink-0 text-success" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "font-heading text-sm font-semibold",
                        entry.highlight ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {entry.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{entry.focus}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{entry.strengths}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{entry.weaknesses}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="mt-7 rounded-xl border border-primary/20 bg-primary/5 p-5"
      >
        <p className="text-sm font-medium leading-relaxed">{d.conclusion}</p>
      </motion.div>
    </GtmContainer>
  );
}
