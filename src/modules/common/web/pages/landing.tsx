import { motion, useInView } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { RotatingWord } from '../components/landing/RotatingWord';
import { Globe2, ShieldCheck, Zap, ArrowRight, Lock, Layers, Rocket, Bot, Activity } from '@/shared/components/animated-icons';
import type { IconComponent } from '@/shared/components/animated-icons';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { useRef } from 'react';



const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const staggerSlow = {
  animate: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1 },
};

// ── Rails data (country-first, with flags) ──────────────────────
interface Rail { flag: string; country: string; rail: string; latency: string }

const RAILS: Rail[] = [
  { flag: '🌐', country: 'Global', rail: 'SWIFT / Wire', latency: 'Same-day to 2 days' },
  { flag: '🇺🇸', country: 'United States', rail: 'ACH', latency: 'Same-day to next-day' },
  { flag: '🇺🇸', country: 'United States', rail: 'FedNow', latency: 'Seconds' },
  { flag: '🇪🇺', country: 'Eurozone', rail: 'SEPA', latency: 'Same-day' },
  { flag: '🇪🇺', country: 'Eurozone', rail: 'SEPA Instant', latency: 'Seconds' },
  { flag: '🇬🇧', country: 'United Kingdom', rail: 'Faster Payments', latency: 'Seconds' },
  { flag: '🇲🇽', country: 'Mexico', rail: 'SPEI', latency: 'Seconds, 24/7' },
  { flag: '🇧🇷', country: 'Brazil', rail: 'PIX', latency: 'Seconds, 24/7' },
  { flag: '🇨🇴', country: 'Colombia', rail: 'Bre-B', latency: 'Seconds' },
  { flag: '🇨🇦', country: 'Canada', rail: 'Interac', latency: 'Seconds' },
  { flag: '🇮🇳', country: 'India', rail: 'UPI', latency: 'Seconds' },
  { flag: '🇸🇬', country: 'Singapore', rail: 'PayNow', latency: 'Seconds' },
  { flag: '🇭🇰', country: 'Hong Kong', rail: 'FPS', latency: 'Seconds' },
];

// ── Animated counter (same as SectionProblem) ───────────────────
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

// ── Product block (same pattern as banks SectionProducts) ───────
interface ProductProps {
  label: string;
  title: string;
  subtitle: string;
  benefits: { icon: IconComponent; title: string; text: string }[];
  stats: string;
  inverted?: boolean;
}

