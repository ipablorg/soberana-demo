/**
 * useSyncAuthMe
 *
 * Mirrors the `auth_me` payload into the auth store once per payload.
 *
 * `setAuth` also rewrites the persisted customer context, so it must not run
 * again just because the session token rotated (silent refresh, reauth): the
 * payload is what identifies a new sign-in, not the token. Logging out drops
 * the payload memory, so the same user signing back in is applied again.
 */

import { useEffect, useRef } from 'react';
import type { AuthUser } from '@/shared/types/auth.types';

export function useSyncAuthMe(
  authMe: AuthUser | null | undefined,
  token: string | null,
  setAuth: (user: AuthUser, token: string) => void,
): void {
  const appliedRef = useRef<AuthUser | null>(null);

  useEffect(() => {
    if (!token) {
      appliedRef.current = null;
      return;
    }
    if (!authMe || appliedRef.current === authMe) return;

    appliedRef.current = authMe;
    setAuth(authMe, token);
  }, [authMe, token, setAuth]);
}
