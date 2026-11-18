/**
 * Dynamic Island Store — the single store behind the single Dynamic Island.
 *
 * Canonical home of the island state (it lives in `shared/` so wizards,
 * the dashboard and the backoffice can all drive the same island). The
 * dashboard module re-exports it from `features/dashboard/stores/`.
 *
 * v4 — wizard progress API (`setStep` / `show` / `hide`, plus the
 * `isVisible` / `currentStep` / `totalSteps` / `stepName` / `progress`
 * fields) merged in from the retired second store. It is a thin adapter over
 * `islandData` (`step-progress` state), so wizards render through the very
 * same island component as the dashboard flows.
 *
 * Dynamic Island Store (original notes)
 *
 * Manages the state and content of the Dynamic Island component
 * Similar to Apple's Dynamic Island concept.
 *
 * v2 — 2026-04-21: added `mode` + per-mode sub-state for the conversational
 * home flows. The DI now narrates which flow is open (`receive` / `send`)
 * and the current step inside that flow, so presenter components can stay
 * pure and let the DI read a single source of truth for copy.
 *
 * Guiding principle: the DI does not know *how* a flow works; it only knows
 * *what the user is doing right now* (`mode`) and *what decision they are
 * on* (`receiveStep`). Copy mapping lives in the DI component itself so the
 * store stays product-agnostic.
 *
 * Backward-compat: the legacy `islandData.state` API is untouched — twelve+
 * consumers (ReceiveFlow, SendFlow, ConvertFlow, workflow runners, etc.)
 * rely on `setIslandState('sending' | 'step-progress' | …)` and continue
 * to work. `mode` is orthogonal.
 */

import { create } from 'zustand';

export type IslandState =
  | 'idle'           // Showing balance
  | 'sending'        // Sending payment
  | 'receiving'      // Receiving payment
  | 'converting'     // Converting currency
  | 'processing'     // Generic processing
  | 'success'        // Success animation
  | 'error'          // Error state
  | 'step-progress'; // Show workflow step progress

/**
 * Top-level flow the dashboard is currently in. `idle` means no inline
 * flow is open and the DI shows the default idle message / balance.
 */
export type IslandMode = 'idle' | 'receive' | 'send' | 'history';

/**
 * Sub-step inside the `receive` flow. Drives the DI copy:
 *   - `select`   → "Tus cuentas. Elige dónde recibir." (or "Aún no tienes. Cuentas virtuales." with none)
 *   - `ready`    → "A nombre tuyo. Haz la transferencia a estos datos."
 *   - `pending`  → "En revisión. Tu cuenta estará lista pronto."
 *   - `activate` → "Un paso más. Activa esta cuenta para recibir."
 *
 * Consumers compute the step from the selected account's status (see
 * `selectCurrency`) instead of setting it directly, so status→step
 * mapping has one home.
 */
export type ReceiveStep = 'select' | 'ready' | 'pending' | 'activate';

/**
 * Sub-step inside the `send` flow. Drives DI copy and the inline
 * SendFlow orchestrator. The machine is strictly linear until `review`,
 * then branches into submit/success/error:
 *
 *   select-beneficiary → amount → review → submitting → success
 *                                             │
 *                                             └──────► error (retryable)
 *
 * `create-beneficiary` is an orthogonal sub-state that opens from
 * `select-beneficiary` and returns to `amount` after success (with the
 * new beneficiary auto-selected). Keeping it as a step in the same
 * machine — rather than a boolean — means the DI can narrate the
 * "Añade." moment without extra plumbing.
 */
export type SendStep =
  | 'select-beneficiary'
  | 'create-beneficiary'
  | 'amount'
  | 'review'
  | 'submitting'
  | 'success'
  | 'error';

/**
 * Account status values that drive `receiveStep`. Aligned with the
 * `BridgeVirtualAccount.status` strings emitted by the backend (see
 * `src/graphql/queries/bridge/get-virtual-accounts.ts`): lowercase
 * `"active" | "pending" | "not_requested"` plus a defensive fallback.
 */
export type AccountStatus = 'active' | 'pending' | 'not_requested' | string;

export interface IslandData {
  state: IslandState;
  balance?: number;
  amount?: number;
  currency?: string;
  recipient?: string;
  sender?: string;
  fromCurrency?: string;
  toCurrency?: string;
  message?: string;
  progress?: number; // 0-100 for progress animations
  stepName?: string; // Current step name for workflow progress
  stepNumber?: number; // Current step number
  totalSteps?: number; // Total steps in workflow
}

