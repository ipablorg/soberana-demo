/**
 * Onboarding-outcome model for approving a rail endorsement (virtual-account
 * request). #411: the provider is the client rail's, never an ops choice.
 */

import type { MessageDescriptor } from '@lingui/core';

import type {
  AdminEndorsementOnboarding,
  AdminEndorsementOnboardingState,
} from '@/graphql/mutations/admin-loopay';

import { providerBlockerLabel, sourceText } from './provider-profile-labels';

export type OnboardingTone = 'success' | 'warning' | 'destructive' | 'secondary';

export function onboardingTone(state: AdminEndorsementOnboardingState): OnboardingTone {
  switch (state) {
    case 'ACTIVE':
      return 'success';
    case 'PROVIDER_ONBOARDING':
      return 'warning';
    case 'FAILED':
      return 'destructive';
    case 'SKIPPED':
      return 'secondary';
  }
}

/**
 * Detail line under the state headline: a known blocker code as a sentence, a
 * missing-data code by its field (the provider message may be redacted), else
 * the provider message or the code.
 */
export function onboardingDetail(
  onboarding: AdminEndorsementOnboarding,
  t: (descriptor: MessageDescriptor) => string = sourceText
): string | null {
  const code = onboarding.error_code?.trim();
  if (code) return providerBlockerLabel(code, onboarding.error_message, t);
  return onboarding.error_message?.trim() || null;
}
