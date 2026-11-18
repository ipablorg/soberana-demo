import { describe, expect, it } from 'vitest';

import {
  getReviewState,
  isBeneficiarySelectable,
  type ReviewableBeneficiary,
} from '../beneficiary-review';

const base: ReviewableBeneficiary = { review_status: 'APPROVED', verification_status: 'VERIFIED' };

describe('beneficiary review state', () => {
  it('reads review_status first', () => {
    expect(getReviewState({ ...base, review_status: 'IN_REVIEW' }).kind).toBe('in_review');
    expect(getReviewState({ ...base, review_status: 'APPROVED' }).kind).toBe('approved');
    expect(getReviewState({ ...base, review_status: 'REJECTED' }).kind).toBe('rejected');
  });

  it('falls back to the legacy verification_status when the back sends no review_status', () => {
    expect(getReviewState({ verification_status: 'VERIFIED' }).kind).toBe('approved');
    expect(getReviewState({ verification_status: 'PENDING' }).kind).toBe('in_review');
    expect(getReviewState({ verification_status: 'REJECTED' }).kind).toBe('rejected');
  });

  it('treats an UNVERIFIED (deactivated by ops) beneficiary as not approved', () => {
    expect(getReviewState({ verification_status: 'UNVERIFIED' }).kind).toBe('rejected');
  });

  it('carries the rejection reason', () => {
    const state = getReviewState({ ...base, review_status: 'REJECTED', review_reason: 'Invalid routing' });
    expect(state.reason).toBe('Invalid routing');
  });

  it('never invents a reason for an approved beneficiary', () => {
    expect(getReviewState({ ...base, review_reason: 'stale' }).reason).toBeNull();
  });

  it('is conservative with unknown values: not approved', () => {
    expect(getReviewState({ review_status: 'SOMETHING_NEW' }).kind).toBe('in_review');
    expect(getReviewState({}).kind).toBe('in_review');
  });
});

describe('beneficiary selection gate (send flow)', () => {
  it('allows only APPROVED beneficiaries', () => {
    expect(isBeneficiarySelectable({ ...base, review_status: 'APPROVED' })).toBe(true);
    expect(isBeneficiarySelectable({ ...base, review_status: 'IN_REVIEW' })).toBe(false);
    expect(isBeneficiarySelectable({ ...base, review_status: 'REJECTED' })).toBe(false);
  });

  it('blocks a legacy PENDING row too', () => {
    expect(isBeneficiarySelectable({ verification_status: 'PENDING' })).toBe(false);
    expect(isBeneficiarySelectable({ verification_status: 'VERIFIED' })).toBe(true);
  });
});
