import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { CustomerProfileCard } from '@/modules/suite-tenant/features/customers/components/customer-profile-card';
import { CustomerRailsCard } from '@/modules/suite-tenant/features/customers/components/customer-rails-card';
import { CustomerRequirementsCard } from '@/modules/suite-tenant/features/customers/components/customer-requirements-card';
import { RetryKycCard } from '@/modules/suite-tenant/features/customers/components/retry-kyc-card';
import {
  useRetryTenantCustomerKyc,
  useSubmitTenantRequirement,
  useTenantCustomer,
  useTenantCustomerRails,
  useTenantCustomerRequirements,
} from '@/modules/suite-tenant/features/customers/hooks/use-tenant-customers';
import {
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { customerDisplayName } from '@/modules/suite-tenant/lib/tenant-format';

/** Container: one customer with its rails, requirements and the KYC retry. */
export default function CustomerDetail() {
  const { t } = useLingui();
  const { customerId = '' } = useParams<{ customerId: string }>();
  const customer = useTenantCustomer(customerId);
  const rails = useTenantCustomerRails(customerId);
  const requirements = useTenantCustomerRequirements(customerId);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const retry = useRetryTenantCustomerKyc(customerId);
  const submit = useSubmitTenantRequirement(customerId, () => setAnsweringId(null));

  const back = (
    <Button asChild variant="ghost" size="sm">
      <Link to={TENANT_ROUTES.customers}>
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-1.5">
          <Trans>All customers</Trans>
        </span>
      </Link>
    </Button>
  );

  if (customer.isLoading) return <TenantPageSkeleton />;
  if (customer.error || !customer.data) {
    return (
      <div className="space-y-6">
        {back}
        <QueryError error={customer.error} onRetry={() => void customer.refetch()} />
      </div>
    );
  }

  const data = customer.data.tenant_getCustomer;

  return (
    <div className="space-y-6">
      {back}
      <SectionHeader
        title={`${customerDisplayName(data)}.`}
        subtitle={t`Identity, rails and what providers ask.`}
      />
      <CustomerProfileCard customer={data} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CustomerRailsCard
          rails={rails.data?.tenant_listCustomerRails.endorsements ?? data.endorsements}
          isLoading={rails.isLoading}
        />
        <RetryKycCard
          pending={retry.isPending}
          onRetry={(input) => retry.mutate({ id: customerId, input })}
        />
      </div>
      <CustomerRequirementsCard
        requirements={requirements.data?.tenant_listCustomerRequirements.data}
        isLoading={requirements.isLoading}
        pendingId={submit.isPending ? answeringId : null}
        onSubmit={(requirement, answer) => {
          setAnsweringId(requirement.id);
          submit.mutate({ id: customerId, requirement_id: requirement.id, input: answer });
        }}
      />
    </div>
  );
}
