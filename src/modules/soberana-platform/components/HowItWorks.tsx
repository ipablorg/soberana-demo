import { motion } from 'framer-motion';
import { ArrowRight } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import { Trans } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';

export function HowItWorks() {
  const { FLOW_STEPS } = usePlatformContent();

  return (
    <section id="how-it-works" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>How It Works</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>From integration to production</Trans>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          <Trans>Three steps. No infrastructure overhead. No months of planning.</Trans>
        </p>
      </motion.div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
        {/* Connecting line — desktop only */}
        <div
          className="hidden md:block absolute top-[2.75rem] left-[calc(33%_+_2rem)] right-[calc(33%_+_2rem)] h-px bg-border"
          aria-hidden="true"
        />

        {FLOW_STEPS.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="relative flex flex-col items-center md:items-start text-center md:text-left px-4 py-6"
          >
            {/* Step circle */}
            <div className="flex items-center justify-center h-14 w-14 rounded-full border-2 border-border bg-background mb-5 relative z-10">
              <step.icon className="h-6 w-6 text-foreground" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {step.step}
              </span>
            </div>

            {/* Duration badge */}
            <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {step.duration}
            </span>

            <h3 className="font-heading text-xl font-bold text-foreground mb-2">
              {step.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Arrow between steps — mobile only */}
            {i < FLOW_STEPS.length - 1 && (
              <div className="md:hidden flex justify-center w-full mt-4">
                <ArrowRight
                  className={cn('h-5 w-5 text-muted-foreground/40 rotate-90')}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom callout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-12 rounded-xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex-1">
          <p className="font-semibold text-foreground mb-1">
            <Trans>Typical timeline: 2–4 weeks to production</Trans>
          </p>
          <p className="text-sm text-muted-foreground">
            <Trans>
              Our integration team is available throughout onboarding. Most clients complete their
              first transaction on sandbox the same day they start.
            </Trans>
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-medium text-success shrink-0">
          <span className="h-2 w-2 rounded-full bg-success" />
          <Trans>Dedicated onboarding support</Trans>
        </div>
      </motion.div>
    </section>
  );
}
