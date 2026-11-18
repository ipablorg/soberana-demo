/**
 * Tutorial configuration: step definitions and localStorage persistence helpers.
 *
 * Persistence is per-user via localStorage keys that include the user ID so that
 * multiple users sharing the same browser each get their own tutorial state.
 *
 * Step design — "orchestration over real UI":
 *  - Steps that `onEnter: 'open-receive'` / `'open-send'` trigger the real flow
 *    to open in ConversationalHome. The tutorial spotlights the real mounted panel.
 *  - Steps that `onEnter: 'close-flow'` close any open flow before spotlighting
 *    the next button target.
 *  - `tooltipSide` drives coachmark placement: 'right'/'left' tries side placement
 *    first (with fallback to above/below), keeping the coachmark off the target.
 *
 * data-tutorial anchor attributes used:
 *   "receive"        GradientCircleButton Recibir
 *   "receive-flow"   motion.div wrapping <ReceiveFlow> in conversational-home
 *   "virtual-card"   motion.div wrapping <VirtualCard>
 *   "send"           GradientCircleButton Enviar
 *   "send-flow"      motion.div wrapping <SendFlow> in conversational-home
 *   "zentinel"       GradientCircleButton Zentinel
 */

import type { TutorialPendingAction } from '../../stores/useTutorialStore';

export interface TutorialStep {
  /** Unique identifier for the step. */
  id: string;
  /**
   * Value of the `data-tutorial` attribute on the target DOM element.
   * Used with `document.querySelector('[data-tutorial="..."]')`.
   */
  targetAttr: string;
  /**
   * Action to execute when the user advances INTO this step.
   * Processed by ConversationalHome via the pendingAction store value.
   */
  onEnter?: TutorialPendingAction;
  /**
   * Preferred coachmark placement relative to the spotlight target.
   * 'auto' = try right → left → above/below.
   * Default: 'auto'.
   */
  tooltipSide?: 'auto' | 'right' | 'left' | 'above' | 'below';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // 0 — Introduce Recibir button
  { id: 'receive-intro',  targetAttr: 'receive'      },
  // 1 — Real ReceiveFlow is open; spotlight the panel
  { id: 'receive-open',   targetAttr: 'receive-flow', onEnter: 'open-receive', tooltipSide: 'right' },
  // 2 — Close flow, spotlight VirtualCard
  { id: 'virtual-card',   targetAttr: 'virtual-card', onEnter: 'close-flow'  },
  // 3 — Introduce Enviar button
  { id: 'send-intro',     targetAttr: 'send'         },
  // 4 — Real SendFlow is open; spotlight the panel
  { id: 'send-open',      targetAttr: 'send-flow',    onEnter: 'open-send',  tooltipSide: 'right' },
  // 5 — Close flow, spotlight Zentinel
  { id: 'zentinel',       targetAttr: 'zentinel',     onEnter: 'close-flow', tooltipSide: 'left' },
];

/** Step index that represents the finish screen (beyond the last real step). */
export const FINISH_STEP_INDEX = TUTORIAL_STEPS.length;

// ── Persistence ───────────────────────────────────────────────────────────────

function storageKey(flag: 'seen' | 'completed' | 'skipped', userId: string): string {
  return `soberana_tutorial_${flag}_${userId}`;
}

export function getTutorialFlag(
  flag: 'seen' | 'completed' | 'skipped',
  userId: string,
): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(storageKey(flag, userId)) === 'true';
}

export function setTutorialFlag(
  flag: 'seen' | 'completed' | 'skipped',
  userId: string,
): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(flag, userId), 'true');
}

export function clearTutorialFlags(userId: string): void {
  if (typeof window === 'undefined') return;
  (['seen', 'completed', 'skipped'] as const).forEach((flag) => {
    window.localStorage.removeItem(storageKey(flag, userId));
  });
}
