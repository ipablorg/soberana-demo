import { Trans, useLingui } from '@lingui/react/macro';

import type { TenantReceiveOption } from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { StatusBadge } from '@/modules/suite-tenant/components/atoms/status-badge';
import { humanizeCode } from '@/modules/suite-tenant/lib/tenant-format';

interface ReceiveOptionsTableProps {
  options: readonly TenantReceiveOption[];
  /** Rail code being requested right now, if any. */
  requesting: string | null;
  onRequest: (option: TenantReceiveOption) => void;
}

/** Whether the option can be requested: available and eligible. */
export function isRequestable(option: TenantReceiveOption): boolean {
  return option.status === 'available' && option.eligible;
}

/** Presentational receive options: rail, provider, state, what blocks it and the request action. */
export function ReceiveOptionsTable({ options, requesting, onRequest }: ReceiveOptionsTableProps) {
  const { t } = useLingui();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table data-testid="receive-options">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Trans>Rail</Trans>
            </TableHead>
            <TableHead>
              <Trans>Provider</Trans>
            </TableHead>
            <TableHead>
              <Trans>Status</Trans>
            </TableHead>
            <TableHead>
              <Trans>Notes</Trans>
            </TableHead>
            <TableHead className="text-right">
              <Trans>Action</Trans>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {options.map((option) => (
            <TableRow key={`${option.country}-${option.rail_code}`}>
              <TableCell>
                <p className="text-sm font-medium text-foreground">{option.rail_name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {option.country} · {option.currency}
                </p>
              </TableCell>
              <TableCell className="text-sm">{option.provider}</TableCell>
              <TableCell>
                <StatusBadge status={option.status} />
              </TableCell>
              <TableCell className="max-w-xs text-xs text-muted-foreground">
                {option.ineligible_reason ? <p>{humanizeCode(option.ineligible_reason)}</p> : null}
                {option.reason ? <p>{option.reason}</p> : null}
                {option.blockers.map((blocker) => (
                  <p key={blocker.code}>{blocker.message}</p>
                ))}
              </TableCell>
              <TableCell className="text-right">
                {isRequestable(option) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={requesting !== null}
                    data-testid={`request-va-${option.rail_code}`}
                    aria-label={t`Request ${option.rail_name} account`}
                    onClick={() => onRequest(option)}
                  >
                    {requesting === option.rail_code ? (
                      <Trans>Requesting…</Trans>
                    ) : (
                      <Trans>Request</Trans>
                    )}
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
