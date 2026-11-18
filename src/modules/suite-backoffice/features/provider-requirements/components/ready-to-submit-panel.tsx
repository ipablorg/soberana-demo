/**
 * "Listos para enviar al proveedor": one line per endorsement with approved
 * items, its "Enviar al proveedor" action and the outcome of the last send
 * (how many went out, the status, and the provider's error when it refused).
 */

import { Plural, Trans } from '@lingui/react/macro';

import type { AdminProviderRequirementSubmitResult } from '@/graphql/types/admin-loopay';
import { Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';

import type { ProviderRequirementRow } from '../lib/provider-requirement-rows';
import { useSubmitErrorText } from '../lib/submit-error';

export interface ReadyEndorsement {
  endorsementId: string;
  customerName: string;
  clientName: string;
  providerLabel: string;
  railLabel: string;
  approved: number;
}

/**
 * Approved rows grouped by endorsement, in first-seen order. Provider-console
 * items are completed at the provider, so they are never sent (T-S21C).
 */
export function groupReadyEndorsements(
  rows: readonly ProviderRequirementRow[]
): ReadyEndorsement[] {
  const groups = new Map<string, ReadyEndorsement>();
  for (const row of rows) {
    if (row.status !== 'APPROVED' || row.providerConsole) continue;
    const current = groups.get(row.endorsementId);
    if (current) {
      current.approved += 1;
      continue;
    }
    groups.set(row.endorsementId, {
      endorsementId: row.endorsementId,
      customerName: row.customerName,
      clientName: row.clientName,
      providerLabel: row.providerLabel,
      railLabel: row.railLabel,
      approved: 1,
    });
  }
  return [...groups.values()];
}

interface ReadyToSubmitPanelProps {
  endorsements: readonly ReadyEndorsement[];
  results: Readonly<Record<string, AdminProviderRequirementSubmitResult>>;
  /** Endorsement being sent right now, if any. */
  pendingId: string | null;
  onSubmit: (endorsementId: string) => void;
}

function SubmitOutcome({ result }: { result: AdminProviderRequirementSubmitResult }) {
  const describeSubmitError = useSubmitErrorText();

  if (result.errorMessage) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm"
      >
        <p className="font-medium text-destructive">
          <Trans>El proveedor no aceptó el envío</Trans>
        </p>
        <p className="mt-1 break-words text-muted-foreground">
          {describeSubmitError(result.errorMessage)}
        </p>
      </div>
    );
  }

  return (
    <p role="status" className="text-sm text-muted-foreground">
      <Plural value={result.submitted} one="# enviado" other="# enviados" /> · {result.status}
    </p>
  );
}

export function ReadyToSubmitPanel({
  endorsements,
  results,
  pendingId,
  onSubmit,
}: ReadyToSubmitPanelProps) {
  const sent = Object.keys(results).filter(
    (id) => !endorsements.some((endorsement) => endorsement.endorsementId === id)
  );

  if (endorsements.length === 0 && sent.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">
        <Trans>Listos para enviar al proveedor</Trans>
      </h2>
      <ul className="space-y-3">
        {endorsements.map((endorsement) => (
          <li
            key={endorsement.endorsementId}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{endorsement.customerName}</p>
              <p className="text-xs text-muted-foreground">
                {endorsement.clientName} · {endorsement.providerLabel} · {endorsement.railLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                <Plural
                  value={endorsement.approved}
                  one="# requerimiento aprobado"
                  other="# requerimientos aprobados"
                />
              </p>
              {results[endorsement.endorsementId] ? (
                <SubmitOutcome result={results[endorsement.endorsementId]} />
              ) : null}
            </div>
            <Button
              size="sm"
              disabled={endorsement.approved === 0 || pendingId !== null}
              onClick={() => onSubmit(endorsement.endorsementId)}
              className="shrink-0"
            >
              {pendingId === endorsement.endorsementId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              <Trans>Enviar al proveedor</Trans>
            </Button>
          </li>
        ))}
        {sent.map((id) => (
          <li key={id} className="rounded-xl border border-border bg-card p-4">
            <SubmitOutcome result={results[id]} />
          </li>
        ))}
      </ul>
    </section>
  );
}
