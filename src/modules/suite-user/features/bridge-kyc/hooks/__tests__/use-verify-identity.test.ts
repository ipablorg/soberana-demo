/* @vitest-environment jsdom */

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useVerifyIdentity } from '../use-verify-identity';

let currentKycState: ReturnType<typeof buildKycState>;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/hooks/useKYC', () => ({
  useKYC: () => currentKycState,
  isUnsupportedApiProviderError: () => false,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: undefined }),
}));

function buildKycState(overrides: Partial<ReturnType<typeof buildKycStateBase>> = {}) {
  return {
    ...buildKycStateBase(),
    ...overrides,
  } as ReturnType<typeof buildKycStateBase>;
}

function buildKycStateBase() {
  return {
    createCustomer: vi.fn(),
    customerType: 'individual',
    hasUnsupportedApiProviderFallback: false,
    isStartingTos: false,
    kycStatus: 'NOT_INITIATED' as string,
    customerCountry: null,
    missingDocumentPurposes: [] as string[],
    missingFields: [] as string[],
    missingQuestionnaireFields: [] as string[],
    needsKycResume: false,
    needsKycRetry: false,
    refreshSnapshot: vi.fn(async () => undefined),
    retryKyc: vi.fn(async () => ({ tos: { url: null } })),
    isRetryingKyc: false,
    isRefreshingSnapshot: false,
    startTos: vi.fn(async () => undefined),
    tosAccepted: true,
    tosLink: null as string | null,
    hasSubmittedIdentityProgress: false,
    unsupportedApiProviderMessage: null,
    snapshot: null,
    customerId: 'cust_123',
  };
}

interface HarnessResult {
  isProcessing: boolean;
}

function TestHarness({ onReady }: { onReady: (value: HarnessResult) => void }) {
  const result = useVerifyIdentity();

  useEffect(() => {
    onReady({ isProcessing: result.isProcessing });
  }, [onReady, result.isProcessing]);

  return React.createElement('div', { 'data-testid': 'processing-flag' }, String(result.isProcessing));
}

async function renderHookValue(state: ReturnType<typeof buildKycState>): Promise<HarnessResult> {
  currentKycState = state;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let lastValue: HarnessResult = { isProcessing: false };

  await act(async () => {
    root.render(
      React.createElement(TestHarness, {
        onReady: (value: HarnessResult) => {
          lastValue = value;
        },
      }),
    );
  });

  // Allow any pending resume-state effects to flush before unmounting.
  await act(async () => {
    await Promise.resolve();
  });

  root.unmount();
  container.remove();

  return lastValue;
}

