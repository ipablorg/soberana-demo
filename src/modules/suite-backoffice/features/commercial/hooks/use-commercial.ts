/**
 * Commercial backoffice hooks (OPS_COMMERCIAL / LOOPAY_ADMIN).
 *
 * Queries go through `useGraphQLQuery`; mutations through `useOpsMutation`,
 * which toasts a `mapError()`-mapped message and re-authenticates on demand.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ClientProviderOnboardingDocument,
  CommercialClientRailsDocument,
  CommercialProviderRailsDocument,
  FeeLedgerSummaryDocument,
  ListFeeLedgerDocument,
  ListFeeSchedulesDocument,
  type ClientProviderOnboardingQuery,
  type ClientProviderOnboardingQueryVariables,
  type CommercialClientRailsQuery,
  type CommercialClientRailsQueryVariables,
  type CommercialProviderRailsQuery,
  type CommercialProviderRailsQueryVariables,
  type FeeLedgerSummaryQuery,
  type FeeLedgerSummaryQueryVariables,
  type ListFeeLedgerQuery,
  type ListFeeLedgerQueryVariables,
  type ListFeeSchedulesQuery,
  type ListFeeSchedulesQueryVariables,
} from '@/graphql/queries/admin-commercial';
import {
  CreateAndOnboardClientDocument,
  CreateFeeScheduleDocument,
  DeactivateFeeScheduleDocument,
  EnableClientRailDocument,
  LinkClientProviderManuallyDocument,
  OnboardClientToProvidersDocument,
  RetryClientProviderOnboardingDocument,
  SetClientRailActiveDocument,
  UpdateAllowedCountriesDocument,
  type CreateAndOnboardClientMutation,
  type CreateAndOnboardClientMutationVariables,
  type CreateFeeScheduleMutation,
  type CreateFeeScheduleMutationVariables,
  type DeactivateFeeScheduleMutation,
  type DeactivateFeeScheduleMutationVariables,
  type EnableClientRailMutation,
  type EnableClientRailMutationVariables,
  type SetClientRailActiveMutation,
  type SetClientRailActiveMutationVariables,
  type UpdateAllowedCountriesMutation,
  type UpdateAllowedCountriesMutationVariables,
  type LinkClientProviderManuallyMutation,
  type LinkClientProviderManuallyMutationVariables,
  type OnboardClientToProvidersMutation,
  type OnboardClientToProvidersMutationVariables,
  type RetryClientProviderOnboardingMutation,
  type RetryClientProviderOnboardingMutationVariables,
} from '@/graphql/mutations/admin-commercial';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { onboardingFailure } from '../lib/commercial-labels';
import { commercialQueryKeys } from '../lib/commercial-logic';

// ---- Queries ---------------------------------------------------------------

export function useClientProviderOnboarding(clientId: string) {
  return useGraphQLQuery<ClientProviderOnboardingQuery, ClientProviderOnboardingQueryVariables>(
    [...commercialQueryKeys.onboarding(clientId)],
    ClientProviderOnboardingDocument,
    { clientId },
    { enabled: clientId !== '' }
  );
}

export function useFeeSchedules(clientId: string, includeInactive: boolean) {
  return useGraphQLQuery<ListFeeSchedulesQuery, ListFeeSchedulesQueryVariables>(
    [...commercialQueryKeys.schedules(clientId)],
    ListFeeSchedulesDocument,
    { clientId, includeInactive },
    { enabled: clientId !== '' }
  );
}

export function useFeeLedger(variables: ListFeeLedgerQueryVariables) {
  return useGraphQLQuery<ListFeeLedgerQuery, ListFeeLedgerQueryVariables>(
    [...commercialQueryKeys.ledger(variables.clientId)],
    ListFeeLedgerDocument,
    variables,
    { enabled: variables.clientId !== '' }
  );
}

export function useFeeLedgerSummary(variables: FeeLedgerSummaryQueryVariables) {
  return useGraphQLQuery<FeeLedgerSummaryQuery, FeeLedgerSummaryQueryVariables>(
    [...commercialQueryKeys.summary(variables.clientId)],
    FeeLedgerSummaryDocument,
    variables,
    { enabled: variables.clientId !== '' }
  );
}

export function useCommercialProviderRails() {
  return useGraphQLQuery<CommercialProviderRailsQuery, CommercialProviderRailsQueryVariables>(
    [...commercialQueryKeys.providerRails],
    CommercialProviderRailsDocument
  );
}

export function useCommercialClientRails(clientId: string) {
  return useGraphQLQuery<CommercialClientRailsQuery, CommercialClientRailsQueryVariables>(
    [...commercialQueryKeys.clientRails(clientId)],
    CommercialClientRailsDocument,
    { clientId },
    { enabled: clientId !== '' }
  );
}

// ---- Operation readiness mutations ----------------------------------------

export function useUpdateAllowedCountries(clientId: string) {
  const { t } = useLingui();

  return useOpsMutation<UpdateAllowedCountriesMutation, UpdateAllowedCountriesMutationVariables>(
    UpdateAllowedCountriesDocument,
    {
      invalidate: [[...opsQueryKeys.clients, 'detail', clientId]],
      successMessage: t`Países del cliente guardados`,
      errorMessage: t`No se pudieron guardar los países`,
    }
  );
}

export function useEnableClientRail(clientId: string) {
  const { t } = useLingui();

  return useOpsMutation<EnableClientRailMutation, EnableClientRailMutationVariables>(
    EnableClientRailDocument,
    {
      invalidate: [commercialQueryKeys.clientRails(clientId), commercialQueryKeys.setup(clientId)],
      successMessage: t`Riel habilitado`,
      errorMessage: t`No se pudo habilitar el riel`,
      conflictMessage: t`El riel ya estaba habilitado para este cliente`,
    }
  );
}

export function useSetClientRailActive(clientId: string) {
  const { t } = useLingui();

  return useOpsMutation<SetClientRailActiveMutation, SetClientRailActiveMutationVariables>(
    SetClientRailActiveDocument,
    {
      invalidate: [commercialQueryKeys.clientRails(clientId), commercialQueryKeys.setup(clientId)],
      successMessage: t`Riel actualizado`,
      errorMessage: t`No se pudo actualizar el riel`,
    }
  );
}

// ---- Onboarding mutations --------------------------------------------------

export function useCreateAndOnboardClient(
  onCompleted?: (result: CreateAndOnboardClientMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<CreateAndOnboardClientMutation, CreateAndOnboardClientMutationVariables>(
    CreateAndOnboardClientDocument,
    {
      invalidate: [],
      successMessage: t`Cliente creado`,
      errorMessage: t`No se pudo crear el cliente`,
      onCompleted,
    }
  );
}

export function useOnboardClientToProviders(
  clientId: string,
  onCompleted?: (result: OnboardClientToProvidersMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<
    OnboardClientToProvidersMutation,
    OnboardClientToProvidersMutationVariables
  >(OnboardClientToProvidersDocument, {
    invalidate: [commercialQueryKeys.onboarding(clientId), commercialQueryKeys.setup(clientId)],
    successMessage: t`Onboarding en proveedores terminado`,
    errorMessage: t`No se pudo hacer el onboarding del cliente`,
    failureOf: (result) =>
      result.adminLoopay_onboardClientToProviders
        .map((row) => ({ row, failure: onboardingFailure(row) }))
        .filter(({ failure }) => failure !== null)
        .map(({ row, failure }) => `${row.provider}: ${failure?.reason}`)
        .join(' · ') || undefined,
    onCompleted,
  });
}

export function useRetryProviderOnboarding(
  clientId: string,
  onCompleted?: (result: RetryClientProviderOnboardingMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<
    RetryClientProviderOnboardingMutation,
    RetryClientProviderOnboardingMutationVariables
  >(RetryClientProviderOnboardingDocument, {
    invalidate: [commercialQueryKeys.onboarding(clientId), commercialQueryKeys.setup(clientId)],
    successMessage: t`Reintento exitoso`,
    errorMessage: t`El reintento de onboarding falló`,
    conflictMessage: t`El proveedor ya está vinculado`,
    failureOf: (result) =>
      onboardingFailure(result.adminLoopay_retryClientProviderOnboarding)?.reason,
    onCompleted,
  });
}

export function useLinkProviderManually(
  clientId: string,
  onCompleted?: (result: LinkClientProviderManuallyMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<
    LinkClientProviderManuallyMutation,
    LinkClientProviderManuallyMutationVariables
  >(LinkClientProviderManuallyDocument, {
    invalidate: [commercialQueryKeys.onboarding(clientId), commercialQueryKeys.setup(clientId)],
    successMessage: t`Proveedor vinculado manualmente`,
    errorMessage: t`No se pudo vincular el proveedor`,
    conflictMessage: t`El proveedor ya está vinculado por la API`,
    onCompleted,
  });
}

// ---- Fee mutations ---------------------------------------------------------

export function useCreateFeeSchedule(
  clientId: string,
  onCompleted?: (result: CreateFeeScheduleMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<CreateFeeScheduleMutation, CreateFeeScheduleMutationVariables>(
    CreateFeeScheduleDocument,
    {
      invalidate: [commercialQueryKeys.schedules(clientId), commercialQueryKeys.setup(clientId)],
      successMessage: t`Tarifa creada`,
      errorMessage: t`No se pudo crear la tarifa`,
      onCompleted,
    }
  );
}

export function useDeactivateFeeSchedule(
  clientId: string,
  onCompleted?: (result: DeactivateFeeScheduleMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<DeactivateFeeScheduleMutation, DeactivateFeeScheduleMutationVariables>(
    DeactivateFeeScheduleDocument,
    {
      invalidate: [commercialQueryKeys.schedules(clientId), commercialQueryKeys.setup(clientId)],
      successMessage: t`Tarifa desactivada`,
      errorMessage: t`No se pudo desactivar la tarifa`,
      onCompleted,
    }
  );
}
