/**
 * KYC Banner Component
 *
 * Onboarding banner shown on /suite/dashboard whenever the user has not
 * completed the two onboarding steps:
 *
 *   1. Accepting the Terms of Service (`auth_me.has_accepted_latest_terms`)
 *   2. Completing KYC verification (`getBridgeKycStatus.kyc_status` === APPROVED)
 *
 * The card always exposes BOTH CTAs (Terms first, KYC second) so the user
 * can act on either step independently. Each button is link-driven —
 * clicking it opens the external flow (Bridge ToS / Persona KYC) in a new
 * tab and starts a per-button cooldown so the user gets immediate feedback
 * ("En proceso…") while they finish the action elsewhere.
 *
 * Once KYC is approved AND terms are accepted the banner unmounts entirely,
 * unless a VA provider asked for documents (S21): then it shows the
 * "Documentos requeridos" state (REQUESTED or REJECTED requirements, with the
 * reject reason) and opens the upload dialog.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Loader2,
  XCircle,
} from '@/shared/components/animated-icons';
import type { IconComponent } from '@/shared/components/animated-icons';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge, type BadgeProps } from '@/shared/components/ui/badge';
import { useBridgeKYC } from '@/modules/suite-user/features/account';
import { isApiKycEnabled } from '@/shared/lib/kyc/create-customer-input';
import { useAuth } from '@/shared/hooks/use-auth';
import { useCustomerProviderRequirements } from '@/shared/hooks/use-provider-requirements';
import { requirementsAwaitingCustomer } from '@/shared/lib/provider-requirements';
import { ProviderRequirementsDialog } from './provider-requirements/provider-requirements-dialog';
import { ProviderRequirementsNotice } from './provider-requirements/provider-requirements-notice';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';

/**
 * Cooldown applied to each onboarding CTA after the user opens the
 * external link. Provides visible feedback ("En proceso…") while they
 * finish the flow elsewhere and avoids accidentally spawning multiple
 * verification tabs in a row when they bounce back to the dashboard.
 *
 * Persisted per-button in `localStorage` so the disabled state survives
 * full page refreshes and route changes back into /suite/dashboard.
 */
const COOLDOWN_MS = 5 * 60 * 1000;

const TOS_CLICK_KEY = 'dashboard_tos_clicked_at';
const KYC_CLICK_KEY = 'dashboard_kyc_clicked_at';

function readTimestamp(key: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function writeTimestamp(key: string, ts: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, String(ts));
}

interface CtaCooldown {
  isCoolingDown: boolean;
  start: () => void;
}

/**
 * Tracks an external-CTA cooldown backed by localStorage so the
 * disabled state survives reloads. Auto-expires via setTimeout when
 * the remaining window elapses, so consumers don't need to poll.
 */
function useCtaCooldown(storageKey: string): CtaCooldown {
  const [clickedAt, setClickedAt] = useState<number | null>(() => {
    const stored = readTimestamp(storageKey);
    if (stored == null) return null;
    if (Date.now() >= stored + COOLDOWN_MS) return null;
    return stored;
  });

  useEffect(() => {
    if (clickedAt == null) return;
    const remaining = clickedAt + COOLDOWN_MS - Date.now();
    if (remaining <= 0) {
      setClickedAt(null);
      return;
    }
    const id = window.setTimeout(() => {
      setClickedAt(null);
    }, remaining + 50);
    return () => window.clearTimeout(id);
  }, [clickedAt]);

  const isCoolingDown = clickedAt != null && Date.now() < clickedAt + COOLDOWN_MS;

  const start = useCallback(() => {
    const ts = Date.now();
    writeTimestamp(storageKey, ts);
    setClickedAt(ts);
  }, [storageKey]);

  return { isCoolingDown, start };
}

interface StatusConfig {
  icon: IconComponent;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
  badge: { label: string; variant: BadgeProps['variant'] };
}

