import { useLingui } from '@lingui/react/macro';

import {
  TenantRegenerateApiKeyDocument,
  type TenantRegenerateApiKeyMutation,
} from '@/graphql/mutations/tenant';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

/** Rotate the tenant API key (recent sign-in + second factor); the secret comes back once. */
export function useRotateApiKey(onCompleted: (result: TenantRegenerateApiKeyMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantRegenerateApiKeyDocument, {
    invalidate: [tenantQueryKeys.me],
    // The reveal panel is the confirmation; no toast competes with the secret.
    errorMessage: t`We couldn't rotate the key`,
    onCompleted,
  });
}
