/**
 * va-request-lifecycle
 *
 * Pure decision model for the virtual-account request lifecycle a
 * customer sees after asking for a rail (money-flow v2):
 *
 *   solicitud → revisión de operaciones → onboarding → activa
 *
 * The backend owns the truth: the endorsement `status` (ops review
 * outcome), `readiness` (can the rail serve receives today) and
 * `artifact_type` (what backs it). This module maps that trio — plus
 * whether deposit instructions already returned an active virtual
 * account — onto the customer-facing phase. Blockers (rejected,
 * frozen, additional info, unavailable) surface with their reason so
 * the UI can tell the user what is actually in the way.
 */

export type VaRequestPhase =
  | 'not_requested'
  | 'ops_review'
  | 'onboarding'
  | 'active'
  | 'blocked';

export type VaBlockerReason = 'additional_info' | 'rejected' | 'frozen' | 'unavailable';

export interface VaRequestLifecycleInput {
  /** Endorsement status: not_initiated | pending | additional_info | approved | rejected | frozen | … */
  status?: string | null;
  /** Backend readiness: ready | waiting | unavailable. */
  readiness?: string | null;
  /** Artifact backing the rail: virtual_account | payment_link | none. */
  artifactType?: string | null;
  /** True when deposit instructions already returned an active virtual account. */
  hasActiveDeposit: boolean;
}

export interface VaRequestLifecycle {
  phase: VaRequestPhase;
  /** 0-based index into the 4 customer-facing steps. */
  stepIndex: number;
  /** Present only while phase === 'blocked'. */
  blocker?: VaBlockerReason;
}

/** Customer-facing steps, in order. */
export const VA_REQUEST_STEPS = [
  'request',
  'ops_review',
  'onboarding',
  'active',
] as const;

export type VaRequestStep = (typeof VA_REQUEST_STEPS)[number];

const STEP_INDEX: Record<VaRequestPhase, number> = {
  not_requested: 0,
  ops_review: 1,
  onboarding: 2,
  active: 3,
  blocked: 1,
};

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

export function resolveVaRequestLifecycle(
  input: VaRequestLifecycleInput,
): VaRequestLifecycle {
  const status = normalize(input.status);
  const readiness = normalize(input.readiness);
  const artifactType = normalize(input.artifactType);

  // A live virtual account is the strongest signal — the rail is
  // serving receives with real bank details.
  if (input.hasActiveDeposit) {
    return { phase: 'active', stepIndex: STEP_INDEX.active };
  }

  if (status === 'rejected') {
    return { phase: 'blocked', stepIndex: STEP_INDEX.blocked, blocker: 'rejected' };
  }

  if (status === 'frozen') {
    return { phase: 'blocked', stepIndex: STEP_INDEX.blocked, blocker: 'frozen' };
  }

  if (status === 'additional_info') {
    return {
      phase: 'blocked',
      stepIndex: STEP_INDEX.blocked,
      blocker: 'additional_info',
    };
  }

  if (status === 'not_initiated' || status === '') {
    return { phase: 'not_requested', stepIndex: STEP_INDEX.not_requested };
  }

  const isApproved = status === 'approved' || status === 'active';

  if (isApproved) {
    // Ops approved. The rail is customer-usable only when the backend
    // says an artifact actually backs it.
    if (readiness === 'unavailable') {
      return {
        phase: 'blocked',
        stepIndex: STEP_INDEX.blocked,
        blocker: 'unavailable',
      };
    }

    if (readiness === 'ready' && artifactType === 'virtual_account') {
      return { phase: 'active', stepIndex: STEP_INDEX.active };
    }

    return { phase: 'onboarding', stepIndex: STEP_INDEX.onboarding };
  }

  // pending and any unknown in-flight status → operations review.
  return { phase: 'ops_review', stepIndex: STEP_INDEX.ops_review };
}
