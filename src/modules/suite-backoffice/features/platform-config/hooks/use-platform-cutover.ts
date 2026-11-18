/**
 * Cutover checklist mutations (`adminLoopay_cutover*`, PLATFORM_ADMIN,
 * `@RequiresRecentAuth`; re-auth is handled globally by `withRecentAuth`).
 */

import { useLingui } from '@lingui/react/macro';

import {
  CutoverDeactivateDeadProviderCatalogDocument,
  CutoverDeactivateDeadProvidersDocument,
  CutoverFlagLegacyTransactionsDocument,
  type CutoverDeactivateDeadProviderCatalogMutation,
  type CutoverDeactivateDeadProviderCatalogMutationVariables,
  type CutoverDeactivateDeadProvidersMutation,
  type CutoverDeactivateDeadProvidersMutationVariables,
  type CutoverFlagLegacyTransactionsMutation,
  type CutoverFlagLegacyTransactionsMutationVariables,
} from '@/graphql/mutations/admin-loopay';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import { platformQueryKeys } from '../lib/platform-query-keys';

export function useCutoverDeactivateDeadProviders() {
  const { t } = useLingui();

  return useOpsMutation<
    CutoverDeactivateDeadProvidersMutation,
    CutoverDeactivateDeadProvidersMutationVariables
  >(CutoverDeactivateDeadProvidersDocument, {
    invalidate: [platformQueryKeys.readiness, platformQueryKeys.clientProviderRails],
    successMessage: t`Junctions de proveedores muertos desactivadas`,
    errorMessage: t`No se pudieron desactivar las junctions de proveedores muertos`,
  });
}

export function useCutoverDeactivateDeadProviderCatalog() {
  const { t } = useLingui();

  return useOpsMutation<
    CutoverDeactivateDeadProviderCatalogMutation,
    CutoverDeactivateDeadProviderCatalogMutationVariables
  >(CutoverDeactivateDeadProviderCatalogDocument, {
    invalidate: [
      platformQueryKeys.providers,
      platformQueryKeys.providerPaymentRails,
      platformQueryKeys.readiness,
    ],
    successMessage: t`Catálogo de proveedores muertos desactivado`,
    errorMessage: t`No se pudo desactivar el catálogo de proveedores muertos`,
  });
}

export function useCutoverFlagLegacyTransactions() {
  const { t } = useLingui();

  return useOpsMutation<
    CutoverFlagLegacyTransactionsMutation,
    CutoverFlagLegacyTransactionsMutationVariables
  >(CutoverFlagLegacyTransactionsDocument, {
    invalidate: [opsQueryKeys.recaudosQueue, opsQueryKeys.dispersionesQueue],
    successMessage: t`Marcado de transacciones legacy completado`,
    errorMessage: t`No se pudo marcar las transacciones legacy`,
  });
}
