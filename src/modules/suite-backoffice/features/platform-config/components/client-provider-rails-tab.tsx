/**
 * Client <-> provider <-> rail junctions per client
 * (`adminLoopay_listClientProviderRails`). #411: a read-only view for the super
 * admin; a client's rails are switched on and off in its Setup screen
 * (Commercial › client), the provider is fixed by the rail and the priority is
 * not shown (kept as 1 in the database).
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminClientProviderRail } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';

import { EMPTY_CELL } from '../../ops-review/lib/ops-formatting';
import { useClientProviderRails } from '../hooks/use-client-config';
import { RailStatusBadge } from './rail-status-badge';
import { ClientPicker } from './client-picker';

export function ClientProviderRailsTab() {
  const { t } = useLingui();
  const [clientId, setClientId] = useState<string | undefined>();
  const { data, isLoading } = useClientProviderRails(clientId);
  const rows = data?.adminLoopay_listClientProviderRails ?? [];

  const columns = useMemo<ColumnDef<AdminClientProviderRail>[]>(
    () => [
      {
        id: 'rail',
        header: t`Riel`,
        cell: ({ row }) =>
          row.original.rail ? (
            <div className="flex flex-col">
              <span className="font-medium">{row.original.rail.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {row.original.rail.code}
              </span>
            </div>
          ) : (
            EMPTY_CELL
          ),
      },
      {
        id: 'provider',
        header: t`Proveedor`,
        cell: ({ row }) =>
          row.original.provider ? (
            <div className="flex flex-col">
              <span className="font-medium">{row.original.provider.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {row.original.provider.code}
              </span>
            </div>
          ) : (
            EMPTY_CELL
          ),
      },
      {
        accessorKey: 'is_active',
        header: t`Estado`,
        cell: ({ row }) => (
          <RailStatusBadge code={row.original.rail?.code ?? ''} active={row.original.is_active} />
        ),
      },
    ],
    [t]
  );

  return (
    <div className="space-y-6">
      <ClientPicker id="client-provider-rail-client" value={clientId} onChange={setClientId} />
      <p className="text-sm text-muted-foreground">
        <Trans>
          Solo lectura: los rieles de un cliente se habilitan en su pantalla de Configuración
          (Comercial › cliente).
        </Trans>
      </p>

      {clientId ? (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          minWidth="700px"
          emptyMessage={t`Este cliente no tiene rieles asignados`}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Trans>Seleccione un cliente para ver sus rieles.</Trans>
        </p>
      )}
    </div>
  );
}
