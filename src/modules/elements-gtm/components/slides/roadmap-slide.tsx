import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function RoadmapSlide() {
  const d = gtmContent.roadmap;

  return (
    <GtmContainer dark>
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
        className="mb-4 font-heading text-3xl font-bold tracking-tight text-background md:text-4xl lg:text-5xl"
        style={{ whiteSpace: "pre-line" }}
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-12 max-w-2xl text-sm leading-relaxed text-background/60 md:text-base"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-6 md:grid-cols-3">
        {d.phases.map((phase, i) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className="flex flex-col gap-5 rounded-xl border border-background/10 bg-background/5 p-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs uppercase tracking-wider text-background/40">
                  {phase.phase}
                </span>
                <span className="font-mono text-xs text-background/30">·</span>
                <span className="font-mono text-xs text-background/40">{phase.period}</span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-background">
                {phase.objective}
              </h3>
            </div>

            <ul className="flex flex-col gap-2">
              {phase.actions.map((action, j) => (
                <li key={j} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-background/30" />
                  <span className="text-xs leading-relaxed text-background/55">{action}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto rounded-lg border border-background/10 bg-background/5 px-4 py-3">
              <span className="font-mono text-xs uppercase tracking-wider text-background/40">
                Hito
              </span>
              <p className="mt-0.5 text-sm font-medium text-background/70">{phase.milestone}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GtmContainer>
  );
}
