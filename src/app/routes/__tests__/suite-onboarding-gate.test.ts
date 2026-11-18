import { describe, expect, it } from 'vitest';
import {
  hasSatisfiedSuiteOnboarding,
  isSuiteOnboardingExemptPath,
  shouldGateSuiteOnboarding,
} from '../suite-onboarding-gate';
import { computeIsReadyForSuite } from '@/shared/hooks/useKYC';

describe('suite-onboarding-gate', () => {
  it('gates non-staff users who still need onboarding before dashboard access', () => {
    expect(shouldGateSuiteOnboarding({
      pathname: '/suite/dashboard',
      hasFailedKyc: false,
      hasRejectedKyc: false,
      isStaff: false,
      hasRetryableKyc: false,
      isReadyForSuite: false,
      kycStatus: 'NOT_INITIATED',
      needsManualRefresh: false,
      tosAccepted: false,
      hasAcceptedLatestTerms: false,
      hasSubmittedApiOnboarding: false,
    })).toBe(true);
  });

  it('does not gate exempt onboarding routes', () => {
    expect(isSuiteOnboardingExemptPath('/suite/verify-identity')).toBe(true);
    expect(shouldGateSuiteOnboarding({
      pathname: '/suite/verify-identity',
      hasFailedKyc: false,
      hasRejectedKyc: false,
      isStaff: false,
      hasRetryableKyc: false,
      isReadyForSuite: false,
      kycStatus: 'NOT_INITIATED',
      needsManualRefresh: false,
      tosAccepted: false,
      hasAcceptedLatestTerms: false,
      hasSubmittedApiOnboarding: false,
    })).toBe(false);
  });

  it('lets staff bypass the onboarding gate', () => {
    expect(shouldGateSuiteOnboarding({
      pathname: '/suite/dashboard',
      hasFailedKyc: false,
      hasRejectedKyc: false,
      isStaff: true,
      hasRetryableKyc: false,
      isReadyForSuite: false,
      kycStatus: 'NOT_INITIATED',
      needsManualRefresh: false,
      tosAccepted: false,
      hasAcceptedLatestTerms: false,
      hasSubmittedApiOnboarding: false,
    })).toBe(false);
  });

  it('recognizes approved users with accepted terms as suite-ready', () => {
    expect(hasSatisfiedSuiteOnboarding({
      hasFailedKyc: false,
      hasRejectedKyc: false,
      kycStatus: 'APPROVED',
      hasRetryableKyc: false,
      needsManualRefresh: false,
      isReadyForSuite: true,
      tosAccepted: true,
      hasAcceptedLatestTerms: true,
      hasSubmittedApiOnboarding: true,
    })).toBe(true);
  });

  it('keeps users gated when the snapshot says they must retry or refresh', () => {
    expect(hasSatisfiedSuiteOnboarding({
      hasFailedKyc: false,
      hasRejectedKyc: false,
      kycStatus: 'APPROVED',
      hasRetryableKyc: true,
      needsManualRefresh: true,
      isReadyForSuite: false,
      tosAccepted: true,
      hasAcceptedLatestTerms: true,
      hasSubmittedApiOnboarding: true,
    })).toBe(false);
  });

  it('keeps rejected users gated to verify-identity even without retryable corrections', () => {
    expect(hasSatisfiedSuiteOnboarding({
      hasFailedKyc: false,
      hasRejectedKyc: true,
      kycStatus: 'REJECTED',
      hasRetryableKyc: false,
      needsManualRefresh: false,
      isReadyForSuite: false,
      tosAccepted: true,
      hasAcceptedLatestTerms: true,
      hasSubmittedApiOnboarding: true,
    })).toBe(false);

    expect(shouldGateSuiteOnboarding({
      pathname: '/suite/dashboard',
      hasFailedKyc: false,
      hasRejectedKyc: true,
      isStaff: false,
      hasRetryableKyc: false,
      isReadyForSuite: false,
      kycStatus: 'REJECTED',
      needsManualRefresh: false,
      tosAccepted: true,
      hasAcceptedLatestTerms: true,
      hasSubmittedApiOnboarding: true,
    })).toBe(true);
  });
});

describe('suite-onboarding-gate — readiness from customer status and wallet', () => {
  const gateFor = (customerStatus: string, walletExists: boolean) => shouldGateSuiteOnboarding({
    pathname: '/suite/dashboard',
    hasFailedKyc: false,
    hasRejectedKyc: false,
    isStaff: false,
    hasRetryableKyc: false,
    isReadyForSuite: computeIsReadyForSuite({ kycStatus: 'APPROVED', customerStatus, walletExists }),
    kycStatus: 'APPROVED',
    needsManualRefresh: false,
    tosAccepted: true,
    hasAcceptedLatestTerms: true,
    hasSubmittedApiOnboarding: true,
  });

  it('gates a SUSPENDED customer even with approved KYC and a wallet', () => {
    expect(gateFor('SUSPENDED', true)).toBe(true);
  });

  it('gates an ACTIVE approved customer whose wallet is not provisioned yet', () => {
    expect(gateFor('ACTIVE', false)).toBe(true);
  });

  it('lets an ACTIVE approved customer with a wallet into the suite', () => {
    expect(gateFor('ACTIVE', true)).toBe(false);
  });
});