interface DynamicIslandStore {
  islandData: IslandData;
  isExpanded: boolean;
  // ── v2: flow mode ────────────────────────────────────────────────
  mode: IslandMode;
  receiveStep: ReceiveStep;
  selectedCurrency: string | null;
  selectedReceiveAccountId: string | null;
  /**
   * Payment-rail code of the currently selected receive account.
   * Used as a selection fallback: when the accounts array recomputes
   * with new ids (e.g. after activating a rail), an exact id match may
   * miss, so we fall back to matching by rail code instead of by
   * currency (which could collide across rails sharing a currency).
   */
  selectedRail: string | null;
  /**
   * How many virtual accounts the receive picker is showing. `null` while
   * unknown (loading). Lets the island narrate the real state instead of
   * always prompting "choose a currency".
   */
  receiveAccountCount: number | null;
  setReceiveAccountCount: (count: number | null) => void;
  // ── v3: send flow sub-state ──────────────────────────────────────
  // Mirrors the receive flow shape (step + selection) so the DI
  // narrates the send journey the same way it narrates receive.
  // `sendAmount` is stored as a string on purpose — USDC amounts
  // flow straight from `<input>` into the quote/off-ramp payload
  // without a float round-trip, so "1.234567" survives verbatim.
  sendStep: SendStep;
  selectedBeneficiaryId: string | null;
  /**
   * Settlement currency of the currently selected beneficiary. Kept on
   * the store (instead of deriving via another hook inside the DI)
   * so the Dynamic Island can narrate "Cuánto en MXN." without pulling
   * the beneficiaries query into a purely presentational component.
   */
  sendTargetCurrency: string | null;
  sendAmount: string;
  /**
   * When set, the beneficiary selector shows only beneficiaries matching
   * this currency. Set by the VirtualCard's quick-cashout arrow buttons;
   * cleared when the user taps "Ver todos" or the mode resets.
   */
  sendFilterCurrency: string | null;
  // ── v4: wizard progress (adapter over `islandData`) ──────────────
  /** True while a wizard step is being narrated (`step-progress`). */
  isVisible: boolean;
  /** Zero-based current wizard step. */
  currentStep: number;
  totalSteps: number;
  stepName: string;
  /** 0-100, derived from `currentStep` / `totalSteps`. */
  progress: number;
  /**
   * Narrate wizard progress. `step` is zero-based. Equivalent to
   * `setIslandState('step-progress', …)` with the derived percentage.
   */
  setStep: (step: number, totalSteps: number, stepName: string) => void;
  /** Stop narrating wizard progress and fall back to the idle island. */
  hide: () => void;
  /** Resume narrating the last wizard step. */
  show: () => void;
  setMode: (mode: IslandMode) => void;
  /**
   * Select a currency in the receive flow. Maps the account `status` to
   * the correct `receiveStep` so consumers never hand-wire the mapping.
   * `rail` is the payment-rail code of the selected account; it is kept
   * as a selection fallback so activation does not jump the selection
   * to another rail sharing the same currency.
   */
  selectCurrency: (
    accountId: string,
    currency: string,
    status: AccountStatus,
    rail: string,
  ) => void;
  /**
   * Drop the current currency selection and return the receive flow
   * to its "select" step. Used by the "Otra moneda" back control —
   * we can't repurpose `setMode('receive')` for this because the
   * store only clears selection when the mode actually changes.
   */
  clearCurrencySelection: () => void;
  /**
   * Advance (or rewind) the send flow step. Consumers call this from
   * the SendFlow orchestrator; the mapping between step and copy
   * lives in `dynamic-island.tsx`, not here.
   */
  setSendStep: (step: SendStep) => void;
  /**
   * Select a beneficiary. Always moves the flow to the `amount` step
   * so the UI reads as a single decisive transition — the DI copy
   * swap + panel phase change happen atomically. `currency` is the
   * beneficiary's settlement currency; used by the DI to enrich the
   * "Cuánto." copy with the target currency.
   */
  selectBeneficiary: (id: string, currency?: string | null) => void;
  setSendAmount: (amount: string) => void;
  /**
   * Drop the current beneficiary + amount selection and return the
   * send flow to its `select-beneficiary` step. Counterpart of
   * `clearCurrencySelection` for the send journey.
   */
  clearSendSelection: () => void;
  setSendFilterCurrency: (currency: string | null) => void;
  openSendWithFilter: (currency: string) => void;
  // ── Legacy API (unchanged) ───────────────────────────────────────
  setIslandState: (state: IslandState, data?: Partial<IslandData>) => void;
  setBalance: (balance: number) => void;
  setExpanded: (expanded: boolean) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  reset: () => void;
}

const DEFAULT_DATA: IslandData = {
  state: 'idle',
  balance: 0,
  progress: 0,
};

/**
 * Map account status → receive step. Centralized so UI code stays
 * declarative: components call `selectCurrency(accountId, code, status)` and the
 * store handles the mapping.
 */
const stepFromStatus = (status: AccountStatus): ReceiveStep => {
  switch (status) {
    case 'active':
      return 'ready';
    case 'pending':
      return 'pending';
    case 'not_requested':
      return 'activate';
    default:
      // Unknown status → behave as "in review" rather than breaking UX.
      return 'pending';
  }
};

