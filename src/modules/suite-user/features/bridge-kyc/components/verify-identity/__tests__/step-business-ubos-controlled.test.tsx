/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Form } from '@/shared/components/ui/form';
import type { UboValues } from '../../../lib/verify-identity.schema';
import { StepBusinessUBOs } from '../step-business-ubos';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/animated-icons', () => {
  const Icon = ({ className }: { className?: string }) => (
    <svg className={className} data-icon="mock" />
  );
  return { Plus: Icon, Trash2: Icon };
});

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

// A UBO as `append()` / hydration leaves it: the optional title and ownership_percentage are absent.
const UBO_WITHOUT_OPTIONALS = {
  first_name: 'Ana',
  last_name: 'Pérez',
  email: 'ana@example.com',
  birth_date: '1990-01-01',
  nationality: 'COL',
  place_of_birth_country: '',
  place_of_birth_city: '',
  residential_address_line_1: 'Calle 1',
  residential_address_city: 'Bogotá',
  residential_address_subdivision: 'DC',
  residential_address_postal_code: '110111',
  residential_address_country: 'COL',
  identifying_document: {
    type: 'PASSPORT',
    issuing_country: 'COL',
    number: '1',
    description: '',
    expiration: '2030-01-01',
    image_front: '',
    image_back: '',
  },
} as unknown as UboValues;

let formRef: UseFormReturn<{ ubos: UboValues[] }> | null = null;

function Harness() {
  const form = useForm<{ ubos: UboValues[] }>({ defaultValues: { ubos: [UBO_WITHOUT_OPTIONALS] } });
  formRef = form;
  return (
    <Form {...form}>
      <StepBusinessUBOs
        form={form}
        getErrorsForField={() => []}
        clearFieldError={() => undefined}
      />
    </Form>
  );
}

afterEach(() => {
  formRef = null;
  vi.restoreAllMocks();
});

describe('StepBusinessUBOs - optional inputs stay controlled', () => {
  it('does not warn "uncontrolled to controlled" when the optional title and ownership are filled later', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => root.render(<Harness />));
    act(() => {
      formRef?.setValue('ubos.0.title', 'CEO');
      formRef?.setValue('ubos.0.ownership_percentage', 40);
    });

    const warned = errors.mock.calls
      .map((call) => String(call[0]))
      .filter((m) => /uncontrolled|controlled/i.test(m));
    expect(warned).toEqual([]);
    act(() => root.unmount());
    container.remove();
  });

  it('keeps the role checkboxes controlled when a UBO without them is ticked', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warns = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => root.render(<Harness />));
    act(() => {
      formRef?.setValue('ubos.0.has_control' as never, true as never);
      formRef?.setValue('ubos.0.is_signer' as never, true as never);
    });

    const warned = [...errors.mock.calls, ...warns.mock.calls]
      .map((call) => String(call[0]))
      .filter((m) => /uncontrolled|controlled/i.test(m));
    expect(warned).toEqual([]);
    act(() => root.unmount());
    container.remove();
  });

  it('names the countries in the user language (Spanish), not the English catalog name', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => root.render(<Harness />));

    const text = container.textContent ?? '';
    expect(text).toContain('Alemania');
    expect(text).not.toContain('Germany');
    act(() => root.unmount());
    container.remove();
  });
});
