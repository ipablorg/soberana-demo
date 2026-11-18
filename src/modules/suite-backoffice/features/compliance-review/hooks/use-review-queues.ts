/**
 * Endorsement and beneficiary review hooks (staff scope `OPS_KYC`).
 *
 * `adminLoopay_reviewEndorsement` and `adminLoopay_reviewBeneficiary` carry
 * `@RequiresRecentAuth`; `adminLoopay_linkBeneficiaryProviderId` does not.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ListAllBeneficiariesDocument,
  ListPendingBeneficiariesDocument,
  ListPendingEndorsementsDocument,
  type ListAllBeneficiariesQuery,
  type ListAllBeneficiariesQueryVariables,
  type ListPendingBeneficiariesQuery,
  type ListPendingEndorsementsQuery,
} from '@/graphql/queries/admin-loopay';
import {
  DeactivateBeneficiaryDocument,
  LinkBeneficiaryProviderIdDocument,
  ReactivateBeneficiaryDocument,
  ReviewBeneficiaryDocument,
  ReviewEndorsementDocument,
  type DeactivateBeneficiaryMutation,
  type DeactivateBeneficiaryMutationVariables,
  type LinkBeneficiaryProviderIdMutation,
  type LinkBeneficiaryProviderIdMutationVariables,
  type ReactivateBeneficiaryMutation,
  type ReactivateBeneficiaryMutationVariables,
  type ReviewBeneficiaryMutation,
  type ReviewBeneficiaryMutationVariables,
  type ReviewEndorsementMutation,
  type ReviewEndorsementMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type {
  AdminBeneficiaryFiltersInput,
  AdminBeneficiaryQueueFilters,
  AdminEndorsementQueueFilters,
} from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

export function usePendingEndorsements(filter: AdminEndorsementQueueFilters) {
  return useGraphQLQuery<
    ListPendingEndorsementsQuery,
    { filter: AdminEndorsementQueueFilters }
  >([...opsQueryKeys.endorsementsQueue], ListPendingEndorsementsDocument, {
    filter,
  });
}

export function useReviewEndorsement(
  onCompleted?: (result: ReviewEndorsementMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    ReviewEndorsementMutation,
    ReviewEndorsementMutationVariables
  >(ReviewEndorsementDocument, {
    // An approval starts the provider onboarding: the virtual-account request
    // list (state + blockers) changes too, success or failure.
    invalidate: [opsQueryKeys.endorsementsQueue, opsQueryKeys.virtualAccountRequests],
    invalidateOnError: true,
    successMessage: t`Decisión del endoso registrada`,
    errorMessage: t`No se pudo registrar la decisión del endoso`,
    onCompleted,
  });
}

export function usePendingBeneficiaries(filter: AdminBeneficiaryQueueFilters) {
  return useGraphQLQuery<
    ListPendingBeneficiariesQuery,
    { filter: AdminBeneficiaryQueueFilters }
  >([...opsQueryKeys.beneficiariesQueue], ListPendingBeneficiariesDocument, {
    filter,
  });
}

export function useReviewBeneficiary(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    ReviewBeneficiaryMutation,
    ReviewBeneficiaryMutationVariables
  >(ReviewBeneficiaryDocument, {
    invalidate: [opsQueryKeys.beneficiariesQueue],
    successMessage: t`Decisión del beneficiario registrada`,
    errorMessage: t`No se pudo registrar la decisión del beneficiario`,
    onCompleted,
  });
}

export function useLinkBeneficiaryProviderId(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    LinkBeneficiaryProviderIdMutation,
    LinkBeneficiaryProviderIdMutationVariables
  >(LinkBeneficiaryProviderIdDocument, {
    invalidate: [opsQueryKeys.beneficiariesQueue],
    successMessage: t`Identificador del proveedor vinculado`,
    errorMessage: t`No se pudo vincular el identificador del proveedor`,
    onCompleted,
  });
}

export function useAllBeneficiaries(where: AdminBeneficiaryFiltersInput) {
  return useGraphQLQuery<
    ListAllBeneficiariesQuery,
    ListAllBeneficiariesQueryVariables
  >([...opsQueryKeys.allBeneficiaries], ListAllBeneficiariesDocument, { where });
}

export function useDeactivateBeneficiary(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    DeactivateBeneficiaryMutation,
    DeactivateBeneficiaryMutationVariables
  >(DeactivateBeneficiaryDocument, {
    invalidate: [opsQueryKeys.allBeneficiaries, opsQueryKeys.beneficiariesQueue],
    successMessage: t`Beneficiario desactivado`,
    errorMessage: t`No se pudo desactivar el beneficiario`,
    onCompleted,
  });
}

export function useReactivateBeneficiary(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    ReactivateBeneficiaryMutation,
    ReactivateBeneficiaryMutationVariables
  >(ReactivateBeneficiaryDocument, {
    invalidate: [opsQueryKeys.allBeneficiaries, opsQueryKeys.beneficiariesQueue],
    successMessage: t`Beneficiario reactivado`,
    errorMessage: t`No se pudo reactivar el beneficiario`,
    onCompleted,
  });
}
