let isSubmitting = false;

export function setSubmittingGuard(value: boolean): void {
  isSubmitting = value;
}

export function getIsSubmittingGuard(): boolean {
  return isSubmitting;
}

export function canSubmit(): boolean {
  return !isSubmitting;
}
