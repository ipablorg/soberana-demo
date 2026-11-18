import { useSearchParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

import { WalletsTable } from '@/modules/suite-tenant/features/wallets/components/wallets-table';
import { useTenantWallets } from '@/modules/suite-tenant/features/wallets/hooks/use-tenant-wallets';
import { CustomerPicker } from '@/modules/suite-tenant/components/molecules/customer-picker';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantCustomerOptions } from '@/modules/suite-tenant/hooks/use-tenant-customer-options';

/**
 * Container: wallets of the customer chosen in `?customer_id=` (the API lists
 * per customer). Read-only: Loopay operations mint wallets on KYC approval.
 */
export default function WalletsList() {
  const { t } = useLingui();
  const [params, setParams] = useSearchParams();
  const customerId = params.get('customer_id') ?? '';
  const customers = useTenantCustomerOptions();
  const wallets = useTenantWallets(customerId);

  if (customers.isLoading) return <TenantPageSkeleton />;
  if (customers.error || !customers.data) {
    return <QueryError error={customers.error} onRetry={() => void customers.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeader title={t`Wallets.`} subtitle={t`Where your customers hold their money.`} />

      <div className="max-w-md">
        <CustomerPicker
          id="wallets-customer"
          customers={customers.data.tenant_listCustomers.data}
          value={customerId}
          onChange={(next) => setParams(next ? { customer_id: next } : {})}
        />
      </div>

      {!customerId ? (
        <EmptyState title={t`Pick a customer.`} description={t`Their wallets show up here.`} />
      ) : wallets.isLoading ? (
        <TenantPageSkeleton />
      ) : wallets.error || !wallets.data ? (
        <QueryError error={wallets.error} onRetry={() => void wallets.refetch()} />
      ) : wallets.data.tenant_listWallets.data.length === 0 ? (
        <EmptyState
          title={t`No wallets yet.`}
          description={t`Wallets are created by Loopay operations when a customer is approved.`}
        />
      ) : (
        <WalletsTable wallets={wallets.data.tenant_listWallets.data} />
      )}
    </div>
  );
}
