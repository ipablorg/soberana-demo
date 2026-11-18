import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SlideContainer } from "../shared/SlideContainer";
import { useDeckContent } from "../../data/deck-lang-context";

import screenshotWallet from "../../assets/screenshots/02-dashboard-soberana-wallet.png";
import screenshotMulti from "../../assets/screenshots/03-multi-currency-receive.png";
import screenshotZentinel from "../../assets/screenshots/05-zentinel-ai-agent.png";
import screenshotWorkflow from "../../assets/screenshots/07-workflow-composer-canvas.png";

const SCREENSHOTS: Record<string, string> = {
  wallet: screenshotWallet,
  multicurrency: screenshotMulti,
  zentinel: screenshotZentinel,
  workflow: screenshotWorkflow,
};

export function DevaluationProductsSlide() {
  const { content } = useDeckContent();
  const d = content.devaluationProducts;

  return (
    <SlideContainer>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="mb-3 block font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground"
      >
        {d.sectionLabel}
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
        className="mb-2 whitespace-pre-line font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl"
      >
        {d.headline}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15, ease: "easeOut" }}
        className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground"
      >
        {d.subheadline}
      </motion.p>

      <div className="grid gap-4 md:grid-cols-2">
        {d.products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 + i * 0.15, ease: "easeOut" }}
            className="flex overflow-hidden rounded-xl border border-border bg-card"
          >
            {/* Screenshot panel */}
            <div className="w-32 shrink-0 overflow-hidden bg-muted lg:w-44">
              <img
                src={SCREENSHOTS[product.id]}
                alt={product.screenshotAlt}
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Content panel */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {product.name}
              </span>
              <p className="font-heading text-base font-semibold leading-snug text-foreground">
                {product.tagline}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {product.description}
              </p>
              <div className="mt-auto flex items-baseline gap-2">
                <span className="font-mono text-xl font-bold tabular-nums text-foreground">
                  {product.stat.value}
                </span>
                <span className="text-xs text-muted-foreground">{product.stat.label}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.85, ease: "easeOut" }}
        className="mt-6 flex items-center justify-center gap-2 border-t border-border pt-5 text-center"
      >
        <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm italic text-muted-foreground">{d.closing}</p>
      </motion.div>
    </SlideContainer>
  );
}
