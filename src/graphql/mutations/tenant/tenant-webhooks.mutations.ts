/**
 * Tenant backoffice mutations, phase B: the client's own outbound webhooks.
 *
 * Create, update and delete need a recent sign-in and a second factor
 * (`graphqlClient` turns `REAUTH_REQUIRED` into the prompt and one retry). The
 * create response carries the plaintext `secret` once; delete returns `true`.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantWebhook,
  TenantWebhookInput,
  TenantWebhookTestResult,
  TenantWebhookUpdateInput,
} from '@/graphql/types/tenant';

export interface TenantCreateWebhookMutation {
  tenant_createWebhook: TenantWebhook;
}

export const TenantCreateWebhookDocument = parse(/* GraphQL */ `
  mutation TenantCreateWebhook($input: JSONObject!) {
    tenant_createWebhook(input: $input)
  }
`) as unknown as TypedDocumentNode<TenantCreateWebhookMutation, { input: TenantWebhookInput }>;

export interface TenantUpdateWebhookMutation {
  tenant_updateWebhook: TenantWebhook;
}

export const TenantUpdateWebhookDocument = parse(/* GraphQL */ `
  mutation TenantUpdateWebhook($id: String!, $input: JSONObject!) {
    tenant_updateWebhook(id: $id, input: $input)
  }
`) as unknown as TypedDocumentNode<
  TenantUpdateWebhookMutation,
  { id: string; input: TenantWebhookUpdateInput }
>;

export interface TenantDeleteWebhookMutation {
  tenant_deleteWebhook: boolean;
}

export const TenantDeleteWebhookDocument = parse(/* GraphQL */ `
  mutation TenantDeleteWebhook($id: String!) {
    tenant_deleteWebhook(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantDeleteWebhookMutation, { id: string }>;

export interface TenantTestWebhookMutation {
  tenant_testWebhook: TenantWebhookTestResult;
}

export const TenantTestWebhookDocument = parse(/* GraphQL */ `
  mutation TenantTestWebhook {
    tenant_testWebhook
  }
`) as unknown as TypedDocumentNode<TenantTestWebhookMutation, Record<string, never>>;
