/**
 * Customer 360 hooks (LOOPAY_ADMIN).
 *
 * `useCustomersManagement` feeds the management table; `useCustomerWallets`
 * is enabled only when a customer is selected in the detail dialog;
 * `useUpdateCustomerStatus` drives the Suspend / Freeze / Penalize / Activate
 * actions.
 */

import { useLingui } from '@lingui/react/macro';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  ListCustomersManagementDocument,
  ListProvidersDocument,
  ListWalletsByCustomerDocument,
  type ListCustomersManagementQuery,
  type ListCustomersManagementQueryVariables,
  type ListProvidersQuery,
  type ListProvidersQueryVariables,
  type ListWalletsByCustomerQuery,
  type ListWalletsByCustomerQueryVariables,
} from '@/graphql/queries/admin-loopay';
import {
  CreateWalletDocument,
  RequestVirtualAccountDocument,
  UpdateCustomerStatusDocument,
  UpdateWalletDocument,
  type CreateWalletMutation,
  type CreateWalletMutationVariables,
  type RequestVirtualAccountMutation,
  type RequestVirtualAccountMutationVariables,
  type UpdateCustomerStatusMutation,
  type UpdateCustomerStatusMutationVariables,
  type UpdateWalletMutation,
  type UpdateWalletMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import type {
  AdminCustomerManagementFilters,
  AdminWalletResponse,
} from '@/graphql/types/admin-loopay';
import { useGraphQLMutation } from '@/shared/hooks/use-graphql-mutation';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { opsQueryKeys } from '../../ops-review/lib/ops-query-keys';
import {
  CustomerReceiveOptionsDocument,
  classifyRequestVirtualAccountError,
  type CustomerReceiveOptionsQuery,
  type CustomerReceiveOptionsQueryVariables,
} from '../lib/virtual-account-request';

export function useCustomersManagement(filter: AdminCustomerManagementFilters) {
  return useGraphQLQuery<
    ListCustomersManagementQuery,
    ListCustomersManagementQueryVariables
  >([...opsQueryKeys.customers], ListCustomersManagementDocument, {
    where: filter,
  });
}

export function useCustomerWallets(customerId: string | null) {
  return useGraphQLQuery<
    ListWalletsByCustomerQuery,
    ListWalletsByCustomerQueryVariables
  >(
    [...opsQueryKeys.customerWallets(customerId ?? '')],
    ListWalletsByCustomerDocument,
    { customerId: customerId ?? '' },
    { enabled: customerId !== null },
  );
}

/**
 * Custody providers selectable for "Agregar billetera" (filtered client-side
 * down to active WALLET-type ones by the caller — this reuses the same
 * unfiltered `adminLoopay_listProviders` document the platform-config
 * feature already queries, rather than duplicating it).
 */
export function useWalletCapableProviders() {
  return useGraphQLQuery<ListProvidersQuery, ListProvidersQueryVariables>(
    [...opsQueryKeys.walletCapableProviders],
    ListProvidersDocument,
  );
}

export function useUpdateCustomerStatus(
  onCompleted?: (result: UpdateCustomerStatusMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    UpdateCustomerStatusMutation,
    UpdateCustomerStatusMutationVariables
  >(UpdateCustomerStatusDocument, {
    invalidate: [opsQueryKeys.customers],
    successMessage: t`Estado del cliente actualizado`,
    errorMessage: t`No se pudo actualizar el estado del cliente`,
    onCompleted,
  });
}

/**
 * Provisions a wallet through the provider integration
 * (`adminLoopay_createWallet`, LOOPAY_ADMIN, no recent-auth requirement).
 *
 * Deliberately not built on `useOpsMutation`: that one toasts `error.message`
 * verbatim, which for this mutation quotes customer/client UUIDs. Failures are
 * surfaced by the dialog (friendly, inline) through the returned `error`.
 * The backend is idempotent, so a success may be an existing wallet
 * (`alreadyExisted`) and the toast says so.
 */
export function useCreateCustomerWallet(
  onCompleted?: (wallet: AdminWalletResponse) => void,
) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  return useGraphQLMutation<CreateWalletMutation, CreateWalletMutationVariables>(
    CreateWalletDocument,
    {
      onSuccess: (result) => {
        const wallet = result.adminLoopay_createWallet;

        void queryClient.invalidateQueries({
          queryKey: [...opsQueryKeys.customerWalletsAll],
        });

        const currency = wallet.currency;
        const chain = wallet.chain ?? '—';
        if (wallet.alreadyExisted) {
          toast.info(t`Este cliente ya tenía una billetera ${currency} en ${chain}.`);
        } else {
          toast.success(t`Billetera ${currency} creada en ${chain}.`);
        }

        onCompleted?.(wallet);
      },
    },
  );
}

/** Rails the customer can receive on, with status and eligibility (enabled while the dialog is open). */
export function useCustomerReceiveOptions(customerId: string | null, enabled: boolean) {
  return useGraphQLQuery<
    CustomerReceiveOptionsQuery,
    CustomerReceiveOptionsQueryVariables
  >(
    [...opsQueryKeys.customerReceiveOptions(customerId ?? '')],
    CustomerReceiveOptionsDocument,
    { customerId: customerId ?? '' },
    { enabled: enabled && customerId !== null },
  );
}

/**
 * Requests a virtual account for the customer (`adminLoopay_requestVirtualAccount`).
 * Success and failure are announced by the dynamic island; known business
 * errors (individual customer, rail under maintenance, ...) get a friendly
 * description instead of the raw backend message.
 */
export function useRequestVirtualAccount(
  onCompleted?: (result: RequestVirtualAccountMutation) => void,
) {
  const { t } = useLingui();

  return useOpsMutation<
    RequestVirtualAccountMutation,
    RequestVirtualAccountMutationVariables
  >(RequestVirtualAccountDocument, {
    invalidate: [
      opsQueryKeys.customerReceiveOptionsAll,
      opsQueryKeys.virtualAccounts,
      opsQueryKeys.virtualAccountRequests,
    ],
    successMessage: t`Cuenta virtual solicitada`,
    errorMessage: t`No se pudo solicitar la cuenta virtual`,
    describeError: classifyRequestVirtualAccountError,
    onCompleted,
  });
}

export function useUpdateWallet(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<UpdateWalletMutation, UpdateWalletMutationVariables>(
    UpdateWalletDocument,
    {
      invalidate: [opsQueryKeys.customers, opsQueryKeys.customerWalletsAll],
      successMessage: t`Billetera actualizada`,
      errorMessage: t`No se pudo actualizar la billetera`,
      onCompleted,
    },
  );
}
