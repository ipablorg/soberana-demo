import { motion, useInView } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';

function AnimatedCounter({ value, delay }: { value: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <span ref={ref} className="inline-block overflow-hidden">
      <motion.span
        className="inline-block font-mono tabular-nums text-7xl lg:text-[120px] font-bold leading-none select-none text-background/6"
        initial={{ y: '100%' }}
        animate={inView ? { y: '0%' } : { y: '100%' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {value}
      </motion.span>
    </span>
  );
}

export function SectionProblem() {
  const { t } = useLingui();

  const painPoints = [
    {
      num: '01',
      title: t`Integrations that take months.`,
      text: t`Every payment rail is a separate project.`,
    },
    {
      num: '02',
      title: t`Fragmented infrastructure.`,
      text: t`Four providers to do what one should.`,
    },
    {
      num: '03',
      title: t`Costs that scale without control.`,
      text: t`The more you grow, the more you pay for complexity you didn't choose.`,
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-6 bg-foreground text-background overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Title — clip-path reveal */}
        <motion.div
          className="mb-20 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-10%' }}
        >
          <motion.h2
            className="font-heading text-3xl lg:text-6xl font-bold leading-tight"
            initial={{ y: '100%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {t`The problem is the infrastructure.`}
          </motion.h2>
        </motion.div>

        {/* Pain points */}
        <div className="space-y-0">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.num}
              className="grid grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start py-10 lg:py-14 border-b border-background/10 last:border-b-0"
              initial={{ opacity: 0, x: -48 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.12,
              }}
            >
              <AnimatedCounter value={point.num} delay={0.15 + i * 0.12} />

              <div className="pt-3 lg:pt-6">
                <motion.div
                  className="overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                >
                  <motion.p
                    className="font-heading text-xl lg:text-2xl font-semibold leading-snug mb-2"
                    initial={{ y: 20 }}
                    whileInView={{ y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.12 }}
                  >
                    {point.title}
                  </motion.p>
                </motion.div>

                <motion.p
                  className="font-body font-light text-base lg:text-lg text-background/50 leading-relaxed"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.45 + i * 0.12 }}
                >
                  {point.text}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated separator line */}
        <motion.div
          className="h-px bg-background/20 mt-16 mb-10 origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Closing statement */}
        <motion.p
          className="font-body text-lg lg:text-xl font-light text-background/70 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {t`Loopay connects traditional finance, global payments, stablecoins, and smart treasury in one architecture.`}
        </motion.p>
      </div>
    </section>
  );
}
