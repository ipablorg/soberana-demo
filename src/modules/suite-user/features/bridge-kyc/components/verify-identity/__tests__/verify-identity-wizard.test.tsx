/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VerifyIdentityWizard } from '../verify-identity-wizard';

import { i18n } from '@lingui/core';

i18n.load('es', {});
i18n.activate('es');

const refreshSnapshotMock = vi.fn(async () => undefined);
const startTosMock = vi.fn(async () => undefined);
const countryStoreMock = {
  selectedCountry: 'CO',
};

let currentKycState: ReturnType<typeof buildKycState>;
let currentCustomerProfileData: { customers_findById: Record<string, unknown> } | undefined;

const QUESTIONNAIRE_FIELD_LABELS: Record<string, string> = {
  source_of_funds: 'Source of funds',
  employment_status: 'Employment status',
  account_purpose: 'Account purpose',
  expected_monthly_payments_usd: 'Expected monthly payments',
  acting_as_intermediary: 'Are you acting as an intermediary?',
  most_recent_occupation: 'Occupation',
};

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

vi.mock('@lingui/react', () => ({
  useLingui: () => ({
    t: translate,
    _: translate,
  }),
  Trans: ({ children }: { children: ReactNode }) => children,
  I18nProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: currentCustomerProfileData,
  }),
}));

vi.mock('@/shared/hooks/useKYC', () => ({
  useKYC: () => currentKycState,
  isUnsupportedApiProviderError: () => false,
}));

vi.mock('@/shared/stores/auth-store', () => ({
  useAuthStore: (selector: (state: { user: { email: string } | null }) => unknown) =>
    selector({ user: { email: 'test@example.com' } }),
}));

vi.mock('@/shared/stores/useCountryStore', () => ({
  useCountryStore: (selector: (state: typeof countryStoreMock) => unknown) => selector(countryStoreMock),
}));

vi.mock('@/shared/components/ui/form', () => ({
  Form: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => <button {...props}>{children}</button>,
}));

vi.mock('../wizard-stepper', () => ({
  WizardStepper: ({ steps, activeIndex = 0 }: { steps: Array<{ title: string }>; activeIndex?: number }) => (
    <div data-testid="stepper">{steps[activeIndex]?.title}</div>
  ),
}));

vi.mock('@/shared/components/animated-icons', () => ({
  ChevronLeft: () => <svg data-icon="chevron-left" />,
  Loader2: () => <svg data-icon="loader" />,
}));

vi.mock('../step-personal', () => ({
  StepPersonal: ({
    form,
    requiredQuestionnaireFields = [],
  }: {
    form: {
      setValue: (field: string, value: unknown, options?: Record<string, unknown>) => void;
      formState: {
        errors: Record<string, { message?: string } | undefined>;
      };
    };
    requiredQuestionnaireFields?: string[];
  }) => {
    const errors = form.formState.errors;

    return (
      <div>
        <div>Personal step</div>

        <div data-testid="questionnaire-required-fields">
          {requiredQuestionnaireFields.map((field) => (
            <span key={field}>{QUESTIONNAIRE_FIELD_LABELS[field] ?? field}</span>
          ))}
        </div>

        <button
          type="button"
          data-testid="fill-valid-personal-fields"
          onClick={() => {
            form.setValue('birth_date', '1990-01-15', { shouldValidate: false });
            form.setValue('nationality', 'COL', { shouldValidate: false });
            form.setValue('tax_id', '900123456', { shouldValidate: false });
            form.setValue('tax_id_type', 'nit', { shouldValidate: false });
            form.setValue('source_of_funds', 'salary', { shouldValidate: false });
            form.setValue('employment_status', 'employed', { shouldValidate: false });
            form.setValue('account_purpose', 'receive_salary', { shouldValidate: false });
            form.setValue('expected_monthly_payments_usd', '5000_9999', { shouldValidate: false });
            form.setValue('most_recent_occupation', '113031', { shouldValidate: false });
          }}
        >
          Fill valid personal fields
        </button>

        <button
          type="button"
          data-testid="set-occupation-whitespace"
          onClick={() => {
            form.setValue('most_recent_occupation', '   ', { shouldValidate: false });
          }}
        >
          Set occupation whitespace
        </button>

        {errors.source_of_funds?.message && <p>{errors.source_of_funds.message}</p>}
        {errors.employment_status?.message && <p>{errors.employment_status.message}</p>}
        {errors.account_purpose?.message && <p>{errors.account_purpose.message}</p>}
        {errors.expected_monthly_payments_usd?.message && (
          <p>{errors.expected_monthly_payments_usd.message}</p>
        )}
        {errors.most_recent_occupation?.message && <p>{errors.most_recent_occupation.message}</p>}
      </div>
    );
  },
}));

