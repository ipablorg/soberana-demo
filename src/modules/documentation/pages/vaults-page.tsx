import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Shield, Sparkles, ChevronDown } from '@/shared/components/animated-icons';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DocSection, Callout } from '../components';
import { useVaultsContent } from '../hooks/useVaultsContent';
import {
  FeatureGrid,
  StepCard,
  TimelineStep,
  RiskSafeguardPair,
  FeeExampleCard,
} from '../components/vaults';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { ScreenshotShowcase } from '../components/ScreenshotShowcase';
import { InteractiveFlowDiagram } from '../components/InteractiveFlowDiagram';
import { AnimatedMetricCard } from '../components/AnimatedMetricCard';
import { CrossNavigation } from '../components/CrossNavigation';

import vaultsDashboard from '../assets/vaults/vaults-dashboard.png';
import investModal from '../assets/vaults/invest-modal.png';
import investSuccess from '../assets/vaults/invest-success.png';
import redeemModal from '../assets/vaults/redeem-modal.png';

export default function VaultsPage() {
  const { t } = useLingui();
  const content = useVaultsContent();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-20">
      {/* ═══════ HERO ═══════ */}
      <header className="relative overflow-hidden rounded-xl border border-border bg-card p-12 md:p-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.55_0.15_280/0.3),transparent)]" />
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            {content.hero.title}
          </h1>
          <p className="text-2xl md:text-3xl text-foreground font-semibold">
            {content.hero.subtitle}
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {content.hero.description}
          </p>

          <div className="mt-12 relative max-w-3xl mx-auto" style={{ perspective: '1000px' }}>
            <motion.div
              initial={{ opacity: 0, rotateY: -5, y: 20 }}
              animate={{ opacity: 1, rotateY: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <img
                src={vaultsDashboard}
                alt="Vaults Dashboard"
                className="rounded-xl border border-border/50 shadow-sm w-full"
              />
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-50" />
      </header>

      {/* ═══════ WHAT IS A VAULT? ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.architecture?.title ?? 'What is a Vault?'}
          sectionId="what-is-a-vault"
          level={1}
        >
          <Card className="p-8 md:p-12 mb-8">
            <p className="text-lg leading-relaxed text-foreground/90">
              Think of a Vault as a smart savings account. You deposit USDC. The
              Vault's algorithm invests it across Protocol 1 and Protocol 2. You receive Shares that represent your portion of the
              total pool. As the pool grows, your shares become worth more.
            </p>
          </Card>

          <InteractiveFlowDiagram
            nodes={[
              { label: 'Deposit USDC' },
              { label: 'Receive Shares' },
              { label: 'Algorithm invests' },
              { label: 'Yield accrues daily' },
              { label: 'Redeem anytime' },
              { label: 'Get USDC + profit' },
            ]}
            className="mb-6"
          />

          <Callout variant="tip">
            <p>
              Your shares are like tokens. Their price goes up as the Vault earns
              yield. You can redeem them at any time for USDC.
            </p>
          </Callout>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ SEE IT IN ACTION ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title="See it in Action"
          sectionId="see-it-in-action"
          level={1}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimateOnScroll delay={0}>
              <ScreenshotShowcase
                src={vaultsDashboard}
                alt="Vaults Dashboard"
                badge="Dashboard"
                caption="Monitor your portfolio at a glance: total value, active positions, unrealized P&L, and APY — all in real time."
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <ScreenshotShowcase
                src={investModal}
                alt="Invest Modal"
                badge="Invest"
                caption="Invest in any vault with one click. Enter an amount, see exactly how many shares you'll receive, and review all fees before confirming."
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <ScreenshotShowcase
                src={investSuccess}
                alt="Investment Confirmed"
                badge="Confirmed"
                caption="Done. Your shares begin earning yield immediately. Settlement happens on-chain in seconds."
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.3}>
              <ScreenshotShowcase
                src={redeemModal}
                alt="Redeem Modal"
                badge="Redeem"
                caption="Need your money back? Redeem by shares or by amount. No lock-ups, no penalties. Your USDC is returned instantly."
              />
            </AnimateOnScroll>
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 1. THE VAULT ARCHITECTURE ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.architecture.title}
          sectionId="vault-architecture"
          subtitle={content.architecture.subtitle}
          level={1}
        >
          <Card className="p-8 md:p-12 mb-8">
            <p className="text-lg leading-relaxed text-foreground/90">
              {content.architecture.intro}
            </p>
          </Card>

          <FeatureGrid pillars={content.architecture.pillars} />

          <div className="mt-6">
            <Callout variant="info">
              <p className="font-semibold">{content.architecture.callout}</p>
            </Callout>
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 2. HOW IT WORKS ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.howItWorks.title}
          sectionId="how-it-works"
          subtitle={content.howItWorks.subtitle}
          level={1}
        >
          <p className="text-lg text-muted-foreground mb-8">
            {content.howItWorks.intro}
          </p>
          <div className="space-y-6">
            <StepCard step={content.howItWorks.invest} index={0} />
            <StepCard step={content.howItWorks.track} index={1} />
            <StepCard step={content.howItWorks.redeem} index={2} />
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 3. STRATEGY ENGINE ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.strategy.title}
          sectionId="strategy-engine"
          subtitle={content.strategy.subtitle}
          level={1}
        >
          <p className="text-lg text-muted-foreground mb-8">
            {content.strategy.intro}
          </p>

          <div className="space-y-8">
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-foreground">
                  <TrendingUp className="h-5 w-5 text-background" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {content.strategy.cashCarry.title}
                </h3>
              </div>
              <p className="text-sm text-foreground font-semibold mb-3">
                {content.strategy.cashCarry.hook}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {content.strategy.cashCarry.description}
              </p>
              <Callout variant="info">
                <p>{content.strategy.cashCarry.detail}</p>
              </Callout>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-foreground">
                  <Sparkles className="h-5 w-5 text-background" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {content.strategy.lp.title}
                </h3>
              </div>
              <p className="text-sm text-foreground font-semibold mb-3">
                {content.strategy.lp.hook}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {content.strategy.lp.description}
              </p>
              <Callout variant="tip">
                <p>{content.strategy.lp.detail}</p>
              </Callout>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-foreground">
                  <Shield className="h-5 w-5 text-background" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {content.strategy.hedging.title}
                </h3>
              </div>
              <p className="text-sm text-foreground font-semibold mb-3">
                {content.strategy.hedging.hook}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {content.strategy.hedging.description}
              </p>
              <Callout variant="success">
                <p>{content.strategy.hedging.detail}</p>
              </Callout>
            </Card>
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ SHARES & NAV ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title="What Are Shares and NAV?"
          sectionId="shares-and-nav"
          level={1}
        >
          <Card className="p-8 md:p-12 mb-8">
            <p className="text-lg leading-relaxed text-foreground/90">
              When you invest $1,000 at a share price of $10.82, you receive
              ~92.42 shares. If the Vault performs well and the share price rises
              to $11.50, your 92.42 shares are now worth $1,062.83 — without you
              doing anything.
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <AnimateOnScroll delay={0}>
              <AnimatedMetricCard
                label="Share Price"
                value={10.82}
                prefix="$"
                decimals={2}
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.1}>
              <AnimatedMetricCard
                label="Your Shares"
                value={92.42}
                decimals={2}
              />
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <AnimatedMetricCard
                label="Your Value"
                value={1062.83}
                prefix="$"
                decimals={2}
              />
            </AnimateOnScroll>
          </div>

          <Callout variant="info">
            <p>
              NAV = Net Asset Value. It's the total real value of all assets in
              the Vault, divided by the number of shares. Updated in real-time.
            </p>
          </Callout>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 4. FEES ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.fees.title}
          sectionId="fees"
          subtitle={content.fees.subtitle}
          level={1}
        >
          <p className="text-lg text-muted-foreground mb-8">
            {content.fees.intro}
          </p>
          <FeeExampleCard
            fees={content.fees.table}
            example={content.fees.example}
            alignment={content.fees.alignment}
          />

          <Card className="p-6 md:p-8 mt-8">
            <h4 className="text-lg font-bold text-foreground mb-4">
              Concrete Example
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                You invest{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  $10,000
                </span>
                . After 1 year the Vault earns{' '}
                <span className="font-semibold text-foreground tabular-nums">
                  12% gross ($1,200)
                </span>
                .
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2">
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Management Fee (2%)
                  </p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    $200
                  </p>
                </div>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Performance Fee (20%)
                  </p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    $200
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-foreground font-semibold">Your Net Return</p>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    $800
                  </p>
                  <p className="text-xs text-muted-foreground">
                    = 8% net yield
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 5. RISKS & SAFEGUARDS ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.risks.title}
          sectionId="risks"
          subtitle={content.risks.subtitle}
          level={1}
        >
          <p className="text-lg text-muted-foreground mb-8">
            {content.risks.intro}
          </p>
          <div className="space-y-4">
            {content.risks.items.map((item, i) => (
              <RiskSafeguardPair key={item.risk} item={item} index={i} />
            ))}
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 6. THE $1,000 JOURNEY ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.journey.title}
          sectionId="example"
          subtitle={content.journey.subtitle}
          level={1}
        >
          <p className="text-lg text-muted-foreground mb-8">
            {content.journey.intro}
          </p>
          <Card className="p-6 md:p-10">
            <div className="space-y-0">
              {content.journey.steps.map((step, i) => (
                <TimelineStep
                  key={step.label}
                  step={step}
                  index={i}
                  isLast={i === content.journey.steps.length - 1}
                />
              ))}
            </div>
          </Card>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 7. FAQ (Accordion) ═══════ */}
      <AnimateOnScroll>
        <DocSection title={content.faq.title} sectionId="faq" level={1}>
          <div className="space-y-2">
            {content.faq.items.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border/50 bg-card/60 overflow-hidden"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-muted/30"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-semibold text-foreground">
                      {item.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ 8. GLOSSARY ═══════ */}
      <AnimateOnScroll>
        <DocSection
          title={content.glossary.title}
          sectionId="glossary"
          level={1}
        >
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-sm font-semibold text-foreground w-1/4">
                    Term
                  </th>
                  <th className="px-5 py-3 text-left text-sm font-semibold text-foreground">
                    Definition
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.glossary.terms.map((item, i) => (
                  <tr
                    key={item.term}
                    className={
                      i < content.glossary.terms.length - 1
                        ? 'border-b border-border/50'
                        : ''
                    }
                  >
                    <td className="px-5 py-3 text-sm font-semibold text-foreground align-top">
                      {item.term}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground leading-relaxed">
                      {item.definition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>
      </AnimateOnScroll>

      {/* ═══════ CTA ═══════ */}
      <AnimateOnScroll>
        <div className="text-center py-16">
          <Card className="inline-block p-12 max-w-3xl">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {content.cta.title}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {content.cta.subtitle}
            </p>
            <Button variant="outline" size="lg" asChild>
              <Link to="/docs">{t`Volver a documentación`}</Link>
            </Button>
          </Card>
        </div>
      </AnimateOnScroll>

      {/* ═══════ CROSS-NAVIGATION ═══════ */}
      <CrossNavigation
        items={[
          {
            icon: '\u{1F4DC}',
            title: 'Soberana Manifesto',
            description: 'Our vision and architecture philosophy',
            href: '/docs/manifesto',
          },
          {
            icon: '\u{1F916}',
            title: 'Soberana Zentinel',
            description: 'AI-powered treasury intelligence',
            href: '/docs/sovy',
          },
        ]}
        backLabel={t`Volver a documentación`}
      />
    </div>
  );
}
