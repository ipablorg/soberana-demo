import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import { Plus } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import { CustomersTable } from '@/modules/suite-tenant/features/customers/components/customers-table';
import { useTenantCustomers } from '@/modules/suite-tenant/features/customers/hooks/use-tenant-customers';
import { PageControls } from '@/modules/suite-tenant/components/molecules/page-controls';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';

/** Container: paginated customers of the tenant. */
export default function CustomersList() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useTenantCustomers(page);

  const header = (
    <SectionHeader
      title={t`Customers.`}
      subtitle={t`Everyone you move money for.`}
      action={
        <Button asChild>
          <Link to={TENANT_ROUTES.customerNew}>
            <Plus className="h-4 w-4" />
            <span className="ml-1.5">
              <Trans>New customer</Trans>
            </span>
          </Link>
        </Button>
      }
    />
  );

  if (isLoading) return <TenantPageSkeleton />;
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <QueryError error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const list = data.tenant_listCustomers;

  return (
    <div className="space-y-6">
      {header}
      {list.data.length === 0 ? (
        <EmptyState
          title={t`No customers yet.`}
          description={t`Create your first one to start moving money.`}
        />
      ) : (
        <>
          <CustomersTable customers={list.data} />
          <PageControls
            page={list.page}
            totalPages={list.total_pages}
            total={list.total}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
