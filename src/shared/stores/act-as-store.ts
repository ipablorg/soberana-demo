import { create } from 'zustand';

import { AuthMeDocument } from '@/graphql/queries/auth';
import { graphqlClient, setActAsHeader } from '@/shared/lib/graphql-client';
import { isTenantAdmin } from '@/shared/lib/tenant-roles';
import type { AuthUser } from '@/shared/types/auth.types';

import { useAuthStore } from './auth-store';
import { selectIsViewingAs, useViewAsStore } from './view-as-store';

/** Identity header of the act-as mode (backend `x-act-as-client`). */
const ACT_AS_HEADER = 'x-act-as-client';

/**
 * "Act as tenant admin" mode (epic 2026-11 S5, commercial dual user): a
 * LOOPAY_ADMIN or OPS_COMMERCIAL enters a client's tenant backoffice as one of
 * its admins. While on, every GraphQL request carries `x-act-as-client` and the
 * auth store holds the synthetic tenant admin `auth_me` returns (roles
 * `CLIENT_ADMIN`, no staff role); leaving restores the staff member. The
 * backend only answers `tenant_*` and `auth_me` under it and audits every
 * request. Memory-only on purpose: a reload ends the mode with the session.
 * Never runs together with view-as: starting one ends the other.
 *
 * Two steps, so the backoffice never sends a request with the header (403
 * `ACT_AS_TENANT_SURFACE_ONLY`) and its staff-only guards never see the
 * synthetic user (`/unauthorized`):
 * 1. `startActAs` (on the client detail) validates the identity with one
 *    `auth_me` carrying the header on that request only, and stages it.
 * 2. `activateActAs` (run by `TenantRoute` once the tenant tree is mounted,
 *    the backoffice tree already gone) sets the global header and swaps the
 *    auth user.
 * Symmetrically `StaffRoute` calls `endActAs` when a staff surface mounts
 * while the mode is active, so "Exit" only navigates.
 */
interface ActAsState {
  clientId: string | null;
  staffUser: AuthUser | null;
  /** Synthetic tenant admin validated by `startActAs`, waiting for `activateActAs`. */
  pendingUser: AuthUser | null;
  /** True while the global header is set and the auth store holds the synthetic user. */
  active: boolean;
  startActAs: (clientId: string) => Promise<void>;
  activateActAs: () => void;
  endActAs: () => void;
}

const INACTIVE = { clientId: null, staffUser: null, pendingUser: null, active: false } as const;

export const useActAsStore = create<ActAsState>()((set, get) => ({
  ...INACTIVE,

  startActAs: async (clientId) => {
    if (get().clientId !== null) get().endActAs();
    if (selectIsViewingAs(useViewAsStore.getState())) useViewAsStore.getState().stop();

    const { user: staffUser, token } = useAuthStore.getState();
    if (!staffUser || !token) return;

    const { auth_me: tenantUser } = await graphqlClient.request(AuthMeDocument, undefined, {
      [ACT_AS_HEADER]: clientId,
    });
    if (!isTenantAdmin(tenantUser)) throw new Error('ACT_AS_NOT_TENANT_ADMIN');
    set({ clientId, staffUser, pendingUser: tenantUser as AuthUser, active: false });
  },

  activateActAs: () => {
    const { clientId, pendingUser } = get();
    const { token } = useAuthStore.getState();
    if (!clientId || !pendingUser || !token) return;

    setActAsHeader(clientId);
    set({ pendingUser: null, active: true });
    useAuthStore.getState().setAuth(pendingUser, token);
    watchSessionEnd();
  },

  endActAs: () => {
    const { staffUser, active } = get();
    const { token } = useAuthStore.getState();

    setActAsHeader(null);
    set({ ...INACTIVE });
    if (active && staffUser && token) {
      useAuthStore.getState().setAuth(staffUser, token);
    }
  },
}));

/** Act-as started (staged or active): starting view-as must end it. */
export const selectIsActingAs = (state: ActAsState): boolean => state.clientId !== null;

/** Header set and synthetic user in the auth store. */
export const selectIsActAsActive = (state: ActAsState): boolean => state.active;

/** Validated identity waiting for the tenant tree to activate it. */
export const selectHasPendingActAs = (state: ActAsState): boolean => state.pendingUser !== null;

let stopWatchingSession: (() => void) | null = null;

/**
 * Logging out ends act-as, so no banner or synthetic identity leaks into the
 * next session (`clearAuth` already drops the header). Subscribed on
 * activation, never at import, like view-as.
 */
function watchSessionEnd(): void {
  stopWatchingSession?.();
  stopWatchingSession = useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) return;
    stopWatchingSession?.();
    stopWatchingSession = null;
    useActAsStore.setState({ ...INACTIVE });
  });
}
