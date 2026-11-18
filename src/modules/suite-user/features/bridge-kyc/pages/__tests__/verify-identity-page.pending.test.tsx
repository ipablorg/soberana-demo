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

  return message.reduce((result, chunk, index) => result + chunk + String(values[index] ?? ''), '');
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
  const Icon = ({ className }: { className?: string }) => (
    <svg data-icon="mock" className={className} />
  );

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
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <section className={className}>{children}</section>
  ),
  CardContent: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: ReactNode; className?: string }) => (
    <header className={className}>{children}</header>
  ),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({
    asChild,
    children,
    ...props
  }: { asChild?: boolean; children: ReactNode } & Record<string, unknown>) => {
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
      <button type="button" onClick={onComplete}>
        Continue verification
      </button>
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
  return (
    Array.from(container.querySelectorAll<HTMLElement>('*')).find((element) =>
      element.textContent?.includes(text)
    ) ?? null
  );
}

function createSnapshot(
  lifecycle:
    | 'REJECTED'
    | 'EXPIRED'
    | 'FAILED'
    | 'APPROVED'
    | 'ADDITIONAL_INFO_REQUIRED'
    | 'PENDING_REVIEW'
    | 'INITIATED'
    | 'NOT_INITIATED',
  actions: Array<'resume' | 'retry' | 'reconcile' | 'contact_support' | 'accept_tos'>
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
  customerType = 'individual',
  tosAccepted = true,
  tosLink = null,
}: {
  lifecycle:
    | 'REJECTED'
    | 'EXPIRED'
    | 'FAILED'
    | 'APPROVED'
    | 'ADDITIONAL_INFO_REQUIRED'
    | 'PENDING_REVIEW'
    | 'INITIATED'
    | 'NOT_INITIATED';
  actions: Array<'resume' | 'retry' | 'reconcile' | 'contact_support' | 'accept_tos'>;
  isKYCApproved?: boolean;
  isKYCInReview?: boolean;
  hasSubmittedIdentityProgress?: boolean;
  customerId?: string | null;
  customerType?: 'individual' | 'business';
  tosAccepted?: boolean | null;
  tosLink?: string | null;
}) {
  const snapshot = createSnapshot(lifecycle, actions);
  snapshot.tos = { accepted: tosAccepted ?? false, url: tosLink };

  return {
    customerType,
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
    // New identity on every call, exactly like the real hook, to catch effect loops.
    refreshSnapshot: () => refreshSnapshotMock(),
    reasons: snapshot.reasons.map((reason) => reason.message),
    snapshot,
    supportHref: 'mailto:legal@loopay.com?subject=KYC%20support%20request',
    tosAccepted,
    tosLink,
    hasSubmittedIdentityProgress,
    isReadyForSuite: isKYCApproved && !actions.includes('reconcile'),
    isBusinessHostedLinkOnly: customerType === 'business',
    onboardingMode: 'api',
    lastReconciliationSource: snapshot.freshness.last_reconciliation_source,
    data: {
      rejectionReasons: snapshot.reasons.map((reason) => reason.message),
    },
    customerId,
  };
}

describe('VerifyIdentityPage pending review (manual KYC)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockReset();
    refreshSnapshotMock.mockClear();
    useAuthMock.mockReturnValue({ user: { company_name: 'Loopay Labs' } });
  });

  afterEach(async () => {
    while (mountedRoots.length > 0) {
      const mounted = mountedRoots.pop();
      if (!mounted) continue;
      await act(async () => {
        mounted.root.unmount();
      });
      mounted.container.remove();
    }
    vi.useRealTimers();
  });

  it.each(['individual', 'business'] as const)(
    'shows the same clean review screen for a %s pending review, without wizard, overlay or ToS',
    async (customerType) => {
      useBridgeKycMock.mockReturnValue(
        buildBridgeKycState({
          lifecycle: 'PENDING_REVIEW',
          actions: [],
          customerType,
          tosAccepted: false,
          hasSubmittedIdentityProgress: true,
        })
      );

      const { container } = await render(<VerifyIdentityPage />);

      expect(container.textContent).toContain("We're reviewing your information");
      expect(queryByText(container, 'Verification form is available.')).toBeNull();
      expect(container.textContent).not.toContain('Terms of Service');
      expect(container.querySelector('[role="status"].fixed')).toBeNull();
    }
  );

  it('refreshes the snapshot once on entry and never loops with an unstable refresh identity', async () => {
    useBridgeKycMock.mockImplementation(() =>
      buildBridgeKycState({
        lifecycle: 'PENDING_REVIEW',
        actions: [],
        customerType: 'business',
        tosAccepted: false,
      })
    );

    const { rerender } = await renderWithRerender(<VerifyIdentityPage />);

    for (let i = 0; i < 5; i += 1) {
      await rerender(<VerifyIdentityPage />);
    }
    await act(async () => {
      vi.advanceTimersByTime(120000);
      await Promise.resolve();
    });

    expect(refreshSnapshotMock).toHaveBeenCalledTimes(1);
  });
});

async function renderWithRerender(ui: ReactNode) {
  const result = await render(ui);
  return {
    ...result,
    rerender: async (next: ReactNode) => {
      await act(async () => {
        result.root.render(next);
      });
    },
  };
}
