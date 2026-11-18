/**
 * VaRequestStatus
 *
 * Lifecycle view for a requested virtual-account rail, replacing the
 * old generic "pending" copy. Renders the four customer-facing steps
 * (solicitud → revisión de operaciones → onboarding → activa) with the
 * current phase derived from backend truth (`status` + `readiness` +
 * `artifact_type` via `resolveVaRequestLifecycle`), plus an explicit
 * blocker panel when the request is stuck (rejected, frozen,
 * additional info, unavailable) — the user always learns WHAT is in
 * the way, never a vague "en espera".
 *
 * Recovery links (kyc / tos) from the endorsement response render as
 * continuation buttons so the user can unblock themselves.
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import { Trans, useLingui } from '@lingui/react/macro';
import { Ban, Check, Clock, Construction, Snowflake } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';
import {
  getVaRailCatalogEntry,
  getVaRailDisplayName,
} from '@/shared/lib/va-rail-catalog';
import {
  resolveVaRequestLifecycle,
  VA_REQUEST_STEPS,
  type VaBlockerReason,
  type VaRequestStep,
} from '@/shared/lib/va-request-lifecycle';
import type { UserAccount } from './hooks/use-user-accounts';

export interface VaRequestStatusProps {
  account: UserAccount;
  className?: string;
}

const stepLabel = (
  step: VaRequestStep,
  t: (strings: TemplateStringsArray, ...values: unknown[]) => string,
): string => {
  switch (step) {
    case 'request':
      return t`Solicitud`;
    case 'ops_review':
      return t`Revisión`;
    case 'onboarding':
      return t`Onboarding`;
    case 'active':
    default:
      return t`Activa`;
  }
};

function BlockerPanel({ blocker }: { blocker: VaBlockerReason }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3',
        blocker === 'rejected'
          ? 'border-destructive/20 bg-destructive/10'
          : 'border-warning/20 bg-warning/10',
      )}
    >
      <span className="mt-0.5 shrink-0">
        <BlockerIcon blocker={blocker} />
      </span>
      <div className="min-w-0">
        {blocker === 'additional_info' ? (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Necesitamos más información</Trans>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Trans>
                El equipo de operaciones necesita datos adicionales para continuar
                con tu solicitud. Te contactaremos para completarlos.
              </Trans>
            </p>
          </>
        ) : blocker === 'rejected' ? (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Solicitud rechazada</Trans>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Trans>
                Tu solicitud para este rail fue rechazada. Si crees que es un
                error, contacta a soporte.
              </Trans>
            </p>
          </>
        ) : blocker === 'frozen' ? (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Rail congelado</Trans>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Trans>
                Este rail está temporalmente congelado. Contacta a soporte para
                conocer los detalles.
              </Trans>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Rail no disponible</Trans>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <Trans>
                Este rail no está disponible actualmente. Puedes usar otros rails
                o contactar soporte.
              </Trans>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function BlockerIcon({ blocker }: { blocker: VaBlockerReason }) {
  if (blocker === 'frozen') {
    return <Snowflake className="h-4 w-4 text-warning" aria-hidden />;
  }
  if (blocker === 'unavailable') {
    return <Construction className="h-4 w-4 text-warning" aria-hidden />;
  }
  return <Ban className="h-4 w-4 text-destructive" aria-hidden />;
}

export const VaRequestStatus: React.FC<VaRequestStatusProps> = ({
  account,
  className,
}) => {
  const { t } = useLingui();

  const lifecycle = React.useMemo(
    () =>
      resolveVaRequestLifecycle({
        status: account.endorsementStatus,
        readiness: account.readiness,
        artifactType: account.artifactType,
        hasActiveDeposit:
          account.status === 'active' && account.deposit !== null,
      }),
    [account],
  );

  const catalogEntry = getVaRailCatalogEntry(account.paymentRail);
  const railDisplayName =
    catalogEntry?.name ?? getVaRailDisplayName(account.paymentRail) ?? account.paymentRail;
  const flag = catalogEntry?.flag ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn('rounded-xl border border-border bg-muted/30 p-4 md:p-5', className)}
    >
      <div className="flex items-center gap-2">
        {flag ? (
          <span aria-hidden className="text-base leading-none" role="img">
            {flag}
          </span>
        ) : null}
        <p className="text-sm font-medium text-foreground">
          {railDisplayName} · {account.currency}
        </p>
      </div>

      {/* Step tracker: the four lifecycle steps with the current one
          highlighted. Blocked requests keep the tracker honest at the
          step where they stalled. */}
      <ol className="mt-4 flex items-center gap-1.5" aria-label={t`Estado de tu solicitud`}>
        {VA_REQUEST_STEPS.map((step, index) => {
          const isDone = index < lifecycle.stepIndex;
          const isCurrent = index === lifecycle.stepIndex && lifecycle.phase !== 'blocked';
          const isBlockedHere = index === lifecycle.stepIndex && lifecycle.phase === 'blocked';
          return (
            <li key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                aria-hidden
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold',
                  'border',
                  isDone && 'border-success/40 bg-success/15 text-success',
                  isCurrent && 'border-primary/40 bg-primary/15 text-primary',
                  isBlockedHere && 'border-warning/50 bg-warning/15 text-warning',
                  !isDone && !isCurrent && !isBlockedHere && 'border-border bg-muted text-muted-foreground',
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3" aria-hidden />
                ) : isBlockedHere ? (
                  <BlockerIcon blocker={lifecycle.blocker as VaBlockerReason} />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  'truncate text-[10px] leading-tight',
                  isDone || isCurrent || isBlockedHere
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {stepLabel(step, t)}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 space-y-1">
        {lifecycle.phase === 'ops_review' && (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Tu solicitud está en revisión</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>
                El equipo de operaciones está revisando tu solicitud de {railDisplayName}.
                Te avisamos cuando avance.
              </Trans>
            </p>
          </>
        )}

        {lifecycle.phase === 'onboarding' && (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Estamos configurando tu cuenta</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Operaciones aprobó tu solicitud. Estamos creando tu cuenta {account.currency}{' '}
                con el proveedor — los datos bancarios aparecerán aquí en cuanto estén listos.
              </Trans>
            </p>
          </>
        )}

        {lifecycle.phase === 'active' && (
          <>
            <p className="text-sm font-medium text-foreground">
              <Trans>Tu cuenta está lista</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>Los datos de depósito de este rail están disponibles arriba.</Trans>
            </p>
          </>
        )}

        {lifecycle.phase === 'blocked' && lifecycle.blocker && (
          <BlockerPanel blocker={lifecycle.blocker} />
        )}
      </div>

      {account.actionLink && (
        <button
          type="button"
          onClick={() => {
            window.open(account.actionLink?.url, '_blank', 'noopener,noreferrer');
          }}
          className={cn(
            'mt-3 inline-flex items-center rounded-md border border-border px-3 py-2',
            'text-xs font-medium text-foreground',
            'hover:bg-muted transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {account.actionLink.type === 'tos' ? (
            <Trans>Continuar con términos</Trans>
          ) : (
            <Trans>Continuar activación</Trans>
          )}
        </button>
      )}
    </motion.div>
  );
};
