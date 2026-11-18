/**
 * Client management hooks (LOOPAY_ADMIN / PLATFORM_ADMIN).
 *
 * `useClients` feeds the clients list table; the mutation hooks drive the
 * create / suspend / revoke / API-key actions from the detail drawer.
 */

import { useLingui } from '@lingui/react/macro';

import {
  GetClientManagementDocument,
  ListClientsDocument,
  ListTaxIdTypesDocument,
  type GetClientManagementQuery,
  type GetClientManagementQueryVariables,
  type ListClientsQuery,
  type ListClientsQueryVariables,
  type ListTaxIdTypesQuery,
  type ListTaxIdTypesQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  CreateClientDocument,
  RegenerateClientApiKeyDocument,
  RevokeClientApiKeyDocument,
  UpdateClientManagementDocument,
  type CreateClientMutation,
  type CreateClientMutationVariables,
  type RegenerateClientApiKeyMutation,
  type RegenerateClientApiKeyMutationVariables,
  type RevokeClientApiKeyMutation,
  type RevokeClientApiKeyMutationVariables,
  type UpdateClientManagementMutation,
  type UpdateClientManagementMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type { AdminClientFiltersInput } from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

export function useClients(where: AdminClientFiltersInput, enabled = true) {
  return useGraphQLQuery<ListClientsQuery, ListClientsQueryVariables>(
    [...opsQueryKeys.clients],
    ListClientsDocument,
    { where },
    { enabled },
  );
}

/** Single client incl. API-key lifecycle (used by the commercial detail page). */
export function useClientApiKeyInfo(clientId: string) {
  return useGraphQLQuery<GetClientManagementQuery, GetClientManagementQueryVariables>(
    [...opsQueryKeys.clients, 'detail', clientId],
    GetClientManagementDocument,
    { id: clientId },
    { enabled: clientId !== '' },
  );
}

export function useTaxIdTypes() {
  return useGraphQLQuery<ListTaxIdTypesQuery, ListTaxIdTypesQueryVariables>(
    [...opsQueryKeys.clients, 'tax-id-types'],
    ListTaxIdTypesDocument,
  );
}

export function useCreateClient(
  onCompleted?: (result: CreateClientMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<CreateClientMutation, CreateClientMutationVariables>(
    CreateClientDocument,
    {
      invalidate: [opsQueryKeys.clients],
      successMessage: t`Cliente creado`,
      errorMessage: t`No se pudo crear el cliente`,
      onCompleted,
    },
  );
}

export function useUpdateClient(
  onCompleted?: (result: UpdateClientManagementMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateClientManagementMutation,
    UpdateClientManagementMutationVariables
  >(UpdateClientManagementDocument, {
    invalidate: [opsQueryKeys.clients],
    successMessage: t`Cliente actualizado`,
    errorMessage: t`No se pudo actualizar el cliente`,
    onCompleted,
  });
}

export function useRegenerateClientApiKey(
  onCompleted?: (result: RegenerateClientApiKeyMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    RegenerateClientApiKeyMutation,
    RegenerateClientApiKeyMutationVariables
  >(RegenerateClientApiKeyDocument, {
    invalidate: [opsQueryKeys.clients],
    successMessage: t`API key regenerada`,
    errorMessage: t`No se pudo regenerar el API key`,
    onCompleted,
  });
}

export function useRevokeClientApiKey(
  onCompleted?: (result: RevokeClientApiKeyMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    RevokeClientApiKeyMutation,
    RevokeClientApiKeyMutationVariables
  >(RevokeClientApiKeyDocument, {
    invalidate: [opsQueryKeys.clients],
    successMessage: t`API key revocado`,
    errorMessage: t`No se pudo revocar el API key`,
    onCompleted,
  });
}
