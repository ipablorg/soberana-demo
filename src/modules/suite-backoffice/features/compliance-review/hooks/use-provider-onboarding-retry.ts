/**
 * Provider onboarding retry of an approved virtual-account endorsement
 * (`adminLoopay_retryEndorsementOnboarding`, OPS_KYC or OPS_COMMERCIAL,
 * `@RequiresRecentAuth`) and the customer data that prefills it.
 */

import { useLingui } from '@lingui/react/macro';

import {
  GetCustomerKycDataDocument,
  type GetCustomerKycDataQuery,
} from '@/graphql/queries/admin-loopay';
import {
  RetryEndorsementOnboardingDocument,
  type RetryEndorsementOnboardingMutation,
  type RetryEndorsementOnboardingMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

/**
 * What the platform already has about the customer, to prefill the form. A
 * role without access to the KYC detail just gets no prefill (no retries).
 */
export function useProviderProfilePrefill(customerId: string) {
  return useGraphQLQuery<GetCustomerKycDataQuery, { customerId: string }>(
    [...opsQueryKeys.kycDetail(customerId)],
    GetCustomerKycDataDocument,
    { customerId },
    { enabled: Boolean(customerId), retry: false },
  );
}

/**
 * Retries the provider onboarding. The request list is refetched after a
 * success AND after a failure, so its blockers are never stale; `onFailed`
 * receives the human reason (provider rejection or call failure).
 */
export function useRetryEndorsementOnboarding(
  onCompleted?: (result: RetryEndorsementOnboardingMutation) => void,
  onFailed?: (description: string) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    RetryEndorsementOnboardingMutation,
    RetryEndorsementOnboardingMutationVariables
  >(RetryEndorsementOnboardingDocument, {
    invalidate: [opsQueryKeys.virtualAccountRequests, opsQueryKeys.endorsementsQueue],
    successMessage: t`Alta en el proveedor reintentada`,
    errorMessage: t`No se pudo reintentar el alta en el proveedor`,
    conflictMessage: t`Esta solicitud ya no está esperando un reintento con el proveedor`,
    failureOf: ({ adminLoopay_retryEndorsementOnboarding: onboarding }) =>
      onboarding.state === 'FAILED'
        ? onboarding.error_message ?? onboarding.error_code ?? t`El proveedor rechazó el alta`
        : undefined,
    invalidateOnError: true,
    onFailed,
    onCompleted,
  });
}
