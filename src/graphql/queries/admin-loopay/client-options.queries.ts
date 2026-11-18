/**
 * admin-loopay client options query.
 *
 * Feeds the client selector of every ops queue toolbar. Mirrors
 * `adminLoopay_listClientOptions` in
 * `src/modules/admin-loopay/clients/clients.resolver.ts` on the backend
 * (any OPS_* role or PLATFORM_ADMIN).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type { AdminClientOption } from '@/graphql/types/admin-loopay';

export interface ListClientOptionsQuery {
  adminLoopay_listClientOptions: AdminClientOption[];
}

export type ListClientOptionsQueryVariables = Record<string, never>;

export const ListClientOptionsDocument = parse(/* GraphQL */ `
  query AdminLoopayListClientOptions {
    adminLoopay_listClientOptions {
      client_id
      client_name
      is_active
    }
  }
`) as unknown as TypedDocumentNode<
  ListClientOptionsQuery,
  ListClientOptionsQueryVariables
>;
