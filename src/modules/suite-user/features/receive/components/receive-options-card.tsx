/**
 * ReceiveOptionsCard
 *
 * "Where do you want to receive?" Countries with their rails, each with a
 * status chip. An available rail has a one-click "Solicitar cuenta"; a
 * requested one shows what is blocking it; an active one already appears with
 * its bank details in the account list on the left.
 */

import { Trans, useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';

import { AlertCircle, Loader2, Plus } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useKYC } from '@/shared/hooks/useKYC';
import { mapError } from '@/shared/lib/error-mapper';
import {
  isRailUnderMaintenance,
  readServerErrorCode,
} from '@/modules/suite-user/features/beneficiaries/lib/rail-maintenance';

import { useReceiveOptions, useRequestVirtualAccount } from '../hooks/use-receive-options';
import {
  canRequest,
  groupReceiveOptions,
  isEligible,
  normalizeReceiveStatus,
  optionKey,
  type ReceiveOption,
  type ReceiveStatus,
} from '../lib/receive-options';

type ChipKind = ReceiveStatus | 'maintenance' | 'unavailable';

const STATUS_VARIANT: Record<ChipKind, 'success' | 'warning' | 'outline' | 'destructive' | 'secondary'> = {
  maintenance: 'secondary',
  unavailable: 'secondary',
  active: 'success',
  requested: 'warning',
  available: 'outline',
  rejected: 'destructive',
};

function StatusChip({ option, kind }: { option: ReceiveOption; kind: ChipKind }) {
  const { t } = useLingui();
  const label = {
    active: t`Activa`,
    requested: t`En proceso`,
    available: t`Disponible`,
    rejected: t`No aprobada`,
    maintenance: t`En mantenimiento`,
    unavailable: t`No disponible`,
  }[kind];

  return (
    <Badge
      variant={STATUS_VARIANT[kind]}
      data-status={kind}
      title={kind === 'rejected' ? (option.reason ?? undefined) : undefined}
    >
      {label}
    </Badge>
  );
}

export function ReceiveOptionsCard() {
  const { t } = useLingui();
  const { customerType } = useKYC();
  const options = useReceiveOptions();
  const request = useRequestVirtualAccount();
  const businessOnlyMessage = t`Las cuentas virtuales están disponibles solo para empresas, incluidas las empresas unipersonales.`;

  const pendingKey =
    request.isPending && request.variables
      ? optionKey({
          country: request.variables.country,
          currency: request.variables.currency,
          railCode: request.variables.railCode,
        })
      : null;

  const handleRequest = (option: ReceiveOption) => {
    request.mutate(
      { country: option.country, currency: option.currency, railCode: option.railCode },
      {
        onSuccess: (result) => {
          toast.success(
            result.created
              ? t`Pedimos tu cuenta en ${option.railName}. Te avisamos cuando esté lista.`
              : t`Ya la habías pedido. Seguimos con ${option.railName}.`,
          );
        },
        onError: (error) => {
          const code = readServerErrorCode(error);
          if (code === 'VA_BUSINESS_ONLY') {
            toast.error(businessOnlyMessage);
          } else if (code === 'RAIL_UNDER_MAINTENANCE') {
            toast.error(t`Esta ruta está en mantenimiento. Pronto la habilitamos.`);
          } else {
            toast.error(mapError(error).message);
          }
        },
      },
    );
  };

  if (options.isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent data-testid="receive-options-loading" className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (options.error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base">
                <Trans>No pudimos cargar los países disponibles.</Trans>
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{mapError(options.error).message}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const groups = groupReceiveOptions(options.data ?? []);
  const showBusinessOnlyNote =
    customerType !== 'business' &&
    groups.some((group) =>
      group.options.some((o) => canRequest(o) && !isRailUnderMaintenance(o.railCode)),
    );

  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            <Trans>Todavía no hay países para recibir.</Trans>
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            <Trans>Cuando habilitemos nuevas rutas las verás aquí.</Trans>
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="text-base">
          <Trans>Recibe en más países.</Trans>
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          <Trans>Pide una cuenta en la ruta que necesites. Te mostramos en qué va cada una.</Trans>
        </p>
        {showBusinessOnlyNote && (
          <p className="mt-2 text-sm text-muted-foreground">{businessOnlyMessage}</p>
        )}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto">
        {groups.map((group) => (
          <section key={group.country} aria-label={group.label} className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">{group.label}</h3>
            {group.options.map((option) => {
              const key = optionKey(option);
              const status = normalizeReceiveStatus(option.status);
              const isPending = pendingKey === key;
              const maintenance = isRailUnderMaintenance(option.railCode);
              const eligible = isEligible(option, customerType);
              const requestable = canRequest(option) && !maintenance && eligible;
              const kind: ChipKind = maintenance
                ? 'maintenance'
                : canRequest(option) && !eligible
                  ? 'unavailable'
                  : status;

              return (
                <div key={key} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{option.railName}</p>
                      <p className="text-xs text-muted-foreground">{option.currency}</p>
                    </div>
                    <StatusChip option={option} kind={kind} />
                    {requestable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-request
                        className="shrink-0 gap-1.5"
                        disabled={isPending || request.isPending}
                        onClick={() => handleRequest(option)}
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                        <Trans>Solicitar cuenta</Trans>
                      </Button>
                    )}
                  </div>

                  {kind === 'maintenance' && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <Trans>Esta ruta está en mantenimiento. Pronto la habilitamos.</Trans>
                    </p>
                  )}
                  {kind === 'unavailable' && option.ineligibleReason && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {option.ineligibleReason === 'VA_BUSINESS_ONLY'
                        ? businessOnlyMessage
                        : option.ineligibleReason}
                    </p>
                  )}
                  {status === 'requested' && !maintenance && option.blockers.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {option.blockers.map((blocker) => (
                        <li key={blocker.code}>{blocker.message}</li>
                      ))}
                    </ul>
                  )}
                  {status === 'requested' && !maintenance && option.blockers.length === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <Trans>Estamos preparando tu cuenta. Te avisamos cuando esté lista.</Trans>
                    </p>
                  )}
                  {status === 'active' && !maintenance && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <Trans>Tus datos bancarios están en la lista de cuentas.</Trans>
                    </p>
                  )}
                  {status === 'rejected' && !maintenance && option.reason && (
                    <p className="mt-2 text-xs text-destructive">{option.reason}</p>
                  )}
                </div>
              );
            })}
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
