/** Customers of the tenant: list, detail, rails, requirements, and the customer commands. */

import { useLingui } from '@lingui/react/macro';

import {
  TenantCreateCustomerDocument,
  TenantRetryCustomerKycDocument,
  TenantSubmitCustomerRequirementDocument,
  type TenantCreateCustomerMutation,
  type TenantRetryCustomerKycMutation,
  type TenantSubmitCustomerRequirementMutation,
} from '@/graphql/mutations/tenant';
import {
  TenantGetCustomerDocument,
  TenantListCustomerRailsDocument,
  TenantListCustomerRequirementsDocument,
  TenantListCustomersDocument,
} from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export const CUSTOMERS_PAGE_SIZE = 20;

export function useTenantCustomers(page: number) {
  return useGraphQLQuery([...tenantQueryKeys.customers], TenantListCustomersDocument, {
    filters: { page, page_size: CUSTOMERS_PAGE_SIZE },
  });
}

export function useTenantCustomer(id: string) {
  return useGraphQLQuery([...tenantQueryKeys.customer(id)], TenantGetCustomerDocument, { id });
}

export function useTenantCustomerRails(id: string) {
  return useGraphQLQuery(
    [...tenantQueryKeys.customer(id), 'rails'],
    TenantListCustomerRailsDocument,
    { id, include_pending: true }
  );
}

export function useTenantCustomerRequirements(id: string) {
  return useGraphQLQuery(
    [...tenantQueryKeys.customer(id), 'requirements'],
    TenantListCustomerRequirementsDocument,
    { id }
  );
}

export function useCreateTenantCustomer(
  onCompleted?: (result: TenantCreateCustomerMutation) => void
) {
  const { t } = useLingui();

  return useTenantMutation(TenantCreateCustomerDocument, {
    invalidate: [tenantQueryKeys.customers],
    successMessage: t`Customer created. Share the verification link to start KYC.`,
    errorMessage: t`We couldn't create the customer`,
    onCompleted,
  });
}

export function useRetryTenantCustomerKyc(
  customerId: string,
  onCompleted?: (result: TenantRetryCustomerKycMutation) => void
) {
  const { t } = useLingui();

  return useTenantMutation(TenantRetryCustomerKycDocument, {
    invalidate: [tenantQueryKeys.customer(customerId), tenantQueryKeys.customers],
    successMessage: t`KYC restarted.`,
    errorMessage: t`We couldn't restart KYC`,
    onCompleted,
  });
}

export function useSubmitTenantRequirement(
  customerId: string,
  onCompleted?: (result: TenantSubmitCustomerRequirementMutation) => void
) {
  const { t } = useLingui();

  return useTenantMutation(TenantSubmitCustomerRequirementDocument, {
    invalidate: [tenantQueryKeys.customer(customerId)],
    successMessage: t`Answer sent. Loopay reviews it next.`,
    errorMessage: t`We couldn't send the answer`,
    messagesByCode: {
      REQUIREMENT_NOT_OPEN: t`This requirement no longer takes answers.`,
      REQUIREMENT_VALUE_INVALID: t`That value is not one of the allowed answers.`,
      REQUIREMENT_DOCUMENT_INVALID: t`Upload PDF, PNG or JPEG files up to 10 MB.`,
    },
    onCompleted,
  });
}
