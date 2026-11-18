/**
 * Platform catalog hooks: providers, payment rails and provider<->rail
 * junctions (`adminLoopay_*`, PLATFORM_ADMIN).
 *
 * Every mutation carries `@RequiresRecentAuth` on the backend; the prompt and
 * retry are handled globally by `withRecentAuth`. Each success also refreshes
 * the readiness matrix, which is derived from this catalog.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ListPaymentRailsDocument,
  ListProviderPaymentRailsDocument,
  ListProvidersDocument,
  type ListPaymentRailsQuery,
  type ListPaymentRailsQueryVariables,
  type ListProviderPaymentRailsQuery,
  type ListProviderPaymentRailsQueryVariables,
  type ListProvidersQuery,
  type ListProvidersQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  CreatePaymentRailDocument,
  CreateProviderDocument,
  CreateProviderPaymentRailDocument,
  UpdatePaymentRailDocument,
  UpdateProviderDocument,
  UpdateProviderPaymentRailDocument,
  type CreatePaymentRailMutation,
  type CreatePaymentRailMutationVariables,
  type CreateProviderMutation,
  type CreateProviderMutationVariables,
  type CreateProviderPaymentRailMutation,
  type CreateProviderPaymentRailMutationVariables,
  type UpdatePaymentRailMutation,
  type UpdatePaymentRailMutationVariables,
  type UpdateProviderMutation,
  type UpdateProviderMutationVariables,
  type UpdateProviderPaymentRailMutation,
  type UpdateProviderPaymentRailMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { platformQueryKeys } from '../lib/platform-query-keys';

/* Providers ---------------------------------------------------------------- */

export function useProviders() {
  return useGraphQLQuery<ListProvidersQuery, ListProvidersQueryVariables>(
    [...platformQueryKeys.providers],
    ListProvidersDocument,
  );
}

export function useCreateProvider(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<CreateProviderMutation, CreateProviderMutationVariables>(
    CreateProviderDocument,
    {
      invalidate: [platformQueryKeys.providers, platformQueryKeys.readiness],
      successMessage: t`Proveedor creado`,
      errorMessage: t`No se pudo crear el proveedor`,
      onCompleted,
    },
  );
}

export function useUpdateProvider(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<UpdateProviderMutation, UpdateProviderMutationVariables>(
    UpdateProviderDocument,
    {
      invalidate: [
        platformQueryKeys.providers,
        platformQueryKeys.providerPaymentRails,
        platformQueryKeys.readiness,
      ],
      successMessage: t`Proveedor actualizado`,
      errorMessage: t`No se pudo actualizar el proveedor`,
      onCompleted,
    },
  );
}

/* Payment rails ------------------------------------------------------------ */

export function usePaymentRails() {
  return useGraphQLQuery<ListPaymentRailsQuery, ListPaymentRailsQueryVariables>(
    [...platformQueryKeys.paymentRails],
    ListPaymentRailsDocument,
  );
}

export function useCreatePaymentRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    CreatePaymentRailMutation,
    CreatePaymentRailMutationVariables
  >(CreatePaymentRailDocument, {
    invalidate: [platformQueryKeys.paymentRails, platformQueryKeys.readiness],
    successMessage: t`Riel de pago creado`,
    errorMessage: t`No se pudo crear el riel de pago`,
    onCompleted,
  });
}

export function useUpdatePaymentRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdatePaymentRailMutation,
    UpdatePaymentRailMutationVariables
  >(UpdatePaymentRailDocument, {
    invalidate: [
      platformQueryKeys.paymentRails,
      platformQueryKeys.providerPaymentRails,
      platformQueryKeys.readiness,
    ],
    successMessage: t`Riel de pago actualizado`,
    errorMessage: t`No se pudo actualizar el riel de pago`,
    onCompleted,
  });
}

/* Provider <-> rail -------------------------------------------------------- */

export function useProviderPaymentRails() {
  return useGraphQLQuery<
    ListProviderPaymentRailsQuery,
    ListProviderPaymentRailsQueryVariables
  >([...platformQueryKeys.providerPaymentRails], ListProviderPaymentRailsDocument);
}

export function useCreateProviderPaymentRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    CreateProviderPaymentRailMutation,
    CreateProviderPaymentRailMutationVariables
  >(CreateProviderPaymentRailDocument, {
    invalidate: [
      platformQueryKeys.providerPaymentRails,
      platformQueryKeys.readiness,
    ],
    successMessage: t`Proveedor asignado al riel`,
    errorMessage: t`No se pudo asignar el proveedor al riel`,
    conflictMessage: t`Esta conexión ya existe. Revisa la tabla y actívala si está inactiva.`,
    onCompleted,
  });
}

export function useUpdateProviderPaymentRail(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateProviderPaymentRailMutation,
    UpdateProviderPaymentRailMutationVariables
  >(UpdateProviderPaymentRailDocument, {
    invalidate: [
      platformQueryKeys.providerPaymentRails,
      platformQueryKeys.readiness,
    ],
    successMessage: t`Asignación proveedor-riel actualizada`,
    errorMessage: t`No se pudo actualizar la asignación proveedor-riel`,
    onCompleted,
  });
}
