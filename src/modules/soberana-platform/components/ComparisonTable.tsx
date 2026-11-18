import { motion } from 'framer-motion';
import { CheckCircle, X } from '@/shared/components/animated-icons';
import { Trans } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';

export function ComparisonTable() {
  const { COMPARISON_ROWS } = usePlatformContent();

  return (
    <section id="comparison" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>Before vs After</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>The Soberana difference</Trans>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          <Trans>Every dimension of financial infrastructure, transformed.</Trans>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-xl border border-border bg-card overflow-hidden"
      >
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-muted/50">
          <div className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Trans>Dimension</Trans>
          </div>
          <div className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-l border-border flex items-center gap-2">
            <X className="h-3.5 w-3.5 text-destructive" />
            <Trans>Without Soberana</Trans>
          </div>
          <div className="px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-l border-border flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-success" />
            <Trans>With Soberana</Trans>
          </div>
        </div>

        {/* Rows */}
        {COMPARISON_ROWS.map((row) => (
          <div
            key={row.dimension}
            className="grid grid-cols-[1fr_1fr_1fr] border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors duration-150"
          >
            <div className="px-5 py-4 text-sm font-medium text-foreground">
              {row.dimension}
            </div>
            <div className="px-5 py-4 text-sm text-muted-foreground border-l border-border/50">
              <span className="line-through decoration-destructive/50">{row.before}</span>
            </div>
            <div className="px-5 py-4 text-sm text-foreground font-medium border-l border-border/50">
              {row.after}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
