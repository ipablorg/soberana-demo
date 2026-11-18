/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act, isValidElement, cloneElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyIdentityPage from '../verify-identity-page';

const navigateMock = vi.fn();
const refreshSnapshotMock = vi.fn(async () => undefined);
const useBridgeKycMock = vi.fn();
const useAuthMock = vi.fn();

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function translate(message: TemplateStringsArray | string, ...values: unknown[]) {
  if (message && typeof message === 'object' && 'message' in message) {
    const richMessage = message as { message?: unknown; id?: unknown };
    return String(richMessage.message ?? richMessage.id ?? '');
  }

  if (typeof message === 'string') {
    return message;
  }

  if (!Array.isArray(message)) {
    return String(message ?? '');
  }

  return message.reduce(
    (result, chunk, index) => result + chunk + String(values[index] ?? ''),
    '',
  );
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('@lingui/react', () => ({
  useLingui: () => ({
    t: translate,
    _: translate,
  }),
  I18nProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/modules/suite-user/features/account', () => ({
  useBridgeKYC: () => useBridgeKycMock(),
}));

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/shared/components/common/PageHeader', () => ({
  PageHeader: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));

vi.mock('@/shared/components/common/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}));

vi.mock('@/shared/components/animated-icons', () => {
  const Icon = ({ className }: { className?: string }) => <svg data-icon="mock" className={className} />;

  return {
    AlertTriangle: Icon,
    Clock: Icon,
    ExternalLink: Icon,
    Loader2: Icon,
    Mail: Icon,
    RefreshCw: Icon,
    Shield: Icon,
    XCircle: Icon,
  };
});

vi.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => <section className={className}>{children}</section>,
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) => <header className={className}>{children}</header>,
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ asChild, children, ...props }: { asChild?: boolean; children: ReactNode } & Record<string, unknown>) => {
    if (asChild && isValidElement(children)) {
      return cloneElement(children, props);
    }

    return <button {...props}>{children}</button>;
  },
}));

vi.mock('../../components/verify-identity/verify-identity-wizard', () => ({
  VerifyIdentityWizard: ({ onComplete }: { onComplete?: () => void }) => (
    <div data-testid="verify-identity-wizard">
      <p>Verification form is available.</p>
      <button type="button" onClick={onComplete}>Continue verification</button>
    </div>
  ),
}));

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

const mountedRoots: RenderResult[] = [];

async function render(ui: ReactNode): Promise<RenderResult> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(ui);
  });

  const result = { container, root };
  mountedRoots.push(result);
  return result;
}

function queryByText(container: HTMLElement, text: string): HTMLElement | null {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find((element) => (
    element.textContent?.includes(text)
  )) ?? null;
}

function createSnapshot(
  lifecycle: 'REJECTED' | 'EXPIRED' | 'FAILED' | 'APPROVED' | 'ADDITIONAL_INFO_REQUIRED' | 'PENDING_REVIEW' | 'INITIATED' | 'NOT_INITIATED',
  actions: Array<'resume' | 'retry' | 'reconcile' | 'contact_support' | 'accept_tos'>,
) {
  return {
    lifecycle,
    actions,
      tos: { accepted: true, url: null as string | null },
    requirements: {
      missing: {
        fields: [],
        document_purposes: [],
        questionnaire_fields: [],
      },
      pending: [],
      issues: [],
    },
    reasons: [
      {
        code: 'retryable_issue',
        target_type: 'customer',
        target_key: 'customer',
        message: 'Please update your verification details.',
        retryable: actions.includes('retry') || actions.includes('resume'),
      },
    ],
    freshness: {
      snapshot_generated_at: '2026-06-26T12:00:00.000Z',
      provider_checked_at: '2026-06-26T12:00:00.000Z',
      webhook_updated_at: null,
      last_reconciliation_source: 'resume',
      reconciliation_state: 'fresh',
    },
  };
}

