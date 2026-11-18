import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { Layers, ShieldCheck, Zap } from '@/shared/components/animated-icons';

const stagger = {
  animate: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const PILLARS_META = [
  { icon: Zap, num: '01', name: 'API', color: 'var(--chart-1)' },
  { icon: Layers, num: '02', name: 'White-Label Platform', color: 'var(--chart-2)' },
  { icon: ShieldCheck, num: '03', name: 'Banking as a Service', color: 'var(--chart-3)' },
] as const;

export function SectionVision() {
  const { t } = useLingui();

  const descriptions = [
    t`Every payment rail in the world. One integration.`,
    t`Your bank, fintech, or enterprise. Our infrastructure. From months to days.`,
    t`Don't build a bank. Assemble yours.`,
  ];

  return (
    <section className="py-24 lg:py-32 px-6 bg-background overflow-hidden">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-10%' }}
        variants={stagger}
      >
        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-xs font-heading uppercase tracking-[0.3em] text-muted-foreground mb-4"
          >
            SOBERANA
          </motion.p>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-heading text-3xl lg:text-6xl font-bold text-foreground leading-tight mb-4"
          >
            {t`One architecture. Three pillars.`}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-body font-light text-lg text-muted-foreground max-w-xl mx-auto"
          >
            {t`Soberana is the modular infrastructure that connects everything.`}
          </motion.p>
        </div>

        {/* Pillars */}
        <div className="relative">
          {/* Horizontal connector — desktop */}
          <div className="hidden md:block absolute top-[60px] left-[16.67%] right-[16.67%]">
            <motion.div
              variants={{ initial: { scaleX: 0 }, animate: { scaleX: 1 } }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              className="h-px bg-border origin-left"
            />
            {/* Traveling dot */}
            <motion.div
              className="absolute top-0 h-1.5 w-1.5 rounded-full -translate-y-1/2"
              style={{ backgroundColor: 'var(--chart-1)' }}
              initial={{ left: '0%', opacity: 0 }}
              whileInView={{
                left: ['0%', '100%'],
                opacity: [0, 1, 1, 0],
              }}
              viewport={{ once: true }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                delay: 1,
                repeat: Infinity,
                repeatDelay: 1.5,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8">
            {PILLARS_META.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.name}
                  variants={{
                    initial: { opacity: 0, y: 32, scale: 0.95 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Icon container with colored ring on hover */}
                  <div className="relative z-10 mb-6">
                    <motion.div
                      className="absolute -inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundColor: pillar.color, opacity: 0 }}
                      whileHover={{ opacity: 0.08 }}
                    />
                    <div
                      className="relative flex h-[120px] w-[120px] items-center justify-center rounded-2xl border-2 bg-background transition-colors duration-200"
                      style={{ borderColor: `color-mix(in oklch, ${pillar.color} 30%, transparent)` }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        whileInView={{ rotate: [0, -6, 6, 0] }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.6 + i * 0.15 }}
                      >
                        <Icon
                          className="h-10 w-10 transition-colors duration-200"
                          style={{ color: pillar.color }}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Ordinal */}
                  <motion.span
                    className="font-mono text-[10px] tracking-widest uppercase mb-2"
                    style={{ color: pillar.color }}
                    variants={fadeUp}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    {pillar.num}
                  </motion.span>

                  {/* Name */}
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                    {pillar.name}
                  </h3>

                  {/* Accent bar */}
                  <motion.div
                    className="h-0.5 w-8 rounded-full mb-4"
                    style={{ backgroundColor: pillar.color }}
                    variants={{ initial: { scaleX: 0 }, animate: { scaleX: 1 } }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                  />

                  {/* Description */}
                  <p className="font-body font-light text-base text-muted-foreground leading-relaxed max-w-xs">
                    {descriptions[i]}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
