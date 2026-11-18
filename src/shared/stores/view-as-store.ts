import { create } from 'zustand';

import { AuthMeDocument } from '@/graphql/queries/auth';
import { graphqlClient, setViewAsHeader } from '@/shared/lib/graphql-client';
import type { AuthUser } from '@/shared/types/auth.types';

import { selectIsActingAs, useActAsStore } from './act-as-store';
import { useAuthStore } from './auth-store';

/**
 * "View as customer" mode (Loopay2/SOBERANA#415): a LOOPAY_ADMIN or (epic
 * 2026-11 S5) OPS_COMMERCIAL opens the client app as one customer, read-only. While on, every GraphQL request
 * carries `x-view-as-customer` and the auth store holds the customer that
 * `auth_me` returns; leaving restores the admin. Memory-only on purpose: a
 * reload ends the mode together with the session. Never runs together with
 * act-as (`act-as-store`): starting one ends the other.
 */
interface ViewAsState {
  customerId: string | null;
  customerLabel: string | null;
  adminUser: AuthUser | null;
  start: (customerId: string, customerLabel: string) => Promise<void>;
  stop: () => void;
}

export const useViewAsStore = create<ViewAsState>()((set, get) => ({
  customerId: null,
  customerLabel: null,
  adminUser: null,

  start: async (customerId, customerLabel) => {
    // Leave act-as first, so the staff member (not the tenant admin) is what stop() restores.
    if (selectIsActingAs(useActAsStore.getState())) useActAsStore.getState().endActAs();

    const { user: adminUser, token } = useAuthStore.getState();
    if (!adminUser || !token) return;

    setViewAsHeader(customerId);
    try {
      const { auth_me: customer } = await graphqlClient.request(AuthMeDocument);
      set({ customerId, customerLabel, adminUser });
      useAuthStore.getState().setAuth(customer as AuthUser, token);
      watchSessionEnd();
    } catch (error) {
      setViewAsHeader(null);
      throw error;
    }
  },

  stop: () => {
    const { adminUser } = get();
    const { token } = useAuthStore.getState();

    setViewAsHeader(null);
    set({ customerId: null, customerLabel: null, adminUser: null });
    if (adminUser && token) {
      useAuthStore.getState().setAuth(adminUser, token);
    }
  },
}));

export const selectIsViewingAs = (state: ViewAsState): boolean => state.customerId !== null;

let stopWatchingSession: (() => void) | null = null;

/**
 * Logging out ends view-as, so no banner or read-only state leaks into the
 * next session. Subscribed on start (never at import: auth-store and this
 * store import each other through useKYC).
 */
function watchSessionEnd(): void {
  stopWatchingSession?.();
  stopWatchingSession = useAuthStore.subscribe((state) => {
    if (state.isAuthenticated) return;
    stopWatchingSession?.();
    stopWatchingSession = null;
    useViewAsStore.setState({ customerId: null, customerLabel: null, adminUser: null });
  });
}
