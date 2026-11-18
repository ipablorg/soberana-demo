import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Home } from '@/shared/components/animated-icons';
import { TypewriterText } from '@/shared/components/common/TypewriterText';
import { Trans, useLingui } from '@lingui/react/macro';

export default function ServerError() {
  const navigate = useNavigate();
  const { t } = useLingui();
  const descRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <span className="font-mono tabular-nums text-[120px] lg:text-[160px] font-bold leading-none text-muted-foreground/10 select-none">
            500
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">
            <Trans>Something went wrong</Trans>
          </h1>
          <div ref={descRef} className="min-h-8">
            <TypewriterText
              text={t`We're working on it. Try again in a few minutes.`}
              speed={25}
              delay={300}
              className="font-body font-light text-lg text-muted-foreground"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center gap-3"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            <Trans>Try again</Trans>
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/')}
          >
            <Home className="mr-1.5 h-4 w-4" />
            <Trans>Home</Trans>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
