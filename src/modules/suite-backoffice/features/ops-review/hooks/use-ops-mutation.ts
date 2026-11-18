/**
 * Shared mutation plumbing for the admin-loopay manual operations queues.
 *
 * Re-authentication is NOT handled here: `graphqlClient.request` is already
 * wrapped by `withRecentAuth`, so a `REAUTH_REQUIRED` rejection opens the modal
 * and retries the call inside `mutationFn`. `onError` therefore only ever sees
 * a final failure, which is exactly what we want to surface as a toast.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { isConflictError, mapError } from '@/shared/lib/error-mapper';

export interface OpsMutationOptions<TResult> {
  /** Queue keys to invalidate once the operation lands. */
  invalidate: readonly (readonly unknown[])[];
  /** Toast headline shown on success. */
  successMessage: string;
  /** Toast headline shown after the call has definitively failed. */
  errorMessage: string;
  /** Runs after invalidation, e.g. to close a modal. */
  onCompleted?: (result: TResult) => void;
  /**
   * Opt-in friendly text for a CONFLICT (409) failure. When set, a conflict
   * shows this instead of the raw backend message (which may quote ids) and
   * also refetches the `invalidate` keys so the UI reflects the row that
   * caused the conflict.
   */
  conflictMessage?: string;
  /** Optional override of the failure description (takes precedence over `conflictMessage`). */
  describeError?: (error: unknown) => string | undefined;
  /**
   * Some calls resolve successfully over HTTP while the underlying operation
   * failed (e.g. a provider onboarding retry that returns `FAILED`). Return the
   * human reason to show the island error state instead of success.
   */
  failureOf?: (result: TResult) => string | undefined;
  /**
   * Refetch the `invalidate` keys after ANY failure too, so a row whose state
   * changed server-side (e.g. new provider blockers) is never left stale.
   */
  invalidateOnError?: boolean;
  /** Receives the human failure description (soft or hard), e.g. to show it inline. */
  onFailed?: (description: string) => void;
}

export function useOpsMutation<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  options: OpsMutationOptions<TResult>,
): UseMutationResult<TResult, Error, TVariables> {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    for (const queryKey of options.invalidate) {
      void queryClient.invalidateQueries({ queryKey: [...queryKey] });
    }
  };

  return useGraphQLMutation<TResult, TVariables>(document, {
    onSuccess: (result) => {
      invalidateAll();

      const softFailure = options.failureOf?.(result);
      if (softFailure) {
        useDynamicIslandStore.getState().showError(options.errorMessage);
        toast.error(options.errorMessage, { description: softFailure });
        options.onFailed?.(softFailure);
        options.onCompleted?.(result);
        return;
      }

      // Success is announced by the shared dynamic island (mounted in the
      // backoffice layout), not by a toast.
      useDynamicIslandStore.getState().showSuccess(options.successMessage);
      options.onCompleted?.(result);
    },
    onError: (error) => {
      const fail = (description: string, refetch: boolean) => {
        if (refetch || options.invalidateOnError) invalidateAll();
        // The island auto-resets after 3s, so the toast stays as the readable detail.
        useDynamicIslandStore.getState().showError(options.errorMessage);
        toast.error(options.errorMessage, { description });
        options.onFailed?.(description);
      };

      const described = options.describeError?.(error);
      if (described) {
        fail(described, isConflictError(error));
        return;
      }

      if (options.conflictMessage && isConflictError(error)) {
        fail(options.conflictMessage, true);
        return;
      }

      // Never surface `error.message`: for GraphQL failures it is the serialized response.
      fail(mapError(error).message, false);
    },
  });
}
