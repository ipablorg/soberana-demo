/**
 * Payout beneficiaries of the tenant's customers. The REST API lists them per
 * customer (`customer_id` is required), so the screens pick a customer first.
 */

import { useLingui } from '@lingui/react/macro';

import {
  TenantCreateBeneficiaryDocument,
  TenantDeactivateBeneficiaryDocument,
  TenantDeleteBeneficiaryDocument,
  TenantReactivateBeneficiaryDocument,
  TenantUpdateBeneficiaryDocument,
  type TenantCreateBeneficiaryMutation,
} from '@/graphql/mutations/tenant';
import {
  TenantGetBeneficiaryDocument,
  TenantListBeneficiariesDocument,
  TenantListRailsDocument,
} from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export function useTenantBeneficiaries(customerId: string) {
  return useGraphQLQuery(
    [...tenantQueryKeys.beneficiaries, 'by-customer'],
    TenantListBeneficiariesDocument,
    { filters: { customer_id: customerId } },
    { enabled: customerId.length > 0 }
  );
}

export function useTenantBeneficiary(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.beneficiary(id)], TenantGetBeneficiaryDocument, {
    id,
  });
}

/** Rails the client can use (`GET /v1/rails`). */
export function useTenantRails() {
  return useGraphQLQuery([...tenantQueryKeys.rails], TenantListRailsDocument, undefined, {
    staleTime: 5 * 60_000,
  });
}

export function useCreateTenantBeneficiary(
  onCompleted?: (result: TenantCreateBeneficiaryMutation) => void
) {
  const { t } = useLingui();

  return useTenantMutation(TenantCreateBeneficiaryDocument, {
    invalidate: [tenantQueryKeys.beneficiaries],
    successMessage: t`Beneficiary created. The provider reviews it before it can receive money.`,
    errorMessage: t`We couldn't create the beneficiary`,
    messagesByCode: {
      BENEFICIARY_PROVIDER_FIELDS_MISSING: t`The provider needs more details. Review the account and address fields.`,
    },
    onCompleted,
  });
}

export function useUpdateTenantBeneficiary() {
  const { t } = useLingui();

  return useTenantMutation(TenantUpdateBeneficiaryDocument, {
    invalidate: [tenantQueryKeys.beneficiaries],
    successMessage: t`Beneficiary updated.`,
    errorMessage: t`We couldn't update the beneficiary`,
  });
}

export function useDeactivateTenantBeneficiary() {
  const { t } = useLingui();

  return useTenantMutation(TenantDeactivateBeneficiaryDocument, {
    invalidate: [tenantQueryKeys.beneficiaries],
    successMessage: t`Beneficiary deactivated.`,
    errorMessage: t`We couldn't deactivate the beneficiary`,
  });
}

export function useReactivateTenantBeneficiary() {
  const { t } = useLingui();

  return useTenantMutation(TenantReactivateBeneficiaryDocument, {
    invalidate: [tenantQueryKeys.beneficiaries],
    successMessage: t`Beneficiary active again.`,
    errorMessage: t`We couldn't reactivate the beneficiary`,
  });
}

export function useDeleteTenantBeneficiary(onCompleted?: () => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantDeleteBeneficiaryDocument, {
    // Only the lists: the deleted beneficiary's own query would answer 404.
    invalidate: [[...tenantQueryKeys.beneficiaries, 'by-customer']],
    successMessage: t`Beneficiary deleted.`,
    errorMessage: t`We couldn't delete the beneficiary`,
    onCompleted: () => onCompleted?.(),
  });
}