describe('useVerifyIdentity source contract', () => {
  it('does not call the API-key retry endpoint from the SPA verify flow', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).not.toContain('/v1/customers/${customerId}/retry-kyc');
    expect(source).not.toContain('mapVerifyValuesToRetryPayload(values)');
    expect(source).toContain('retryKyc(payload)');
    expect(source).toContain('createCustomer(payload)');
    expect(source).toContain('payload.customer_type = customerType;');
  });

  it('does not submit retryKyc or createCustomer when approved users only have workflow next steps left', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('if (isApprovedWorkflowOnlyNextStep) {');
    expect(source).toContain('setSubmitted(true);');
    expect(source).toContain('return;');
  });

  it('keeps the submit path customer-bound by avoiding an eager refetch after create', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('await createCustomer(payload);');
    // No ToS step: the submit never parks the flow on a returned ToS link.
    expect(source).not.toContain('nextTosLink');
    expect(source).not.toContain('await refetch();');
  });

  it('clears expiration when the selected document semantics hide that field', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain("documentTypeShowsExpiration(watchedIssuingCountry, watchedDocumentType)");
    expect(source).toContain("form.setValue('expiration', undefined");
  });

  it('gates finish on backend-confirmed persisted progress, not local checkbox state', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const wizardPath = path.resolve(__dirname, '../../components/verify-identity/verify-identity-wizard.tsx');
    const source = fs.readFileSync(wizardPath, 'utf-8');

    expect(source).toContain('canComplete');
    expect(source).not.toContain('useState(false)');
    expect(source).not.toContain('tosAccepted');
  });

  it('keeps retryable rejected api customers on an actionable page state', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.resolve(__dirname, '../../pages/verify-identity-page.tsx');
    const source = fs.readFileSync(pagePath, 'utf-8');

    expect(source).toContain('hasExecutableRecovery ? (');
    expect(source).toContain('<VerifyIdentityWizard />');
    expect(source).toContain('Correct the requested items in the form below.');
  });

  it('wires explicit support escalation for contact_support snapshots', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.resolve(__dirname, '../../pages/verify-identity-page.tsx');
    const source = fs.readFileSync(pagePath, 'utf-8');

    expect(source).toContain('showSupportCta');
    expect(source).toContain('Contact support');
    expect(source).toContain('buildKycSupportHref');
  });

  it('routes remediation resumes back to form steps instead of forcing the review step', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('hasOutstandingRemediationRequirements');
    expect(source).toContain('setSubmitted(false);');
    expect(source).toContain('setStepIndex(nextStepIndex);');
  });

  it('starts fresh verify-identity users with empty country-derived defaults until real data hydrates', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('defaultValues: DEFAULT_VALUES');
    expect(source).not.toContain('nationality: iso3Country');
    expect(source).not.toContain('country: iso3Country');
    expect(source).not.toContain('issuing_country: iso3Country');
  });

  it('always exposes the full questionnaire field set regardless of flow', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('const effectiveQuestionnaireFields = useMemo(');
    expect(source).toContain('() => [...DEFAULT_SOF_QUESTIONNAIRE_FIELDS],');
    expect(source).toContain('[],');
  });

  it('uses buildVerifyIdentitySchema through zodResolver and exposes effectiveQuestionnaireFields to the wizard', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('buildVerifyIdentitySchema');
    expect(source).toContain('const schema = useMemo(');
    expect(source).toContain('() => buildVerifyIdentitySchema(effectiveQuestionnaireFields),');
    expect(source).toContain('resolver: zodResolver(schema),');
    expect(source).toContain('effectiveQuestionnaireFields,');
  });

  it('keeps waiting and reconcile states on a controlled auto-refresh loop', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const pagePath = path.resolve(__dirname, '../../pages/verify-identity-page.tsx');
    const source = fs.readFileSync(pagePath, 'utf-8');

    expect(source).toContain('const isAutoRefreshInFlight = useRef(false);');
    expect(source).toContain('shouldAutoRefreshVerifyIdentityEntry');
    expect(source).toContain('const shouldKeepAutoRefreshing =');
    expect(source).toContain('window.setTimeout(runRefreshLoop, 15000);');
  });
});

describe('useVerifyIdentity isProcessing', () => {
  it('imports KYC_TERMINAL_LIFECYCLES from the feature lib and derives isProcessing from submitted, kycStatus, and ToS state', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const hookPath = path.resolve(__dirname, '../use-verify-identity.ts');
    const source = fs.readFileSync(hookPath, 'utf-8');

    expect(source).toContain('KYC_TERMINAL_LIFECYCLES');
    expect(source).toContain("from '../lib/kyc-snapshot-state'");
    expect(source).toContain('const isProcessing = useMemo(');
    expect(source).toContain('!KYC_TERMINAL_LIFECYCLES.includes(kycStatus)');
    expect(source).toContain('isProcessing,');
  });

  it('returns isProcessing true after submission while kycStatus is non-terminal and ToS is not required', async () => {
    const result = await renderHookValue(
      buildKycState({
        kycStatus: 'PENDING_REVIEW',
        needsKycResume: true,
        hasSubmittedIdentityProgress: true,
        tosAccepted: true,
      }),
    );

    expect(result.isProcessing).toBe(true);
  });

  it('returns isProcessing false for terminal kycStatus', async () => {
    const result = await renderHookValue(
      buildKycState({
        kycStatus: 'APPROVED',
        needsKycResume: true,
        hasSubmittedIdentityProgress: true,
        tosAccepted: true,
      }),
    );

    expect(result.isProcessing).toBe(false);
  });

  it('keeps processing even if the backend still returns a ToS link (the ToS step no longer exists)', async () => {
    const result = await renderHookValue(
      buildKycState({
        kycStatus: 'PENDING_REVIEW',
        needsKycResume: true,
        hasSubmittedIdentityProgress: true,
        tosAccepted: false,
        tosLink: 'https://tos.test/accept',
      }),
    );

    expect(result.isProcessing).toBe(true);
  });

  it('keeps processing (no ToS step) under manual review even when tos.accepted is false', async () => {
    const result = await renderHookValue(
      buildKycState({
        kycStatus: 'PENDING_REVIEW',
        needsKycResume: true,
        hasSubmittedIdentityProgress: true,
        tosAccepted: false,
        tosLink: null,
      }),
    );

    expect(result.isProcessing).toBe(true);
  });
});
