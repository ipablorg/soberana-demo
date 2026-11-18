/**
 * Virtual-account and wallet-ops hooks (staff scope `OPS_VA` / `LOOPAY_ADMIN`).
 *
 * `adminLoopay_linkWalletAddress` and `adminLoopay_moveToOpsVault` carry
 * `@RequiresRecentAuth`; the prompt-and-retry is handled globally by
 * `withRecentAuth`.
 */

import { useLingui } from '@lingui/react/macro';

import {
  ListProviderLinkedAccountsDocument,
  ListVirtualAccountsDocument,
  type ListProviderLinkedAccountsQuery,
  type ListProviderLinkedAccountsQueryVariables,
  type ListVirtualAccountsQuery,
} from '@/graphql/queries/admin-loopay';
import {
  CreateWalletDocument,
  LinkProviderCustomerDocument,
  LinkWalletAddressDocument,
  MoveToOpsVaultDocument,
  RepairVirtualAccountRequestDocument,
  UpdateVirtualAccountDocument,
  type CreateWalletMutation,
  type CreateWalletMutationVariables,
  type LinkProviderCustomerMutation,
  type LinkProviderCustomerMutationVariables,
  type LinkWalletAddressMutation,
  type LinkWalletAddressMutationVariables,
  type MoveToOpsVaultMutation,
  type MoveToOpsVaultMutationVariables,
  type RepairVirtualAccountRequestMutation,
  type RepairVirtualAccountRequestMutationVariables,
  type UpdateVirtualAccountMutation,
  type UpdateVirtualAccountMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type { AdminVirtualAccountFilters } from '@/graphql/types/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { describeLinkVirtualAccountError } from '../lib/link-virtual-account-error';
import {
  describeRepairVirtualAccountError,
  needsManualBankDetails,
} from '../lib/repair-virtual-account';
import {
  ListVirtualAccountRequestsDocument,
  type VirtualAccountRequestsQuery,
} from '../lib/virtual-account-requests';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

export function useVirtualAccounts(where: AdminVirtualAccountFilters) {
  return useGraphQLQuery<
    ListVirtualAccountsQuery,
    { where: AdminVirtualAccountFilters }
  >([...opsQueryKeys.virtualAccounts], ListVirtualAccountsDocument, { where });
}

/** Open virtual-account requests (REQUESTED / OPS_APPROVED / PROVIDER_ONBOARDING). */
export function useVirtualAccountRequests() {
  return useGraphQLQuery<VirtualAccountRequestsQuery, Record<string, never>>(
    [...opsQueryKeys.virtualAccountRequests],
    ListVirtualAccountRequestsDocument,
  );
}

export function useProviderLinkedAccounts(
  variables: ListProviderLinkedAccountsQueryVariables,
) {
  return useGraphQLQuery<
    ListProviderLinkedAccountsQuery,
    ListProviderLinkedAccountsQueryVariables
  >(
    [...opsQueryKeys.providerLinkedAccounts],
    ListProviderLinkedAccountsDocument,
    variables,
  );
}

export interface RepairVirtualAccountOptions {
  onCompleted?: (result: RepairVirtualAccountRequestMutation) => void;
  /** Receives the Spanish reason, for the inline error of the dialog. */
  onFailed?: (description: string) => void;
  /** The provider returned no bank details: staff must type and confirm them. */
  onManualBankDetailsRequired?: () => void;
}

/**
 * S22: closes a blocked VA request with the account staff opened at the
 * provider (`@RequiresRecentAuth`). The backend fetches the bank details from
 * the provider; when it has none, it refuses and the dialog asks them typed.
 */
export function useRepairVirtualAccountRequest(options: RepairVirtualAccountOptions = {}) {
  const { t } = useLingui();

  return useOpsMutation<
    RepairVirtualAccountRequestMutation,
    RepairVirtualAccountRequestMutationVariables
  >(RepairVirtualAccountRequestDocument, {
    invalidate: [
      opsQueryKeys.virtualAccountRequests,
      opsQueryKeys.virtualAccounts,
      opsQueryKeys.providerLinkedAccounts,
      opsQueryKeys.providerRequirements,
      opsQueryKeys.providerRequirementCounts,
    ],
    successMessage: t`Solicitud reparada con la cuenta del proveedor`,
    errorMessage: t`No se pudo reparar la solicitud`,
    conflictMessage: t`Esta solicitud ya no está bloqueada`,
    describeError: (error) => {
      if (needsManualBankDetails(error)) {
        options.onManualBankDetailsRequired?.();
        return t`El proveedor no devolvió datos bancarios. Ingréselos y confirme que los verificó.`;
      }
      return (
        describeRepairVirtualAccountError(error, (d) => t(d)) ??
        describeLinkVirtualAccountError(error, (d) => t(d))
      );
    },
    invalidateOnError: true,
    onFailed: options.onFailed,
    onCompleted: options.onCompleted,
  });
}

export function useLinkProviderCustomer(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    LinkProviderCustomerMutation,
    LinkProviderCustomerMutationVariables
  >(LinkProviderCustomerDocument, {
    invalidate: [opsQueryKeys.providerLinkedAccounts],
    successMessage: t`Cliente del proveedor vinculado`,
    errorMessage: t`No se pudo vincular el cliente del proveedor`,
    onCompleted,
  });
}

export function useCreateWallet(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<CreateWalletMutation, CreateWalletMutationVariables>(
    CreateWalletDocument,
    {
      invalidate: [opsQueryKeys.virtualAccounts],
      successMessage: t`Billetera aprovisionada`,
      errorMessage: t`No se pudo aprovisionar la billetera`,
      onCompleted,
    },
  );
}

export function useLinkWalletAddress(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    LinkWalletAddressMutation,
    LinkWalletAddressMutationVariables
  >(LinkWalletAddressDocument, {
    invalidate: [opsQueryKeys.virtualAccounts],
    successMessage: t`Dirección de billetera vinculada`,
    errorMessage: t`No se pudo vincular la dirección de billetera`,
    onCompleted,
  });
}

export function useMoveToOpsVault(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    MoveToOpsVaultMutation,
    MoveToOpsVaultMutationVariables
  >(MoveToOpsVaultDocument, {
    invalidate: [opsQueryKeys.dispersionesQueue],
    successMessage: t`Fondos movidos a la bóveda de operaciones`,
    errorMessage: t`No se pudo mover los fondos a la bóveda de operaciones`,
    onCompleted,
  });
}

export function useUpdateVirtualAccount(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateVirtualAccountMutation,
    UpdateVirtualAccountMutationVariables
  >(UpdateVirtualAccountDocument, {
    invalidate: [opsQueryKeys.virtualAccounts],
    successMessage: t`Cuenta virtual actualizada`,
    errorMessage: t`No se pudo actualizar la cuenta virtual`,
    onCompleted,
  });
}
