/**
 * NextStepsCard
 *
 * Smart card rendered at the top of the receive flow. It reads the
 * customer's KYC snapshot FRESH from the provider (via `useKycNextSteps`)
 * and decides — from `next_step.code`, `requirements.missing.fields` and
 * `tos.accepted` — exactly what the customer must do to finish enabling
 * their receive rails, then renders the actionable UI inline:
 *
 *   - `external_account`  → inline rail-specific `<ExternalAccountForm>`
 *     (replaces the old "go to /suite/send" CTA — the user never leaves
 *     the receive context).
 *   - `id_verification`   → a button that opens the KYC link served by
 *     `getBridgeKycStatus` (the same query `useKYC` polls app-wide, so the
 *     request dedups against the existing cache).
 *   - ToS not accepted    → a button to the provider's ToS URL.
 *
 * When everything is already satisfied the card renders `null` so the
 * currency selector below is the only thing the customer sees.
 *
 * No backend contract is changed — this only composes existing queries
 * (`customers_refreshKycSnapshot`, `getBridgeKycStatus`) and the existing
 * `beneficiaries_create` mutation.
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trans } from '@lingui/react/macro';
import {
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  ShieldCheck,
} from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/hooks/use-auth';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useKycNextSteps } from '@/shared/hooks/use-kyc-next-steps';
import { GetKycStatusDocument } from '@/graphql/queries/customers/get-kyc-status';
import {
  ExternalAccountForm,
  type ExternalAccountRail,
} from './external-account-form';

const SUPPORTED_RAILS: ReadonlySet<string> = new Set<ExternalAccountRail>([
  'ach_wire',
  'sepa',
  'spei',
  'pix',
  'faster_payments',
]);

function resolveRail(rail: string | null | undefined): ExternalAccountRail | null {
  if (!rail) return null;
  const normalized = rail.toLowerCase();
  return SUPPORTED_RAILS.has(normalized) ? (normalized as ExternalAccountRail) : null;
}

export const NextStepsCard: React.FC<{ className?: string }> = ({ className }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const customerId = user?.customer_profile_id;

  const { nextStep, missingFields, snapshot, isLoading, refetch } = useKycNextSteps();

  // Provider ToS comes straight off the snapshot — no extra request.
  const tosAccepted = snapshot?.tos?.accepted ?? true;
  const tosUrl = snapshot?.tos?.url ?? null;
  const needsTos = !tosAccepted && Boolean(tosUrl);

  const needsIdVerification = missingFields.includes('id_verification');

  const railCode = resolveRail(nextStep?.rail);
  const isExternalAccount =
    nextStep?.code === 'external_account' && railCode !== null;

  // KYC link from getBridgeKycStatus — only fetched when the verify CTA
  // will actually be shown. Shares the ['kyc-status', customerId] cache
  // key with the app-wide useKYC poller, so this usually resolves from
  // cache without a new request.
  const kycStatusQuery = useGraphQLQuery(
    ['kyc-status', customerId],
    GetKycStatusDocument,
    { customerId: customerId ?? '' },
    { enabled: Boolean(customerId) && needsIdVerification },
  );
  const kycLink = kycStatusQuery.data?.getBridgeKycStatus.kyc_link ?? null;
  const isKycLinkLoading = needsIdVerification && kycStatusQuery.isLoading;

  // A next_step that isn't one of the inline-handled codes (e.g. a pending
  // document). We fall back to a "complete verification" CTA so the card
  // is never a dead end.
  const hasGenericNextStep =
    Boolean(nextStep) && !isExternalAccount && !needsTos && !needsIdVerification;

  const hasActionable =
    isExternalAccount || needsTos || needsIdVerification || hasGenericNextStep;

  const openKycLink = () => {
    if (kycLink) {
      window.open(kycLink, '_blank', 'noopener,noreferrer');
      return;
    }
    // No hosted link available — send the user to the in-app verification hub.
    navigate('/suite/settings');
  };

  if (isLoading) {
    return (
      <div className={cn('w-full max-w-[560px] mx-auto', className)}>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!hasActionable) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('w-full max-w-[560px] mx-auto', 'rounded-xl bg-brand-gradient p-px', className)}
    >
      <div className="rounded-xl bg-card p-5 md:p-6 space-y-4">
        <header className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">
            <Trans>Próximos pasos</Trans>
          </h2>
        </header>

        {/* Primary: inline external-account form for the pending rail. */}
        {isExternalAccount && railCode ? (
          <ExternalAccountForm
            rail={railCode}
            prefill={snapshot?.prefill}
            onSuccess={() => {
              void refetch();
            }}
          />
        ) : null}

        {/* Fallback: a next step we don't render inline (e.g. a document). */}
        {hasGenericNextStep ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <Trans>Completa la verificación para seguir operando.</Trans>
            </p>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => navigate('/suite/settings')}
            >
              <Trans>Completar verificación</Trans>
            </Button>
          </div>
        ) : null}

        {/* ToS acceptance — external link. */}
        {needsTos ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">
              <Trans>Acepta los términos del servicio</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Necesario para habilitar tus rails de pago. Se abre en una pestaña nueva.
              </Trans>
            </p>
            <Button
              type="button"
              variant="gradient"
              className="rounded-lg"
              onClick={() => {
                if (tosUrl) {
                  window.open(tosUrl, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <FileText className="h-4 w-4" aria-hidden />
              <Trans>Aceptar términos</Trans>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        ) : null}

        {/* Identity verification — opens the Persona KYC link. */}
        {needsIdVerification ? (
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">
              <Trans>Verifica tu identidad</Trans>
            </p>
            <p className="text-xs text-muted-foreground">
              <Trans>
                Completa la verificación KYC. El link se abre en una pestaña nueva.
              </Trans>
            </p>
            <Button
              type="button"
              variant="gradient"
              className="rounded-lg"
              onClick={openKycLink}
              disabled={isKycLinkLoading}
            >
              {isKycLinkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <ShieldCheck className="h-4 w-4" aria-hidden />
              )}
              <Trans>Verificar identidad</Trans>
              {!isKycLinkLoading ? <ExternalLink className="h-3.5 w-3.5" aria-hidden /> : null}
            </Button>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};
