/**
 * Fee schedules of one client. Creating or deactivating a schedule is
 * LOOPAY_ADMIN only on the backend; OPS_COMMERCIAL sees the table read-only.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Plus } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useHasStaffRole } from '@/shared/hooks/use-staff-role';
import { mapError } from '@/shared/lib/error-mapper';

import { formatOpsText } from '../../ops-review/lib/ops-formatting';
import {
  useCreateFeeSchedule,
  useDeactivateFeeSchedule,
  useFeeSchedules,
} from '../hooks/use-commercial';
import { feeModeLabel, feeOperationLabel } from '../lib/commercial-labels';
import {
  COMMERCIAL_ROLE,
  buildFeeScheduleInput,
  formatFeeValue,
} from '../lib/commercial-logic';
import { FeeScheduleDialog } from './fee-schedule-dialog';

export function FeesPanel({ clientId }: { clientId: string }) {
  const { t } = useLingui();
  // OPS_COMMERCIAL (and the superuser, who always passes) manage fee schedules.
  const canManage = useHasStaffRole(COMMERCIAL_ROLE);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, error, refetch } = useFeeSchedules(clientId, includeInactive);
  const create = useCreateFeeSchedule(clientId, () => setCreateOpen(false));
  const deactivate = useDeactivateFeeSchedule(clientId);

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" data-testid="fees-skeleton" />;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-border p-4 space-y-3">
        <p className="text-sm text-destructive">{mapError(error).message}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <Trans>Volver a intentar</Trans>
        </Button>
      </div>
    );
  }

  const schedules = data?.adminLoopay_listFeeSchedules ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(event) => setIncludeInactive(event.target.checked)}
          />
          <Trans>Mostrar versiones inactivas</Trans>
        </label>
        {canManage ? (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            <Trans>Crear tarifa</Trans>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground" data-testid="fees-readonly-notice">
            <Trans>
              Solo el equipo comercial o un super administrador puede crear o
              desactivar tarifas. Aquí las ves en modo lectura.
            </Trans>
          </p>
        )}
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          <Trans>Este cliente aún no tiene tarifas configuradas</Trans>
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Trans>Operación</Trans>
              </TableHead>
              <TableHead>
                <Trans>Riel</Trans>
              </TableHead>
              <TableHead>
                <Trans>Modo</Trans>
              </TableHead>
              <TableHead className="text-right">
                <Trans>Valor</Trans>
              </TableHead>
              <TableHead className="text-right">
                <Trans>Mín.</Trans>
              </TableHead>
              <TableHead className="text-right">
                <Trans>Máx.</Trans>
              </TableHead>
              <TableHead className="text-right">
                <Trans>Versión</Trans>
              </TableHead>
              <TableHead>
                <Trans>Activa</Trans>
              </TableHead>
              {canManage ? <TableHead /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{feeOperationLabel(schedule.operation, t)}</TableCell>
                <TableCell>{schedule.railCode ?? <Trans>Cualquiera</Trans>}</TableCell>
                <TableCell>{feeModeLabel(schedule.mode, t)}</TableCell>
                <TableCell className="font-mono tabular-nums text-right">
                  {formatFeeValue(schedule.mode, schedule.value, schedule.currency)}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-right">
                  {formatOpsText(schedule.minAmount)}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-right">
                  {formatOpsText(schedule.maxAmount)}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-right">
                  {schedule.version}
                </TableCell>
                <TableCell>
                  <Badge variant={schedule.active ? 'success' : 'secondary'}>
                    {schedule.active ? <Trans>Activa</Trans> : <Trans>Inactiva</Trans>}
                  </Badge>
                </TableCell>
                {canManage ? (
                  <TableCell className="text-right">
                    {schedule.active ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deactivate.isPending}
                        onClick={() => deactivate.mutate({ id: schedule.id })}
                      >
                        <Trans>Desactivar</Trans>
                      </Button>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <FeeScheduleDialog
        key={createOpen ? 'open' : 'closed'}
        open={createOpen}
        isPending={create.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={(form) =>
          create.mutate({ input: buildFeeScheduleInput(clientId, form) })
        }
      />
    </div>
  );
}
