import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantVirtualAccountRequestResult } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ReceiveOptionsTable } from '@/modules/suite-tenant/features/virtual-accounts/components/receive-options-table';
import {
  useRequestTenantVirtualAccount,
  useTenantReceiveOptions,
} from '@/modules/suite-tenant/features/virtual-accounts/hooks/use-tenant-virtual-accounts';
import { CustomerPicker } from '@/modules/suite-tenant/components/molecules/customer-picker';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { useTenantCustomerOptions } from '@/modules/suite-tenant/hooks/use-tenant-customer-options';

/**
 * Container: where the customer in `?customer_id=` can receive money and the
 * request of a virtual account on an available option (operations review it
 * before the provider opens the account; repeating it is safe).
 */
export default function VirtualAccounts() {
  const { t } = useLingui();
  const [params, setParams] = useSearchParams();
  const customerId = params.get('customer_id') ?? '';
  const [draftCountry, setDraftCountry] = useState('');
  const [country, setCountry] = useState('');
  const [requesting, setRequesting] = useState<string | null>(null);
  const [result, setResult] = useState<TenantVirtualAccountRequestResult | null>(null);
  const customers = useTenantCustomerOptions();
  const options = useTenantReceiveOptions(customerId, country);
  const request = useRequestTenantVirtualAccount((answer) =>
    setResult(answer.tenant_requestVirtualAccount)
  );

  if (customers.isLoading) return <TenantPageSkeleton />;
  if (customers.error || !customers.data) {
    return <QueryError error={customers.error} onRetry={() => void customers.refetch()} />;
  }

  const filter = (event: FormEvent) => {
    event.preventDefault();
    setCountry(draftCountry.trim().toUpperCase());
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Virtual accounts.`}
        subtitle={t`Local bank details for your customers to get paid.`}
      />

      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <CustomerPicker
          id="va-customer"
          customers={customers.data.tenant_listCustomers.data}
          value={customerId}
          onChange={(next) => {
            setResult(null);
            setParams(next ? { customer_id: next } : {});
          }}
        />
        <form onSubmit={filter} className="flex items-end gap-2" noValidate data-testid="va-filter">
          <div className="flex-1">
            <FormField id="va-country" label={t`Country (optional)`}>
              <Input
                id="va-country"
                value={draftCountry}
                onChange={(event) => setDraftCountry(event.target.value)}
              />
            </FormField>
          </div>
          <Button type="submit" variant="outline">
            <Trans>Filter</Trans>
          </Button>
        </form>
      </div>

      {result ? (
        <div
          className="rounded-xl bg-muted/30 px-4 py-3 text-sm text-foreground"
          role="status"
          data-testid="va-request-result"
        >
          {result.created ? (
            <Trans>
              Request sent for {result.request.rail_name}. Operations review it before the provider
              opens the account.
            </Trans>
          ) : (
            <Trans>
              This {result.request.rail_name} account was already requested. Nothing changed.
            </Trans>
          )}
        </div>
      ) : null}

      {!customerId ? (
        <EmptyState
          title={t`Pick a customer.`}
          description={t`See where they can receive money.`}
        />
      ) : options.isLoading ? (
        <TenantPageSkeleton />
      ) : options.error || !options.data ? (
        <QueryError error={options.error} onRetry={() => void options.refetch()} />
      ) : options.data.tenant_virtualAccountReceiveOptions.data.length === 0 ? (
        <EmptyState title={t`No options here.`} description={t`Try another country or customer.`} />
      ) : (
        <ReceiveOptionsTable
          options={options.data.tenant_virtualAccountReceiveOptions.data}
          requesting={requesting}
          onRequest={(option) => {
            setRequesting(option.rail_code);
            setResult(null);
            request.mutate(
              {
                input: {
                  customer_id: customerId,
                  country: option.country,
                  currency: option.currency,
                  rail_code: option.rail_code,
                },
              },
              { onSettled: () => setRequesting(null) }
            );
          }}
        />
      )}
    </div>
  );
}
