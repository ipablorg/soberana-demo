/**
 * DashboardTutorial
 *
 * Orchestrator component that runs the guided tour over the real dashboard UI.
 *
 * Design — "orchestration over real UI":
 *  - Spotlights the actual DOM elements (buttons, open flow panels).
 *  - Triggers real flow open/close via `pendingAction` in the tutorial store;
 *    ConversationalHome processes the action and calls its own handlers.
 *  - Never renders parallel/mock UI components for the flows it demos.
 *
 * Each step can specify `onEnter` → when the user advances INTO that step the
 * action is pushed to pendingAction for ConversationalHome to execute.
 *
 * Auto-trigger fires at most once per user lifetime (after KYC activation).
 * Mount this component inside `conversational-home.tsx` so it only runs while
 * the dashboard is rendered.
 */

import * as React from 'react';
import { useBridgeKYC } from '@/modules/suite-user/features/account';
import { useAuth } from '@/shared/hooks/use-auth';
import { isDevMockMode } from '@/shared/lib/dev-config';
import { useTutorialStore } from '../../stores/useTutorialStore';
import { useTutorialDemoStore } from '@/shared/stores/useTutorialDemoStore';
import {
  TUTORIAL_STEPS,
  FINISH_STEP_INDEX,
  getTutorialFlag,
  setTutorialFlag,
  clearTutorialFlags,
} from './tutorial-config';
import type { SpotlightRect } from './tutorial-overlay';
import { TutorialOverlay } from './tutorial-overlay';
import { TutorialTooltip } from './tutorial-tooltip';
import { TutorialFinishScreen } from './tutorial-finish-screen';

