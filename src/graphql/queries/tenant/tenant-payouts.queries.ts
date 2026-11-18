/**
 * Tenant backoffice queries, phase B: beneficiaries, quotes, rails and
 * virtual accounts (`tenant_*`, CLIENT_ADMIN of an ACTIVE client).
 *
 * Arguments are the REST query (snake_case JSON) and results the REST response
 * body (back `docs/api/TENANT_GRAPHQL.md`).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantBeneficiary,
  TenantBeneficiaryFilters,
  TenantBeneficiaryList,
  TenantIndicativeRate,
  TenantQuote,
  TenantQuoteRateFilters,
  TenantRail,
  TenantRailCatalogue,
  TenantReceiveOptions,
  TenantReceiveOptionsFilters,
} from '@/graphql/types/tenant';

type NoVariables = Record<string, never>;

// ── Beneficiaries ──────────────────────────────────────────────────────────

export interface TenantListBeneficiariesQuery {
  /** The REST body: a bare array (a `{ data }` wrapper is tolerated, see `beneficiariesOf`). */
  tenant_listBeneficiaries: TenantBeneficiary[] | TenantBeneficiaryList;
}

export const TenantListBeneficiariesDocument = parse(/* GraphQL */ `
  query TenantListBeneficiaries($filters: JSONObject) {
    tenant_listBeneficiaries(filters: $filters)
  }
`) as unknown as TypedDocumentNode<
  TenantListBeneficiariesQuery,
  { filters: TenantBeneficiaryFilters }
>;

export interface TenantGetBeneficiaryQuery {
  tenant_getBeneficiary: TenantBeneficiary;
}

export const TenantGetBeneficiaryDocument = parse(/* GraphQL */ `
  query TenantGetBeneficiary($id: String!) {
    tenant_getBeneficiary(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantGetBeneficiaryQuery, { id: string }>;

// ── Quotes ─────────────────────────────────────────────────────────────────

export interface TenantQuoteRateQuery {
  tenant_quoteRate: TenantIndicativeRate;
}

export const TenantQuoteRateDocument = parse(/* GraphQL */ `
  query TenantQuoteRate($filters: JSONObject!) {
    tenant_quoteRate(filters: $filters)
  }
`) as unknown as TypedDocumentNode<TenantQuoteRateQuery, { filters: TenantQuoteRateFilters }>;

export interface TenantGetQuoteQuery {
  tenant_getQuote: TenantQuote;
}

export const TenantGetQuoteDocument = parse(/* GraphQL */ `
  query TenantGetQuote($id: String!) {
    tenant_getQuote(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantGetQuoteQuery, { id: string }>;

// ── Rails ──────────────────────────────────────────────────────────────────

export interface TenantListRailsQuery {
  tenant_listRails: TenantRail[];
}

export const TenantListRailsDocument = parse(/* GraphQL */ `
  query TenantListRails {
    tenant_listRails
  }
`) as unknown as TypedDocumentNode<TenantListRailsQuery, NoVariables>;

export interface TenantRailCatalogueQuery {
  tenant_railCatalogue: TenantRailCatalogue;
}

export const TenantRailCatalogueDocument = parse(/* GraphQL */ `
  query TenantRailCatalogue($country: String) {
    tenant_railCatalogue(country: $country)
  }
`) as unknown as TypedDocumentNode<TenantRailCatalogueQuery, { country?: string }>;

// ── Virtual accounts ───────────────────────────────────────────────────────

export interface TenantVirtualAccountReceiveOptionsQuery {
  tenant_virtualAccountReceiveOptions: TenantReceiveOptions;
}

export const TenantVirtualAccountReceiveOptionsDocument = parse(/* GraphQL */ `
  query TenantVirtualAccountReceiveOptions($filters: JSONObject!) {
    tenant_virtualAccountReceiveOptions(filters: $filters)
  }
`) as unknown as TypedDocumentNode<
  TenantVirtualAccountReceiveOptionsQuery,
  { filters: TenantReceiveOptionsFilters }
>;
