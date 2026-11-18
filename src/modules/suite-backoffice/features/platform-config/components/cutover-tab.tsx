/**
 * Cutover checklist, in order, every action per explicit client selection and
 * behind a confirmation modal:
 *   1. `adminLoopay_cutoverDeactivateDeadProviders` — per-client junctions.
 *   2. `adminLoopay_cutoverDeactivateDeadProviderCatalog` — refused (409
 *      `DEAD_PROVIDER_JUNCTIONS_REMAIN`) while any client junction is active.
 *   3. `adminLoopay_cutoverFlagLegacyTransactions` — the real run stays
 *      disabled until a dry run with the same inputs succeeded.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type {
  AdminCutoverDeadProviderCatalogResult,
  AdminCutoverDeadProvidersResult,
} from '@/graphql/types/admin-loopay';
import { StateChangeConfirmationModal } from '@/shared/components/backoffice/StateChangeConfirmationModal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import { useClientOptions } from '../../ops-review/hooks/use-client-options';
import {
  useCutoverDeactivateDeadProviderCatalog,
  useCutoverDeactivateDeadProviders,
  useCutoverFlagLegacyTransactions,
} from '../hooks/use-platform-cutover';
import {
  CUTOVER_REASON_MAX_LENGTH,
  activeClientIds,
  buildFlagLegacyTransactionsInput,
  cutoverInputSignature,
  isValidCutoverReason,
  readDeadProviderJunctionsConflict,
  toCutoffInstant,
  toggleClientId,
  type DeadProviderJunctionsConflict,
} from '../lib/cutover';

type CutoverAction =
  | 'deactivate-junctions'
  | 'deactivate-catalog'
  | 'flag-dry-run'
  | 'flag-run';

interface DryRunOutcome {
  signature: string;
  count: number;
}

function StepCard({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-6">
      <div>
        <h3 className="text-base font-semibold">{`${step}. ${title}`}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function CutoverTab() {
  const { t } = useLingui();
  const { options } = useClientOptions();

  const [clientIds, setClientIds] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [cutoffLocal, setCutoffLocal] = useState('');
  const [pendingAction, setPendingAction] = useState<CutoverAction | null>(null);

  const [junctionsResult, setJunctionsResult] =
    useState<AdminCutoverDeadProvidersResult | null>(null);
  const [catalogResult, setCatalogResult] =
    useState<AdminCutoverDeadProviderCatalogResult | null>(null);
  const [catalogConflict, setCatalogConflict] =
    useState<DeadProviderJunctionsConflict | null>(null);
  const [dryRun, setDryRun] = useState<DryRunOutcome | null>(null);
  const [flaggedCount, setFlaggedCount] = useState<number | null>(null);

  const deactivateJunctions = useCutoverDeactivateDeadProviders();
  const deactivateCatalog = useCutoverDeactivateDeadProviderCatalog();
  const flagLegacy = useCutoverFlagLegacyTransactions();
  const isSubmitting =
    deactivateJunctions.isPending ||
    deactivateCatalog.isPending ||
    flagLegacy.isPending;

  const clientNames = useMemo(
    () => new Map(options.map((option) => [option.client_id, option.client_name])),
    [options],
  );

  const reasonValid = isValidCutoverReason(reason);
  const cutoff = toCutoffInstant(cutoffLocal);
  const hasClients = clientIds.length > 0;
  const signature = cutoff ? cutoverInputSignature(clientIds, reason, cutoff) : null;

  const canDeactivateJunctions = hasClients && reasonValid && !isSubmitting;
  const canDeactivateCatalog = reasonValid && !isSubmitting;
  const canDryRun = hasClients && reasonValid && cutoff !== null && !isSubmitting;
  const canRealRun = canDryRun && dryRun !== null && dryRun.signature === signature;

  const closeModal = () => setPendingAction(null);

  const handleConfirm = () => {
    const action = pendingAction;
    if (!action) return;
    const onSettled = () => setPendingAction(null);

    if (action === 'deactivate-junctions') {
      deactivateJunctions.mutate(
        { input: { clientIds: [...clientIds], reason: reason.trim() } },
        {
          onSuccess: (result) =>
            setJunctionsResult(result.adminLoopay_cutoverDeactivateDeadProviders),
          onSettled,
        },
      );
      return;
    }

    if (action === 'deactivate-catalog') {
      setCatalogConflict(null);
      deactivateCatalog.mutate(
        { reason: reason.trim() },
        {
          onSuccess: (result) =>
            setCatalogResult(result.adminLoopay_cutoverDeactivateDeadProviderCatalog),
          onError: (error) =>
            setCatalogConflict(readDeadProviderJunctionsConflict(error)),
          onSettled,
        },
      );
      return;
    }

    if (!cutoff || !signature) {
      setPendingAction(null);
      return;
    }

    const isDryRun = action === 'flag-dry-run';
    flagLegacy.mutate(
      { input: buildFlagLegacyTransactionsInput(clientIds, reason, cutoff, isDryRun) },
      {
        onSuccess: (result) => {
          const outcome = result.adminLoopay_cutoverFlagLegacyTransactions;
          if (isDryRun) {
            setDryRun({ signature, count: outcome.count });
            setFlaggedCount(null);
          } else {
            setFlaggedCount(outcome.count);
            setDryRun(null);
          }
        },
        onSettled,
      },
    );
  };

  const modalCopy: Record<
    CutoverAction,
    { count: number; label: string; plural: string; from: string; to: string }
  > = {
    'deactivate-junctions': {
      count: clientIds.length,
      label: t`cliente`,
      plural: t`clientes`,
      from: t`conexiones a proveedores muertos activas`,
      to: t`inactivas`,
    },
    'deactivate-catalog': {
      count: 1,
      label: t`catálogo de proveedores muertos`,
      plural: t`catálogos de proveedores muertos`,
      from: t`activo`,
      to: t`inactivo`,
    },
    'flag-dry-run': {
      count: clientIds.length,
      label: t`cliente`,
      plural: t`clientes`,
      from: t`pendientes o en proceso`,
      to: t`simulación de legacyBridge (sin cambios)`,
    },
    'flag-run': {
      count: clientIds.length,
      label: t`cliente`,
      plural: t`clientes`,
      from: t`pendientes o en proceso`,
      to: t`legacyBridge`,
    },
  };
  const copy = pendingAction ? modalCopy[pendingAction] : null;

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold">
            <Trans>Clientes de la migración</Trans>
          </h3>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setClientIds(activeClientIds(options))}
            >
              <Trans>Seleccionar todos los activos</Trans>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setClientIds([])}
            >
              <Trans>Limpiar selección</Trans>
            </Button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <label
              key={option.client_id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                data-client-id={option.client_id}
                checked={clientIds.includes(option.client_id)}
                onChange={() =>
                  setClientIds((current) => toggleClientId(current, option.client_id))
                }
              />
              {option.is_active
                ? option.client_name
                : t`${option.client_name} (inactivo)`}
            </label>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <Trans>Clientes seleccionados: {clientIds.length}</Trans>
        </p>

        <div className="space-y-2">
          <Label htmlFor="cutover-reason">
            <Trans>Razón (obligatoria, queda en auditoría)</Trans>
          </Label>
          <Textarea
            id="cutover-reason"
            value={reason}
            maxLength={CUTOVER_REASON_MAX_LENGTH}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
          />
        </div>
      </section>

      <StepCard
        step={1}
        title={t`Desactivar conexiones de proveedores muertos`}
        description={t`Desactiva, solo para los clientes seleccionados, las asignaciones activas a proveedores muertos.`}
      >
        <Button
          variant="destructive"
          disabled={!canDeactivateJunctions}
          onClick={() => setPendingAction('deactivate-junctions')}
        >
          <Trans>Desactivar conexiones</Trans>
        </Button>
        {junctionsResult ? (
          <div className="space-y-1 text-sm" data-testid="cutover-step-1-result">
            <p className="font-medium">
              <Trans>Total desactivadas: {junctionsResult.total_deactivated}</Trans>
            </p>
            <ul className="list-disc pl-5">
              {junctionsResult.clients.map((client) => (
                <li key={client.client_id}>
                  {`${clientNames.get(client.client_id) ?? client.client_id}: ${client.deactivated_junctions}`}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </StepCard>

      <StepCard
        step={2}
        title={t`Desactivar catálogo de proveedores muertos`}
        description={t`Desactiva los proveedores muertos y sus rieles. Se rechaza mientras quede alguna junction de cliente activa hacia ellos.`}
      >
        <Button
          variant="destructive"
          disabled={!canDeactivateCatalog}
          onClick={() => setPendingAction('deactivate-catalog')}
        >
          <Trans>Desactivar catálogo</Trans>
        </Button>
        {catalogConflict ? (
          <p className="text-sm text-destructive" role="alert">
            {catalogConflict.activeJunctions !== null ? (
              <Trans>
                Aún quedan {catalogConflict.activeJunctions} conexiones de clientes
                activas hacia proveedores muertos. Desactívelas por cliente en el
                paso 1.
              </Trans>
            ) : null}{' '}
            {catalogConflict.message}
          </p>
        ) : null}
        {catalogResult ? (
          <div className="space-y-1 text-sm">
            <p>
              <Trans>
                Proveedores desactivados: {catalogResult.deactivated_providers} ·
                Rieles de proveedor desactivados:{' '}
                {catalogResult.deactivated_provider_payment_rails}
              </Trans>
            </p>
            <p className="text-muted-foreground">
              {catalogResult.provider_codes.join(', ')}
            </p>
          </div>
        ) : null}
      </StepCard>

      <StepCard
        step={3}
        title={t`Marcar transacciones legacy`}
        description={t`Marca como legacyBridge los depósitos y retiros pendientes o en proceso creados antes del corte. Primero simule; la ejecución real solo se habilita con los mismos datos de la simulación.`}
      >
        <div className="space-y-2">
          <Label htmlFor="cutover-created-before">
            <Trans>Creadas antes de</Trans>
          </Label>
          <Input
            id="cutover-created-before"
            type="datetime-local"
            value={cutoffLocal}
            onChange={(event) => setCutoffLocal(event.target.value)}
            className="w-64"
          />
          {cutoffLocal && !cutoff ? (
            <p className="text-xs text-destructive">
              <Trans>Ingrese una fecha válida que no esté en el futuro.</Trans>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!canDryRun}
            onClick={() => setPendingAction('flag-dry-run')}
          >
            <Trans>Simular (dry run)</Trans>
          </Button>
          <Button
            variant="destructive"
            disabled={!canRealRun}
            onClick={() => setPendingAction('flag-run')}
          >
            <Trans>Ejecutar marcado</Trans>
          </Button>
        </div>
        {dryRun ? (
          <p className="text-sm">
            {dryRun.signature === signature ? (
              <Trans>Simulación: se marcarían {dryRun.count} transacciones.</Trans>
            ) : (
              <Trans>
                Los datos cambiaron desde la simulación; vuelva a simular antes de
                ejecutar.
              </Trans>
            )}
          </p>
        ) : null}
        {flaggedCount !== null ? (
          <p className="text-sm font-medium">
            <Trans>Transacciones marcadas: {flaggedCount}</Trans>
          </p>
        ) : null}
      </StepCard>

      <StateChangeConfirmationModal
        open={pendingAction !== null}
        onClose={closeModal}
        onConfirm={handleConfirm}
        selectedCount={copy?.count ?? 0}
        fromState={copy?.from ?? ''}
        toState={copy?.to ?? ''}
        entityType="ops"
        entityLabel={copy?.label ?? ''}
        entityLabelPlural={copy?.plural ?? ''}
        showReason={false}
        loading={isSubmitting}
      />
    </div>
  );
}
