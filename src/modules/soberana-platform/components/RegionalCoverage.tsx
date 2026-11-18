import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { CheckCircle, Clock } from '@/shared/components/animated-icons';
import { Trans } from '@lingui/react/macro';
import { REGIONAL_COUNTRIES } from '../data/platform-content';

export function RegionalCoverage() {
  const live = REGIONAL_COUNTRIES.filter((c) => c.status === 'live');
  const coming = REGIONAL_COUNTRIES.filter((c) => c.status === 'coming-soon');

  return (
    <section id="coverage" className="px-6 py-16 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="mb-10"
      >
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Trans>Coverage</Trans>
        </p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          <Trans>Where Soberana operates</Trans>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl">
          <Trans>
            Live infrastructure across the Americas, with European expansion underway.
            Local payment methods, compliance, and settlement in every market.
          </Trans>
        </p>
      </motion.div>

      {/* Live markets */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-4 w-4 text-success" />
          <p className="text-sm font-semibold text-foreground"><Trans>Live markets</Trans></p>
          <Badge variant="success" className="ml-1">{live.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {live.map((country, i) => (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={country.name}>
                  {country.flag}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{country.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    <span className="text-xs text-success font-medium"><Trans>Live</Trans></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {country.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="text-[11px] bg-muted/60 text-muted-foreground rounded-md px-2 py-0.5 font-mono"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-muted-foreground"><Trans>Coming soon</Trans></p>
          <Badge variant="outline" className="ml-1">{coming.length}</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coming.map((country, i) => (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3 opacity-80"
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-2xl grayscale opacity-60"
                  role="img"
                  aria-label={country.name}
                >
                  {country.flag}
                </span>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{country.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    <span className="text-xs text-muted-foreground/70 font-medium"><Trans>Coming soon</Trans></span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {country.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className={cn(
                      'text-[11px] bg-muted/40 text-muted-foreground/60 rounded-md px-2 py-0.5 font-mono'
                    )}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
