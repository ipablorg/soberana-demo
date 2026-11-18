/**
 * Development Configuration — Dev Mock Mode flag.
 *
 * Controls whether the app renders hand-crafted fixtures instead of hitting
 * the network, for local UI/UX work without a backend.
 *
 * Two activation paths:
 * 1. Public portfolio demo build — the deploy workflow passes
 *    `VITE_DEMO_MODE=true` to `vite build`. Demo mode enables the mock
 *    fixtures AND the internal product surfaces (Workflow Composer, Loopay
 *    Elements, products section) in a PRODUCTION bundle, so a visitor of the
 *    public portfolio page gets a full walkthrough with no backend and no
 *    login. Only the deploy workflow sets `VITE_DEMO_MODE`; it never lives in
 *    any committed `.env` file, so a normal prod build stays mock-free.
 * 2. Local dev (`npm run dev`) — mock mode is forced on unconditionally so
 *    frontend work never needs a backend (`.env.local` is access-restricted
 *    on this machine, hence no opt-in env var).
 *
 * Production safeguards:
 * - Without `VITE_DEMO_MODE`, `isDevMockMode()` and
 *   `isInternalProductSettingsEnabled()` always return `false` in
 *   `import.meta.env.PROD` builds, keeping the mock and the internal
 *   surfaces inert in production even if a stray flag lands in a staging
 *   `.env`.
 * - In dev-mock/demo mode, login is bypassed in `protected-route.tsx`, KYC is
 *   stubbed to APPROVED in `useKYC.ts`, and the dashboard/receive/send hooks
 *   serve fixtures from `tutorial-demo-data.ts` via `useTutorialDemoStore`.
 */

/**
 * True only in the public portfolio demo build, when the deploy workflow
 * passed `VITE_DEMO_MODE=true`. In a regular prod build this env var is
 * absent, so Vite inlines `undefined` and this compiles to a constant false.
 */
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

/**
 * True while running under Vite dev server / unbundled build.
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * True in the public demo build (regardless of PROD) or under the dev server.
 */
export const isDevMockMode = (): boolean => {
  if (isDemoMode()) return true;
  if (import.meta.env.PROD) return false;
  return true;
};

/**
 * Internal, not-yet-production-ready product surfaces (Workflow Composer,
 * Loopay Elements, settings products section) are gated behind this flag.
 *
 * It is `true` in the public demo build and under the Vite dev server
 * (`npm run dev`), and `false` in a regular `vite build` (PROD) — the same
 * hard production safeguard as `isDevMockMode`. Without `VITE_DEMO_MODE` a
 * production build cannot be flipped on by a stray flag in a staging `.env`.
 *
 * Consumers must AND this with their own enablement state (e.g. the
 * persisted `workflow-composer`/`elements-integration` stores). A user who
 * toggled a product on in a previous prod session still has `enabled=true`
 * in localStorage, but in a production build the UI must NOT react to it —
 * gate every product surface (settings tab, header shortcuts, dock item,
 * `/workflow` + `/elements` routes) on this helper.
 */
export const isInternalProductSettingsEnabled = (): boolean => {
  if (isDemoMode()) return true;
  if (import.meta.env.PROD) return false;
  return import.meta.env.DEV;
};

/**
 * Mock user role selector (kept for backward compatibility with existing
 * consumers such as `mock-data.ts`). New code should not read this.
 */
export const getDevMockUserRole = (): 'company_admin' | 'staff_admin' | 'company_user' => {
  const envRole = import.meta.env.VITE_DEV_MOCK_USER_ROLE;

  if (envRole === 'staff_admin' || envRole === 'company_user') {
    return envRole;
  }

  return 'company_admin';
};

/**
 * Prints a one-time, highly visible banner so nobody forgets mock mode is on.
 * Safe to call from any top-level `useEffect` — it is a no-op when the flag
 * is off or in production.
 */
export const warnIfDevMockMode = (): void => {
  if (!isDevMockMode()) return;

  // eslint-disable-next-line no-console
  console.warn(
    '%c[Dev Mock Mode] Active%c\n' +
      'The app is rendering hand-crafted fixtures instead of hitting the backend.\n' +
      'To disable: set VITE_DEV_MOCK_MODE=false in .env.local and restart the dev server.',
    'background:#E06B4A;color:#fff;padding:2px 6px;border-radius:4px;font-weight:bold;',
    'color:inherit;',
  );
};

/**
 * Legacy alias kept for backward compatibility. Prefer `warnIfDevMockMode`.
 */
export const logDevMode = (): void => {
  warnIfDevMockMode();
};
