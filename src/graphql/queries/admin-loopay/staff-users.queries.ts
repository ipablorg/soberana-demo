/**
 * admin-loopay staff user queries.
 *
 * `adminLoopay_listStaffUsers` (LOOPAY_ADMIN) returns the paginated staff
 * directory with role and status filters.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminStaffUserFilters,
  AdminStaffUserPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

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

export interface ListStaffUsersQuery {
  adminLoopay_listStaffUsers: AdminStaffUserPaginated;
}

export interface ListStaffUsersQueryVariables {
  where?: AdminStaffUserFilters;
  pagination?: AdminPaginationInput;
}

export const ListStaffUsersDocument = parse(/* GraphQL */ `
  query AdminLoopayListStaffUsers(
    $where: StaffUserFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listStaffUsers(where: $where, pagination: $pagination) {
      data {
        ${STAFF_USER_FIELDS}
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListStaffUsersQuery,
  ListStaffUsersQueryVariables
>;
