import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AlertTriangle, Clock, ExternalLink, Loader2, Mail, RefreshCw, Shield, XCircle } from '@/shared/components/animated-icons';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { ThemeToggle } from '@/shared/components/common/theme-toggle';
import { useBridgeKYC } from '@/modules/suite-user/features/account';
import {
  classifyPendingWorkflowRequirements,
  isWorkflowOnlyNextStepState,
  shouldAutoRefreshVerifyIdentityEntry,
} from '../hooks/use-verify-identity-state';
import { VerifyIdentityWizard } from '../components/verify-identity/verify-identity-wizard';
import { useAuth } from '@/shared/hooks/use-auth';
import { useKycProgress } from '../hooks/use-kyc-progress';
import { formatManualReviewItemLabel } from '../lib/pending-review-label';
import { StepProgressCard } from '../components/kyc-progress';
import {
  buildKycSupportHref,
  deriveKycSnapshotState,
  formatPendingRequirementLabel,
  hasExecutableKycRecovery,
  isWorkflowOnlyKycRequirementKey,
  shouldEscalateKycToSupport,
} from '@/shared/lib/kyc/kyc-snapshot-state';

/**
 * In-app identity verification page (KYC `api` method).
 *
 * Renders the {@link VerifyIdentityWizard} so the user completes KYC entirely
 * inside the app — no hosted-link redirect. After the wizard submits the
 * `api` payload, the existing snapshot polling (via `useBridgeKYC`)
 * drives the completion UI: approved → redirect to dashboard, retry/resume →
 * reopen the actionable wizard, support-only → explicit escalation CTA. _(REQ-001, REQ-006)_
 */
