import { describe, expect, it } from 'vitest';

import {
  canCompleteVerifyIdentity,
  classifyPendingWorkflowRequirements,
  hasPersistedVerifyIdentityReviewProgress,
  isWorkflowOnlyNextStepState,
  shouldAutoRefreshVerifyIdentityEntry,
  shouldResumeVerifyIdentity,
} from '../use-verify-identity-state';

describe('shouldResumeVerifyIdentity', () => {
  it('resumes the review step when submitted api onboarding progress was persisted', () => {
    expect(
      shouldResumeVerifyIdentity({
        hasResumeAction: true,
        hasOutstandingRequirements: false,
        kycStatus: 'PENDING_REVIEW',
      }),
    ).toBe(true);
  });

  it('resumes initiated state only when no missing remediation inputs remain', () => {
    expect(
      shouldResumeVerifyIdentity({
        hasResumeAction: true,
        hasOutstandingRequirements: false,
        kycStatus: 'INITIATED',
      }),
    ).toBe(true);
  });

  it('does not skip to review when additional-info requirements are still outstanding', () => {
    expect(
      shouldResumeVerifyIdentity({
        hasResumeAction: true,
        hasOutstandingRequirements: true,
        kycStatus: 'ADDITIONAL_INFO_REQUIRED',
      }),
    ).toBe(false);
  });

  it('does not resume only because the lifecycle exists without a resume action', () => {
    expect(
      shouldResumeVerifyIdentity({
        hasResumeAction: false,
        hasOutstandingRequirements: false,
        kycStatus: 'NOT_INITIATED',
      }),
    ).toBe(false);
  });

  it('does not resume when no onboarding progress was detected yet', () => {
    expect(
      shouldResumeVerifyIdentity({
        hasResumeAction: false,
        hasOutstandingRequirements: false,
        kycStatus: 'PENDING_REVIEW',
      }),
    ).toBe(false);
  });
});

describe('hasPersistedVerifyIdentityReviewProgress', () => {
  it('treats pending review as persisted progress after reload', () => {
    expect(
      hasPersistedVerifyIdentityReviewProgress({
        kycStatus: 'PENDING_REVIEW',
        tosAccepted: false,
        hasSubmittedIdentityProgress: false,
      }),
    ).toBe(true);
  });

  it('does not treat accepted ToS as review progress before backend review starts', () => {
    expect(
      hasPersistedVerifyIdentityReviewProgress({
        kycStatus: 'INITIATED',
        tosAccepted: true,
        hasSubmittedIdentityProgress: true,
      }),
    ).toBe(false);
  });

  it('treats approved status plus persisted evidence as completion progress', () => {
    expect(
      hasPersistedVerifyIdentityReviewProgress({
        kycStatus: 'APPROVED',
        tosAccepted: true,
        hasSubmittedIdentityProgress: true,
      }),
    ).toBe(true);
  });

  it('does not invent progress from ToS acceptance alone when the form was never submitted', () => {
    expect(
      hasPersistedVerifyIdentityReviewProgress({
        kycStatus: 'INITIATED',
        tosAccepted: true,
        hasSubmittedIdentityProgress: false,
      }),
    ).toBe(false);
  });

  it('does not invent progress from local state alone', () => {
    expect(
      hasPersistedVerifyIdentityReviewProgress({
        kycStatus: 'INITIATED',
        tosAccepted: null,
        hasSubmittedIdentityProgress: false,
      }),
    ).toBe(false);
  });
});

describe('canCompleteVerifyIdentity', () => {
  it('blocks completion while ToS is still pending', () => {
    expect(
      canCompleteVerifyIdentity({
        submitted: true,
        requiresReviewTosAcceptance: true,
        hasPersistedReviewProgress: false,
      }),
    ).toBe(false);
  });

  it('blocks completion when there is no persisted review progress yet', () => {
    expect(
      canCompleteVerifyIdentity({
        submitted: true,
        requiresReviewTosAcceptance: false,
        hasPersistedReviewProgress: false,
      }),
    ).toBe(false);
  });

  it('allows completion only after backend-confirmed review progress exists', () => {
    expect(
      canCompleteVerifyIdentity({
        submitted: true,
        requiresReviewTosAcceptance: false,
        hasPersistedReviewProgress: true,
      }),
    ).toBe(true);
  });
});

