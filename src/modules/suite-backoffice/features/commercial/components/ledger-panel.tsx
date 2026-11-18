/**
 * Fee ledger of one client: date/operation filters, totals per operation and
 * currency, and the entries table.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { FeeOperation } from '@/graphql/queries/admin-commercial';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { mapError } from '@/shared/lib/error-mapper';

import { formatOpsDateTime, formatOpsText } from '../../ops-review/lib/ops-formatting';
import { feeOperationLabel } from '../lib/commercial-labels';
import { useFeeLedger, useFeeLedgerSummary } from '../hooks/use-commercial';
import {
  EMPTY_LEDGER_FILTER,
  FEE_OPERATIONS,
  buildLedgerVariables,
  groupSummaryByOperation,
  isLedgerRangeValid,
  type LedgerFilterState,
} from '../lib/commercial-logic';

export function LedgerPanel({ clientId }: { clientId: string }) {
  const { t } = useLingui();
  const [filter, setFilter] = useState<LedgerFilterState>(EMPTY_LEDGER_FILTER);
  const rangeValid = isLedgerRangeValid(filter);

  // An inverted range is never sent to the backend.
  const variables = useMemo(
    () => buildLedgerVariables(clientId, rangeValid ? filter : EMPTY_LEDGER_FILTER),
    [clientId, filter, rangeValid],
  );
  const summaryVariables = {
    clientId: variables.clientId,
    from: variables.from,
    to: variables.to,
  };

  const ledger = useFeeLedger(variables);
  const summary = useFeeLedgerSummary(summaryVariables);

  const groups = groupSummaryByOperation(summary.data?.adminLoopay_feeLedgerSummary ?? []);
  const entries = ledger.data?.adminLoopay_listFeeLedger ?? [];
  const error = ledger.error ?? summary.error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="ledger-from">
            <Trans>Desde</Trans>
          </Label>
          <Input
            id="ledger-from"
            type="date"
            value={filter.from}
            onChange={(event) => setFilter({ ...filter, from: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ledger-to">
            <Trans>Hasta</Trans>
          </Label>
          <Input
            id="ledger-to"
            type="date"
            value={filter.to}
            onChange={(event) => setFilter({ ...filter, to: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ledger-operation">
            <Trans>Operación</Trans>
          </Label>
          <select
            id="ledger-operation"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            value={filter.operation}
            onChange={(event) =>
              setFilter({ ...filter, operation: event.target.value as FeeOperation | '' })
            }
          >
            <option value="">—</option>
            {FEE_OPERATIONS.map((operation) => (
              <option key={operation} value={operation}>
                {feeOperationLabel(operation, t)}
              </option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => setFilter(EMPTY_LEDGER_FILTER)}>
          <Trans>Limpiar</Trans>
        </Button>
      </div>

      {!rangeValid ? (
        <p role="alert" className="text-sm text-destructive">
          <Trans>La fecha inicial no puede ser posterior a la final</Trans>
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {mapError(error).message}
        </p>
      ) : null}

      {ledger.isLoading || summary.isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" data-testid="ledger-skeleton" />
      ) : (
        <>
          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              <Trans>Totales</Trans>
            </h3>
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                <Trans>No se cobraron tarifas en este período</Trans>
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group.operation}
                    className="rounded-xl border border-border p-3"
                    data-testid={`total-${group.operation}`}
                  >
                    <p className="text-xs text-muted-foreground">
                      {feeOperationLabel(group.operation, t)}
                    </p>
                    {group.totals.map((row) => (
                      <p key={row.currency} className="font-mono tabular-nums text-right">
                        {row.total} {row.currency}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-medium">
              <Trans>Movimientos</Trans>
            </h3>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                <Trans>No hay movimientos</Trans>
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Trans>Fecha</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Operación</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Riel</Trans>
                    </TableHead>
                    <TableHead className="text-right">
                      <Trans>Monto base</Trans>
                    </TableHead>
                    <TableHead className="text-right">
                      <Trans>Tarifa</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Moneda</Trans>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatOpsDateTime(entry.createdAt)}</TableCell>
                      <TableCell>{feeOperationLabel(entry.operation, t)}</TableCell>
                      <TableCell>{formatOpsText(entry.railCode)}</TableCell>
                      <TableCell className="font-mono tabular-nums text-right">
                        {entry.baseAmount}
                      </TableCell>
                      <TableCell className="font-mono tabular-nums text-right">
                        {entry.feeAmount}
                      </TableCell>
                      <TableCell>{entry.currency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
