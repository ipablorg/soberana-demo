import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';

const stagger = {
  animate: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
};

export function SectionProof() {
  const { t } = useLingui();

  const stats = [
    { value: '+45', label: t`countries` },
    { value: '+1M', label: t`transactions` },
    { value: '$2B+', label: t`mobilized` },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 bg-foreground text-background">
      <motion.div
        className="max-w-5xl mx-auto text-center"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-10%' }}
        variants={stagger}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-heading text-3xl lg:text-5xl font-bold leading-tight mb-20"
        >
          {t`Numbers that speak.`}
        </motion.h2>

        <div className="grid grid-cols-3 gap-8 mb-20">
          {stats.map((stat) => (
            <motion.div
              key={stat.value}
              variants={scaleIn}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <p className="font-mono tabular-nums text-5xl lg:text-8xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-background/50 mt-3">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-mono text-xs text-background/30 tracking-widest uppercase"
        >
          PCI DSS  ·  ISO 27001  ·  SOC 2
        </motion.p>
      </motion.div>
    </section>
  );
}
