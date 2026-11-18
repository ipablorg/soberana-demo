/**
 * Post-login transition store.
 *
 * Tracks whether the welcome animation has already played in the current
 * browser session so we never show it twice in a row when the user
 * navigates between protected routes (dashboard ↔ cards ↔ etc.).
 *
 * Persisted to `sessionStorage` (NOT `localStorage`) on purpose: we want
 * the splash to play again the next time the user signs in, but not on
 * every internal navigation within the same session.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PostLoginTransitionStore {
  /** True after the splash has played once in this browser session. */
  hasPlayed: boolean;
  /** Mark the splash as played for the rest of this session. */
  markPlayed: () => void;
  /** Reset the played flag — call from `clearAuth` so the next login replays. */
  reset: () => void;
}

export const usePostLoginTransitionStore = create<PostLoginTransitionStore>()(
  persist(
    (set) => ({
      hasPlayed: false,
      markPlayed: () => set({ hasPlayed: true }),
      reset: () => set({ hasPlayed: false }),
    }),
    {
      name: 'loopay-post-login-transition',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
