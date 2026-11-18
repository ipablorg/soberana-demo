import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { Trans } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';
import type { CardAccent } from '../types/platform.types';

const accentStyles: Record<CardAccent, { border: string; iconBg: string; iconColor: string }> = {
  primary: {
    border: 'border-l-4 border-l-primary',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    border: 'border-l-4 border-l-success',
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    border: 'border-l-4 border-l-warning',
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  accent: {
    border: 'border-l-4 border-l-accent',
    iconBg: 'bg-accent/15',
    iconColor: 'text-accent',
  },
};

export function PlatformMetrics() {
  const { PLATFORM_METRICS } = usePlatformContent();

  return (
    <section id="metrics" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>By the Numbers</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>The scale of Soberana</Trans>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLATFORM_METRICS.map((metric, i) => {
          const style = accentStyles[metric.accent];
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className={cn('p-6 transition-colors duration-150 hover:shadow-md', style.border)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono tabular-nums text-2xl font-bold text-foreground mb-1">
                      {metric.prefix}{metric.value}{metric.suffix}
                    </p>
                    <p className="text-sm font-medium text-foreground mb-1">{metric.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {metric.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      style.iconBg,
                      style.iconColor
                    )}
                  >
                    <metric.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