export const useDynamicIslandStore = create<DynamicIslandStore>((set) => ({
  islandData: DEFAULT_DATA,
  isExpanded: false,
  mode: 'idle',
  receiveStep: 'select',
  selectedCurrency: null,
  selectedReceiveAccountId: null,
  selectedRail: null,
  receiveAccountCount: null,
  setReceiveAccountCount: (count) => set({ receiveAccountCount: count }),
  sendStep: 'select-beneficiary',
  selectedBeneficiaryId: null,
  sendTargetCurrency: null,
  sendAmount: '',
  sendFilterCurrency: null,
  isVisible: false,
  currentStep: 0,
  totalSteps: 4,
  stepName: '',
  progress: 0,

  setStep: (step, totalSteps, stepName) => {
    const progress = Math.round(((step + 1) / totalSteps) * 100);
    set((prev) => ({
      isVisible: true,
      currentStep: step,
      totalSteps,
      stepName,
      progress,
      islandData: {
        ...prev.islandData,
        state: 'step-progress',
        stepName,
        stepNumber: step + 1,
        totalSteps,
        progress,
      },
    }));
  },

  hide: () =>
    set((prev) => ({
      isVisible: false,
      islandData:
        prev.islandData.state === 'step-progress'
          ? { ...prev.islandData, state: 'idle' }
          : prev.islandData,
    })),

  show: () =>
    set((prev) => ({
      isVisible: true,
      islandData: {
        ...prev.islandData,
        state: 'step-progress',
        stepName: prev.stepName,
        stepNumber: prev.currentStep + 1,
        totalSteps: prev.totalSteps,
        progress: prev.progress,
      },
    })),

  setMode: (mode) =>
    set((prev) => {
      // Leaving a flow (or switching flows) resets *every* sub-state so
      // re-entering starts clean. We reset both receive and send
      // sub-state unconditionally: the alternative (only reset the
      // flow you're leaving) leaks stale selections across flows when
      // the user bounces Receive → Send → Receive.
      if (mode === 'idle' || mode !== prev.mode) {
        return {
          mode,
          receiveStep: 'select',
          selectedCurrency: null,
          selectedReceiveAccountId: null,
          selectedRail: null,
          receiveAccountCount: null,
          sendStep: 'select-beneficiary',
          selectedBeneficiaryId: null,
          sendTargetCurrency: null,
          sendAmount: '',
          sendFilterCurrency: null,
        };
      }
      return { mode };
    }),

  selectCurrency: (accountId, currency, status, rail) =>
    set({
      selectedReceiveAccountId: accountId,
      selectedCurrency: currency,
      selectedRail: rail,
      receiveStep: stepFromStatus(status),
    }),

  clearCurrencySelection: () =>
    set({
      selectedCurrency: null,
      selectedReceiveAccountId: null,
      selectedRail: null,
      receiveStep: 'select',
    }),

  setSendStep: (step) => set({ sendStep: step }),

  selectBeneficiary: (id, currency) =>
    set({
      selectedBeneficiaryId: id,
      sendTargetCurrency: currency ?? null,
      sendStep: 'amount',
    }),

  setSendAmount: (amount) => set({ sendAmount: amount }),

  clearSendSelection: () =>
    set({
      selectedBeneficiaryId: null,
      sendTargetCurrency: null,
      sendAmount: '',
      sendStep: 'select-beneficiary',
      sendFilterCurrency: null,
    }),

  setSendFilterCurrency: (currency) => set({ sendFilterCurrency: currency }),

  openSendWithFilter: (currency) =>
    set({
      mode: 'send',
      receiveStep: 'select',
      selectedCurrency: null,
      selectedReceiveAccountId: null,
      selectedRail: null,
      sendStep: 'select-beneficiary',
      selectedBeneficiaryId: null,
      sendTargetCurrency: null,
      sendAmount: '',
      sendFilterCurrency: currency,
    }),

  setIslandState: (state, data) => set((prev) => ({
    islandData: {
      ...prev.islandData,
      state,
      ...data,
    },
  })),

  setBalance: (balance) => set((prev) => ({
    islandData: {
      ...prev.islandData,
      balance,
    },
  })),

  setExpanded: (expanded) => set({ isExpanded: expanded }),

  showSuccess: (message) => {
    set((prev) => ({
      islandData: {
        ...prev.islandData,
        state: 'success',
        message,
      },
    }));
    // Auto-reset after 3 seconds
    setTimeout(() => {
      set((prev) => ({
        islandData: {
          ...prev.islandData,
          state: 'idle',
          message: undefined,
        },
      }));
    }, 3000);
  },

  showError: (message) => {
    set((prev) => ({
      islandData: {
        ...prev.islandData,
        state: 'error',
        message,
      },
    }));
    // Auto-reset after 3 seconds
    setTimeout(() => {
      set((prev) => ({
        islandData: {
          ...prev.islandData,
          state: 'idle',
          message: undefined,
        },
      }));
    }, 3000);
  },

  reset: () => set({
    islandData: DEFAULT_DATA,
    isExpanded: false,
    mode: 'idle',
    receiveStep: 'select',
    selectedCurrency: null,
    selectedReceiveAccountId: null,
    selectedRail: null,
    receiveAccountCount: null,
    sendStep: 'select-beneficiary',
    selectedBeneficiaryId: null,
    sendTargetCurrency: null,
    sendAmount: '',
    sendFilterCurrency: null,
    isVisible: false,
    currentStep: 0,
    totalSteps: 4,
    stepName: '',
    progress: 0,
  }),
}));

