import { motion } from 'framer-motion';
import { ShieldCheck, ArrowUpRight, Zap, Globe } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Trans, useLingui } from '@lingui/react/macro';
import { usePlatformContent } from '../data/platform-content';

interface PlatformHeroProps {
  onGetStarted: () => void;
  onViewProducts: () => void;
}

export function PlatformHero({ onGetStarted, onViewProducts }: PlatformHeroProps) {
  const { HERO_STATS } = usePlatformContent();
  const { t } = useLingui();

  const trustBadges = [
    { icon: ShieldCheck, label: t`PCI Certified` },
    { icon: Globe, label: t`PSP Licensed` },
    { icon: Zap, label: 'API-First' },
  ];

  return (
    <section
      id="hero"
      className="relative px-6 py-20 md:py-28 lg:py-32 max-w-5xl mx-auto scroll-mt-20"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-6"
      >
        <Badge variant="outline" className="font-mono text-xs tracking-wider uppercase">
          <Trans>White-Label Infrastructure</Trans>
        </Badge>
        <span className="h-px flex-1 bg-border max-w-[60px]" aria-hidden="true" />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-6"
      >
        <Trans>
          From months
          <br />
          <span className="text-muted-foreground font-light">to minutes.</span>
        </Trans>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 font-light"
      >
        <Trans>
          Soberana is the financial infrastructure platform that lets banks, fintechs, and wallets
          offer cross-border payments, FX, digital assets, and AI-powered treasury — under their own
          brand, in weeks, not years.
        </Trans>
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex flex-wrap gap-3 mb-12"
      >
        <Button variant="gradient" size="lg" onClick={onGetStarted}>
          <Trans>Book a Demo</Trans>
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" onClick={onViewProducts}>
          <Trans>Explore Products</Trans>
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 pt-8 border-t border-border"
      >
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className="font-mono tabular-nums text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex flex-wrap items-center gap-4"
      >
        {trustBadges.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Icon className="h-3.5 w-3.5 text-success" />
            <span>{label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