function getTargetRect(targetAttr: string): SpotlightRect | null {
  const el = document.querySelector<HTMLElement>(
    `[data-tutorial="${targetAttr}"]`,
  );
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

export function DashboardTutorial() {
  const { user } = useAuth();
  const { kycStatus, needsKycRetry, needsManualRefresh } = useBridgeKYC();

  const isOpen = useTutorialStore((s) => s.isOpen);
  const currentStep = useTutorialStore((s) => s.currentStep);
  const open = useTutorialStore((s) => s.open);
  const close = useTutorialStore((s) => s.close);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const prevStep = useTutorialStore((s) => s.prevStep);
  const setPendingAction = useTutorialStore((s) => s.setPendingAction);
  const reset = useTutorialStore((s) => s.reset);

  const enableDemo = useTutorialDemoStore((s) => s.enable);
  const disableDemo = useTutorialDemoStore((s) => s.disable);

  const userId = user?.id ?? null;
  const hasAcceptedTerms = user?.has_accepted_latest_terms ?? false;

  // ── Auto-trigger ───────────────────────────────────────────────────
  const autoTriggeredRef = React.useRef(false);
  React.useEffect(() => {
    if (autoTriggeredRef.current) return;
    if (!userId) return;
    if (!hasAcceptedTerms) return;
    if (kycStatus === 'NOT_INITIATED') return;
    if (needsKycRetry || needsManualRefresh) return;

    const alreadySeen = getTutorialFlag('seen', userId);
    const alreadyCompleted = getTutorialFlag('completed', userId);
    const alreadySkipped = getTutorialFlag('skipped', userId);

    if (alreadySeen || alreadyCompleted || alreadySkipped) return;

    autoTriggeredRef.current = true;
    setTutorialFlag('seen', userId);
    const id = window.setTimeout(() => {
      open();
    }, 600);
    return () => window.clearTimeout(id);
  }, [userId, hasAcceptedTerms, kycStatus, needsKycRetry, needsManualRefresh, open]);

  // ── Demo mode: inject mock data while tutorial is open ────────────
  React.useEffect(() => {
    // Local demo override: dev mock mode keeps demo fixtures on permanently,
    // so the tutorial open/close lifecycle must not disable them.
    if (isDevMockMode()) return;
    if (isOpen) { enableDemo(); } else { disableDemo(); }
  }, [isOpen, enableDemo, disableDemo]);

  // ── Target rect tracking ───────────────────────────────────────────
  const [targetRect, setTargetRect] = React.useState<SpotlightRect | null>(null);

  const updateRect = React.useCallback(() => {
    if (!isOpen || currentStep >= FINISH_STEP_INDEX) {
      setTargetRect(null);
      return;
    }
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) { setTargetRect(null); return; }
    setTargetRect(getTargetRect(step.targetAttr));
  }, [isOpen, currentStep]);

  // Primary update on step/open change.
  React.useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  // Delayed re-read after each step change. Handles two cases:
  //  1. Async flow mounting — receive-flow / send-flow appear after ConversationalHome
  //     processes pendingAction in its own commit, so the element isn't in the DOM yet.
  //  2. Layout shift correction — close-flow runs a ≤200ms Framer exit animation that
  //     keeps the flow in the DOM while it shrinks, so the initial rect (captured before
  //     ConversationalHome processes pendingAction) may reflect the shifted layout.
  //     Removing the `targetRect !== null` guard ensures we always correct the rect
  //     after the animation fully settles, even when the element was already found.
  React.useEffect(() => {
    if (!isOpen || currentStep >= FINISH_STEP_INDEX) return;
    const id = window.setTimeout(updateRect, 350);
    return () => window.clearTimeout(id);
  }, [isOpen, currentStep, updateRect]);

  // Observe target element for size/position mutations.
  React.useEffect(() => {
    if (!isOpen || currentStep >= FINISH_STEP_INDEX) return;
    const step = TUTORIAL_STEPS[currentStep];
    if (!step) return;
    const el = document.querySelector<HTMLElement>(
      `[data-tutorial="${step.targetAttr}"]`,
    );
    if (!el) return;

    const obs = new ResizeObserver(() => updateRect());
    obs.observe(el);
    return () => obs.disconnect();
  }, [isOpen, currentStep, updateRect]);

  // ── Keyboard: Esc closes tutorial (treated as skip) ───────────────
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      handleSkip();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, userId]);

  // ── Navigation handlers ────────────────────────────────────────────
  const handleNext = () => {
    const newStepIndex = currentStep + 1;
    // Execute any onEnter action defined on the INCOMING step.
    const incomingStep = TUTORIAL_STEPS[newStepIndex];
    if (incomingStep?.onEnter) {
      setPendingAction(incomingStep.onEnter);
    }
    nextStep();
  };

  const handlePrev = () => {
    if (currentStep <= 0) return;
    // Re-entering a previous step: if it was a flow-open step, re-open the flow.
    const prevStepDef = TUTORIAL_STEPS[currentStep - 1];
    if (prevStepDef?.onEnter === 'open-receive' || prevStepDef?.onEnter === 'open-send') {
      setPendingAction(prevStepDef.onEnter);
    } else {
      // If going back past a flow step, close the flow.
      const currentStepDef = TUTORIAL_STEPS[currentStep];
      if (currentStepDef?.onEnter === 'open-receive' || currentStepDef?.onEnter === 'open-send') {
        setPendingAction('close-flow');
      }
    }
    prevStep();
  };

  const handleSkip = () => {
    if (userId) setTutorialFlag('skipped', userId);
    setPendingAction('close-flow');
    close();
  };

  const handleClose = () => {
    if (userId) setTutorialFlag('completed', userId);
    setPendingAction('close-flow');
    close();
  };

  const handleRepeat = () => {
    if (userId) clearTutorialFlags(userId);
    setPendingAction('close-flow');
    reset();
    window.setTimeout(() => open(), 50);
  };

  if (!isOpen) return null;

  const currentStepDef = TUTORIAL_STEPS[currentStep];

  return (
    <>
      <TutorialOverlay
        visible={isOpen && currentStep < FINISH_STEP_INDEX}
        targetRect={targetRect}
        onBackdropClick={undefined}
      />
      <TutorialTooltip
        currentStep={currentStep}
        visible={isOpen}
        targetRect={targetRect}
        tooltipSide={currentStepDef?.tooltipSide ?? 'auto'}
        onNext={handleNext}
        onPrev={handlePrev}
        onSkip={handleSkip}
      />
      <TutorialFinishScreen
        currentStep={currentStep}
        onClose={handleClose}
        onRepeat={handleRepeat}
      />
    </>
  );
}
