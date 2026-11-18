/**
 * Mutation plumbing of the tenant backoffice.
 *
 * Re-authentication is not handled here: `graphqlClient.request` already turns
 * `REAUTH_REQUIRED` into the sign-in prompt and one retry, so `onError` only
 * sees a final failure. Known domain codes get a precise message; a 400 shows
 * the back's validation text (the REST DTO messages); anything else goes
 * through `mapError` (never the raw serialized response).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';

import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { mapError } from '@/shared/lib/error-mapper';
import { tenantErrorCode, tenantValidationMessage } from '@/modules/suite-tenant/lib/tenant-errors';

export interface TenantMutationOptions<TResult> {
  /** Query keys refetched once the operation lands. */
  invalidate: readonly (readonly unknown[])[];
  /** Toast headline on success; omit for a silent success (e.g. the API key reveal). */
  successMessage?: string;
  /** Toast headline after a definitive failure. */
  errorMessage: string;
  /** Precise text per back `error_code` for this operation. */
  messagesByCode?: Readonly<Record<string, string>>;
  onCompleted?: (result: TResult) => void;
  /** Receives the failure description, e.g. to render it inline. */
  onFailed?: (description: string, code: string | undefined) => void;
}

export function useTenantMutation<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  options: TenantMutationOptions<TResult>
): UseMutationResult<TResult, Error, TVariables> {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const commonMessages: Readonly<Record<string, string>> = {
    MFA_REQUIRED: t`This action needs a second factor. Sign in again with your authenticator app.`,
    TENANT_ACCESS_REQUIRED: t`Your account cannot use the tenant backoffice. Contact Loopay.`,
    CUSTOMER_NOT_ACTIVE: t`The customer is not active yet: its KYC must be approved first.`,
    KYC_NOT_APPROVED: t`The customer's KYC is not approved yet.`,
    IDEMPOTENCY_KEY_REUSED: t`This reference was already used with different data. Review the form and try again.`,
  };

  return useGraphQLMutation<TResult, TVariables>(document, {
    onSuccess: (result) => {
      for (const queryKey of options.invalidate) {
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      }
      if (options.successMessage) toast.success(options.successMessage);
      options.onCompleted?.(result);
    },
    onError: (error) => {
      const code = tenantErrorCode(error);
      const description =
        (code ? (options.messagesByCode?.[code] ?? commonMessages[code]) : undefined) ??
        tenantValidationMessage(error) ??
        mapError(error).message;

      toast.error(options.errorMessage, { description });
      options.onFailed?.(description, code);
    },
  });
}
