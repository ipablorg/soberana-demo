/**
 * Tenant backoffice mutations, phase B: beneficiaries, quotes and
 * virtual-account requests (`tenant_*`).
 *
 * `input` is the REST body (snake_case JSON) validated by the back against the
 * same DTOs as REST; results are the REST response body. Where REST answers
 * `204` (beneficiary delete) the mutation returns `true`.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantBeneficiary,
  TenantCreateBeneficiaryInput,
  TenantCreateQuoteInput,
  TenantQuote,
  TenantRequestVirtualAccountInput,
  TenantUpdateBeneficiaryInput,
  TenantVirtualAccountRequestResult,
} from '@/graphql/types/tenant';

// ── Beneficiaries ──────────────────────────────────────────────────────────

export interface TenantCreateBeneficiaryMutation {
  tenant_createBeneficiary: TenantBeneficiary;
}

export const TenantCreateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation TenantCreateBeneficiary($input: JSONObject!) {
    tenant_createBeneficiary(input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantCreateBeneficiaryMutation,
  { input: TenantCreateBeneficiaryInput }
>;

export interface TenantUpdateBeneficiaryMutation {
  tenant_updateBeneficiary: TenantBeneficiary;
}

export const TenantUpdateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation TenantUpdateBeneficiary($id: String!, $input: JSONObject!) {
    tenant_updateBeneficiary(id: $id, input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantUpdateBeneficiaryMutation,
  { id: string; input: TenantUpdateBeneficiaryInput }
>;

export interface TenantDeleteBeneficiaryMutation {
  tenant_deleteBeneficiary: boolean;
}

export const TenantDeleteBeneficiaryDocument = parse(/* GraphQL */ `
  mutation TenantDeleteBeneficiary($id: String!) {
    tenant_deleteBeneficiary(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantDeleteBeneficiaryMutation, { id: string }>;

export interface TenantDeactivateBeneficiaryMutation {
  tenant_deactivateBeneficiary: TenantBeneficiary;
}

export const TenantDeactivateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation TenantDeactivateBeneficiary($id: String!) {
    tenant_deactivateBeneficiary(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantDeactivateBeneficiaryMutation, { id: string }>;

export interface TenantReactivateBeneficiaryMutation {
  tenant_reactivateBeneficiary: TenantBeneficiary;
}

export const TenantReactivateBeneficiaryDocument = parse(/* GraphQL */ `
  mutation TenantReactivateBeneficiary($id: String!) {
    tenant_reactivateBeneficiary(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantReactivateBeneficiaryMutation, { id: string }>;

// ── Quotes ─────────────────────────────────────────────────────────────────

export interface TenantCreateQuoteMutation {
  tenant_createQuote: TenantQuote;
}

export const TenantCreateQuoteDocument = parse(/* GraphQL */ `
  mutation TenantCreateQuote($input: JSONObject!) {
    tenant_createQuote(input: $input)
  }
`) as unknown as TypedDocumentNode<TenantCreateQuoteMutation, { input: TenantCreateQuoteInput }>;

// ── Virtual accounts ───────────────────────────────────────────────────────

export interface TenantRequestVirtualAccountMutation {
  tenant_requestVirtualAccount: TenantVirtualAccountRequestResult;
}

export const TenantRequestVirtualAccountDocument = parse(/* GraphQL */ `
  mutation TenantRequestVirtualAccount($input: JSONObject!) {
    tenant_requestVirtualAccount(input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantRequestVirtualAccountMutation,
  { input: TenantRequestVirtualAccountInput }
>;
