/**
 * Zentinel chat store — the source of truth for the *real* (backend-
 * powered) assistant conversation rendered inside the dashboard phone
 * frame.
 *
 * Why a dedicated store (separate from `useSovyStore`):
 * - `useSovyStore` still backs the hardcoded mock responder used by
 *   `useSovyMock` (the `VITE_ZENTINEL_USE_MOCK=true` escape hatch).
 *   If we shared a store, the real-engine and mock-engine messages
 *   would interleave inside the same transcript — breaking R4 of
 *   the brief (never mix the two outputs).
 * - This store tracks three concerns the legacy store doesn't need:
 *   `session_id` from the backend (so the agent keeps context across
 *   messages), `pending_action` (for the plan→confirm card), and
 *   `rate_limit` (to gate the composer).
 *
 * Persistence: none. Reloading the tab starts a fresh conversation.
 * The Zentinel JWT is restored from sessionStorage by `useZentinelAuth`
 * but the transcript itself is intentionally ephemeral — a confirmed
 * plan already lives in Soberana, the chat is a UI concern.
 */

import { create } from 'zustand';
import {
  configureZentinelClient,
  type PendingAction,
  type RateLimitInfo,
  type SecurityBlock,
} from '@/shared/lib/zentinel-client';

export type ZentinelChatMessageRole = 'user' | 'assistant' | 'system';

export type ZentinelChatMessageStatus =
  | 'sending'
  | 'streaming'
  | 'sent'
  /**
   * Charlie guardrail intercepted this turn. The bubble must render
   * the {@link SecurityBlock} card instead of `content` Markdown, and
   * MUST NOT be treated as a confirmable plan or a normal assistant
   * answer (per FRONTEND_PRODUCTION_CONNECTION.md §4 the agent's
   * `response` field is a duplicate of `securityBlock.message` and we
   * deliberately ignore it).
   */
  | 'security_blocked'
  | 'error';

export interface ZentinelChatMessage {
  id: string;
  role: ZentinelChatMessageRole;
  content: string;
  timestamp: Date;
  status: ZentinelChatMessageStatus;
  /** Populated on assistant messages once the `done` frame arrives. */
  tools_used?: string[];
  /**
   * When this assistant message carried a plan, we snapshot the
   * {@link PendingAction} alongside. Once the user confirms or cancels,
   * the UI renders a follow-up "executed"/"cancelled" bubble — the
   * original pending message keeps its pending_action so the scroll-up
   * history shows what the user was asked to confirm.
   */
  pending_action?: PendingAction;
  /** After a plan resolves, we tag it on the pending message. */
  plan_resolution?: 'executed' | 'cancelled' | 'expired';
  /**
   * Charlie incident attached to this assistant turn. When set, the
   * renderer swaps the Markdown bubble for `<ZentinelSecurityCard>`
   * (FRONTEND_PRODUCTION_CONNECTION.md §4 + Check 5: incidentId must
   * be visible to the user for support escalation).
   */
  security_block?: SecurityBlock;
  /** Free-form error string for failed assistant turns. */
  error_message?: string;
}

interface ZentinelChatState {
  messages: ZentinelChatMessage[];
  session_id: string | null;
  pending_action: PendingAction | null;
  /** Id of the assistant message that currently owns `pending_action`. */
  pending_message_id: string | null;
  rate_limit: RateLimitInfo | null;

  add_message: (msg: ZentinelChatMessage) => void;
  replace_message: (
    id: string,
    patch: Partial<ZentinelChatMessage>,
  ) => void;
  remove_message: (id: string) => void;

  set_session_id: (id: string) => void;
  set_pending_action: (
    action: PendingAction | null,
    message_id: string | null,
  ) => void;
  clear_pending_action: () => void;

  set_rate_limit: (info: RateLimitInfo | null) => void;
  reset: () => void;
}

// Wire the singleton client's rate-limit callback into this store at
// module evaluation time. The client filters out no-header responses
// itself; we still guard against stacking by only registering once.
// Living here (instead of in `src/shared/providers/`) keeps the shared
// layer free of module-level imports, satisfying the unidirectional
// import boundary (`shared → modules → app`).
let rate_limit_wired = false;
function wire_rate_limit_once(): void {
  if (rate_limit_wired) return;
  rate_limit_wired = true;
  configureZentinelClient({
    on_rate_limit: (info) => {
      if (
        info.limit == null &&
        info.remaining == null &&
        info.retry_after == null
      ) {
        return;
      }
      useZentinelChatStore.getState().set_rate_limit(info);
    },
  });
}

export const useZentinelChatStore = create<ZentinelChatState>((set) => ({
  messages: [],
  session_id: null,
  pending_action: null,
  pending_message_id: null,
  rate_limit: null,

  add_message: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  replace_message: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    })),

  remove_message: (id) =>
    set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),

  set_session_id: (id) => set({ session_id: id }),

  set_pending_action: (action, message_id) =>
    set({ pending_action: action, pending_message_id: message_id }),

  clear_pending_action: () =>
    set({ pending_action: null, pending_message_id: null }),

  set_rate_limit: (info) => set({ rate_limit: info }),

  reset: () =>
    set({
      messages: [],
      session_id: null,
      pending_action: null,
      pending_message_id: null,
      rate_limit: null,
    }),
}));

wire_rate_limit_once();
