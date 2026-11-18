import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { LoadingScreen } from '@/shared/components/common/loading-screen';
import { SplashScreen } from '@/shared/components/common/splash-screen';
import { useElementsIntegrationStore } from '@/shared/stores/use-elements-integration-store';

type Phase = 'idle' | 'loading' | 'splash';

const LOADING_MIN_MS = 1200;

export function ElementsActivationSplash() {
  const enabled = useElementsIntegrationStore((s) => s.enabled);
  const splashShown = useElementsIntegrationStore((s) => s.splashShown);
  const markSplashShown = useElementsIntegrationStore((s) => s.markSplashShown);

  const [phase, setPhase] = useState<Phase>('idle');
  const [barComplete, setBarComplete] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);

  // Trigger once on mount when enabled and splash hasn't been shown yet.
  const triggered = useRef(false);

  useEffect(() => {
    if (enabled && !splashShown && !triggered.current) {
      triggered.current = true;
      setBarComplete(false);
      setMinElapsed(false);
      setPhase('loading');
    }
  }, [enabled, splashShown]);

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => setMinElapsed(true), LOADING_MIN_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === 'loading' && barComplete && minElapsed) {
      setPhase('splash');
    }
  }, [phase, barComplete, minElapsed]);

  const handleBarComplete = useCallback(() => setBarComplete(true), []);

  const handleSplashDismiss = useCallback(() => {
    markSplashShown();
    setPhase('idle');
  }, [markSplashShown]);

  if (phase === 'idle') return null;

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && (
        <LoadingScreen
          key="elements-loading"
          variant="elements"
          onComplete={handleBarComplete}
        />
      )}
      {phase === 'splash' && (
        <SplashScreen
          key="elements-splash"
          variant="elements"
          onDismiss={handleSplashDismiss}
          visibleMs={1200}
          fadeMs={700}
        />
      )}
    </AnimatePresence>
  );
}
