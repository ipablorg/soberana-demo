import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { LoginForm } from '@/modules/common/auth/components/login-form';
import { RegisterForm } from '@/modules/common/auth/components/RegisterForm';
import { SovereignMoneyNetwork } from '../components/sovereign-money-network';
import { Bot, MapPin, TrendingUp, Timer, GitBranch, DollarSign } from '@/shared/components/animated-icons';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay negro 1.png';
import SoberanaLogoDark  from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';

type Mode = 'explore' | 'login' | 'register';

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

const formVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -20 },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function SoveranaLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t }    = useLingui();

  const [mode, setMode] = useState<Mode>(() => {
    const s = (location.state as { mode?: Mode } | null)?.mode;
    return s === 'login' || s === 'register' ? s : 'explore';
  });

  // Clear location state so a hard-refresh doesn't re-open the form
  useEffect(() => {
    if ((location.state as { mode?: string } | null)?.mode) {
      navigate('/', { replace: true, state: {} });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Header ───────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ willChange: 'transform, opacity' }}
        className="fixed top-0 left-0 right-0 z-40 bg-background/95 border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={() => { if (mode !== 'explore') setMode('explore'); }} className="focus:outline-none">
              <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
              <img src={SoberanaLogoDark}  alt="Soberana" className="h-8 w-auto hidden dark:block" />
            </button>
          <div className="flex items-center gap-2">
            <LanguageToggle availableLanguages={['en', 'es', 'pt']} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode('login')}
              className="text-foreground"
            >
              <Trans>Sign in</Trans>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* ── Hero — full-viewport with canvas ─────────────────────── */}
      <section className="relative min-h-screen overflow-hidden">
        <SovereignMoneyNetwork className="absolute inset-0 w-full h-full" paused={mode !== 'explore'} />

        {/* Content sits above the canvas */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="text-center max-w-4xl"
          >
            {/* Eyebrow */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="text-sm font-mono uppercase tracking-[0.4em] text-foreground/50 mb-8"
            >
              SOBERANA
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-heading font-bold leading-none tracking-tight mb-6"
            >
              <span className="block text-5xl sm:text-6xl lg:text-8xl text-foreground">
                <Trans>Open your</Trans>
              </span>
              <span className="block text-5xl sm:text-6xl lg:text-8xl text-gradient-loopay">
                <Trans>sovereign account</Trans>
              </span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="font-body text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto mb-12"
            >
              <Trans>Your local currency loses value every second. Soberana is the digital dollar account that lets you move globally, shield your capital, and choose how you save.</Trans>
            </motion.p>

            {/* Auth CTAs — primary hierarchy */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5"
            >
              {/* Secondary auth — gradient border only */}
              <div className="gradient-border-thin-always rounded-full">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setMode('login')}
                  className="rounded-full px-8 text-foreground hover:bg-transparent"
                >
                  <Trans>Sign in</Trans>
                </Button>
              </div>
              {/* Primary auth — solid gradient */}
              <Button
                variant="gradient"
                size="lg"
                onClick={() => setMode('register')}
                className="rounded-full px-8"
              >
                <Trans>Create account</Trans>
              </Button>
            </motion.div>

            {/* Destination links — secondary hierarchy */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center justify-center gap-4"
            >
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/remittances">
                  <Trans>Remittances</Trans>
                  {' →'}
                </Link>
              </Button>
              <span className="text-muted-foreground/30 text-xs select-none">·</span>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/gig">
                  <Trans>For Freelancers</Trans>
                  {' →'}
                </Link>
              </Button>
              <span className="text-muted-foreground/30 text-xs select-none">·</span>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link to="/docs/manifesto">
                  <Trans>Manifesto</Trans>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-background">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.18 }}
          className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {([
            { num: t`Global`, label: t`open it from any country`,   Icon: MapPin     },
            { num: '0',       label: t`frozen accounts`,            Icon: GitBranch  },
            { num: '24/7',    label: t`access to your money`,       Icon: Timer      },
            { num: '0',       label: t`hidden fees`,                Icon: DollarSign },
            { num: '1:1',     label: t`digital dollar backing`,     Icon: TrendingUp },
            { num: '100%',    label: t`digital, no bank branches`,  Icon: Bot        },
          ] as const).map(({ num, label, Icon }) => (
            <motion.div
              key={label}
              variants={{
                initial: { opacity: 0, y: 10, scale: 0.78 },
                animate: { opacity: 1, y: 0, scale: [0.78, 1.10, 1] },
              }}
              transition={{ duration: 0.55, ease: 'easeOut', times: [0, 0.62, 1] }}
            >
              <Card variant="gradient-thin" className="relative overflow-hidden">
                <motion.div
                  variants={{
                    initial: { opacity: 0 },
                    animate: { opacity: [0, 1, 0], transition: { duration: 1.0, times: [0, 0.2, 1], ease: 'easeOut' } },
                  }}
                  className="absolute inset-0 pointer-events-none bg-primary/20"
                />
                <CardContent className="p-5 text-center flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center">
                    <Icon className="h-4 w-4 icon-gradient" size={16} />
                  </div>
                  <p className="font-mono tabular-nums text-3xl sm:text-4xl font-bold text-foreground leading-none">{num}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Money without borders ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-foreground leading-tight">
            <Trans>Your money shouldn’t know borders — or bureaucracy.</Trans>
          </h2>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-10%' }}
          transition={{ staggerChildren: 0.15 }}
          className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {([
            { Icon: MapPin,     title: t`Borderless`,   desc: t`Operate across the U.S., Europe, and the rest of the world as if you were home.` },
            { Icon: DollarSign, title: t`Any currency`, desc: t`Your money, your terms. Manage digital dollars and your local currency in one ecosystem.` },
            { Icon: GitBranch,  title: t`No barriers`,  desc: t`Skip the impossible paperwork. Your sovereign account activates with your own country's documents.` },
          ] as const).map(({ Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full"
            >
              <div className="gradient-border-thin-always rounded-xl h-full">
                <div className="bg-card rounded-xl p-6 h-full flex flex-col hover:bg-accent/30 transition-colors duration-150">
                  <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 icon-gradient" size={20} />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Dynamic yield ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-6 w-6 icon-gradient" size={24} />
          </div>
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            <Trans>Your capital — always moving, always protected.</Trans>
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            <Trans>Don’t just store your money; make it generate dynamic yield against inflation. With Soberana, grow your savings in stable assets. It’s time your money worked for you.</Trans>
          </p>
        </motion.div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-background border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-3xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            <Trans>Start today. Financial sovereignty begins with one decision.</Trans>
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
            <Trans>Join thousands who have already taken control of their future.</Trans>
          </p>
          <Button variant="gradient" size="lg" onClick={() => setMode('register')}>
            <Trans>Open your account</Trans>
          </Button>
          <p className="font-body text-sm text-muted-foreground mt-4">
            <Trans>100% digital, ready in minutes — no paperwork.</Trans>
          </p>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
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

      {/* ── Auth overlay (fixed, above everything) ────────────────── */}
      <AnimatePresence>
        {mode !== 'explore' && (
          <motion.div
            key="auth-overlay"
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ willChange: 'opacity' }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
          >
            {/* Close button */}
            <button
              onClick={() => setMode('explore')}
              aria-label="Close"
              className="absolute top-4 right-5 text-2xl leading-none text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              ✕
            </button>

            {/* Form panel */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login-form"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full max-w-md"
                >
                  <LoginForm
                    onSwitchToRegister={() => setMode('register')}
                    onBack={() => setMode('explore')}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register-form"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full max-w-md"
                >
                  <RegisterForm
                    onSwitchToLogin={() => setMode('login')}
                    onBack={() => setMode('explore')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
