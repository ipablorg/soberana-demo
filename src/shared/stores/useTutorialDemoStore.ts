/**
 * useTutorialDemoStore
 *
 * Minimal shared store that signals "tutorial demo mode is active".
 *
 * Lives in src/shared/ so that shared hooks (useWallets, useWalletBalance,
 * useDepositInstructions, useQuoteRate, useRails) can import it without
 * crossing module boundaries. The tutorial orchestrator in suite-user imports
 * it too to enable/disable the mode as the tutorial opens and closes.
 *
 * When isDemoMode is true, shared hooks return realistic mock data instead of
 * firing real API calls. This ensures the tutorial is meaningful even when
 * KYC is pending and the user has no wallets, accounts, or balances yet.
 */

import { create } from 'zustand';
import { isDevMockMode } from '@/shared/lib/dev-config';

interface TutorialDemoState {
  isDemoMode: boolean;
  enable: () => void;
  disable: () => void;
}

export const useTutorialDemoStore = create<TutorialDemoState>((set) => ({
  // Local demo override: dev mock mode implies demo fixtures everywhere.
  isDemoMode: isDevMockMode(),
  enable: () => set({ isDemoMode: true }),
  disable: () => set({ isDemoMode: false }),
}));
