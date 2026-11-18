/**
 * Zentinel bootstrap provider.
 *
 * Mounted near the app root (inside the QueryClientProvider) so the
 * Zentinel session auto-login and the health probe run in parallel
 * with the rest of the app bootstrap, not on first chat open. This
 * removes the "first message latency" penalty in dev.
 *
 * The provider exposes NO context — both `useZentinelAuth` and
 * `useZentinelHealth` can be called from any tree node because they
 * are backed by a module-level store and TanStack Query respectively.
 * The component's only job is to make sure those two hooks are *live*
 * from app start so their side-effects fire early.
 */

import { type ReactNode } from 'react';
import { useZentinelAuth } from '@/shared/hooks/use-zentinel-auth';
import { useZentinelHealth } from '@/shared/hooks/use-zentinel-health';

/**
 * Bootstrap the Zentinel auth + health hooks at the app root so their
 * side-effects fire before the first chat open. We deliberately keep
 * this provider free of module-level imports (it lives under
 * `src/shared/`, which is not allowed to import from `src/modules/`);
 * the chat-store rate-limit wiring is instead owned by the store
 * module itself (see `use-zentinel-chat-store.ts → wire_rate_limit_once`).
 */
function ZentinelBootstrap() {
  useZentinelAuth();
  useZentinelHealth();
  return null;
}

interface ZentinelProviderProps {
  children: ReactNode;
}

export function ZentinelProvider({ children }: ZentinelProviderProps) {
  return (
    <>
      <ZentinelBootstrap />
      {children}
    </>
  );
}
