/**
 * Staff user management hooks (LOOPAY_ADMIN only).
 *
 * `useStaffUsers` feeds the staff directory table; the mutation hooks drive
 * create / update-role / deactivate. LOOPAY_ADMIN may grant LOOPAY_ADMIN; the
 * backend still refuses to remove the last superuser (409 LAST_SUPERUSER) or
 * let staff change their own role (403); conflicts get a friendly message.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ListStaffUsersDocument,
  type ListStaffUsersQuery,
  type ListStaffUsersQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  CreateStaffUserDocument,
  DeactivateStaffUserDocument,
  UpdateStaffUserDocument,
  type CreateStaffUserMutation,
  type CreateStaffUserMutationVariables,
  type DeactivateStaffUserMutation,
  type DeactivateStaffUserMutationVariables,
  type UpdateStaffUserMutation,
  type UpdateStaffUserMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type { AdminStaffUserFilters } from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { describeStaffError } from '../lib/staff-error-message';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

export function useStaffUsers(where?: AdminStaffUserFilters) {
  return useGraphQLQuery<ListStaffUsersQuery, ListStaffUsersQueryVariables>(
    [...opsQueryKeys.staffUsers],
    ListStaffUsersDocument,
    { where },
  );
}

export function useCreateStaffUser(
  onCompleted?: (result: CreateStaffUserMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<CreateStaffUserMutation, CreateStaffUserMutationVariables>(
    CreateStaffUserDocument,
    {
      invalidate: [opsQueryKeys.staffUsers],
      successMessage: t`Usuario staff creado`,
      errorMessage: t`No se pudo crear el usuario staff`,
      conflictMessage: t`Ya existe un usuario staff con ese email.`,
      onCompleted,
    },
  );
}

export function useUpdateStaffUser(
  onCompleted?: (result: UpdateStaffUserMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateStaffUserMutation,
    UpdateStaffUserMutationVariables
  >(UpdateStaffUserDocument, {
    invalidate: [opsQueryKeys.staffUsers],
    successMessage: t`Usuario staff actualizado`,
    errorMessage: t`No se pudo actualizar el usuario staff`,
    conflictMessage: t`Debe quedar al menos un super administrador activo: no se puede quitar el último.`,
    describeError: describeStaffError,
    onCompleted,
  });
}

export function useReactivateStaffUser(
  onCompleted?: (result: UpdateStaffUserMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateStaffUserMutation,
    UpdateStaffUserMutationVariables
  >(UpdateStaffUserDocument, {
    invalidate: [opsQueryKeys.staffUsers],
    successMessage: t`Usuario staff reactivado`,
    errorMessage: t`No se pudo reactivar el usuario staff`,
    describeError: describeStaffError,
    onCompleted,
  });
}

export function useDeactivateStaffUser(
  onCompleted?: (result: DeactivateStaffUserMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    DeactivateStaffUserMutation,
    DeactivateStaffUserMutationVariables
  >(DeactivateStaffUserDocument, {
    invalidate: [opsQueryKeys.staffUsers],
    successMessage: t`Usuario staff desactivado`,
    errorMessage: t`No se pudo desactivar el usuario staff`,
    conflictMessage: t`Debe quedar al menos un super administrador activo: no se puede desactivar el último.`,
    describeError: describeStaffError,
    onCompleted,
  });
}
