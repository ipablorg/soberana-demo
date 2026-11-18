/**
 * admin-loopay staff user mutations (LOOPAY_ADMIN).
 *
 * `adminLoopay_createStaffUser`, `adminLoopay_updateStaffUser` and
 * `adminLoopay_deactivateStaffUser`. Creation takes only email, names and role:
 * `authUid` is optional (the backend finds or creates the Firebase user by
 * email) and the result may carry a one-time `passwordSetupLink`. Role/active
 * changes sync the Firebase staff claims server-side.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminStaffUserEntity,
  AdminCreateStaffUserInput,
  AdminUpdateStaffUserInput,
} from '@/graphql/types/admin-loopay';

/** `CreateStaffUserInput`: `authUid` is optional since the backend provisions Firebase. */
export type CreateStaffUserInput = Omit<AdminCreateStaffUserInput, 'authUid'> & {
  authUid?: string;
};

/** Create result: the staff entity plus the one-time setup link (null if the Firebase user pre-existed). */
export type CreatedStaffUser = AdminStaffUserEntity & {
  passwordSetupLink?: string | null;
};

const STAFF_USER_FIELDS = `
  id
  email
  role
  staff_role
  first_name
  last_name
  is_active
  created_at
  updated_at
`;

export interface CreateStaffUserMutation {
  adminLoopay_createStaffUser: CreatedStaffUser;
}

export interface CreateStaffUserMutationVariables {
  input: CreateStaffUserInput;
}

export const CreateStaffUserDocument = parse(/* GraphQL */ `
  mutation AdminLoopayCreateStaffUser($input: CreateStaffUserInput!) {
    adminLoopay_createStaffUser(input: $input) {
      ${STAFF_USER_FIELDS}
      passwordSetupLink
    }
  }
`) as unknown as TypedDocumentNode<
  CreateStaffUserMutation,
  CreateStaffUserMutationVariables
>;

export interface UpdateStaffUserMutation {
  adminLoopay_updateStaffUser: AdminStaffUserEntity;
}

export interface UpdateStaffUserMutationVariables {
  id: string;
  input: AdminUpdateStaffUserInput;
}

export const UpdateStaffUserDocument = parse(/* GraphQL */ `
  mutation AdminLoopayUpdateStaffUser($id: String!, $input: UpdateStaffUserInput!) {
    adminLoopay_updateStaffUser(id: $id, input: $input) {
      ${STAFF_USER_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  UpdateStaffUserMutation,
  UpdateStaffUserMutationVariables
>;

export interface DeactivateStaffUserMutation {
  adminLoopay_deactivateStaffUser: AdminStaffUserEntity;
}

export interface DeactivateStaffUserMutationVariables {
  id: string;
}

export const DeactivateStaffUserDocument = parse(/* GraphQL */ `
  mutation AdminLoopayDeactivateStaffUser($id: String!) {
    adminLoopay_deactivateStaffUser(id: $id) {
      ${STAFF_USER_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  DeactivateStaffUserMutation,
  DeactivateStaffUserMutationVariables
>;
