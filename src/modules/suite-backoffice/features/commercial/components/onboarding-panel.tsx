/**
 * Per-provider onboarding status, attempt history and actions for one client.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type { ClientProviderOnboarding } from '@/graphql/queries/admin-commercial';
import { Loader2, RefreshCw } from '@/shared/components/animated-icons';
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
import { mapError } from '@/shared/lib/error-mapper';

import {
  EMPTY_CELL,
  formatOpsDateTime,
  formatOpsText,
} from '../../ops-review/lib/ops-formatting';
import {
  useClientProviderOnboarding,
  useLinkProviderManually,
  useOnboardClientToProviders,
  useRetryProviderOnboarding,
} from '../hooks/use-commercial';
import {
  buildManualLinkVariables,
  canLinkManually,
  ONBOARDING_PROVIDERS,
  canRetryProvider,
  onboardingBadgeVariant,
  pendingProviders,
  summarizeJson,
} from '../lib/commercial-logic';
import { actorLabel, onboardingStatusLabel } from '../lib/commercial-labels';
import { describeMissingMestaFields } from '../lib/mesta-labels';
import { LinkManuallyDialog } from './link-manually-dialog';
import { MestaCompleteProfileDialog } from './mesta-complete-profile-dialog';

const MISSING_FIELDS_CODE = 'VALIDATION_MISSING_FIELDS';

/** Data the provider reported missing in its latest attempt (empty otherwise). */
function missingFieldsOf(row: ClientProviderOnboarding): readonly string[] {
  if (row.lastErrorCode !== MISSING_FIELDS_CODE) return [];
  const latest = row.attempts[row.attempts.length - 1];

  return latest?.missingFields ?? [];
}

function ProviderCard({
  row,
  busy,
  onRetry,
  onLink,
  onCompleteProfile,
}: {
  row: ClientProviderOnboarding;
  busy: boolean;
  onRetry: (provider: string) => void;
  onLink: (provider: string) => void;
  onCompleteProfile: (missing: readonly string[]) => void;
}) {
  const { t } = useLingui();
  // Only Mesta takes a company profile; a retry cannot fix missing data.
  const missing = row.providerCode === 'mesta' ? missingFieldsOf(row) : [];
  const needsProfile = canRetryProvider(row.status) && missing.length > 0;

  return (
    <section
      className="rounded-xl border border-border p-4 space-y-4"
      data-testid={`provider-${row.providerCode}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold uppercase">{row.providerCode}</h3>
          <Badge variant={onboardingBadgeVariant(row.status)}>
            {onboardingStatusLabel(row.status, (d) => t(d))}
          </Badge>
        </div>
        <div className="flex gap-2">
          {needsProfile ? (
            <Button size="sm" disabled={busy} onClick={() => onCompleteProfile(missing)}>
              <Trans>Completar perfil y reintentar</Trans>
            </Button>
          ) : null}
          {canRetryProvider(row.status) && !needsProfile ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onRetry(row.providerCode)}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              <Trans>Reintentar</Trans>
            </Button>
          ) : null}
          {canLinkManually(row.status) ? (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onLink(row.providerCode)}
            >
              <Trans>Vincular manualmente</Trans>
            </Button>
          ) : null}
        </div>
      </header>

      {needsProfile ? (
        <p role="alert" className="text-sm text-destructive">
          {describeMissingMestaFields(missing, (d) => t(d))}
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">
            <Trans>ID de cliente en el proveedor</Trans>
          </dt>
          <dd className="font-mono tabular-nums">{formatOpsText(row.providerCustomerId)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            <Trans>Último error</Trans>
          </dt>
          <dd className="font-mono">{formatOpsText(row.lastErrorCode)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">
            <Trans>Vinculado el</Trans>
          </dt>
          <dd>{formatOpsDateTime(row.linkedAt)}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">
          <Trans>Intentos</Trans>
        </h4>
        {row.attempts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            <Trans>Aún no hay intentos</Trans>
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Trans>#</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Actor</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Cuándo</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Código de error</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Solicitud</Trans>
                </TableHead>
                <TableHead>
                  <Trans>Respuesta</Trans>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {row.attempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-mono tabular-nums">{attempt.attemptNo}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {actorLabel(attempt.actorUserId)}
                  </TableCell>
                  <TableCell>{formatOpsDateTime(attempt.createdAt)}</TableCell>
                  <TableCell className="font-mono">{attempt.errorCode ?? EMPTY_CELL}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs">
                    {summarizeJson(attempt.requestSummary)}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-xs">
                    {summarizeJson(attempt.responseSummary)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}

export function OnboardingPanel({ clientId }: { clientId: string }) {
  const { t } = useLingui();
  const [linkProvider, setLinkProvider] = useState<string | null>(null);
  const [completing, setCompleting] = useState<readonly string[] | null>(null);

  const { data, isLoading, error, refetch } = useClientProviderOnboarding(clientId);
  const onboardAll = useOnboardClientToProviders(clientId);
  const retry = useRetryProviderOnboarding(clientId, () => setCompleting(null));
  const link = useLinkProviderManually(clientId, () => setLinkProvider(null));

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="onboarding-skeleton">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
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

  const rows = data?.adminLoopay_clientProviderOnboarding ?? [];
  // Providers skipped at creation have no row yet: they can still be started.
  const pending = [
    ...pendingProviders(rows),
    ...ONBOARDING_PROVIDERS.filter((p) => !rows.some((row) => row.providerCode === p)),
  ];
  const busy = onboardAll.isPending || retry.isPending || link.isPending;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          disabled={busy || pending.length === 0}
          onClick={() => onboardAll.mutate({ clientId, providers: null })}
        >
          {onboardAll.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          <Trans>Iniciar onboarding de pendientes</Trans>
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t`Aún no se ha intentado el onboarding de este cliente`}
        </p>
      ) : (
        rows.map((row) => (
          <ProviderCard
            key={row.id}
            row={row}
            busy={busy}
            onRetry={(provider) => retry.mutate({ clientId, provider })}
            onLink={setLinkProvider}
            onCompleteProfile={setCompleting}
          />
        ))
      )}

      {completing ? (
        <MestaCompleteProfileDialog
          clientId={clientId}
          missingFields={completing}
          isPending={retry.isPending}
          onClose={() => setCompleting(null)}
          onSubmit={(onboardingProfile) =>
            retry.mutate({ clientId, provider: 'mesta', onboardingProfile })
          }
        />
      ) : null}

      <LinkManuallyDialog
        key={linkProvider ?? 'closed'}
        provider={linkProvider}
        isPending={link.isPending}
        onClose={() => setLinkProvider(null)}
        onSubmit={(input) =>
          linkProvider
            ? link.mutate(buildManualLinkVariables(clientId, linkProvider, input))
            : undefined
        }
      />
    </div>
  );
}