function buildBridgeKycState({
  lifecycle,
  actions,
  isKYCApproved = false,
  isKYCInReview = false,
  hasSubmittedIdentityProgress = true,
  customerId = 'cust_123',
  tosAccepted = true,
  tosLink = null,
}: {
  lifecycle: 'REJECTED' | 'EXPIRED' | 'FAILED' | 'APPROVED' | 'ADDITIONAL_INFO_REQUIRED' | 'PENDING_REVIEW' | 'INITIATED' | 'NOT_INITIATED';
  actions: Array<'resume' | 'retry' | 'reconcile' | 'contact_support' | 'accept_tos'>;
  isKYCApproved?: boolean;
  isKYCInReview?: boolean;
  hasSubmittedIdentityProgress?: boolean;
  customerId?: string | null;
  tosAccepted?: boolean | null;
  tosLink?: string | null;
}) {
  const snapshot = createSnapshot(lifecycle, actions);
  snapshot.tos = { accepted: tosAccepted ?? false, url: tosLink };

  return {
    customerType: 'individual',
    isKYCApproved,
    isKYCInReview,
    isKYCExpired: lifecycle === 'EXPIRED',
    isKYCFailed: lifecycle === 'FAILED',
    isKYCRejected: lifecycle === 'REJECTED',
    isLoading: false,
    isRefreshingSnapshot: false,
    kycStatus: lifecycle,
    customerStatus: 'under_manual_review',
    needsKycRetry: actions.includes('retry'),
    needsKycResume: actions.includes('resume'),
    needsManualRefresh: actions.includes('reconcile'),
    missingDocumentPurposes: [],
    missingFields: [],
    missingQuestionnaireFields: [],
    refreshSnapshot: refreshSnapshotMock,
    reasons: snapshot.reasons.map((reason) => reason.message),
    snapshot,
    supportHref: 'mailto:legal@loopay.com?subject=KYC%20support%20request',
    tosAccepted,
    tosLink,
    hasSubmittedIdentityProgress,
    isReadyForSuite: isKYCApproved && !actions.includes('reconcile'),
    isBusinessHostedLinkOnly: false,
    onboardingMode: 'api',
    lastReconciliationSource: snapshot.freshness.last_reconciliation_source,
    data: {
      rejectionReasons: snapshot.reasons.map((reason) => reason.message),
    },
    customerId,
  };
}

