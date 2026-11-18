/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '@lingui/core';
import { Form } from '@/shared/components/ui/form';
import type { BusinessBasicValues } from '../../../lib/verify-identity.schema';
import { StepBusinessBasic } from '../step-business-basic';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
i18n.load('es', {});
i18n.activate('es');

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

let formRef: UseFormReturn<BusinessBasicValues> | null = null;
let root: Root | null = null;
let container: HTMLDivElement | null = null;

function Harness({ defaults }: { defaults: Partial<BusinessBasicValues> }) {
  const form = useForm<BusinessBasicValues>({
    defaultValues: {
      business_legal_name: 'Acme SAS',
      primary_website: '',
      website_absence_reason: '',
      registration_number: '',
      tax_id: '',
      is_financial_institution: false,
      ...defaults,
    },
  });
  formRef = form;
  return (
    <Form {...form}>
      <StepBusinessBasic form={form} getErrorsForField={() => []} clearFieldError={() => undefined} />
    </Form>
  );
}

function render(defaults: Partial<BusinessBasicValues> = {}): string {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container!);
    root.render(<Harness defaults={defaults} />);
  });
  return (container.textContent ?? '').replace(/\s+/g, ' ');
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  formRef = null;
});

describe('StepBusinessBasic provider profile', () => {
  it('asks once for the registration number, employees, financial institution and the website reason', () => {
    const text = render();

    expect(text).toContain('Número de registro de la empresa');
    expect(text).toContain('Número de empleados');
    expect(text).toContain('¿La empresa es una institución financiera?');
    expect(text).toContain('¿Por qué la empresa no tiene sitio web?');
  });

  it('hides the website reason when the business has a website', () => {
    const text = render({ primary_website: 'https://acme.co' });

    expect(text).not.toContain('¿Por qué la empresa no tiene sitio web?');
  });

  it('asks the registration number explicitly and never prefills it with the tax id (NF-3)', () => {
    const text = render({ tax_id: '900123456' });

    expect(formRef?.getValues('registration_number')).toBe('');
    expect(text).toContain('Número del registro mercantil, distinto del ID fiscal');
    expect(text).not.toContain('Lo llenamos con el ID fiscal');
  });

  it('keeps a stored registration number', () => {
    render({ tax_id: '900123456', registration_number: 'MAT-77' });
    expect(formRef?.getValues('registration_number')).toBe('MAT-77');
  });
});
