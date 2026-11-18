import { Link, useSearchParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { Plus } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { BeneficiariesTable } from '@/modules/suite-tenant/features/beneficiaries/components/beneficiaries-table';
import { useTenantBeneficiaries } from '@/modules/suite-tenant/features/beneficiaries/hooks/use-tenant-beneficiaries';
import { beneficiariesOf } from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';
import { CustomerPicker } from '@/modules/suite-tenant/components/molecules/customer-picker';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantCustomerOptions } from '@/modules/suite-tenant/hooks/use-tenant-customer-options';

/** Container: payout beneficiaries of the customer chosen in `?customer_id=` (the API lists per customer). */
export default function BeneficiariesList() {
  const { t } = useLingui();
  const [params, setParams] = useSearchParams();
  const customerId = params.get('customer_id') ?? '';
  const customers = useTenantCustomerOptions();
  const beneficiaries = useTenantBeneficiaries(customerId);
  const rows = beneficiariesOf(beneficiaries.data?.tenant_listBeneficiaries);

  const newHref = customerId
    ? `${TENANT_ROUTES.beneficiaryNew}?customer_id=${encodeURIComponent(customerId)}`
    : TENANT_ROUTES.beneficiaryNew;

  if (customers.isLoading) return <TenantPageSkeleton />;
  if (customers.error || !customers.data) {
    return <QueryError error={customers.error} onRetry={() => void customers.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Beneficiaries.`}
        subtitle={t`The bank accounts your customers send money to.`}
        action={
          <Button asChild>
            <Link to={newHref}>
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>New beneficiary</Trans>
              </span>
            </Link>
          </Button>
        }
      />

      <div className="max-w-md">
        <CustomerPicker
          id="beneficiaries-customer"
          customers={customers.data.tenant_listCustomers.data}
          value={customerId}
          onChange={(next) => setParams(next ? { customer_id: next } : {})}
        />
      </div>

      {!customerId ? (
        <EmptyState
          title={t`Pick a customer.`}
          description={t`Their beneficiaries show up here.`}
        />
      ) : beneficiaries.isLoading ? (
        <TenantPageSkeleton />
      ) : beneficiaries.error || !beneficiaries.data ? (
        <QueryError error={beneficiaries.error} onRetry={() => void beneficiaries.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t`No beneficiaries yet.`}
          description={t`Add the first account this customer pays out to.`}
        />
      ) : (
        <BeneficiariesTable beneficiaries={rows} />
      )}
    </div>
  );
}