vi.mock('../step-address', () => ({
  StepAddress: () => <div>Address step</div>,
}));

vi.mock('../step-document', () => ({
  StepDocument: () => <div>Document step</div>,
}));

vi.mock('../step-review', () => ({
  StepReview: () => <div>Review step</div>,
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

async function rerender(renderResult: RenderResult, ui: ReactNode): Promise<void> {
  await act(async () => {
    renderResult.root.render(ui);
  });
}

function click(element: Element): void {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

async function clickAsync(element: Element): Promise<void> {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });
}

function buildKycState(overrides: Partial<ReturnType<typeof buildKycStateBase>> = {}) {
  return {
    ...buildKycStateBase(),
    ...overrides,
  } as ReturnType<typeof buildKycStateBase>;
}

function buildKycStateBase() {
  return {
    createCustomer: vi.fn(),
    hasUnsupportedApiProviderFallback: false,
    isStartingTos: false,
    kycStatus: 'NOT_INITIATED',
    customerCountry: null,
    missingDocumentPurposes: [] as string[],
    missingFields: [] as string[],
    missingQuestionnaireFields: [] as string[],
    snapshot: null,
    customerId: 'cust_123',
    needsKycResume: false,
    needsKycRetry: false,
    refetch: vi.fn(async () => undefined),
    refreshSnapshot: refreshSnapshotMock,
    retryKyc: vi.fn(async () => ({ tos: { url: null } })),
    isRetryingKyc: false,
    isRefreshingSnapshot: false,
    startTos: startTosMock,
    tosAccepted: true,
    tosLink: null,
    hasSubmittedIdentityProgress: false,
    unsupportedApiProviderMessage: null,
  };
}

describe('VerifyIdentityWizard behavior', () => {
  beforeEach(() => {
    refreshSnapshotMock.mockClear();
    startTosMock.mockClear();
    currentCustomerProfileData = undefined;
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
  });

  it('unblocks a resumed flow when a later snapshot removes the missing requirement', async () => {
    const onComplete = vi.fn();

    currentKycState = buildKycState({
      kycStatus: 'PENDING_REVIEW',
      missingFields: ['city'],
      needsKycResume: true,
      hasSubmittedIdentityProgress: true,
      tosAccepted: true,
    });

    const rendered = await render(<VerifyIdentityWizard onComplete={onComplete} />);

    expect(rendered.container.textContent).toContain('Address step');
    expect(rendered.container.textContent).toContain('What you need to correct');
    expect(rendered.container.textContent).toContain('City');

    currentKycState = buildKycState({
      kycStatus: 'PENDING_REVIEW',
      missingFields: [],
      needsKycResume: true,
      hasSubmittedIdentityProgress: true,
      tosAccepted: true,
    });

    await rerender(rendered, <VerifyIdentityWizard onComplete={onComplete} />);

    expect(rendered.container.textContent).toContain('Review step');
    expect(rendered.container.textContent).not.toContain('What still needs attention');

    await rerender(rendered, <VerifyIdentityWizard onComplete={onComplete} />);

    expect(refreshSnapshotMock).not.toHaveBeenCalled();

    const finishButton = Array.from(rendered.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Finish'));

    expect(finishButton).toBeDefined();
    // The review step is now in a processing state while Bridge still reports PENDING_REVIEW,
    // so the finish action stays disabled until the lifecycle reaches a terminal state.
    expect(finishButton?.hasAttribute('disabled')).toBe(true);
  });

  it('shows restored-data and workflow-only blockers separately from editable requirements', async () => {
    currentCustomerProfileData = {
      customers_findById: {
        id: 'cust_123',
        email: 'ops@loopay.com',
        first_name: 'Jane',
        last_name: 'Doe',
        kyc_status: 'ADDITIONAL_INFO_REQUIRED',
        customer_status: 'pending',
        country: 'COL',
        tax_id: '900123456',
        tax_id_type: 'NIT',
        address: {
          street: 'Calle 100 #20-30',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postal_code: '110111',
        },
      },
    };

    currentKycState = buildKycState({
      needsKycResume: true,
      missingFields: ['tax_id'],
      snapshot: {
        lifecycle: 'ADDITIONAL_INFO_REQUIRED',
        actions: ['resume'],
        tos: { accepted: true, url: null },
        provider_customer_state: 'pending',
        requirements: {
          missing: {
            fields: ['tax_id'],
            document_purposes: [],
            questionnaire_fields: [],
          },
          pending: [
            { kind: 'review', key: 'bridge_review', status: 'under_review' },
          ],
          issues: [],
        },
        reasons: [],
        freshness: {
          snapshot_generated_at: '2026-06-26T10:00:00.000Z',
          provider_checked_at: null,
          webhook_updated_at: null,
          last_reconciliation_source: 'resume',
          reconciliation_state: 'fresh',
        },
      } as NonNullable<ReturnType<typeof buildKycStateBase>['snapshot']>,
    });

    const rendered = await render(<VerifyIdentityWizard />);

    expect(rendered.container.textContent).toContain('Saved data restored from your customer profile');
    expect(rendered.container.textContent).toContain('Provider workflow blockers');
    expect(rendered.container.textContent).toContain('Review in progress');
    expect(rendered.container.textContent).toContain('focus on the requested corrections before submitting again');
  });

  it('does not treat external-account workflow blockers like editable corrections', async () => {
    currentKycState = buildKycState({
      needsKycResume: true,
      hasSubmittedIdentityProgress: true,
      missingFields: ['external_account'],
      snapshot: {
        lifecycle: 'REJECTED',
        actions: ['resume', 'reconcile'],
        tos: { accepted: true, url: null },
        provider_customer_state: 'pending',
        requirements: {
          missing: {
            fields: ['external_account'],
            document_purposes: [],
            questionnaire_fields: [],
          },
          pending: [
            { kind: 'field', key: 'external_account', status: 'submitted' },
          ],
          issues: [],
        },
        reasons: [],
        freshness: {
          snapshot_generated_at: '2026-06-26T10:00:00.000Z',
          provider_checked_at: null,
          webhook_updated_at: null,
          last_reconciliation_source: 'resume',
          reconciliation_state: 'fresh',
        },
      } as NonNullable<ReturnType<typeof buildKycStateBase>['snapshot']>,
    });

    const rendered = await render(<VerifyIdentityWizard />);

    expect(rendered.container.textContent).not.toContain('What you need to correct');
    expect(rendered.container.textContent).toContain('Provider workflow blockers');
    expect(rendered.container.textContent).toContain('External account setup needed');
    expect(rendered.container.textContent).toContain('These items cannot be edited here.');
  });

  it('renders all six proactive SOF fields on create path and blocks empty submission', async () => {
    currentKycState = buildKycState({
      missingQuestionnaireFields: [],
      needsKycResume: false,
      needsKycRetry: false,
    });

    const rendered = await render(<VerifyIdentityWizard />);

    expect(rendered.container.textContent).toContain('Source of funds');
    expect(rendered.container.textContent).toContain('Employment status');
    expect(rendered.container.textContent).toContain('Account purpose');
    expect(rendered.container.textContent).toContain('Expected monthly payments');
    expect(rendered.container.textContent).toContain('Are you acting as an intermediary?');
    expect(rendered.container.textContent).toContain('Occupation');

    const continueButton = Array.from(rendered.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Continue'));

    if (!continueButton) {
      throw new Error('Continue button was not rendered');
    }

    await clickAsync(continueButton);

    expect(rendered.container.textContent).toContain('Selecciona el origen de los fondos');
    expect(rendered.container.textContent).toContain('Selecciona tu situación laboral');
    expect(rendered.container.textContent).toContain('Selecciona el propósito de la cuenta');
    expect(rendered.container.textContent).toContain('Selecciona los pagos mensuales esperados');
    expect(rendered.container.textContent).toContain('Selecciona tu ocupación');
    expect(rendered.container.textContent).toContain('Personal step');
  });

  it('renders the full SOF field set on resume path (always show all fields)', async () => {
    currentKycState = buildKycState({
      needsKycResume: true,
      missingQuestionnaireFields: ['source_of_funds'],
    });

    const rendered = await render(<VerifyIdentityWizard />);

    expect(rendered.container.textContent).toContain('Source of funds');
    expect(rendered.container.textContent).toContain('Employment status');
    expect(rendered.container.textContent).toContain('Account purpose');
    expect(rendered.container.textContent).toContain('Expected monthly payments');
    expect(rendered.container.textContent).toContain('Are you acting as an intermediary?');
    expect(rendered.container.textContent).toContain('Occupation');
  });

  it('rejects whitespace-only occupation on create path', async () => {
    currentKycState = buildKycState({
      missingQuestionnaireFields: [],
      needsKycResume: false,
      needsKycRetry: false,
    });

    const rendered = await render(<VerifyIdentityWizard />);

    const fillButton = rendered.container.querySelector('button[data-testid="fill-valid-personal-fields"]');
    const whitespaceButton = rendered.container.querySelector('button[data-testid="set-occupation-whitespace"]');
    const continueButton = Array.from(rendered.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Continue'));

    if (!fillButton || !whitespaceButton || !continueButton) {
      throw new Error('Expected test control buttons were not rendered');
    }

    click(fillButton);
    click(whitespaceButton);
    await clickAsync(continueButton);

    expect(rendered.container.textContent).toContain('Selecciona tu ocupación');
    expect(rendered.container.textContent).not.toContain('Selecciona el origen de los fondos');
    expect(rendered.container.textContent).not.toContain('Selecciona tu situación laboral');
    expect(rendered.container.textContent).not.toContain('Selecciona el propósito de la cuenta');
    expect(rendered.container.textContent).not.toContain('Selecciona los pagos mensuales esperados');
  });

  it('accepts backend-safe occupation code values on create path', async () => {
    currentKycState = buildKycState({
      missingQuestionnaireFields: [],
      needsKycResume: false,
      needsKycRetry: false,
    });

    const rendered = await render(<VerifyIdentityWizard />);

    const fillButton = rendered.container.querySelector('button[data-testid="fill-valid-personal-fields"]');
    const continueButton = Array.from(rendered.container.querySelectorAll('button')).find((button) => button.textContent?.includes('Continue'));

    if (!fillButton || !continueButton) {
      throw new Error('Expected test control buttons were not rendered');
    }

    click(fillButton);
    await clickAsync(continueButton);

    expect(rendered.container.textContent).toContain('Address step');
    expect(rendered.container.textContent).not.toContain('Selecciona tu ocupación');
  });

  it('disables navigation and the primary button while the submission is processing', async () => {
    currentKycState = buildKycState({
      kycStatus: 'PENDING_REVIEW',
      needsKycResume: true,
      hasSubmittedIdentityProgress: true,
      tosAccepted: true,
    });

    const rendered = await render(<VerifyIdentityWizard />);
    const fieldset = rendered.container.querySelector('fieldset');
    const finishButton = Array.from(rendered.container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Finish'),
    );
    const backButton = Array.from(rendered.container.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Back'),
    );

    expect(fieldset).not.toBeNull();
    expect(fieldset?.hasAttribute('disabled')).toBe(true);
    expect(backButton).toBeUndefined();
    expect(finishButton).toBeDefined();
    expect(finishButton?.hasAttribute('disabled')).toBe(true);
  });
});
