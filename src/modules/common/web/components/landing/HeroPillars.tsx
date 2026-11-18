import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Zap, Layers, ShieldCheck, Vault, ArrowRight } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

interface HeroPillarsProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onLearnMore: () => void;
}

export function HeroPillars({ onGetStarted, onSignIn, onLearnMore }: HeroPillarsProps) {
  const { t } = useLingui();

  const pillars = [
    {
      icon: Zap,
      label: '01',
      name: 'API',
      line: t`Every payment rail. One integration.`,
    },
    {
      icon: Layers,
      label: '02',
      name: 'White-Label Platform',
      line: t`Your bank, fintech, or enterprise. Our rails. Days, not months.`,
    },
    {
      icon: ShieldCheck,
      label: '03',
      name: 'Banking as a Service',
      line: t`Don't build a bank. Assemble yours.`,
    },
    {
      icon: Vault,
      label: '04',
      name: 'Vaults',
      line: t`Your capital never stops. Yields up to 12% annually.`,
      badge: 'Beta',
    },
  ];

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Pillars */}
      <div className="space-y-6">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.name}
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-start gap-4 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1 pt-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">
                    {p.label}
                  </span>
                  <h3 className="font-heading text-base font-semibold text-foreground">
                    {p.name}
                  </h3>
                  {'badge' in p && p.badge && (
                    <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-semibold">
                      {p.badge}
                    </Badge>
                  )}
                </div>
                <p className="font-body font-light text-sm text-muted-foreground leading-relaxed">
                  {p.line}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Separator */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="border-t border-border"
      />

      {/* CTA — tiered: primary discovery → register → sign in */}
      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col gap-3"
      >
        <Button variant="gradient" size="lg" className="w-full sm:w-auto" onClick={onLearnMore}>
          <Trans>Discover how it works</Trans>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="default" onClick={onGetStarted}>
            <Trans>Create account</Trans>
          </Button>
          <span className="text-muted-foreground/40 text-xs">|</span>
          <Button variant="link" size="default" onClick={onSignIn}>
            <Trans>Sign in</Trans>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
