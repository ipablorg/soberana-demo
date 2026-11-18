/**
 * Providers catalog (platform-level). #411: a read-only catalogue for the super
 * admin: no provider is created or (de)activated here (dead providers stay
 * retired); only an existing provider's `config` is edited through
 * `adminLoopay_updateProvider`, validated with `JSON.parse` before any submit.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type { AdminProvider } from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { Button } from '@/shared/components/ui/button';

import {
  EMPTY_PROVIDER_FORM,
  buildUpdateProviderInput,
  hasFormErrors,
  providerToForm,
  validateProviderForm,
  type ProviderFormState,
} from '../lib/catalog-forms';
import { useProviders, useUpdateProvider } from '../hooks/use-platform-catalog';
import { ActiveBadge } from './active-badge';
import { ProviderFormDialog } from './provider-form-dialog';

export function ProvidersTab() {
  const { t } = useLingui();
  const [form, setForm] = useState<ProviderFormState>(EMPTY_PROVIDER_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setForm(EMPTY_PROVIDER_FORM);
    setShowErrors(false);
    setIsDialogOpen(false);
  };

  const { data, isLoading } = useProviders();
  const updateProvider = useUpdateProvider(resetForm);
  const isSubmitting = updateProvider.isPending;

  const rows = data?.adminLoopay_listProviders ?? [];
  const errors = validateProviderForm(form);
  const isEditing = form.id !== null;

  const update = <K extends keyof ProviderFormState>(field: K, value: ProviderFormState[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (hasFormErrors(errors)) {
      setShowErrors(true);
      return;
    }
    if (isSubmitting) return;

    // #411: read-only catalogue; only an existing provider's config is edited.
    if (form.id) {
      updateProvider.mutate({ id: form.id, input: buildUpdateProviderInput(form) });
    }
  };

  const columns = useMemo<ColumnDef<AdminProvider>[]>(
    () => [
      {
        accessorKey: 'code',
        header: t`Código`,
        cell: ({ row }) => <span className="font-mono text-sm">{row.original.code}</span>,
      },
      { accessorKey: 'name', header: t`Nombre` },
      { accessorKey: 'type', header: t`Tipo` },
      {
        accessorKey: 'is_active',
        header: t`Estado`,
        cell: ({ row }) => <ActiveBadge active={row.original.is_active} />,
      },
      {
        id: 'actions',
        header: t`Acciones`,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setForm(providerToForm(row.original));
                setShowErrors(false);
                setIsDialogOpen(true);
              }}
            >
              <Trans>Editar</Trans>
            </Button>
          </div>
        ),
      },
    ],
    [t, isSubmitting]
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <Trans>
          Catálogo de solo lectura: los proveedores no se crean ni se activan desde aquí. Solo se
          edita la configuración de un proveedor existente.
        </Trans>
      </p>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        minWidth="900px"
        emptyMessage={t`No hay proveedores registrados`}
      />

      <ProviderFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) resetForm();
        }}
        form={form}
        errors={errors}
        showErrors={showErrors}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onFieldChange={update}
        onSubmit={handleSubmit}
        onCancel={resetForm}
      />
    </div>
  );
}
