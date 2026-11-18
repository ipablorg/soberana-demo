import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantTransactionFilters } from '@/graphql/types/tenant';
import { Plus } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { TENANT_ROUTES } from '@/shared/config/tenant-modes.config';
import {
  TRANSACTIONS_PAGE_SIZE,
  useTenantTransactions,
} from '@/modules/suite-tenant/features/transactions/hooks/use-tenant-transactions';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import { PageControls } from '@/modules/suite-tenant/components/molecules/page-controls';
import {
  EmptyState,
  QueryError,
  TenantPageSkeleton,
} from '@/modules/suite-tenant/components/molecules/query-state';
import { SectionHeader } from '@/modules/suite-tenant/components/molecules/section-header';
import { TransactionsTable } from '@/modules/suite-tenant/components/organisms/transactions-table';
import { humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

/** `TransactionType` / `TransactionStatus` values the list filter accepts. */
const TYPES = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT'] as const;
const STATUSES = ['CREATED', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'] as const;

/** Container: every transaction of the tenant, filtered by type and status. */
export default function TransactionsList() {
  const { t } = useLingui();
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const filters: TenantTransactionFilters = { page, page_size: TRANSACTIONS_PAGE_SIZE };
  if (type) filters.type = type;
  if (status) filters.status = status;
  const { data, isLoading, error, refetch } = useTenantTransactions(filters);

  const toOptions = (values: readonly string[]) =>
    values.map((value) => ({ value, label: humanizeCode(value) }));

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t`Transactions.`}
        subtitle={t`Every move, in one place.`}
        action={
          <Button asChild>
            <Link to={TENANT_ROUTES.transactionNew}>
              <Plus className="h-4 w-4" />
              <span className="ml-1.5">
                <Trans>New transaction</Trans>
              </span>
            </Link>
          </Button>
        }
      />

      <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="transactions-type" label={t`Type`}>
          <NativeSelect
            id="transactions-type"
            value={type}
            placeholder={t`All types`}
            options={toOptions(TYPES)}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          />
        </FormField>
        <FormField id="transactions-status" label={t`Status`}>
          <NativeSelect
            id="transactions-status"
            value={status}
            placeholder={t`All statuses`}
            options={toOptions(STATUSES)}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          />
        </FormField>
      </div>

      {isLoading ? (
        <TenantPageSkeleton />
      ) : error || !data ? (
        <QueryError error={error} onRetry={() => void refetch()} />
      ) : data.tenant_listTransactions.data.length === 0 ? (
        <EmptyState
          title={t`No moves yet.`}
          description={t`Your customers' transactions show up here.`}
        />
      ) : (
        <>
          <TransactionsTable transactions={data.tenant_listTransactions.data} />
          <PageControls
            page={data.tenant_listTransactions.page}
            totalPages={data.tenant_listTransactions.total_pages}
            total={data.tenant_listTransactions.total}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
