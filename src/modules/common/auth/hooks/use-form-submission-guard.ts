/**
 * Form submission guard hook.
 *
 * Prevents duplicate form submissions by tracking submission state and
 * optionally integrating with deduplication caches.
 *
 * Use this hook to guard forms that:
 * - Make network requests
 * - Have side effects
 * - Should not be submitted multiple times in rapid succession
 */

import { useCallback, useRef, useState } from 'react';

export interface FormSubmissionGuardOptions {
  /**
   * Optional deduplication check function.
   * If provided, the guard will call this before allowing submission.
   * Return true to block submission, false to allow.
   */
  shouldBlockSubmission?: () => boolean | Promise<boolean>;

  /**
   * Optional callback when submission is blocked.
   * Useful for logging or user feedback.
   */
  onBlocked?: () => void;

  /**
   * Optional cooldown period in milliseconds.
   * If provided, submissions are blocked for this duration after completion.
   */
  cooldownMs?: number;
}

export interface FormSubmissionGuardResult {
  /**
   * Whether a submission is currently in progress.
   */
  isSubmitting: boolean;

  /**
   * Guard a submission handler with deduplication logic.
   * Wraps the provided handler to prevent duplicate submissions.
   *
   * @param handler - The async function to execute
   * @returns A wrapped function that can only be called once at a time
   */
  guardSubmission: <T>(handler: () => Promise<T>) => Promise<T>;

  /**
   * Manually reset the submission state.
   * Use this if you need to clear the guard state externally.
   */
  reset: () => void;
}

/**
 * Hook to guard form submissions against duplicates.
 *
 * @param options - Configuration options for the guard
 * @returns Object containing guard state and methods
 *
 * @example
 * ```tsx
 * const { guardSubmission, isSubmitting } = useFormSubmissionGuard({
 *   shouldBlockSubmission: () => isRecentlySynced(email),
 *   cooldownMs: 5000,
 * });
 *
 * const handleSubmit = async () => {
 *   await guardSubmission(async () => {
 *     await submitForm(data);
 *   });
 * };
 * ```
 */
export function useFormSubmissionGuard(
  options: FormSubmissionGuardOptions = {}
): FormSubmissionGuardResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmitTime = useRef<number>(0);
  const {
    shouldBlockSubmission,
    onBlocked,
    cooldownMs = 0,
  } = options;

  const reset = useCallback(() => {
    setIsSubmitting(false);
    lastSubmitTime.current = 0;
  }, []);

  const guardSubmission = useCallback(
    async <T>(handler: () => Promise<T>): Promise<T> => {
      // Prevent submission if already in progress
      if (isSubmitting) {
        return Promise.reject(new Error('Submission already in progress'));
      }

      // Check cooldown period
      if (cooldownMs > 0) {
        const now = Date.now();
        const timeSinceLastSubmit = now - lastSubmitTime.current;
        if (timeSinceLastSubmit < cooldownMs) {
          onBlocked?.();
          return Promise.reject(
            new Error(`Submission blocked: cooldown period (${cooldownMs}ms) not elapsed`)
          );
        }
      }

      // Check custom deduplication logic
      if (shouldBlockSubmission) {
        const shouldBlock = await shouldBlockSubmission();
        if (shouldBlock) {
          onBlocked?.();
          return Promise.reject(
            new Error('Submission blocked: deduplication check failed')
          );
        }
      }

      setIsSubmitting(true);
      lastSubmitTime.current = Date.now();

      try {
        const result = await handler();
        return result;
      } finally {
        // Don't reset isSubmitting immediately if cooldown is active
        // The cooldown check will handle preventing rapid resubmissions
        if (cooldownMs === 0) {
          setIsSubmitting(false);
        } else {
          // Reset after cooldown period
          setTimeout(() => {
            setIsSubmitting(false);
          }, cooldownMs);
        }
      }
    },
    [isSubmitting, shouldBlockSubmission, onBlocked, cooldownMs]
  );

  return {
    isSubmitting,
    guardSubmission,
    reset,
  };
}