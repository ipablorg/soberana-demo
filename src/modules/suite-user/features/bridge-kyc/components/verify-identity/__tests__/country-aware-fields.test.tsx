/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Form } from '@/shared/components/ui/form';
import type { VerifyIdentityValues } from '../../../lib/verify-identity.schema';
import { StepPersonal } from '../step-personal';
import { StepDocument } from '../step-document';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function translate(message: TemplateStringsArray | string, ...values: unknown[]) {
  if (message && typeof message === 'object' && 'message' in message) {
    const descriptor = message as { message?: unknown; id?: unknown };
    return String(descriptor.message ?? descriptor.id ?? '');
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

vi.mock('@/shared/components/animated-icons', () => {
  const Icon = ({ className }: { className?: string }) => <svg className={className} data-icon="mock" />;

  return {
    Camera: Icon,
    Check: Icon,
    ChevronDown: Icon,
    Loader2: Icon,
    RefreshCw: Icon,
  };
});

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { value?: string; onValueChange?: (value: string) => void; children: ReactNode }) => (
    <div data-select-value={value} data-on-change={onValueChange ? 'yes' : 'no'}>{children}</div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock('@/shared/components/ui/popover', () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/shared/components/ui/command', () => ({
  Command: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CommandInput: ({ placeholder }: { placeholder?: string }) => <input placeholder={placeholder} readOnly />,
  CommandItem: ({ children, onSelect }: { children: ReactNode; onSelect?: () => void }) => <button type="button" onClick={onSelect}>{children}</button>,
  CommandList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../document-capture', () => ({
  DocumentCapture: ({ label }: { label: string }) => <div>{label}</div>,
  DocumentUploadCapture: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock('../questionnaire-section', () => ({
  QuestionnaireSection: () => <div>Questionnaire</div>,
}));

interface RenderResult {
  container: HTMLDivElement;
  root: Root;
}

const mountedRoots: RenderResult[] = [];

const baseValues: VerifyIdentityValues = {
  birth_date: '1990-01-15',
  nationality: 'MEX',
  tax_id: 'ABCD123456EF7',
  tax_id_type: 'RFC',
  address_line_1: 'Street 123',
  city: 'Mexico City',
  state: 'CDMX',
  postal_code: '01000',
  country: 'MEX',
  type: 'DNI',
  issuing_country: 'MEX',
  number: '1234567890123',
  description: '',
  expiration: '2030-01-01',
  source_of_funds: undefined,
  employment_status: undefined,
  account_purpose: undefined,
  expected_monthly_payments_usd: undefined,
  acting_as_intermediary: false,
  most_recent_occupation: undefined,
  selfie: undefined,
  supporting_documents: undefined,
  image_front: 'front',
  image_back: 'back',
};

function StepPersonalHarness({ values }: { values: VerifyIdentityValues }) {
  const form = useForm<VerifyIdentityValues>({ defaultValues: values });

  return (
    <Form {...form}>
      <StepPersonal form={form} />
    </Form>
  );
}

function StepDocumentHarness({ values }: { values: VerifyIdentityValues }) {
  const form = useForm<VerifyIdentityValues>({ defaultValues: values });

  return (
    <Form {...form}>
      <StepDocument form={form} requiresSelfie />
    </Form>
  );
}

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

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mounted = mountedRoots.pop();

    if (!mounted) continue;

    await act(async () => {
      mounted.root.unmount();
    });

    mounted.container.remove();
  }
});

describe('country-aware KYC fields', () => {
  it('shows country-aware fiscal labels and options for Mexico', async () => {
    const { container } = await render(<StepPersonalHarness values={baseValues} />);

    expect(container.textContent).toContain('Fiscal / tax identification');
    expect(container.textContent).toContain('Tax identification number');
    expect(container.textContent).toContain('Tax identifier type');
    expect(container.textContent).toContain('RFC');
    expect(container.textContent).toContain('CURP');

    const input = container.querySelector('input[placeholder="e.g. ABCD123456EF7"]');
    expect(input).not.toBeNull();
  });

  it('shows country-aware government document labels while keeping the backend enum options', async () => {
    const { container } = await render(<StepDocumentHarness values={baseValues} />);

    expect(container.textContent).toContain('Government identity document');
    expect(container.textContent).toContain('INE / voter ID');
    expect(container.textContent).toContain('Passport');
    expect(container.textContent).toContain('Residence card or other government document');
    expect(container.textContent).toContain('Government document photos');
    expect(container.textContent).toContain('Selfie verification');

    const numberInput = container.querySelector('input[placeholder="e.g. 1234567890123"]');
    expect(numberInput).not.toBeNull();
    expect(container.textContent).not.toContain('Expiration date');
  });

  it('shows expiration for passports and explains it is required', async () => {
    const { container } = await render(<StepDocumentHarness values={{
      ...baseValues,
      type: 'PASSPORT',
      image_back: undefined,
    }} />);

    expect(container.textContent).toContain('Expiration date');
    expect(container.textContent).toContain('This document usually expires, so we need that date.');
  });
});
