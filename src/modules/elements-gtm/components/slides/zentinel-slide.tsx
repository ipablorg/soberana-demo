import { motion } from "framer-motion";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function ZentinelSlide() {
  const d = gtmContent.zentinel;

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
        className="mb-4 font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground"
      >
        {d.description}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="mb-9 max-w-2xl text-sm leading-relaxed text-muted-foreground/70"
      >
        {d.subheadline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="overflow-hidden rounded-xl border border-border"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Función
              </th>
              <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Impacto operativo
              </th>
              <th className="hidden px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted-foreground md:table-cell">
                Tecnología
              </th>
            </tr>
          </thead>
          <tbody>
            {d.functions.map((fn, i) => (
              <motion.tr
                key={fn.function}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30"
              >
                <td className="px-5 py-3.5">
                  <span className="font-heading text-sm font-medium">{fn.function}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-muted-foreground">{fn.impact}</td>
                <td className="hidden px-5 py-3.5 text-sm text-muted-foreground/70 md:table-cell">
                  {fn.technology}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.85 }}
        className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5"
      >
        <p className="text-sm leading-relaxed">{d.differentiator}</p>
      </motion.div>
    </GtmContainer>
  );
}