function ProductBlock({ label, title, subtitle, benefits, stats, inverted }: ProductProps) {
  const textPrimary = inverted ? 'text-background' : 'text-foreground';
  const textSecondary = inverted ? 'text-background/60' : 'text-muted-foreground';
  const statsBg = inverted ? 'bg-background/5' : 'bg-muted/50';
  const statsText = inverted ? 'text-background/50' : 'text-muted-foreground';

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-10%' }}
      variants={staggerSlow}
    >
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`text-xs font-heading uppercase tracking-[0.3em] ${textSecondary} mb-6`}
      >
        {label}
      </motion.p>
      <motion.h3
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`font-heading text-2xl lg:text-4xl font-bold ${textPrimary} leading-tight mb-3`}
      >
        {title}
      </motion.h3>
      <motion.p
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`font-body text-lg ${textSecondary} mb-12`}
      >
        {subtitle}
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.title}
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col gap-3"
            >
              <Icon className={`h-5 w-5 ${textPrimary}`} />
              <h4 className={`font-heading text-sm font-semibold ${textPrimary}`}>{b.title}</h4>
              <p className={`font-body text-sm ${textSecondary} leading-relaxed`}>{b.text}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        variants={fadeUp}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${statsBg} rounded-lg px-6 py-4`}
      >
        <p className={`font-mono tabular-nums text-sm ${statsText} tracking-wide`}>
          {stats}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  LANDING — Global B2B Payments
// ═══════════════════════════════════════════════════════════════════

export default function Landing() {
  const { t } = useLingui();

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="focus:outline-none">
                <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
                <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
              </Link>
              <div className="hidden sm:block border-l border-border h-4 mx-2" />
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground" asChild>
                <Link to="/">
                  ← <Trans>Back to Soberana</Trans>
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle availableLanguages={['en', 'es', 'pt']} />
              <Button
                size="sm"
                className="border border-border bg-transparent hover:bg-foreground/5 text-foreground"
                asChild
              >
                <Link to="/login">
                  <Trans>Sign in</Trans>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Hero (two-col) — right column swaps between pillars / login / register ── */}
      <section className="px-6 pt-24 pb-8">
        <div className="w-full max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:min-h-[50vh]">
          <motion.div
            className="mb-12 lg:mb-0"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-heading text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              <Trans>The Sovereign Account.</Trans>{' '}
              <RotatingWord
                words={[t`Defeats inflation.`, t`Dollarizes instantly.`, t`Outpaces local devaluation.`]}
                interval={3500}
                className="text-gradient-loopay"
              />
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-body text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              <Trans>Your local currency loses value every second. Receive globally, shield your capital in digital dollars, and generate dynamic yield to beat inflation.</Trans>
            </motion.p>
          </motion.div>

          {/* RIGHT: Dynamic panel */}
          <div className="flex flex-col items-center justify-center">
              <motion.div
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full flex flex-col gap-8"
                >
                  <div className="space-y-6">
                    {[
                      { icon: Globe2, num: '01', name: t`Local everywhere`, line: t`Receive in pesos, euros, or reais without SWIFT friction.` },
                      { icon: ShieldCheck, num: '02', name: t`Immediate dollarization`, line: t`Instant 1:1 conversion to digital dollars. Your purchasing power, frozen.` },
                      { icon: Rocket, num: '03', name: t`Inflation shield`, line: t`Dynamic yield that adapts to always outpace your local inflation.` },
                    ].map((p) => {
                      const Icon = p.icon;
                      return (
                        <div key={p.name} className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-[10px] text-muted-foreground/50 tracking-widest uppercase">{p.num}</span>
                              <h3 className="font-heading text-base font-semibold text-foreground">{p.name}</h3>
                            </div>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed">{p.line}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-border" />

                  <div className="flex flex-col gap-3">
                    <Button variant="gradient" size="lg" className="w-full sm:w-auto" asChild>
                      <Link to="/register">
                        <Trans>Start sending</Trans>
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="default" asChild>
                        <Link to="/register">
                          <Trans>Create account</Trans>
                        </Link>
                      </Button>
                      <span className="text-muted-foreground/40 text-xs">|</span>
                      <Button variant="link" size="default" asChild>
                        <Link to="/login">
                          <Trans>Sign in</Trans>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
          </div>
        </div>
      </section>

      {/* ── Proof strip ────────────────────────────────────────── */}
      <section className="px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
          className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm text-muted-foreground"
        >
          <span className="font-mono tabular-nums"><Trans>Instant dollarization</Trans></span>
          <span className="text-border">·</span>
          <span className="font-mono tabular-nums"><Trans>Inflation-beating yield</Trans></span>
          <span className="text-border">·</span>
          <span className="font-mono tabular-nums"><Trans>Global rails</Trans></span>
        </motion.div>
      </section>

      {/* ── Section: The Problem (inverted) ────────────────────── */}
      <section id="how-it-works" className="py-24 lg:py-32 px-6 bg-foreground text-background overflow-hidden">
        <div className="max-w-4xl mx-auto">
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
              <Trans>Your money is losing value.</Trans>
            </motion.h2>
          </motion.div>

          <div className="space-y-0">
            {[
              { num: '01', title: t`Inflation steals your purchasing power.`, text: t`Holding local currency means losing value every day. Traditional banks offer yields that don't even beat inflation.` },
              { num: '02', title: t`SWIFT friction blocks growth.`, text: t`Legacy cross-border payments are slow, expensive, and opaque. Your business is global, your bank is local.` },
              { num: '03', title: t`Idle capital is wasted capital.`, text: t`Treasury sitting in a checking account is a liability. Your CFO needs to actively defend your margins.` },
            ].map((point, i) => (
              <motion.div
                key={point.num}
                className="grid grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start py-10 lg:py-14 border-b border-background/10 last:border-b-0"
                initial={{ opacity: 0, x: -48 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.12 }}
              >
                <AnimatedCounter value={point.num} delay={0.15 + i * 0.12} />
                <div className="pt-3 lg:pt-6">
                  <motion.p
                    className="font-heading text-xl lg:text-2xl font-semibold leading-snug mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.12 }}
                  >
                    {point.title}
                  </motion.p>
                  <motion.p
                    className="font-body text-base lg:text-lg text-background/50 leading-relaxed"
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

          <motion.div
            className="h-px bg-background/20 mt-16 mb-10 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.p
            className="font-body text-lg lg:text-xl text-background/70 max-w-2xl"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Trans>The Sovereign Account gives you elite financial infrastructure: receive globally, dollarize instantly, and auto-invest your treasury.</Trans>
          </motion.p>
        </div>
      </section>

      {/* ── Product sections ── */}
      {([
        {
          label: t`01 — Global Rails`,
          title: t`Local everywhere.`,
          subtitle: t`Receive in pesos, euros, or reais. Send globally without abusive fees or days of waiting.`,
          benefits: [
            { icon: Globe2, title: t`Receive like a local`, text: t`Provide local account details in key markets. Bypass SWIFT friction.` },
            { icon: ShieldCheck, title: t`Immediate dollarization`, text: t`Instantly convert to digital dollars. Stop bleeding purchasing power to local devaluation.` },
            { icon: Zap, title: t`Fast settlement`, text: t`Route payments through the fastest corridor automatically.` },
          ],
          stats: t`Multi-currency  ·  Instant conversion  ·  Global reach`,
          dark: true,
        },
        {
          label: t`02 — Yield Box`,
          title: t`Dynamic yield. Total flexibility.`,
          subtitle: t`Don't let your treasury sit idle. Auto-invest in high-efficiency funds to protect your margins against inflation.`,
          benefits: [
            { icon: Layers, title: t`Beat local inflation`, text: t`Access dynamic yields engineered to always outpace your local currency's devaluation.` },
            { icon: Rocket, title: t`Total liquidity`, text: t`Your money remains available for payments while it earns.` },
            { icon: Lock, title: t`Inflation shield`, text: t`Protect your purchasing power against local currency devaluation.` },
          ],
          stats: t`Dynamic yield  ·  Auto-invest  ·  Instant liquidity`,
          dark: false,
        },
        {
          label: t`03 — Zentinel AI`,
          title: t`Your virtual CFO.`,
          subtitle: t`An AI agent that watches your treasury, executes payments, and invests to combat inflation.`,
          benefits: [
            { icon: Bot, title: t`Treasury care`, text: t`Zentinel monitors your balances and suggests optimal yield strategies.` },
            { icon: Activity, title: t`Smart execution`, text: t`Automate recurring payments and payroll across borders.` },
            { icon: ShieldCheck, title: t`Proactive defense`, text: t`Constant analysis of currency risks and yield opportunities.` },
          ],
          stats: t`AI-powered  ·  Automated treasury  ·  24/7 monitoring`,
          dark: true,
        },
      ] as (ProductProps & { dark: boolean })[]).map((product) => (
        <section
          key={product.label}
          className={`py-24 lg:py-32 px-6 ${product.dark ? 'bg-foreground text-background' : 'bg-background text-foreground'}`}
        >
          <div className="max-w-4xl mx-auto">
            <ProductBlock {...product} inverted={product.dark} />
          </div>
        </section>
      ))}

      {/* ── Section: Every Country. Every Rail. (flags grid) ───── */}
      <section className="py-24 lg:py-32 px-6 bg-background">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-10%' }}
          variants={staggerSlow}
        >
          <div className="text-center mb-16">
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-heading text-3xl lg:text-5xl font-bold text-foreground leading-tight mb-4"
            >
              <Trans>Every country. Without borders.</Trans>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-body text-lg text-muted-foreground max-w-xl mx-auto"
            >
              <Trans>Move money globally without friction. One elite infrastructure, every corridor.</Trans>
            </motion.p>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.06 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
          >
            {RAILS.map((rail) => (
              <motion.div
                key={`${rail.country}-${rail.rail}`}
                variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="rounded-xl bg-muted/30 p-4 flex items-start gap-3"
              >
                <span className="text-2xl leading-none mt-0.5" role="img" aria-label={rail.country}>
                  {rail.flag}
                </span>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{rail.country}</p>
                  <p className="text-xs font-mono text-muted-foreground">{rail.rail}</p>
                  <p className="text-[11px] text-muted-foreground/70">{rail.latency}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Section: Proof (inverted) ──────────────────────────── */}
      <section className="py-24 lg:py-32 px-6 bg-foreground text-background">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-10%' }}
          variants={staggerSlow}
        >
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-heading text-3xl lg:text-5xl font-bold leading-tight mb-20"
          >
            <Trans>The power of sovereignty.</Trans>
          </motion.h2>

          <div className="grid grid-cols-3 gap-8 mb-20">
            {[
              { value: '1:1', label: t`dollar parity` },
              { value: 'Beat', label: t`local inflation` },
              { value: '0', label: t`SWIFT friction` },
            ].map((stat) => (
              <motion.div key={stat.value} variants={scaleIn} transition={{ duration: 0.5, ease: 'easeOut' }}>
                <p className="font-mono tabular-nums text-5xl lg:text-8xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm text-background/50 mt-3">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-mono text-xs text-background/30 tracking-widest uppercase"
          >
            PCI DSS  ·  ISO 27001  ·  SOC 2
          </motion.p>
        </motion.div>
      </section>

      {/* ── Section: CTA ───────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-background">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-10%' }}
          variants={staggerSlow}
        >
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-heading text-3xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
          >
            <Trans>Take control of your treasury.</Trans>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-body text-lg text-muted-foreground leading-relaxed mb-12"
          >
            <Trans>Elite financial infrastructure. No setup fees. Start dollarizing today.</Trans>
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-16"
          >
            <Button variant="gradient" size="lg" asChild>
              <Link to="/register">
                {t`Start sending`}
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            <div>
              <img src={SoberanaLogoLight} alt="Soberana" className="h-6 w-auto dark:hidden" />
              <img src={SoberanaLogoDark} alt="Soberana" className="h-6 w-auto hidden dark:block" />
            </div>
            <p className="font-mono text-xs text-muted-foreground/40 tracking-wide">
              soberana.app
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2026 Loopay · soberana.app
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/40 tracking-widest uppercase">
            PCI DSS · ISO 27001 · SOC 2
          </p>
        </div>
      </footer>
    </div>
  );
}
