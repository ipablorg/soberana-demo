import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';

import type { TenantBeneficiary } from '@/graphql/types/tenant';
import { Star } from '@/shared/components/animated-icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { tenantBeneficiaryRoute } from '@/shared/config/tenant-modes.config';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { isDeactivated } from '@/modules/suite-tenant/features/beneficiaries/lib/beneficiary-form';

interface BeneficiariesTableProps {
  beneficiaries: readonly TenantBeneficiary[];
}

/** Presentational beneficiaries table; the alias (or name) opens the detail. */
export function BeneficiariesTable({ beneficiaries }: BeneficiariesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="beneficiaries-table">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Beneficiary</Trans>
            </TableHead>
            <TableHead>
              <Trans>Rail</Trans>
            </TableHead>
            <TableHead>
              <Trans>Account</Trans>
            </TableHead>
            <TableHead>
              <Trans>Review</Trans>
            </TableHead>
            <TableHead>
              <Trans>State</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beneficiaries.map((beneficiary) => (
            <TableRow key={beneficiary.id}>
              <TableCell>
                <Link
                  to={tenantBeneficiaryRoute(beneficiary.id)}
                  className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors duration-150 hover:text-primary"
                >
                  {beneficiary.is_favorite ? (
                    <>
                      <Star className="h-3.5 w-3.5 text-warning" />
                      <span className="sr-only">
                        <Trans>Favorite</Trans>
                      </span>
                    </>
                  ) : null}
                  {beneficiary.alias || beneficiary.beneficiary_name}
                </Link>
                {beneficiary.alias ? (
                  <p className="text-xs text-muted-foreground">{beneficiary.beneficiary_name}</p>
                ) : null}
              </TableCell>
              <TableCell className="text-sm">
                <span className="font-mono">
                  {beneficiary.rail_code ?? beneficiary.payment_rail ?? '—'}
                </span>
                <span className="text-muted-foreground">
                  {' '}
                  · {beneficiary.country} · {beneficiary.currency}
                </span>
              </TableCell>
              <TableCell className="font-mono text-sm tabular-nums">
                {beneficiary.masked_account_number ?? '—'}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={beneficiary.review_status ?? beneficiary.verification_status}
                />
              </TableCell>
              <TableCell>
                {isDeactivated(beneficiary) ? (
                  <StatusBadge status="INACTIVE" />
                ) : (
                  <StatusBadge status="ACTIVE" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
