import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

const stagger = {
  animate: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function SectionAudiences() {
  const { t } = useLingui();

  const audiences = [
    {
      name: t`Banks`,
      pain: t`Launching digital services requires years of development and regulation.`,
      answer: t`Your brand, our rails. In production in weeks.`,
    },
    {
      name: t`Fintechs`,
      pain: t`Building payments, FX, and crypto infrastructure burns runway and delays go-to-market.`,
      answer: t`API-first. From sandbox to production in days.`,
    },
    {
      name: t`Corporates`,
      pain: t`Managing multi-currency treasury in LATAM means 4-6 banks, FX losses, and zero visibility.`,
      answer: t`Smart Treasury consolidates, automates, and predicts.`,
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 bg-background">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-10%' }}
        variants={stagger}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-heading text-3xl lg:text-5xl font-bold text-foreground leading-tight mb-20 text-center"
        >
          {t`Built for every financial company.`}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {audiences.map((aud) => (
            <motion.div
              key={aud.name}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-4"
            >
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {aud.name}
              </h3>
              <div className="h-px w-12 bg-border" />
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {aud.pain}
              </p>
              <p className="font-body text-sm font-medium text-foreground leading-relaxed">
                → {aud.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
