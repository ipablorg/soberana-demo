/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { i18n } from '@lingui/core';
import { describe, expect, it, vi, afterEach, beforeAll } from 'vitest';
import { StepReview } from '../step-review';
import type { VerifyIdentityValues } from '../../../lib/verify-identity.schema';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/shared/components/animated-icons', () => ({
  CheckCircle: () => <svg data-icon="check-circle" />,
  ExternalLink: () => <svg data-icon="external-link" />,
  Loader2: () => <svg data-icon="loader" />,
}));

function translate(message: TemplateStringsArray | string | { message?: unknown; id?: unknown }, ...values: unknown[]) {
  if (message && typeof message === 'object' && 'message' in message) {
    return String(message.message ?? message.id ?? '');
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
  Trans: ({
    children,
    message,
    id,
  }: {
    children?: ReactNode;
    message?: string;
    id?: string;
  }) => children ?? message ?? id,
  I18nProvider: ({ children }: { children: ReactNode }) => children,
}));

const mountedRoots: { container: HTMLDivElement; root: Root }[] = [];

async function render(ui: ReactNode) {
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

const DEFAULT_FORM_VALUES: VerifyIdentityValues = {
  birth_date: '1990-01-15',
  nationality: 'COL',
  tax_id: '900123456',
  tax_id_type: 'nit',
  address_line_1: 'Calle 100 #20-30',
  city: 'Bogotá',
  state: 'Cundinamarca',
  postal_code: '110111',
  country: 'COL',
  type: 'PASSPORT',
  issuing_country: 'COL',
  number: 'ABC123',
  description: '',
  expiration: '',
  source_of_funds: undefined,
  employment_status: undefined,
  account_purpose: undefined,
  expected_monthly_payments_usd: undefined,
  acting_as_intermediary: false,
  most_recent_occupation: undefined,
  selfie: undefined,
  supporting_documents: undefined,
  image_front: '',
  image_back: undefined,
};

function TestWrapper({ isProcessing }: { isProcessing?: boolean }) {
  const form = useForm<VerifyIdentityValues>({
    mode: 'onChange',
    defaultValues: DEFAULT_FORM_VALUES,
  });

  return (
    <StepReview
      form={form}
      submitted={true}
      tosLink={null}
      isResumeState={false}
      requiresTosAction={false}
      isOpeningTos={false}
      onOpenTos={() => {}}
      hasUnsupportedProviderFallback={false}
      unsupportedProviderMessage={null}
      isProcessing={isProcessing}
    />
  );
}

describe('StepReview processing state', () => {
  it('renders a processing card with a spinner when isProcessing is true', async () => {
    const rendered = await render(<TestWrapper isProcessing />);

    expect(rendered.container.textContent).toContain('Verifying your identity...');
    expect(rendered.container.querySelector('[data-icon="loader"]')).not.toBeNull();
    expect(rendered.container.textContent).not.toContain(
      'Your information was submitted. We are verifying your identity.',
    );
  });

  it('renders the existing submitted success message when isProcessing is false', async () => {
    const rendered = await render(<TestWrapper isProcessing={false} />);

    expect(rendered.container.textContent).toContain(
      'Your information was submitted. We are verifying your identity.',
    );
    expect(rendered.container.textContent).not.toContain('Verifying your identity...');
  });
});

function BusinessWrapper({ values }: { values: Record<string, unknown> }) {
  const form = useForm<VerifyIdentityValues>({
    defaultValues: values as unknown as VerifyIdentityValues,
  });

  return (
    <StepReview
      form={form}
      submitted={false}
      tosLink={null}
      isResumeState={false}
      requiresTosAction={false}
      isOpeningTos={false}
      onOpenTos={() => {}}
      hasUnsupportedProviderFallback={false}
      unsupportedProviderMessage={null}
    />
  );
}

const BUSINESS_VALUES = {
  business_legal_name: 'Acme SAS',
  business_type: 'corporation',
  incorporation_date: '2020-01-01',
  registration_number: '900123456',
  number_of_employees: '11-50',
  is_financial_institution: false,
  primary_website: '',
  website_absence_reason: 'Vendemos por redes sociales',
};

describe('StepReview business summary', () => {
  beforeAll(() => {
    // The business label helpers translate through the global Lingui instance.
    i18n.loadAndActivate({ locale: 'es', messages: {} });
  });

  it('shows registration number, employees, financial institution and the website absence reason', async () => {
    const rendered = await render(<BusinessWrapper values={BUSINESS_VALUES} />);
    const text = rendered.container.textContent ?? '';

    expect(text).toContain('900123456');
    expect(text).toContain('11-50');
    expect(text).toContain('¿Es una institución financiera?');
    expect(text).toContain('Vendemos por redes sociales');
  });

  it('omits the compliance answers the user never gave instead of showing defaults', async () => {
    const rendered = await render(<BusinessWrapper values={BUSINESS_VALUES} />);
    const text = rendered.container.textContent ?? '';

    expect(text).not.toContain('Source of funds');
    expect(text).not.toContain('Account purpose');
    expect(text).not.toContain('Ingresos anuales esperados');
    expect(text).not.toContain('Industry');
  });
});
