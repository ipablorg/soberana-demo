import { motion } from 'framer-motion';
import { ArrowUpRight, MessageCircle, ShieldCheck } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Trans, useLingui } from '@lingui/react/macro';

interface CTASectionProps {
  onBook: () => void;
  onContact: () => void;
}

export function CTASection({ onBook, onContact }: CTASectionProps) {
  const { t } = useLingui();

  const trustItems = [
    t`No lock-in contracts`,
    t`Sandbox in under 10 minutes`,
    t`Dedicated onboarding team`,
    t`SLA-backed infrastructure`,
  ];

  return (
    <section id="cta" className="px-6 py-20 max-w-5xl mx-auto scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-border bg-card p-8 md:p-12 text-center space-y-8"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/60">
            <ShieldCheck className="h-8 w-8 text-foreground" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            <Trans>Ready to go from months to minutes?</Trans>
          </h2>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            <Trans>
              Talk to our team. We will scope your integration, walk you through the white-label
              configuration, and get your sandbox running the same day.
            </Trans>
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="gradient" size="lg" onClick={onBook}>
            <Trans>Book a Demo</Trans>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={onContact}>
            <MessageCircle className="mr-2 h-4 w-4" />
            <Trans>Contact Sales</Trans>
          </Button>
        </div>

        {/* Trust items */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 border-t border-border">
          {trustItems.map((item) => (
            <span key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-success inline-block" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
