/**
 * ReauthProvider / useReauth
 *
 * Owns the single re-authentication modal for the app and registers itself as
 * the handler used by `withRecentAuth`, so a query/mutation function anywhere
 * can trigger the prompt without holding a React reference.
 *
 * Mounted in `AppProvider` next to `ZentinelProvider`.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ReauthModal } from '@/shared/components/common/reauth-modal';
import { registerReauthHandler, type ReauthChallenge } from '@/shared/lib/reauth';

interface ReauthContextValue {
  /** Opens the modal and resolves `true` when the user re-authenticated. */
  requestReauth: (challenge?: ReauthChallenge) => Promise<boolean>;
  isOpen: boolean;
  challenge: ReauthChallenge | null;
}

const ReauthContext = createContext<ReauthContextValue | null>(null);

export function ReauthProvider({ children }: { children: ReactNode }) {
  const [challenge, setChallenge] = useState<ReauthChallenge | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pendingRef = useRef<((value: boolean) => void) | null>(null);

  const requestReauth = useCallback((next?: ReauthChallenge) => {
    // A prompt is already on screen — share its outcome instead of stacking
    // a second modal for a concurrent request.
    if (pendingRef.current) {
      const previous = pendingRef.current;
      return new Promise<boolean>((resolve) => {
        pendingRef.current = (value) => {
          previous(value);
          resolve(value);
        };
      });
    }

    setChallenge(next ?? { maxAgeSeconds: null });
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      pendingRef.current = resolve;
    });
  }, []);

  const handleResolve = useCallback((reauthenticated: boolean) => {
    setIsOpen(false);
    setChallenge(null);
    const resolve = pendingRef.current;
    pendingRef.current = null;
    resolve?.(reauthenticated);
  }, []);

  useEffect(() => registerReauthHandler((next) => requestReauth(next)), [requestReauth]);

  const value = useMemo(
    () => ({ requestReauth, isOpen, challenge }),
    [requestReauth, isOpen, challenge],
  );

  return (
    <ReauthContext.Provider value={value}>
      {children}
      <ReauthModal open={isOpen} challenge={challenge} onResolve={handleResolve} />
    </ReauthContext.Provider>
  );
}

/**
 * Access the re-auth prompt from a component. Throws when used outside
 * `ReauthProvider` so the miswiring surfaces immediately.
 */
export function useReauth(): ReauthContextValue {
  const context = useContext(ReauthContext);
  if (!context) {
    throw new Error('useReauth must be used within a ReauthProvider');
  }
  return context;
}