export default function VerifyIdentityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    customerType,
    isKYCApproved,
    isKYCInReview,
    isKYCExpired,
    isKYCFailed,
    isKYCRejected,
    isLoading,
    isRefreshingSnapshot,
    kycStatus,
    customerStatus,
    needsKycRetry,
    needsKycResume,
    needsManualRefresh,
    missingDocumentPurposes,
    missingFields,
    missingQuestionnaireFields,
    refreshSnapshot,
    reasons,
    snapshot,
    supportHref,
    hasSubmittedIdentityProgress,
    isReadyForSuite,
    data,
    customerId,
  } = useBridgeKYC();

  const { progress, getAllStepsInfo } = useKycProgress({
    customerId: customerId ?? undefined,
    customerType,
  });

  const stepsInfo = getAllStepsInfo();

  const snapshotState = useMemo(() => deriveKycSnapshotState(snapshot, kycStatus), [snapshot, kycStatus]);
  const hasExecutableRecovery = hasExecutableKycRecovery(snapshotState);
  const isSupportOnly = shouldEscalateKycToSupport(snapshotState);
  const shouldShowSupportCta = snapshotState.needsSupport;
  // KYC is a manual review by operations: there is no provider Terms of
  // Service step, so the page never asks the user to accept one.
  const canEnterSuite = isKYCApproved && isReadyForSuite;
  const shouldAutoRefreshEntry = shouldAutoRefreshVerifyIdentityEntry({
    customerType,
    hasSubmittedIdentityProgress,
    isKYCInReview,
    kycStatus,
    needsKycResume,
    needsKycRetry,
    needsManualRefresh,
  });
  const resolvedSupportHref = supportHref ?? buildKycSupportHref({
    lifecycle: kycStatus,
    customerStatus,
    customerId,
  });
  const pendingWorkflowRaw = snapshot?.requirements.pending
    ?.filter((item) => (
      item.kind === 'review'
      || item.status === 'under_review'
      || isWorkflowOnlyKycRequirementKey(item.key)
    )) ?? [];
  const hasDuplicateNameDobCheck = pendingWorkflowRaw.some(
    (item) => item.key === 'duplicate_check_name_dob',
  );
  const pendingWorkflowItems = pendingWorkflowRaw
    .sort((a, b) => {
      if (a.key === 'duplicate_check_name_dob') return -1;
      if (b.key === 'duplicate_check_name_dob') return 1;
      return 0;
    })
    .map((item) => formatManualReviewItemLabel(item.key, formatPendingRequirementLabel('review', item.key)));
  const pendingRequirementBuckets = classifyPendingWorkflowRequirements({
    pendingRequirements: snapshot?.requirements.pending ?? [],
  });
  const editableMissingFields = missingFields.filter((field) => !isWorkflowOnlyKycRequirementKey(field));
  const workflowOnlyMissingFields = missingFields.filter((field) => isWorkflowOnlyKycRequirementKey(field));
  const hasOutstandingRequirements =
    editableMissingFields.length > 0 ||
    missingDocumentPurposes.length > 0 ||
    missingQuestionnaireFields.length > 0;
  const hasWorkflowOnlyRequirements =
    workflowOnlyMissingFields.length > 0 && !hasOutstandingRequirements;
  const hasWorkflowOnlyBlockers =
    pendingRequirementBuckets.workflow.length > 0 ||
    missingFields.some((field) => isWorkflowOnlyKycRequirementKey(field));
  const isApprovedWorkflowOnlyNextStep = isWorkflowOnlyNextStepState({
    hasWorkflowOnlyBlockers,
    hasOutstandingRequirements,
    kycStatus,
    needsTosAction: false,
  });
  const isSubmittedWaitingState =
    (hasSubmittedIdentityProgress || pendingWorkflowRaw.length > 0) &&
    kycStatus === 'INITIATED' &&
    !needsKycResume &&
    !needsKycRetry &&
    !hasOutstandingRequirements;
  const isCanonicalWaitingState =
    (kycStatus === 'PENDING_REVIEW') ||
    (
      kycStatus === 'INITIATED' &&
      needsManualRefresh &&
      !needsKycResume &&
      !needsKycRetry &&
      !hasOutstandingRequirements
    ) ||
    (isKYCApproved && needsManualRefresh);
  const isWaitingForAutomaticRefresh =
    !isKYCRejected &&
    !isKYCExpired &&
    !isKYCFailed &&
    (isSubmittedWaitingState || isKYCInReview || isCanonicalWaitingState);
  const shouldRefreshOnEntry = shouldAutoRefreshEntry || isWaitingForAutomaticRefresh;

  // Once Bridge reports APPROVED, the user is done — hand off to the dashboard.
  useEffect(() => {
    if (!isLoading && canEnterSuite) {
      navigate('/suite/dashboard', { replace: true });
    }
  }, [canEnterSuite, isLoading, navigate]);

  // One reconciliation when the page is entered. Afterwards the status and
  // snapshot queries (useKYC) poll on a backed-off interval that pauses while
  // the tab is hidden; a mutation must never run inside a polling loop.
  const refreshSnapshotRef = useRef(refreshSnapshot);
  refreshSnapshotRef.current = refreshSnapshot;
  const entryRefreshedFor = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !customerId || !shouldRefreshOnEntry) {
      return;
    }

    if (entryRefreshedFor.current === customerId) {
      return;
    }

    entryRefreshedFor.current = customerId;
    void refreshSnapshotRef.current().catch(() => {
      // Background reconciliation errors are non-critical; polling continues.
    });
  }, [customerId, isLoading, shouldRefreshOnEntry]);

  if (canEnterSuite) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-3 flex justify-end sm:mb-4">
          <ThemeToggle />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr] lg:items-start lg:gap-6">
          <div className="space-y-4">
            <WelcomeCard />
          </div>

          <div className="space-y-4 sm:space-y-6">
            {isKYCRejected || isKYCExpired || isKYCFailed ? (
              hasWorkflowOnlyBlockers && !hasExecutableRecovery ? (
                <WorkflowNextStepCard
                  lifecycle={kycStatus}
                  pendingWorkflowItems={pendingWorkflowItems}
                  onRefresh={() => void refreshSnapshot()}
                  isRefreshing={isRefreshingSnapshot}
                />
              ) : hasExecutableRecovery ? (
                <div className="space-y-4">
                  {hasDuplicateNameDobCheck && (
                    <Card className="border-warning/20 bg-warning/10">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <p className="font-medium text-foreground text-sm">Duplicate check in progress</p>
                            <p className="text-sm text-muted-foreground">We are checking if you already have an account. Please wait for this check to complete before making any changes.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <RejectionCard
                    lifecycle={kycStatus}
                    reasons={reasons.length > 0 ? reasons : data?.rejectionReasons ?? null}
                    needsManualRefresh={needsManualRefresh}
                    needsRetry={needsKycRetry}
                    needsResume={needsKycResume}
                    hasOutstandingRequirements={hasOutstandingRequirements}
                    hasExecutableRecovery={hasExecutableRecovery}
                    isSupportOnly={isSupportOnly}
                    showSupportCta={shouldShowSupportCta}
                    supportHref={resolvedSupportHref}
                    onRefresh={() => void refreshSnapshot()}
                    isRefreshing={isRefreshingSnapshot}
                  />

                  <Card className="overflow-hidden">
                    <CardContent className="p-4 sm:p-6">
                      <VerifyIdentityWizard />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <RejectionCard
                  lifecycle={kycStatus}
                  reasons={reasons.length > 0 ? reasons : data?.rejectionReasons ?? null}
                  needsManualRefresh={needsManualRefresh}
                  needsRetry={needsKycRetry}
                  needsResume={needsKycResume}
                  hasOutstandingRequirements={hasOutstandingRequirements}
                  hasExecutableRecovery={hasExecutableRecovery}
                  isSupportOnly={isSupportOnly}
                  showSupportCta={shouldShowSupportCta}
                  supportHref={resolvedSupportHref}
                  onRefresh={() => void refreshSnapshot()}
                  isRefreshing={isRefreshingSnapshot}
                />
              )
             ) : hasWorkflowOnlyRequirements ? (
               <WorkflowNextStepCard
                 lifecycle={kycStatus}
                 pendingWorkflowItems={pendingWorkflowItems}
                 onRefresh={() => void refreshSnapshot()}
                 isRefreshing={isRefreshingSnapshot}
               />
             ) : isApprovedWorkflowOnlyNextStep || isWaitingForAutomaticRefresh ? (
               <ReviewPendingCard
                 status={kycStatus}
                 needsManualRefresh={needsManualRefresh}
                 pendingWorkflowItems={pendingWorkflowItems}
                 onRefresh={() => void refreshSnapshot()}
                 isRefreshing={isRefreshingSnapshot}
               />
             ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <VerifyIdentityWizard />
                </CardContent>
              </Card>
            )}

            {user?.company_name && (
              <p className="text-center text-xs text-muted-foreground">
                {user.company_name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeCard() {
  const { t } = useLingui();

  return (
    <Card className="lg:sticky lg:top-8">
      <CardHeader className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="rounded-lg bg-primary/10 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <PageHeader
            title={t`Identity verification`}
            subtitle={t`Last step to activate your account.`}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <p className="text-sm text-muted-foreground">
          {t`To comply with international financial regulations (KYC/AML), we need to verify your identity before you can operate.`}
        </p>

        <div className="space-y-2 rounded-lg bg-muted/50 p-3 sm:p-4">
          <h3 className="font-semibold text-sm">{t`What you'll need`}</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t`A valid ID document (passport or national ID)`}</li>
            <li>{t`5-10 minutes of your time`}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Shown after the wizard submits, while `getBridgeKycStatus` polling confirms
 * the outcome. Bridge never pushes back to the frontend, so this card reflects
 * the latest polled status until it reaches a terminal state.
 */
function ReviewPendingCard({
  status,
  needsManualRefresh,
  pendingWorkflowItems,
  onRefresh,
  isRefreshing,
}: {
  status: string;
  needsManualRefresh: boolean;
  pendingWorkflowItems: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { t } = useLingui();
  const isInReview = status === 'PENDING_REVIEW';
  const isApprovedStale = status === 'APPROVED' && needsManualRefresh;
  const isSubmitted = status === 'INITIATED';

  return (
    <Card className="border-warning/20 bg-warning/10">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-warning/10 border border-warning/20 p-3">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {isApprovedStale
                ? t`Finalizing your verification`
                : isInReview
                ? t`We're reviewing your information`
                : t`Your verification was submitted`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isApprovedStale
                ? t`Your verification was approved. We keep checking automatically until your dashboard is ready. If this looks stuck, you can refresh manually.`
                : isInReview
                ? t`Your review is already in progress. This page updates automatically until it's complete.`
                : t`Your submission was received. This page keeps checking automatically until the review progresses.`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isApprovedStale
              ? t`Automatic status checks are active.`
              : isSubmitted
              ? t`Waiting for the provider to pick up your submission…`
              : t`Automatic status checks are active.`}
          </div>
          {pendingWorkflowItems.length > 0 && (
            <div className="w-full rounded-lg border border-border/60 bg-card/70 p-3 text-left text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t`What is waiting on the provider`}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {pendingWorkflowItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {needsManualRefresh && (
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onRefresh} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t`Refresh status`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Terminal state summary. Surfaces backend-provided reasons and tells the user
 * whether they can continue in-product or need support escalation.
 */
function RejectionCard({
  lifecycle,
  reasons,
  needsManualRefresh,
  needsRetry,
  needsResume,
  hasOutstandingRequirements,
  hasExecutableRecovery,
  isSupportOnly,
  showSupportCta,
  supportHref,
  onRefresh,
  isRefreshing,
}: {
  lifecycle: string;
  reasons: string[] | null;
  needsManualRefresh: boolean;
  needsRetry: boolean;
  needsResume: boolean;
  hasOutstandingRequirements: boolean;
  hasExecutableRecovery: boolean;
  isSupportOnly: boolean;
  showSupportCta: boolean;
  supportHref: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { t } = useLingui();
  const isExpired = lifecycle === 'EXPIRED';
  const isFailed = lifecycle === 'FAILED';
  const hasReasons = Boolean(reasons && reasons.length > 0);
  const canRetry = needsRetry || needsResume;

  const headline = isExpired
    ? t`Tu sesión de verificación expiró`
    : isFailed
      ? t`La verificación se detuvo`
      : t`Necesitamos que revises tu información`;

  const message = isExpired
    ? t`Tu sesión de verificación venció antes de que pudiéramos completarla. Podés reintentar desde el formulario de abajo.`
    : isFailed
      ? t`No pudimos completar la verificación de forma automática. Podés reintentar o contactar a soporte.`
      : hasReasons
        ? t`Encontramos algunos problemas con la información que nos enviaste. Revisá los motivos a continuación y corregí lo que sea necesario.`
        : t`No pudimos verificar tu identidad con la información proporcionada. Si creés que esto es un error, contactá a nuestro equipo de soporte.`;

  const isCorrectionFlow = hasExecutableRecovery && hasOutstandingRequirements;

  const cardStyle = isSupportOnly && !canRetry
    ? 'border-destructive/20 bg-destructive/10'
    : 'border-warning/20 bg-warning/10';

  const iconStyle = isSupportOnly && !canRetry
    ? 'bg-destructive/10 border-destructive/20'
    : 'bg-warning/10 border-warning/20';

  const iconColor = isSupportOnly && !canRetry
    ? 'text-destructive'
    : 'text-warning';

  const Icon = isSupportOnly && !canRetry ? XCircle : AlertTriangle;

  return (
    <Card className={cardStyle}>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`rounded-full border p-3 ${iconStyle}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{headline}</h3>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
            {!hasReasons && showSupportCta && (
              <p className="text-sm text-muted-foreground">
                {t`Nuestro equipo de soporte puede ayudarte a entender qué pasó y cómo avanzar.`}
              </p>
            )}
            {hasReasons && (
              <p className="text-sm text-muted-foreground">
                {showSupportCta
                  ? isSupportOnly
                    ? t`Si necesitás ayuda, contactá a nuestro equipo de soporte.`
                    : t`Podés corregir la información en el formulario de abajo, o contactar a soporte si necesitás ayuda.`
                  : isCorrectionFlow
                    ? t`Restauramos tu última submission para que corrijas solo lo que sea necesario y lo envíes de nuevo.`
                  : canRetry
                    ? t`Revisá los motivos y corregí lo que sea necesario en el formulario de abajo.`
                    : t`Si creés que esto es un error, contactá a nuestro equipo de soporte.`}
              </p>
            )}
          </div>

          {hasReasons && (
            <div className="w-full rounded-lg bg-card/70 p-3 text-left">
              <p className="text-sm font-medium text-foreground mb-2">{t`Motivos:`}</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                {reasons!.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            {needsManualRefresh && (
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onRefresh} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {t`Actualizar estado`}
              </Button>
            )}
            {needsRetry && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                {isCorrectionFlow ? t`Corregí los items solicitados en el formulario de abajo.` : t`Podés reintentar desde el formulario de abajo.`}
              </div>
            )}
            {needsResume && !needsRetry && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                <AlertTriangle className="h-4 w-4" />
                {isCorrectionFlow ? t`Continuá con tus correcciones en el formulario de abajo.` : t`Podés continuar desde el formulario de abajo.`}
              </div>
            )}
            {showSupportCta && (
              <Button asChild type="button" variant="outline" size="sm" className="gap-2">
                <a href={supportHref} target="_blank" rel="noreferrer">
                  <Mail className="h-4 w-4" />
                  {t`Contactar soporte`}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowNextStepCard({
  lifecycle,
  pendingWorkflowItems,
  onRefresh,
  isRefreshing,
}: {
  lifecycle: string;
  pendingWorkflowItems: string[];
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const { t } = useLingui();
  const isRejected = lifecycle === 'REJECTED';

  return (
    <Card className="border-warning/20 bg-warning/10">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-warning/10 border border-warning/20 p-3">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {isRejected
                ? t`Your verification needs a provider-side next step`
                : t`Your verification is waiting on the provider`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t`This status is not something you can correct inside the form. We keep you on this page so you can complete the next step or wait for provider processing.`}
            </p>
          </div>

          {pendingWorkflowItems.length > 0 && (
            <div className="w-full rounded-lg border border-border/60 bg-card/70 p-3 text-left text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t`What is waiting on the provider`}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {pendingWorkflowItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {t`Refresh status`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
