/**
 * Per-client platform config hooks (PLATFORM_ADMIN):
 * client <-> provider <-> rail junctions and the client config (wallet
 * defaults). Mutations carry `@RequiresRecentAuth` on the backend; re-auth is
 * handled globally by `withRecentAuth`.
 */

import { useLingui } from '@lingui/react/macro';

import {
  GetClientDocument,
  ListClientProviderRailsDocument,
  type GetClientQuery,
  type GetClientQueryVariables,
  type ListClientProviderRailsQuery,
  type ListClientProviderRailsQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  CreateClientProviderRailDocument,
  UpdateClientDocument,
  UpdateClientProviderRailDocument,
  type CreateClientProviderRailMutation,
  type CreateClientProviderRailMutationVariables,
  type UpdateClientMutation,
  type UpdateClientMutationVariables,
  type UpdateClientProviderRailMutation,
  type UpdateClientProviderRailMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { platformQueryKeys } from '../lib/platform-query-keys';

/** Backend cap: `take` must be between 1 and 100. */
const CLIENT_PROVIDER_RAILS_TAKE = 100;

export function useClientProviderRails(clientId: string | undefined) {
  return useGraphQLQuery<
    ListClientProviderRailsQuery,
    ListClientProviderRailsQueryVariables
  >(
    [...platformQueryKeys.clientProviderRails],
    ListClientProviderRailsDocument,
    { where: { clientId: clientId ?? '' }, take: CLIENT_PROVIDER_RAILS_TAKE },
    { enabled: Boolean(clientId) },
  );
}

export function useCreateClientProviderRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    CreateClientProviderRailMutation,
    CreateClientProviderRailMutationVariables
  >(CreateClientProviderRailDocument, {
    invalidate: [platformQueryKeys.clientProviderRails, platformQueryKeys.readiness],
    successMessage: t`Riel asignado al cliente`,
    errorMessage: t`No se pudo asignar el riel al cliente`,
    onCompleted,
  });
}

export function useUpdateClientProviderRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateClientProviderRailMutation,
    UpdateClientProviderRailMutationVariables
  >(UpdateClientProviderRailDocument, {
    invalidate: [platformQueryKeys.clientProviderRails, platformQueryKeys.readiness],
    successMessage: t`Asignación del cliente actualizada`,
    errorMessage: t`No se pudo actualizar la asignación del cliente`,
    onCompleted,
  });
}

export function useClientConfig(clientId: string | undefined) {
  return useGraphQLQuery<GetClientQuery, GetClientQueryVariables>(
    [...platformQueryKeys.clientConfig],
    GetClientDocument,
    { id: clientId ?? '' },
    { enabled: Boolean(clientId) },
  );
}

export function useUpdateClientConfig(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<UpdateClientMutation, UpdateClientMutationVariables>(
    UpdateClientDocument,
    {
      invalidate: [platformQueryKeys.clientConfig, platformQueryKeys.readiness],
      successMessage: t`Defaults del cliente guardados`,
      errorMessage: t`No se pudieron guardar los defaults del cliente`,
      onCompleted,
    },
  );
}
