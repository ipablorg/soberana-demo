/**
 * The client's outbound webhooks. Create, update and delete need a recent
 * sign-in and a second factor (handled by `graphqlClient`).
 */

import { useLingui } from '@lingui/react/macro';

import {
  TenantCreateWebhookDocument,
  TenantDeleteWebhookDocument,
  TenantTestWebhookDocument,
  TenantUpdateWebhookDocument,
  type TenantCreateWebhookMutation,
  type TenantTestWebhookMutation,
  type TenantUpdateWebhookMutation,
} from '@/graphql/mutations/tenant';
import {
  TenantListWebhooksDocument,
  TenantWebhookEventTypesDocument,
  TenantWebhookLogDocument,
  TenantWebhookLogsDocument,
} from '@/graphql/queries/tenant';
import type { TenantWebhookLogFilters } from '@/graphql/types/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export function useTenantWebhooks() {
  return useGraphQLQuery([...tenantQueryKeys.webhooks], TenantListWebhooksDocument);
}

export function useTenantWebhookEventTypes() {
  return useGraphQLQuery(
    [...tenantQueryKeys.webhookEventTypes],
    TenantWebhookEventTypesDocument,
    undefined,
    {
      staleTime: 10 * 60_000,
    }
  );
}

export function useTenantWebhookLogs(filters: TenantWebhookLogFilters) {
  return useGraphQLQuery([...tenantQueryKeys.webhookLogs], TenantWebhookLogsDocument, { filters });
}

export function useTenantWebhookLog(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.webhookLog(id)], TenantWebhookLogDocument, { id });
}

export function useCreateTenantWebhook(onCompleted: (result: TenantCreateWebhookMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantCreateWebhookDocument, {
    invalidate: [tenantQueryKeys.webhooks],
    errorMessage: t`We couldn't create the webhook`,
    onCompleted,
  });
}

export function useUpdateTenantWebhook(onCompleted: (result: TenantUpdateWebhookMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantUpdateWebhookDocument, {
    invalidate: [tenantQueryKeys.webhooks],
    successMessage: t`Webhook updated.`,
    errorMessage: t`We couldn't update the webhook`,
    onCompleted,
  });
}

export function useDeleteTenantWebhook() {
  const { t } = useLingui();

  return useTenantMutation(TenantDeleteWebhookDocument, {
    invalidate: [tenantQueryKeys.webhooks],
    successMessage: t`Webhook deleted. Its delivery logs stay.`,
    errorMessage: t`We couldn't delete the webhook`,
  });
}

export function useTestTenantWebhook(onCompleted: (result: TenantTestWebhookMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantTestWebhookDocument, {
    invalidate: [tenantQueryKeys.webhookLogs],
    errorMessage: t`We couldn't send the test event`,
    onCompleted,
  });
}
