import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import type { TenantCustomer } from '@/graphql/types/tenant';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { tenantCustomerRoute } from '@/shared/config/tenant-modes.config';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { customerDisplayName, formatDateTime } from '@/modules/suite-tenant/lib/tenant-format';

interface CustomersTableProps {
  customers: readonly TenantCustomer[];
}

/** Presentational customers table; each name opens the customer detail. */
export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="customers-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Customer</Trans>
            </TableHead>
            <TableHead>
              <Trans>External ID</Trans>
            </TableHead>
            <TableHead>
              <Trans>KYC</Trans>
            </TableHead>
            <TableHead>
              <Trans>Status</Trans>
            </TableHead>
            <TableHead>
              <Trans>Created</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link
                  to={tenantCustomerRoute(customer.id)}
                  className="font-medium text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {customerDisplayName(customer)}
                </Link>
                <p className="text-xs text-muted-foreground">{customer.email}</p>
              </TableCell>
              <TableCell className="font-mono text-xs">{customer.external_id}</TableCell>
              <TableCell>
                <StatusBadge status={customer.kyc_status} />
              </TableCell>
              <TableCell>
                <StatusBadge status={customer.customer_status} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDateTime(customer.created_at)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