describe('shouldAutoRefreshVerifyIdentityEntry', () => {
  it('auto-refreshes explicit stale reconcile states on page entry', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: true,
        isKYCInReview: false,
        kycStatus: 'APPROVED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: true,
      }),
    ).toBe(true);
  });

  it('auto-refreshes actionable retry or resume states', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: true,
        isKYCInReview: false,
        kycStatus: 'REJECTED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: true,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });

  it('auto-refreshes persisted review states on entry', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: true,
        isKYCInReview: true,
        kycStatus: 'PENDING_REVIEW',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });

  it('auto-refreshes canonical pending-review states even when legacy progress flags are missing', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: false,
        isKYCInReview: false,
        kycStatus: 'PENDING_REVIEW',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });

  it('auto-refreshes persisted additional-info resumes even before manual refresh is exposed', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: true,
        isKYCInReview: false,
        kycStatus: 'ADDITIONAL_INFO_REQUIRED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });

  it('allows auto-refresh while a submitted waiting state is still reconciling', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: true,
        isKYCInReview: false,
        kycStatus: 'INITIATED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });

  it('auto-refreshes canonical initiated reconcile states even without persisted submitted progress', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: false,
        isKYCInReview: false,
        kycStatus: 'INITIATED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: true,
      }),
    ).toBe(true);
  });

  it('does not auto-refresh fresh first-entry onboarding states', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        hasSubmittedIdentityProgress: false,
        isKYCInReview: false,
        kycStatus: 'NOT_INITIATED',
        customerType: 'individual',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(false);
  });

  it('auto-refreshes business hosted-link users when they come back waiting for readiness', () => {
    expect(
      shouldAutoRefreshVerifyIdentityEntry({
        customerType: 'business',
        hasSubmittedIdentityProgress: true,
        isKYCInReview: false,
        kycStatus: 'APPROVED',
        needsKycResume: false,
        needsKycRetry: false,
        needsManualRefresh: false,
      }),
    ).toBe(true);
  });
});

describe('classifyPendingWorkflowRequirements', () => {
  it('separates editable missing inputs from workflow-only review blockers', () => {
    expect(classifyPendingWorkflowRequirements({
      pendingRequirements: [
        { kind: 'field', key: 'tax_id', status: 'submitted' },
        { kind: 'document_purpose', key: 'proof_of_address', status: 'submitted' },
        { kind: 'review', key: 'bridge_review', status: 'under_review' },
      ],
    })).toEqual({
      editable: [
        { kind: 'field', key: 'tax_id' },
        { kind: 'document_purpose', key: 'proof_of_address' },
      ],
      workflow: [
        { kind: 'review', key: 'bridge_review' },
      ],
    });
  });

  it('treats external-account, ToS, and post-processing requirements as workflow-only blockers', () => {
    expect(classifyPendingWorkflowRequirements({
      pendingRequirements: [
        { kind: 'field', key: 'external_account', status: 'submitted' },
        { kind: 'field', key: 'terms_of_service_v2', status: 'submitted' },
        { kind: 'field', key: 'post_processing', status: 'submitted' },
      ],
    })).toEqual({
      editable: [],
      workflow: [
        { kind: 'field', key: 'external_account' },
        { kind: 'field', key: 'terms_of_service_v2' },
        { kind: 'field', key: 'post_processing' },
      ],
    });
  });
});

describe('isWorkflowOnlyNextStepState', () => {
  it('treats approved workflow-only blockers as next-step states, not editable retry states', () => {
    expect(isWorkflowOnlyNextStepState({
      hasWorkflowOnlyBlockers: true,
      hasOutstandingRequirements: false,
      kycStatus: 'APPROVED',
      needsTosAction: false,
    })).toBe(true);
  });

  it('treats approved pending ToS as a next-step state', () => {
    expect(isWorkflowOnlyNextStepState({
      hasWorkflowOnlyBlockers: false,
      hasOutstandingRequirements: false,
      kycStatus: 'APPROVED',
      needsTosAction: true,
    })).toBe(true);
  });

  it('does not hide genuine remediation requirements behind the next-step state', () => {
    expect(isWorkflowOnlyNextStepState({
      hasWorkflowOnlyBlockers: true,
      hasOutstandingRequirements: true,
      kycStatus: 'APPROVED',
      needsTosAction: false,
    })).toBe(false);
  });

  it('does not mark non-approved states as workflow-only next steps', () => {
    expect(isWorkflowOnlyNextStepState({
      hasWorkflowOnlyBlockers: true,
      hasOutstandingRequirements: false,
      kycStatus: 'REJECTED',
      needsTosAction: false,
    })).toBe(false);
  });
});