export function KYCBanner() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    customerId,
    kycStatus,
    reasons,
    supportHref,
    tosLink,
    isKYCApproved,
    isKYCExpired,
    isKYCFailed,
    startKYC,
    startTos,
    isStartingTos,
    isStartingKyc,
    isRefreshingSnapshot,
    isPollingSnapshot,
    isCustomerInitialized,
    isReadyForSuite,
    isBusinessHostedLinkOnly,
    needsKycRetry,
    needsManualRefresh,
    refreshSnapshot,
    tosFlowMode,
    tosAccepted,
    hasTaxId,
    hasAddress,
    onboardingMode,
    lastReconciliationSource,
    needsSupport,
  } = useBridgeKYC();

  const tosCooldown = useCtaCooldown(TOS_CLICK_KEY);
  const kycCooldown = useCtaCooldown(KYC_CLICK_KEY);

  // Provider requirements (S21): documents a VA provider still needs.
  const { data: requirementsData } = useCustomerProviderRequirements(customerId);
  const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);
  const awaitingRequirements = requirementsAwaitingCustomer(
    requirementsData?.customers_providerRequirements ?? [],
  );

  if (customerId && awaitingRequirements.length > 0) {
    return (
      <>
        <ProviderRequirementsNotice
          requirements={awaitingRequirements}
          onOpen={() => setIsRequirementsOpen(true)}
        />
        <ProviderRequirementsDialog
          open={isRequirementsOpen}
          onOpenChange={setIsRequirementsOpen}
          customerId={customerId}
          requirements={awaitingRequirements}
        />
      </>
    );
  }

  const hasAcceptedTerms = tosAccepted ?? user?.has_accepted_latest_terms ?? false;
  const tosComesAfterIdentity = tosFlowMode === 'wait_for_api_customer';
  const isRejectedApiFlow = isApiKycEnabled() && kycStatus === 'REJECTED';
  const hasExistingCustomer = Boolean(customerId);

  // Banner unmounts entirely when both onboarding steps are complete.
  // We still show it if KYC is approved but terms weren't refreshed
  // (rare but possible after a ToS version bump).
  if (isKYCApproved && hasAcceptedTerms && isReadyForSuite) return null;

  // ── CTA visibility ────────────────────────────────────────────────
  // ToS button: when the backend already knows the customer-level ToS state,
  // let that state drive whether we still need a resume CTA.
  const showTosButton = !tosComesAfterIdentity && (
    hasExistingCustomer
      ? tosAccepted !== true
      : (!hasAcceptedTerms || Boolean(tosLink))
  );

  // KYC button: render until KYC is approved. The button stays disabled
  // until `has_accepted_latest_terms` is true so Bridge receives ToS
  // before KYC.
  const showKycButton = !isKYCApproved;

  if (!showTosButton && !showKycButton) return null;

  // ── Status presentation ───────────────────────────────────────────
  // The visual treatment is driven by the most "active" pending step.
  // While terms remain unaccepted we surface the ToS visual (Step 1
  // of 2). Once they're accepted, the KYC status drives the look.
  const statusConfig: Record<string, StatusConfig> = {
    NOT_INITIATED: {
      icon: AlertCircle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      title: t`Verificación de identidad pendiente`,
      description: t`Para operar debes completar la verificación KYC. Es rápido y seguro.`,
      badge: { label: t`Paso 2 de 2`, variant: 'secondary' },
    },
    INITIATED: {
      icon: Clock,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      title: t`Verificación en progreso`,
      description: t`Completa el proceso de verificación para poder operar.`,
      badge: { label: t`En progreso`, variant: 'secondary' },
    },
    PENDING_REVIEW: {
      icon: Clock,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border',
      title: t`Verificación en revisión`,
      description: t`Estamos revisando tus documentos. Te notificaremos cuando el proceso esté completo.`,
      badge: { label: t`En revisión`, variant: 'secondary' },
    },
    ADDITIONAL_INFO_REQUIRED: {
      icon: AlertCircle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      title: t`Información adicional requerida`,
      description: t`Necesitamos información adicional para completar tu verificación.`,
      badge: { label: t`Info requerida`, variant: 'warning' },
    },
    REJECTED: {
      icon: XCircle,
      iconColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/20',
      title: t`Verificación rechazada`,
      description: t`Encontramos un problema con tu verificación. Actualizá el estado o contactá a soporte si el resultado persiste.`,
      badge: { label: t`Rechazada`, variant: 'destructive' },
    },
    EXPIRED: {
      icon: XCircle,
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      borderColor: 'border-border',
      title: t`Verificación expirada`,
      description: t`Tu sesión de verificación expiró. Abrí de nuevo el flujo y continuá desde donde te quedaste.`,
      badge: { label: t`Expirada`, variant: 'secondary' },
    },
    FAILED: {
      icon: AlertCircle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      title: t`Verificación detenida`,
      description: t`No pudimos completar la verificación automáticamente. Actualizá el estado, y si persiste contactá a soporte.`,
      badge: { label: t`Atención`, variant: 'warning' },
    },
      APPROVED: {
        icon: CheckCircle,
        iconColor: 'text-success',
        bgColor: 'bg-success/10',
        borderColor: 'border-success/20',
        title: t`Verificación completada`,
        description: isReadyForSuite
          ? t`Tu cuenta está verificada. Puedes usar todos los servicios.`
          : t`Tu identidad fue aprobada, pero aún esperamos la confirmación de disponibilidad antes de desbloquear el suite.`,
        badge: { label: t`Aprobada`, variant: 'default' },
      },
  };

  const termsConfig: StatusConfig = {
    icon: FileText,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/20',
    title: t`Completa tu onboarding`,
    description: t`Acepta los términos y condiciones y completa la verificación de identidad para empezar a operar.`,
    badge: { label: t`Paso 1 de 2`, variant: 'secondary' },
  };

  const config: StatusConfig = !hasAcceptedTerms
    ? termsConfig
    : statusConfig[kycStatus] ?? statusConfig.NOT_INITIATED;
  const Icon = config.icon;

  // ── KYC label ─────────────────────────────────────────────────────
  // The KYC button label adapts to the current status so the user knows
  // whether they're starting, resuming or restarting the flow.
  const kycLabel: string = (() => {
    switch (kycStatus) {
      case 'NOT_INITIATED':
        return t`Iniciar verificación`;
      case 'REJECTED':
        return needsKycRetry ? t`Reintentar verificación` : t`Continuar verificación`;
      case 'EXPIRED':
        return t`Reiniciar verificación`;
      case 'FAILED':
        return t`Reanudar verificación`;
      case 'PENDING_REVIEW':
      case 'ADDITIONAL_INFO_REQUIRED':
      case 'INITIATED':
      default:
        return t`Continuar verificación`;
    }
  })();

  // Step gating — KYC button stays disabled until terms are accepted, so
  // Bridge always receives the ToS event before the KYC event arrives.
  const kycLocked = !tosComesAfterIdentity && !hasAcceptedTerms;
  const isTosBusy = isStartingTos || tosCooldown.isCoolingDown;
  const isKycBusy = isStartingKyc || kycCooldown.isCoolingDown;
  const isKycUnavailable = kycLocked || isKycBusy || (isRejectedApiFlow && !needsKycRetry && !needsManualRefresh);

  const handleTosClick = () => {
    if (isTosBusy) return;
    tosCooldown.start();
    // Existing customers resume with their customer-bound tos_link.
    // Standalone ToS-link generation is reserved for flows without a customer yet.
    void startTos();
  };

  const handleKycClick = () => {
    if (isKycUnavailable) return;
    // In-app api method: drive the user into the embedded Verify Identity
    // wizard instead of opening a hosted Bridge/Persona link.
    if (isApiKycEnabled()) {
      navigate('/suite/verify-identity');
      return;
    }
    kycCooldown.start();
    // startKYC() opens kyc_link directly when available, otherwise falls
    // back to the customer-creation or ToS-link chain.
    void startKYC();
  };

  const handleRefreshClick = () => {
    if (isRefreshingSnapshot) return;
    void refreshSnapshot();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card className={`${config.bgColor} ${config.borderColor} border rounded-xl`}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className={`rounded-full p-3 ${config.bgColor} border ${config.borderColor}`}>
              <Icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{config.title}</h3>
                <Badge variant={config.badge.variant}>{config.badge.label}</Badge>
                {isPollingSnapshot && (
                  <span
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                    aria-live="polite"
                    title={t`Checking verification status…`}
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t`Checking…`}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{config.description}</p>

              {kycStatus === 'APPROVED' && !isReadyForSuite && (
                <div className="rounded-lg bg-card/70 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{t`Approval received — final sync still pending`}</p>
                  <p className="mt-1">
                    {t`We already received Bridge approval, but Loopay still needs a fresh readiness snapshot before opening transactional pages.`}
                  </p>
                  {lastReconciliationSource && (
                    <p className="mt-2 text-xs">{t`Last reconciliation source:`} {lastReconciliationSource}</p>
                  )}
                </div>
              )}

              {isBusinessHostedLinkOnly && (
                <div className="rounded-lg bg-card/70 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{t`Business onboarding uses the hosted verification link`}</p>
                  <p className="mt-1">
                    {t`For business accounts, Loopay only supports the hosted verification handoff in this first release.`}
                  </p>
                </div>
              )}

              {reasons.length > 0 && (isKYCExpired || isKYCFailed || kycStatus === 'REJECTED' || kycStatus === 'ADDITIONAL_INFO_REQUIRED') && (
                <div className="rounded-lg bg-card/70 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{t`Motivos pendientes`}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sequence hint — explicit because Bridge never pushes back
                  to the frontend; the user must complete step 1 before
                  step 2 is available. */}
              {!isKYCApproved && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground/80">
                    {!hasAcceptedTerms
                      ? tosComesAfterIdentity
                        ? t`Completa la verificación de identidad. Si Bridge requiere términos, te los mostraremos al final del flujo.`
                        : t`Primero acepta los términos. Cuando Bridge confirme, podrás iniciar la verificación.`
                      : !isReadyForSuite && isKYCApproved
                        ? t`Identity is approved. Refresh the snapshot until Loopay confirms your suite access is ready.`
                        : isBusinessHostedLinkOnly || onboardingMode === 'kyc_link'
                          ? t`Continue with the hosted verification link to finish your business onboarding.`
                          : t`Términos aceptados. Continúa con la verificación de identidad y espera la confirmación.`}
                  </p>

                  {/* Onboarding progress — shows what's pending when the
                      customer already exists but hasn't completed KYC */}
                  {isCustomerInitialized && (tosAccepted !== null || hasTaxId !== null || hasAddress !== null) && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {tosAccepted === false && (
                        <Badge variant="outline" className="text-xs">
                          {t`TyC pendientes`}
                        </Badge>
                      )}
                      {tosAccepted === true && (
                        <Badge variant="outline" className="text-xs border-success/40 text-success">
                          {t`TyC aceptados`}
                        </Badge>
                      )}
                      {hasTaxId === false && (
                        <Badge variant="outline" className="text-xs">
                          {t`ID fiscal pendiente`}
                        </Badge>
                      )}
                      {hasAddress === false && (
                        <Badge variant="outline" className="text-xs">
                          {t`Dirección pendiente`}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CTA row — Terms first, then KYC, per onboarding order. */}
              <div className="flex flex-wrap gap-2 pt-1">
                {showTosButton && (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="gap-1.5"
                    disabled={isTosBusy}
                    onClick={handleTosClick}
                  >
                    {isStartingTos
                      ? t`Generando enlace…`
                      : tosCooldown.isCoolingDown
                        ? t`Esperando confirmación…`
                        : hasAcceptedTerms
                          ? t`Revisar términos`
                          : t`1. Aceptar términos`}
                    {!isTosBusy && <ExternalLink className="h-3.5 w-3.5" />}
                  </Button>
                )}

                {showKycButton && (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="gap-1.5"
                    disabled={isKycUnavailable}
                    onClick={handleKycClick}
                    aria-disabled={isKycUnavailable}
                    title={
                      isRejectedApiFlow
                        ? t`Refresh first. If Bridge still blocks retry, support will help you continue.`
                        : kycLocked
                          ? t`Acepta los términos para habilitar este paso.`
                          : undefined
                    }
                  >
                    {kycLocked
                      ? t`2. Verificación (bloqueado)`
                      : isStartingKyc
                        ? t`Preparando verificación…`
                        : kycCooldown.isCoolingDown
                          ? t`Esperando confirmación…`
                          : tosComesAfterIdentity
                            ? kycLabel
                            : `2. ${kycLabel}`}
                    {!isKycUnavailable && (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                  </Button>
                )}

                {needsManualRefresh && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleRefreshClick}
                    disabled={isRefreshingSnapshot}
                  >
                    {isRefreshingSnapshot ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {t`Refresh status`}
                  </Button>
                )}

                {needsSupport && supportHref && (
                  <Button asChild type="button" variant="outline" size="sm" className="gap-1.5">
                    <a href={supportHref} target="_blank" rel="noreferrer">
                      {t`Contact support`}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
