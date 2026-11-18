import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { GtmContainer } from "../shared/gtm-container";
import { gtmContent } from "../../data/gtm-content";

export function PartnershipTiersSlide() {
  const d = gtmContent.partnershipTiers;

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
        {d.tiers.map((tier, i) => (
          <motion.div
            key={tier.tier}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
            className="flex flex-col gap-5 rounded-xl border border-background/10 bg-background/5 p-6"
          >
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-background/40">
                {tier.tier}
              </span>
              <h3 className="mt-1 font-heading text-xl font-semibold text-background">
                {tier.name}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-background/70">{tier.headline}</p>
            </div>

            <p className="text-sm leading-relaxed text-background/55">{tier.description}</p>

            <ul className="flex flex-col gap-2">
              {tier.benefits.map((benefit, j) => (
                <li key={j} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-background/40" />
                  <span className="text-xs leading-relaxed text-background/55">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </GtmContainer>
  );
}
