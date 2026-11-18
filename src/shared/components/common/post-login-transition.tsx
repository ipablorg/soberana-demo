/**
 * PostLoginTransition — orchestrates the two-phase welcome flow.
 *
 *   loading  →  splash  →  done (children render)
 *
 *   loading: full-screen LoadingScreen with the brand progress bar.
 *            Stays mounted until `ready` flips to true AND the bar has
 *            reached 100%. Whichever finishes last gates the transition,
 *            so a slow auth bootstrap never gets cropped by the bar
 *            animation, and a fast one still respects the brand cadence.
 *   splash:  SplashScreen with "Bienvenido a Soberana", visible ~900ms,
 *            then fade+blur out.
 *   done:    children mount and the store's `hasPlayed` flag flips so we
 *            never replay the sequence on internal navigation.
 *
 * Once `hasPlayed` is true (sessionStorage-persisted) we render children
 * directly — the welcome plays once per browser session, and `clearAuth`
 * is responsible for calling `reset()` so the next login sees it again.
 */

import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingScreen } from './loading-screen';
import { SplashScreen } from './splash-screen';
import { usePostLoginTransitionStore } from '@/shared/stores/use-post-login-transition';

type Phase = 'loading' | 'splash' | 'done';

export interface PostLoginTransitionProps {
  /**
   * True when the protected tree is fully ready to render: typically
   * `isAuthenticated && !isLoading && !isSigningIn`. The loading bar
   * holds at most until this flips to true.
   */
  ready: boolean;
  children: ReactNode;
}

export function PostLoginTransition({ ready, children }: PostLoginTransitionProps) {
  const hasPlayed = usePostLoginTransitionStore((s) => s.hasPlayed);
  const markPlayed = usePostLoginTransitionStore((s) => s.markPlayed);

  const [phase, setPhase] = useState<Phase>(() => (hasPlayed ? 'done' : 'loading'));
  const [barComplete, setBarComplete] = useState(false);

  useEffect(() => {
    if (hasPlayed && phase !== 'done') {
      setPhase('done');
    }
  }, [hasPlayed, phase]);

  useEffect(() => {
    if (phase === 'loading' && ready && barComplete) {
      setPhase('splash');
    }
  }, [phase, ready, barComplete]);

  const handleBarComplete = useCallback(() => {
    setBarComplete(true);
  }, []);

  const handleSplashDismiss = useCallback(() => {
    markPlayed();
    setPhase('done');
  }, [markPlayed]);

  if (phase === 'done') {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <LoadingScreen key="post-login-loading" onComplete={handleBarComplete} />
        )}
        {phase === 'splash' && (
          <SplashScreen key="post-login-splash" onDismiss={handleSplashDismiss} />
        )}
      </AnimatePresence>
      <div aria-hidden className="hidden">
        {children}
      </div>
    </>
  );
}

export default PostLoginTransition;
