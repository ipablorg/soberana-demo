/**
 * #411 Setup screen (presentational): the client checklist top to bottom, each
 * line done or "missing, go here". The last line is informational.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

import { readinessIssueKeyLabel } from '../../platform-config/lib/readiness-issues';
import type { SetupReadinessIssueKey, SetupStep, SetupTab } from '../lib/client-setup';

interface SetupChecklistProps {
  steps: readonly SetupStep[];
  onGoTo: (tab: SetupTab) => void;
  /** Readiness findings no step reports (wallet defaults, wallet provider...). */
  issues?: readonly SetupReadinessIssueKey[];
  /** Where the client's name, tax id and country are edited; null when the viewer cannot. */
  clientEditHref?: string | null;
}

function StepStatusBadge({ step }: { step: SetupStep }) {
  if (step.status === 'done') {
    return (
      <Badge variant="success">
        <Trans>Listo</Trans>
      </Badge>
    );
  }
  if (step.status === 'pending') {
    return (
      <Badge variant="secondary">
        <Trans>Pendiente</Trans>
      </Badge>
    );
  }

  return (
    <Badge variant="warning">
      <Trans>Falta</Trans>
    </Badge>
  );
}

export function SetupChecklist({
  steps,
  onGoTo,
  issues = [],
  clientEditHref = null,
}: SetupChecklistProps) {
  const { t } = useLingui();
  const required = steps.filter((step) => !step.informational);
  const doneCount = required.filter((step) => step.status === 'done').length;
  const total = required.length;

  const title = (step: SetupStep): string => {
    switch (step.id) {
      case 'client':
        return t`Cliente creado`;
      case 'providers':
        return t`Registrado en los proveedores de sus rieles`;
      case 'rails':
        return t`Rieles habilitados`;
      case 'fees':
        return t`Tarifas de depósito y retiro`;
      case 'api-key':
        return t`API key emitida`;
      case 'first-customer':
        return t`Primer usuario aprobado y primera cuenta virtual (informativo)`;
    }
  };

  const detail = (step: SetupStep): string => {
    if (step.status === 'missing' && step.reason === 'client-not-active') {
      return t`Cliente no activo: actívalo para evaluar sus proveedores y rieles.`;
    }
    if (step.status === 'missing' && step.reason === 'dead-provider-junctions') {
      return t`El cliente aún tiene rieles activos con proveedores retirados: ejecuta el cutover de proveedores retirados.`;
    }
    switch (step.id) {
      case 'client':
        return step.status === 'done'
          ? t`Nombre, identificación tributaria y país registrados.`
          : t`Faltan el nombre, la identificación tributaria o el país del cliente.`;
      case 'providers': {
        if (step.status === 'done')
          return t`El cliente está registrado donde sus rieles lo necesitan.`;
        const providers = (step.missingProviders ?? []).join(', ');
        return providers
          ? t`Falta registrarlo en: ${providers}.`
          : t`Aún no está registrado en ningún proveedor.`;
      }
      case 'rails':
        return step.status === 'done'
          ? t`El cliente tiene rieles activos.`
          : t`Habilita al menos un riel (país, moneda y dirección).`;
      case 'fees':
        return step.status === 'done'
          ? t`Hay tarifa de depósito y de retiro.`
          : t`Falta la tarifa de depósito, la de retiro o ambas.`;
      case 'api-key':
        return step.status === 'done'
          ? t`El cliente ya tiene API key.`
          : t`Genera la API key para que el cliente pueda integrarse.`;
      case 'first-customer': {
        const customer = step.firstCustomerApproved
          ? t`Primer usuario aprobado: sí.`
          : t`Primer usuario aprobado: todavía no.`;
        const account = step.firstVirtualAccountOpen
          ? t`Primera cuenta virtual abierta: sí.`
          : t`Primera cuenta virtual abierta: todavía no.`;
        return `${customer} ${account}`;
      }
    }
  };

  const actionLabel = (tab: SetupTab): string => {
    switch (tab) {
      case 'onboarding':
        return t`Ir a onboarding`;
      case 'operation':
        return t`Ir a rieles`;
      case 'fees':
        return t`Ir a tarifas`;
      case 'api-key':
        return t`Ir a API key`;
    }
  };

  return (
    <section
      className="space-y-4 rounded-xl border border-border p-4"
      data-testid="setup-checklist"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">
          <Trans>Configuración del cliente</Trans>
        </h3>
        <span className="text-sm text-muted-foreground" data-testid="setup-progress">
          <Trans>
            {doneCount} de {total} pasos listos
          </Trans>
        </span>
      </header>
      <ol className="divide-y divide-border rounded-lg border border-border">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            data-testid={`setup-step-${step.id}`}
            data-status={step.status}
          >
            <div className="min-w-0 space-y-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <span className="text-muted-foreground tabular-nums">{index + 1}.</span>
                {title(step)}
                <StepStatusBadge step={step} />
              </p>
              <p className="text-sm text-muted-foreground">{detail(step)}</p>
            </div>
            {step.id === 'client' && step.status === 'missing' && clientEditHref ? (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 self-start sm:self-center"
              >
                <Link to={clientEditHref}>
                  <Trans>Editar en Clientes</Trans>
                </Link>
              </Button>
            ) : null}
            {step.actionTab ? (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 self-start sm:self-center"
                onClick={() => step.actionTab && onGoTo(step.actionTab)}
              >
                {actionLabel(step.actionTab)}
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
      {issues.length > 0 ? (
        <div className="space-y-1" data-testid="setup-readiness-issues">
          <p className="text-sm font-medium">
            <Trans>Otros problemas de preparación</Trans>
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {issues.map((issue, index) => (
              <li key={`${index}:${issue.key}`}>{readinessIssueKeyLabel(issue, t)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
