import { motion } from 'framer-motion';
import { useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import loopayLogoLight from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import loopayLogoDark from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';

const stagger = {
  animate: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function SectionCTA() {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <section className="py-32 lg:py-48 px-6 bg-background">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-10%' }}
        variants={stagger}
      >
        <motion.h2
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-heading text-3xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
        >
          {t`Let's build what's next.`}
        </motion.h2>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-body font-light text-lg text-muted-foreground leading-relaxed mb-12"
        >
          {t`The financial infrastructure your company needs. Ready to integrate.`}
        </motion.p>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-16"
        >
          <Button variant="gradient" size="lg" onClick={() => navigate('/register')}>
            {t`Get started`}
          </Button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <div>
            <img src={loopayLogoLight} alt="Soberana" className="h-6 w-auto dark:hidden" />
            <img src={loopayLogoDark} alt="Soberana" className="h-6 w-auto hidden dark:block" />
          </div>
          <p className="font-mono text-xs text-muted-foreground/40 tracking-wide">
            soberana.app
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
