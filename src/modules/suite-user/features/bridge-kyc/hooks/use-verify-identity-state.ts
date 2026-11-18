interface VerifyIdentityResumeStateInput {
  hasResumeAction: boolean;
  hasOutstandingRequirements: boolean;
  kycStatus: string;
}

interface VerifyIdentityReviewProgressInput {
  kycStatus: string;
  tosAccepted: boolean | null;
  hasSubmittedIdentityProgress: boolean;
}

interface VerifyIdentityCompletionInput {
  submitted: boolean;
  requiresReviewTosAcceptance: boolean;
  hasPersistedReviewProgress: boolean;
}

interface VerifyIdentityAutoRefreshInput {
  customerType?: 'individual' | 'business';
  hasSubmittedIdentityProgress: boolean;
  isKYCInReview: boolean;
  kycStatus: string;
  needsKycResume: boolean;
  needsKycRetry: boolean;
  needsManualRefresh: boolean;
}

interface PendingWorkflowClassificationInput {
  pendingRequirements: Array<{
    kind: string;
    key: string;
    status: string;
  }>;
}

import { isWorkflowOnlyKycRequirementKey } from '@/shared/lib/kyc/kyc-snapshot-state';

export interface PendingWorkflowRequirementItem {
  kind: string;
  key: string;
}

export interface PendingWorkflowClassification {
  editable: PendingWorkflowRequirementItem[];
  workflow: PendingWorkflowRequirementItem[];
}

interface WorkflowOnlyNextStepStateInput {
  hasWorkflowOnlyBlockers: boolean;
  hasOutstandingRequirements: boolean;
  kycStatus: string;
  needsTosAction: boolean;
}

export function shouldResumeVerifyIdentity({
  hasResumeAction,
  hasOutstandingRequirements,
  kycStatus,
}: VerifyIdentityResumeStateInput): boolean {
  if (!hasResumeAction) {
    return false;
  }

  if (hasOutstandingRequirements) {
    return false;
  }

  return (
    kycStatus === 'PENDING_REVIEW' ||
    kycStatus === 'INITIATED'
  );
}

export function hasPersistedVerifyIdentityReviewProgress({
  kycStatus,
  tosAccepted,
  hasSubmittedIdentityProgress,
}: VerifyIdentityReviewProgressInput): boolean {
  if (kycStatus === 'PENDING_REVIEW' || kycStatus === 'ADDITIONAL_INFO_REQUIRED') {
    return true;
  }

  return kycStatus === 'APPROVED' && hasSubmittedIdentityProgress && tosAccepted === true;
}

export function canCompleteVerifyIdentity({
  submitted,
  requiresReviewTosAcceptance,
  hasPersistedReviewProgress,
}: VerifyIdentityCompletionInput): boolean {
  if (!submitted) return false;
  if (requiresReviewTosAcceptance) return false;

  return hasPersistedReviewProgress;
}

export function shouldAutoRefreshVerifyIdentityEntry({
  customerType,
  hasSubmittedIdentityProgress,
  isKYCInReview,
  kycStatus,
  needsKycResume,
  needsKycRetry,
  needsManualRefresh,
}: VerifyIdentityAutoRefreshInput): boolean {
  if (customerType === 'business') {
    return needsManualRefresh || hasSubmittedIdentityProgress;
  }

  const isFreshSubmittedWaitingState =
    kycStatus === 'INITIATED' &&
    !needsKycResume &&
    !needsKycRetry &&
    !needsManualRefresh;

  if (isFreshSubmittedWaitingState) {
    return true;
  }

  if (kycStatus === 'PENDING_REVIEW') {
    return true;
  }

  if (needsManualRefresh) {
    return true;
  }

  if (needsKycResume || needsKycRetry || isKYCInReview) {
    return true;
  }

  return hasSubmittedIdentityProgress && (
    kycStatus === 'ADDITIONAL_INFO_REQUIRED' ||
    kycStatus === 'INITIATED'
  );
}

export function classifyPendingWorkflowRequirements({
  pendingRequirements,
}: PendingWorkflowClassificationInput): PendingWorkflowClassification {
  return pendingRequirements.reduce<PendingWorkflowClassification>((acc, requirement) => {
    const target = requirement.kind === 'review'
      || requirement.status === 'under_review'
      || isWorkflowOnlyKycRequirementKey(requirement.key)
      ? acc.workflow
      : acc.editable;

    target.push({ kind: requirement.kind, key: requirement.key });
    return acc;
  }, {
    editable: [],
    workflow: [],
  });
}

export function isWorkflowOnlyNextStepState({
  hasWorkflowOnlyBlockers,
  hasOutstandingRequirements,
  kycStatus,
  needsTosAction,
}: WorkflowOnlyNextStepStateInput): boolean {
  if (kycStatus !== 'APPROVED') {
    return false;
  }

  if (hasOutstandingRequirements) {
    return false;
  }

  return hasWorkflowOnlyBlockers || needsTosAction;
}
