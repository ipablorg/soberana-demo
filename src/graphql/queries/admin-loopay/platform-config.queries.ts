/**
 * admin-loopay platform config queries (PLATFORM_ADMIN only).
 *
 * Mirrors on the backend:
 * - `adminLoopay_platformReadiness` — `src/modules/admin-loopay/platform/platform.resolver.ts`
 * - `adminLoopay_listProviders` / `listPaymentRails` / `listProviderPaymentRails`
 *   — `src/modules/admin-loopay/catalog/catalog.resolver.ts`
 * - `adminLoopay_listClientProviderRails` — `clients/client-provider-rails.resolver.ts`
 * - `adminLoopay_getClient` — `clients/clients.resolver.ts`
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminClient,
  AdminClientProviderRail,
  AdminClientProviderRailFilters,
  AdminPaymentRail,
  AdminPlatformClientReadiness,
  AdminProvider,
  AdminProviderPaymentRail,
} from '@/graphql/types/admin-loopay';

export const PROVIDER_FIELDS = `
  id
  code
  name
  type
  is_active
  config
  created_at
  updated_at
`;

export const PAYMENT_RAIL_FIELDS = `
  id
  code
  canonical_code
  name
  currency
  country
  direction
  is_active
  created_at
`;

export const PROVIDER_PAYMENT_RAIL_FIELDS = `
  id
  is_active
  config
  created_at
  provider {
    id
    code
    name
  }
  rail {
    id
    code
    name
  }
`;

export const CLIENT_PROVIDER_RAIL_FIELDS = `
  id
  client_id
  provider_id
  rail_id
  priority
  is_active
  default_attributes
  provider {
    id
    code
    name
  }
  rail {
    id
    code
    name
  }
  created_at
  updated_at
`;

export const CLIENT_CONFIG_FIELDS = `
  id
  name
  status
  config
  updated_at
`;

export interface PlatformReadinessQuery {
  adminLoopay_platformReadiness: AdminPlatformClientReadiness[];
}

/** `clientId` (#411): only that client, for its Setup screen. */
export interface PlatformReadinessQueryVariables {
  clientId?: string | null;
}

export const PlatformReadinessDocument = parse(/* GraphQL */ `
  query AdminLoopayPlatformReadiness($clientId: String) {
    adminLoopay_platformReadiness(clientId: $clientId) {
      client_id
      client_name
      wallet_defaults_set
      active_providers
      active_junction_count
      missing_pairings
      dead_provider_junctions_active
      status
      issues
      issue_keys {
        key
        params
      }
    }
  }
`) as unknown as TypedDocumentNode<PlatformReadinessQuery, PlatformReadinessQueryVariables>;

/**
 * Non-secret wallet capability of a provider (`walletCapability`), returned to
 * every staff role even when `config` is masked.
 */
export interface AdminProviderWalletCapability {
  enabled: boolean;
  chains: string[];
  defaultChain: string | null;
  currency: string | null;
}

/** A listed provider; `config` is null for roles that cannot read it. */
export type AdminListedProvider = AdminProvider & {
  walletCapability?: AdminProviderWalletCapability | null;
};

export interface ListProvidersQuery {
  adminLoopay_listProviders: AdminListedProvider[];
}

export type ListProvidersQueryVariables = Record<string, never>;

export const ListProvidersDocument = parse(/* GraphQL */ `
  query AdminLoopayListProviders {
    adminLoopay_listProviders {
      ${PROVIDER_FIELDS}
      walletCapability {
        enabled
        chains
        defaultChain
        currency
      }
    }
  }
`) as unknown as TypedDocumentNode<ListProvidersQuery, ListProvidersQueryVariables>;

export interface ListPaymentRailsQuery {
  adminLoopay_listPaymentRails: AdminPaymentRail[];
}

export type ListPaymentRailsQueryVariables = Record<string, never>;

export const ListPaymentRailsDocument = parse(/* GraphQL */ `
  query AdminLoopayListPaymentRails {
    adminLoopay_listPaymentRails {
      ${PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<ListPaymentRailsQuery, ListPaymentRailsQueryVariables>;

export interface ListProviderPaymentRailsQuery {
  adminLoopay_listProviderPaymentRails: AdminProviderPaymentRail[];
}

export type ListProviderPaymentRailsQueryVariables = Record<string, never>;

export const ListProviderPaymentRailsDocument = parse(/* GraphQL */ `
  query AdminLoopayListProviderPaymentRails {
    adminLoopay_listProviderPaymentRails {
      ${PROVIDER_PAYMENT_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ListProviderPaymentRailsQuery,
  ListProviderPaymentRailsQueryVariables
>;

export interface ListClientProviderRailsQuery {
  adminLoopay_listClientProviderRails: AdminClientProviderRail[];
}

export interface ListClientProviderRailsQueryVariables {
  where: AdminClientProviderRailFilters;
  skip?: number;
  take?: number;
}

export const ListClientProviderRailsDocument = parse(/* GraphQL */ `
  query AdminLoopayListClientProviderRails(
    $where: ClientProviderRailFiltersInput
    $skip: Int
    $take: Int
  ) {
    adminLoopay_listClientProviderRails(where: $where, skip: $skip, take: $take) {
      ${CLIENT_PROVIDER_RAIL_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<
  ListClientProviderRailsQuery,
  ListClientProviderRailsQueryVariables
>;

export interface GetClientQuery {
  adminLoopay_getClient: AdminClient;
}

export interface GetClientQueryVariables {
  id: string;
}

export const GetClientDocument = parse(/* GraphQL */ `
  query AdminLoopayGetClient($id: String!) {
    adminLoopay_getClient(id: $id) {
      ${CLIENT_CONFIG_FIELDS}
    }
  }
`) as unknown as TypedDocumentNode<GetClientQuery, GetClientQueryVariables>;
