/**
 * Tenant backoffice queries, phase B: the client's own outbound webhooks
 * (`tenant_*`). Bodies are camelCase like the REST API (`isActive`,
 * `eventType`); list secrets are masked (`secretLastChars`).
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';

import type {
  TenantPage,
  TenantWebhook,
  TenantWebhookEventType,
  TenantWebhookLog,
  TenantWebhookLogDetail,
  TenantWebhookLogFilters,
} from '@/graphql/types/tenant';

type NoVariables = Record<string, never>;

export interface TenantListWebhooksQuery {
  tenant_listWebhooks: TenantWebhook[];
}

export const TenantListWebhooksDocument = parse(/* GraphQL */ `
  query TenantListWebhooks {
    tenant_listWebhooks
  }
`) as unknown as TypedDocumentNode<TenantListWebhooksQuery, NoVariables>;

export interface TenantWebhookEventTypesQuery {
  tenant_webhookEventTypes: TenantWebhookEventType[];
}

export const TenantWebhookEventTypesDocument = parse(/* GraphQL */ `
  query TenantWebhookEventTypes {
    tenant_webhookEventTypes
  }
`) as unknown as TypedDocumentNode<TenantWebhookEventTypesQuery, NoVariables>;

export interface TenantWebhookLogsQuery {
  tenant_webhookLogs: TenantPage<TenantWebhookLog>;
}

export const TenantWebhookLogsDocument = parse(/* GraphQL */ `
  query TenantWebhookLogs($filters: JSONObject) {
    tenant_webhookLogs(filters: $filters)
  }
`) as unknown as TypedDocumentNode<TenantWebhookLogsQuery, { filters: TenantWebhookLogFilters }>;

export interface TenantWebhookLogQuery {
  tenant_webhookLog: TenantWebhookLogDetail;
}

export const TenantWebhookLogDocument = parse(/* GraphQL */ `
  query TenantWebhookLog($id: String!) {
    tenant_webhookLog(id: $id)
  }
`) as unknown as TypedDocumentNode<TenantWebhookLogQuery, { id: string }>;
