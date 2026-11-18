import { motion, useReducedMotion } from "framer-motion";
import { useDeckContent } from "../../data/deck-lang-context";
import { NetworkSlideShell } from "../shared/network-slide-shell";

/* Slide 1 — Title. Wordmark, positioning statement, one-liner, the number. */
export function NetworkTitleSlide() {
  const { content } = useDeckContent();
  const t = content.title;
  const reduced = useReducedMotion();

  return (
    <NetworkSlideShell>
      <div className="flex h-[78vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="font-mono text-xs font-medium tracking-[0.25em] text-muted-foreground uppercase"
        >
          {t.kicker}
        </motion.div>

        <motion.h1
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
          className="mt-6 max-w-5xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance md:text-6xl"
        >
          {t.headline}
        </motion.h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
          className="mt-6 max-w-3xl text-base text-muted-foreground md:text-lg"
        >
          {t.positioning}
        </motion.p>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
          className="mt-8 max-w-2xl font-mono text-sm text-foreground/80 italic md:text-base"
        >
          {t.oneLiner}
        </motion.p>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
          className="mt-10 flex flex-col items-center gap-1"
        >
          <div className="font-mono text-5xl font-bold tracking-tight tabular-nums md:text-6xl">
            {t.number}
          </div>
          <div className="text-sm text-muted-foreground">{t.numberLabel}</div>
        </motion.div>
      </div>
    </NetworkSlideShell>
  );
}
