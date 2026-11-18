export const SUITE_ONBOARDING_REDIRECT_PATH = '/suite/verify-identity' as const;

export const SUITE_ONBOARDING_EXEMPT_PATHS = [
  '/suite/verify-identity',
  '/suite/bridge-kyc-start',
] as const;

interface SuiteOnboardingGateInput {
  hasFailedKyc?: boolean;
  hasRejectedKyc?: boolean;
  hasAcceptedLatestTerms?: boolean | null;
  hasSubmittedApiOnboarding?: boolean | null;
  isReadyForSuite?: boolean;
  hasRetryableKyc?: boolean;
  needsManualRefresh?: boolean;
  isStaff: boolean;
  kycStatus?: string | null;
  pathname: string;
  tosAccepted?: boolean | null;
}

export function isSuiteOnboardingExemptPath(pathname: string): boolean {
  return SUITE_ONBOARDING_EXEMPT_PATHS.some((path) => (
    pathname === path || pathname.startsWith(`${path}/`)
  ));
}

export function hasSatisfiedSuiteOnboarding({
  hasFailedKyc,
  hasRejectedKyc,
  hasAcceptedLatestTerms,
  hasSubmittedApiOnboarding,
  isReadyForSuite,
  hasRetryableKyc,
  kycStatus,
  needsManualRefresh,
  tosAccepted,
}: Omit<SuiteOnboardingGateInput, 'isStaff' | 'pathname'>): boolean {
  if (hasFailedKyc || hasRejectedKyc || hasRetryableKyc || needsManualRefresh) {
    return false;
  }

  const hasAcceptedTerms = tosAccepted === true || hasAcceptedLatestTerms === true;
  const hasSubmittedIdentity = hasSubmittedApiOnboarding === true || kycStatus === 'APPROVED';

  return hasAcceptedTerms && hasSubmittedIdentity && kycStatus === 'APPROVED' && isReadyForSuite === true;
}

export function shouldGateSuiteOnboarding({
  hasFailedKyc,
  hasRejectedKyc,
  hasAcceptedLatestTerms,
  hasSubmittedApiOnboarding,
  isReadyForSuite,
  hasRetryableKyc,
  needsManualRefresh,
  isStaff,
  kycStatus,
  pathname,
  tosAccepted,
}: SuiteOnboardingGateInput): boolean {
  if (isStaff || isSuiteOnboardingExemptPath(pathname)) {
    return false;
  }

  return !hasSatisfiedSuiteOnboarding({
    hasFailedKyc,
    hasRejectedKyc,
    hasAcceptedLatestTerms,
    hasSubmittedApiOnboarding,
    isReadyForSuite,
    hasRetryableKyc,
    kycStatus,
    needsManualRefresh,
    tosAccepted,
  });
}
