/**
 * useDisplayName
 *
 * Canonical resolver for the current user's display name. Single source
 * of truth used by the topbar (`AppTopbar`), the user chip
 * (`UserAvatarChip`), the VirtualCard on the conversational home, and
 * any other surface that renders "who am I".
 *
 * Precedence:
 *   1. `company_name` (B2B identity — the CustomerProfile's business
 *      name). Fintech users overwhelmingly identify with their
 *      company, not their personal name, so this wins when present.
 *   2. `name` (the authenticated human's full name).
 *   3. Literal fallback `'Usuario'`. This is a TECHNICAL fallback for
 *      the degenerate case of a logged-in session with neither field
 *      populated (should not happen in production). It is NOT user-
 *      facing copy and therefore intentionally not Lingui-wrapped —
 *      wrapping it would imply the UI is designed to show it.
 *
 * Returns both `full` (used in large surfaces like the VirtualCard
 * header) and `short` (used in tight surfaces like the topbar chip:
 * first token of `name` when no `company_name` exists, so "Juan
 * Pérez" renders as "Juan"). `email` is returned verbatim and used as
 * the secondary line in the user-menu.
 */

import { useAuth } from '@/shared/hooks/use-auth';

export interface DisplayName {
  /** Full label: used when space is not constrained (VirtualCard). */
  full: string;
  /** Short label: used in compact surfaces (topbar chip). */
  short: string;
  /** User email; empty string when the session is not yet hydrated. */
  email: string;
}

export function useDisplayName(): DisplayName {
  const { user } = useAuth();
  const full = user?.company_name || user?.name || 'Usuario';
  const short =
    user?.company_name || user?.name?.split(' ')[0] || 'Usuario';
  const email = user?.email ?? '';
  return { full, short, email };
}
