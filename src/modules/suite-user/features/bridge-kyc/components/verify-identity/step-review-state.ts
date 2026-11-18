interface StepReviewStateInput {
  submitted: boolean;
  tosLink: string | null;
  isResumeState: boolean;
  requiresTosAction: boolean;
  hasUnsupportedProviderFallback: boolean;
}

export type StepReviewState =
  | { kind: 'editing' }
  | { kind: 'terms'; tosLink: string; resume: boolean }
  | { kind: 'terms-recovery'; resume: boolean }
  | { kind: 'submitted' }
  | { kind: 'unsupported-provider' };

export function getStepReviewState({
  submitted,
  tosLink,
  isResumeState,
  requiresTosAction,
  hasUnsupportedProviderFallback,
}: StepReviewStateInput): StepReviewState {
  if (hasUnsupportedProviderFallback) {
    return { kind: 'unsupported-provider' };
  }

  if (!submitted) {
    return { kind: 'editing' };
  }

  if (tosLink) {
    return {
      kind: 'terms',
      tosLink,
      resume: isResumeState,
    };
  }

  if (requiresTosAction) {
    return {
      kind: 'terms-recovery',
      resume: isResumeState,
    };
  }

  return { kind: 'submitted' };
}