describe('VerifyIdentityPage behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
    refreshSnapshotMock.mockClear();
    useAuthMock.mockReturnValue({
      user: {
        company_name: 'Loopay Labs',
      },
    });
  });

  afterEach(async () => {
    while (mountedRoots.length > 0) {
      const mounted = mountedRoots.pop();

      if (!mounted) {
        continue;
      }

      await act(async () => {
        mounted.root.unmount();
      });

      mounted.container.remove();
    }

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it.each([
    ['REJECTED', ['retry'], 'Verification rejected', 'Retry is available from the verification form below.'],
    ['EXPIRED', ['resume'], 'Verification expired', 'Resume is available from the verification form below.'],
    ['FAILED', ['retry'], 'Verification paused', 'Retry is available from the verification form below.'],
  ] as const)(
    'keeps %s recovery executable from the verify identity page',
    async (lifecycle, actions, headline, recoveryMessage) => {
      useBridgeKycMock.mockReturnValue(buildBridgeKycState({ lifecycle, actions: [...actions] }));

      const { container } = await render(<VerifyIdentityPage />);

      expect(container.textContent).toContain(headline);
      expect(container.textContent).toContain('Podés reintentar desde el formulario de abajo.');
      expect(container.textContent).toContain(recoveryMessage);
      expect(queryByText(container, 'Verification form is available.')).not.toBeNull();
    },
  );

  it('keeps first-create users on the verification wizard entry point', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'NOT_INITIATED',
      actions: [],
      hasSubmittedIdentityProgress: false,
      isKYCInReview: false,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(queryByText(container, 'Verification form is available.')).not.toBeNull();
    expect(container.textContent).not.toContain("We're reviewing your information");
    expect(container.textContent).not.toContain('Finalizing your verification');
  });

  it('keeps actionable resume users on the wizard so subset or proactive questionnaire logic can run', async () => {
    const state = buildBridgeKycState({
      lifecycle: 'ADDITIONAL_INFO_REQUIRED',
      actions: ['resume'],
      hasSubmittedIdentityProgress: true,
    });

    state.missingQuestionnaireFields = ['source_of_funds'] as typeof state.missingQuestionnaireFields;
    state.snapshot.requirements.missing.questionnaire_fields = ['source_of_funds'] as typeof state.snapshot.requirements.missing.questionnaire_fields;

    useBridgeKycMock.mockReturnValue(state);

    const { container } = await render(<VerifyIdentityPage />);

    expect(queryByText(container, 'Verification form is available.')).not.toBeNull();
    expect(container.textContent).not.toContain('What is waiting on the provider');
  });

  it('shows an explicit support CTA when only contact_support is available', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'REJECTED',
      actions: ['contact_support'],
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(container.textContent).toContain('Si necesitás ayuda, contactá a nuestro equipo de soporte.');
    expect(container.textContent).toContain('Contact support');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();

    const supportLink = container.querySelector('a[href^="mailto:legal@loopay.com"]');
    expect(supportLink).not.toBeNull();
    expect(supportLink?.getAttribute('href')).toContain('KYC%20support%20request');
  });

  it('keeps auto-refreshing approved-but-stale users while keeping the manual fallback button', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'APPROVED',
      actions: ['reconcile'],
      isKYCApproved: true,
      isKYCInReview: false,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(navigateMock).not.toHaveBeenCalledWith('/suite/dashboard', { replace: true });
    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Finalizing your verification');
      expect(container.textContent).toContain('Your verification was approved. We keep checking automatically until your dashboard is ready. If this looks stuck, you can refresh manually.');

    await act(async () => {
      vi.advanceTimersByTime(60000);
      await Promise.resolve();
    });

    // One reconciliation on entry; later updates come from the query polling.
    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);

    const refreshButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Refresh status'));

    expect(refreshButton).toBeDefined();

    if (!refreshButton) {
      throw new Error('Refresh button was not rendered');
    }

    act(() => {
      refreshButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(2);
  });

  it('auto-refreshes actionable additional-info resume states on entry', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'ADDITIONAL_INFO_REQUIRED',
      actions: ['resume'],
      hasSubmittedIdentityProgress: true,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(queryByText(container, 'Verification form is available.')).not.toBeNull();
  });

  it('shows submitted waiting states as automatic refresh-first without exposing the form again', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'INITIATED',
      actions: [],
      hasSubmittedIdentityProgress: true,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      vi.advanceTimersByTime(60000);
      await Promise.resolve();
    });
    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Your verification was submitted');
    expect(container.textContent).toContain('Your submission was received. This page keeps checking automatically until the review progresses.');
    expect(container.textContent).toContain('Waiting for the provider to pick up your submission…');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });

  it('keeps canonical pending review on waiting UI even when legacy submitted progress is missing', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'PENDING_REVIEW',
      actions: [],
      isKYCApproved: false,
      isKYCInReview: false,
      hasSubmittedIdentityProgress: false,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("We're reviewing your information");
    expect(container.textContent).toContain("Your review is already in progress. This page updates automatically until it's complete.");
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });

  it('keeps canonical initiated reconcile states on waiting UI even when legacy submitted progress is missing', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'INITIATED',
      actions: ['reconcile'],
      isKYCApproved: false,
      isKYCInReview: false,
      hasSubmittedIdentityProgress: false,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Your verification was submitted');
    expect(container.textContent).toContain('Your submission was received. This page keeps checking automatically until the review progresses.');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });

  it('keeps approved reconcile states on finalization UI even when legacy submitted progress is missing', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'APPROVED',
      actions: ['reconcile'],
      isKYCApproved: true,
      isKYCInReview: false,
      hasSubmittedIdentityProgress: false,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Finalizing your verification');
    expect(container.textContent).toContain('Your verification was approved. We keep checking automatically until your dashboard is ready. If this looks stuck, you can refresh manually.');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });

  it('surfaces correction-focused copy when retryable requirements can be fixed in place', async () => {
    const state = buildBridgeKycState({
      lifecycle: 'REJECTED',
      actions: ['retry'],
      hasSubmittedIdentityProgress: true,
    });

    state.missingFields = ['postal_code'] as typeof state.missingFields;
    state.snapshot.requirements.missing.fields = ['postal_code'] as typeof state.snapshot.requirements.missing.fields;

    useBridgeKycMock.mockReturnValue(state);

    const { container } = await render(<VerifyIdentityPage />);

    expect(container.textContent).toContain('We restored your last submission below so you can correct only the requested items and send them again.');
    expect(container.textContent).toContain('Correct the requested items in the form below.');
  });

  it('does not auto-refresh the entry before a customer id is hydrated on reload', async () => {
    useBridgeKycMock.mockReturnValue(buildBridgeKycState({
      lifecycle: 'APPROVED',
      actions: ['reconcile'],
      isKYCApproved: true,
      customerId: null,
    }));

    const { container } = await render(<VerifyIdentityPage />);

    expect(refreshSnapshotMock).not.toHaveBeenCalled();
    expect(container.textContent).toContain('Finalizing your verification');
    expect(container.textContent).toContain('Refresh status');
    expect(container.textContent).not.toContain('No customer ID available');
  });

  it('surfaces provider-owned pending workflow items while review is in progress', async () => {
    const state = buildBridgeKycState({
      lifecycle: 'APPROVED',
      actions: ['reconcile'],
      isKYCApproved: true,
    });

    state.snapshot.requirements.pending = [
      { kind: 'review', key: 'bridge_review', status: 'under_review' },
    ] as typeof state.snapshot.requirements.pending;

    useBridgeKycMock.mockReturnValue(state);

    const { container } = await render(<VerifyIdentityPage />);

      expect(container.textContent).toContain('What is waiting on the provider');
    expect(container.textContent).toContain('Review in progress');
  });

  it('keeps approved users with workflow-only blockers in next-step review state instead of reopening the form', async () => {
    const state = buildBridgeKycState({
      lifecycle: 'APPROVED',
      actions: ['reconcile'],
      isKYCApproved: true,
      hasSubmittedIdentityProgress: true,
    });

    state.missingFields = ['external_account'] as typeof state.missingFields;
    state.snapshot.requirements.missing.fields = ['external_account'] as typeof state.snapshot.requirements.missing.fields;
    state.snapshot.requirements.pending = [
      { kind: 'field', key: 'external_account', status: 'submitted' },
    ] as typeof state.snapshot.requirements.pending;

    useBridgeKycMock.mockReturnValue(state);

    const { container } = await render(<VerifyIdentityPage />);

    expect(container.textContent).toContain('Finalizing your verification');
    expect(container.textContent).toContain('What is waiting on the provider');
    expect(container.textContent).toContain('External account setup needed');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });

  it('shows workflow-only next-step messaging for rejected external-account blockers instead of reopening the form', async () => {
    const state = buildBridgeKycState({
      lifecycle: 'REJECTED',
      actions: ['reconcile'],
      hasSubmittedIdentityProgress: true,
    });

    state.missingFields = ['external_account'] as typeof state.missingFields;
    state.snapshot.requirements.missing.fields = ['external_account'] as typeof state.snapshot.requirements.missing.fields;
    state.snapshot.requirements.pending = [
      { kind: 'field', key: 'external_account', status: 'submitted' },
    ] as typeof state.snapshot.requirements.pending;

    useBridgeKycMock.mockReturnValue(state);

    const { container } = await render(<VerifyIdentityPage />);

    expect(container.textContent).toContain('Your verification needs a provider-side next step');
    expect(container.textContent).toContain('This status is not something you can correct inside the form.');
    expect(container.textContent).toContain('External account setup needed');
    expect(queryByText(container, 'Verification form is available.')).toBeNull();
  });
});
