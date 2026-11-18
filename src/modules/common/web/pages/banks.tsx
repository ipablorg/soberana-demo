import { motion } from 'framer-motion';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { LanguageToggle } from '@/shared/components/common/LanguageToggle';
import { SectionProblem } from '../components/landing/SectionProblem';
import { SectionVision } from '../components/landing/SectionVision';
import { SectionProducts } from '../components/landing/SectionProducts';
import { SectionAudiences } from '../components/landing/SectionAudiences';
import { SectionProof } from '../components/landing/SectionProof';
import { SectionCTA } from '../components/landing/SectionCTA';
import { HeroPillars } from '../components/landing/HeroPillars';
import { InfrastructureGraph } from '../components/landing/InfrastructureGraph';
import { RotatingWord } from '../components/landing/RotatingWord';
import SoberanaLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import SoberanaLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';

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

export default function Banks() {
  const navigate = useNavigate();
  const { t } = useLingui();

  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="focus:outline-none">
                <img src={SoberanaLogoLight} alt="Soberana" className="h-8 w-auto dark:hidden" />
                <img src={SoberanaLogoDark} alt="Soberana" className="h-8 w-auto hidden dark:block" />
              </button>
              <div className="hidden sm:block border-l border-border h-4 mx-2" />
              <Button variant="ghost" size="sm" className="hidden sm:flex text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                ← <Trans>Back to Soberana</Trans>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle availableLanguages={['en', 'es', 'pt']} />
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="border border-border bg-transparent hover:bg-foreground/5 text-foreground"
              >
                <Trans>Sign in</Trans>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero — text left + dynamic right panel */}
      <section className="px-6 pt-24 pb-8">
        <div className="w-full max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:min-h-[50vh]">
          {/* LEFT: Brand storytelling */}
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
              SOBERANA
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-heading text-4xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              {t`The payment infrastructure`}{' '}
              <RotatingWord
                words={[t`banks`, t`fintechs`, t`enterprises`]}
                interval={2500}
                className="text-gradient-loopay"
              />{' '}
              {t`deserve.`}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="font-body text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              {t`Global payment rails. Digital assets. Smart treasury. One architecture.`}
            </motion.p>
          </motion.div>

          {/* RIGHT: HeroPillars */}
          <div className="flex flex-col items-center justify-center">
              <motion.div
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="w-full"
                >
                  <HeroPillars
                    onGetStarted={() => navigate('/register')}
                    onSignIn={() => navigate('/login')}
                    onLearnMore={() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                </motion.div>
          </div>
        </div>
      </section>

      {/* Infrastructure graph + scrollable sections */}
          <section className="px-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
              className="max-w-7xl mx-auto flex flex-col items-center"
            >
              <div className="w-80 h-80 lg:w-[480px] lg:h-[480px]">
                <InfrastructureGraph />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
                <span className="font-mono tabular-nums">+45 {t`countries`}</span>
                <span className="text-border">·</span>
                <span className="font-mono tabular-nums">+1M {t`transactions`}</span>
                <span className="text-border">·</span>
                <span className="font-mono tabular-nums">$2B+ {t`mobilized`}</span>
              </div>
            </motion.div>
          </section>

          <div id="how-it-works">
            <SectionProblem />
          </div>
          <SectionVision />
          <SectionProducts />
          <SectionAudiences />
          <SectionProof />
          <SectionCTA />

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
