import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { Zap, ShieldCheck, Globe2, ArrowRight } from '@/shared/components/animated-icons';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay negro 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import { useEffect } from 'react';

const panelVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
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

// ═══════════════════════════════════════════════════════════════════
//  REMITTANCES — Send money home, from the USA to Latam & Europe
// ═══════════════════════════════════════════════════════════════════

export default function Remittances() {
  const { t } = useLingui();

  // SEO title + meta description (i18n-aware — re-runs on locale change)
  useEffect(() => {
    const title = t`Send remittances from the USA to Latam and Europe | Soberana`;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      'content',
      t`The fastest and safest way to send remittances. No hidden fees, the best exchange rate, and direct connectivity to local banks.`,
    );
  }, [t]);

  // ── Rails data (region-first, with flags) ──────────────────────
  const RAILS: { flag: string; region: string; detail: string }[] = [
    { flag: '🇺🇸', region: t`United States`, detail: t`Fund via ACH or WIRE transfer.` },
    { flag: '🇲🇽', region: t`Mexico`, detail: t`We arrive in seconds via SPEI.` },
    { flag: '🇨🇴', region: t`Colombia, Ecuador & Peru`, detail: t`Instant deliveries using Loopay rails and the Bre-B network.` },
    { flag: '🇧🇷', region: t`Brazil`, detail: t`Instant transfers via PIX.` },
    { flag: '🇪🇺', region: t`Europe`, detail: t`Transfer euros across the entire SEPA zone.` },
  ];

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

      {/* ── Hero (two-col) ─────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-8">
        <div className="w-full max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:min-h-[50vh]">
          <motion.div
            className="mb-12 lg:mb-0"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-xs font-heading uppercase tracking-[0.3em] text-muted-foreground mb-6"
            >
              <Trans>Remittances</Trans>
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-heading text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              <Trans>Your money gets home, wherever you are. Send from the USA to all of Latin America and Europe.</Trans>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-body text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              <Trans>The fastest and safest way to send remittances. No hidden fees, the best exchange rate, and direct connectivity to local banks.</Trans>
            </motion.p>
          </motion.div>

          {/* RIGHT: value pillars + CTA */}
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
                  { icon: Zap, num: '01', name: t`Fast and secure`, line: t`The fastest, safest way to send remittances across borders.` },
                  { icon: ShieldCheck, num: '02', name: t`Best exchange rate`, line: t`No hidden fees. The real rate, every single time.` },
                  { icon: Globe2, num: '03', name: t`Local bank delivery`, line: t`Direct connectivity to local banks across Latam and Europe.` },
                ].map((p) => {
                  const Icon = p.icon;
                  return (
                    <div key={p.name} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="h-5 w-5" size={20} />
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
                    <Trans>Start sending money today</Trans>
                    <ArrowRight className="ml-1 h-4 w-4" size={16} />
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
          <span className="font-mono tabular-nums"><Trans>No hidden fees</Trans></span>
          <span className="text-border">·</span>
          <span className="font-mono tabular-nums"><Trans>Best exchange rate</Trans></span>
          <span className="text-border">·</span>
          <span className="font-mono tabular-nums"><Trans>Local bank rails</Trans></span>
        </motion.div>
      </section>

      {/* ── Section: Rails (region grid) ───────────────────────── */}
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
              <Trans>Every corridor. Every rail.</Trans>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-body text-lg text-muted-foreground max-w-xl mx-auto"
            >
              <Trans>Fund in the US and deliver locally across Latin America and Europe.</Trans>
            </motion.p>
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.06 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {RAILS.map((rail) => (
              <motion.div
                key={rail.region}
                variants={{ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="rounded-xl bg-muted/30 p-5 flex items-start gap-3"
              >
                <span className="text-2xl leading-none mt-0.5" role="img" aria-label={rail.region}>
                  {rail.flag}
                </span>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{rail.region}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{rail.detail}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
            <Trans>Your money, home in minutes.</Trans>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-body text-lg text-muted-foreground leading-relaxed mb-12"
          >
            <Trans>No hidden fees. The best exchange rate. Start sending today.</Trans>
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-16"
          >
            <Button variant="gradient" size="lg" asChild>
              <Link to="/register">
                {t`Start sending money today`}
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
