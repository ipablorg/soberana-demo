/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { ProviderRequirementsDialog } from '../provider-requirements-dialog';

const mutate = vi.fn();
const showSuccess = vi.fn();
const showError = vi.fn();
let submitOptions: { onSuccess?: (result: unknown) => void; onError?: (error: Error) => void } = {};

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/hooks/use-provider-requirements', () => ({
  useSubmitProviderRequirement: (options: typeof submitOptions) => {
    submitOptions = options;
    return { mutate, isPending: false };
  },
}));

// The Radix select as plain items: clicking one picks its value.
let pickOption: ((value: string) => void) | undefined;
vi.mock('@/shared/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange: (value: string) => void;
  }) => {
    pickOption = onValueChange;
    return <div data-testid="select">{children}</div>;
  },
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <div id={id}>{children}</div>
  ),
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button type="button" data-option={value} onClick={() => pickOption?.(value)}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/stores/useDynamicIslandStore', () => ({
  useDynamicIslandStore: { getState: () => ({ showSuccess, showError }) },
}));

function requirement(overrides: Record<string, unknown>) {
  return {
    id: 'r-1',
    endorsementId: 'e-1',
    customerId: 'c-1',
    provider: 'kirafin',
    railCode: 'ach',
    source: 'MISSING_FIELD',
    blockerCode: 'X',
    key: 'file_proof_of_address',
    group: 'documents',
    kind: 'DOCUMENT',
    status: 'REQUESTED',
    documents: [],
    value: null,
    rejectReason: null,
    requestedAt: '2026-10-19T10:00:00.000Z',
    updatedAt: '2026-10-19T10:00:00.000Z',
    dueAt: null,
    ...overrides,
  } as never;
}

const REQUIREMENTS = [
  requirement({}),
  requirement({ id: 'r-2', key: 'registration_number', kind: 'VALUE' }),
  requirement({
    id: 'r-3',
    key: 'beneficial_owners',
    kind: 'UBO_LINK',
    status: 'REJECTED',
    rejectReason: 'Falta el segundo socio',
  }),
  requirement({
    id: 'r-4',
    key: 'high_risk_industries',
    kind: 'VALUE',
    options: ['Yes', 'No'],
  }),
];

let page: MountedPage;

function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

function buttons(label: string): HTMLButtonElement[] {
  return Array.from(document.body.querySelectorAll('button')).filter(
    (node) => (node.textContent ?? '').trim() === label
  );
}

beforeEach(() => {
  mutate.mockReset();
  showSuccess.mockReset();
  showError.mockReset();
  page = mountPage(
    <ProviderRequirementsDialog
      open
      onOpenChange={vi.fn()}
      customerId="c-1"
      requirements={REQUIREMENTS}
    />
  );
});

afterEach(() => {
  page?.unmount();
});

describe('ProviderRequirementsDialog (S21)', () => {
  it('lists each requirement by its Spanish name', () => {
    expect(bodyText()).toContain('Comprobante de domicilio');
    expect(bodyText()).toContain('Número de registro de la empresa');
    expect(bodyText()).toContain('Beneficiarios finales');
  });

  it('tells the customer we contact them for UBO steps, with the reject reason', () => {
    expect(bodyText()).toContain('Te contactaremos para este paso');
    expect(bodyText()).toContain('Falta el segundo socio');
  });

  it('sends a typed value', () => {
    changeValue(
      document.body.querySelector<HTMLInputElement>('#requirement-value-r-2')!,
      ' RM-42 '
    );
    page.click(buttons('Enviar')[1]);

    expect(mutate).toHaveBeenCalledWith({
      input: { customerId: 'c-1', requirementId: 'r-2', value: 'RM-42' },
    });
  });

  it('N4: answers a documented value from a Spanish-labelled select', () => {
    const options = Array.from(document.body.querySelectorAll<HTMLButtonElement>('[data-option]'));
    expect(options.map((node) => node.textContent)).toEqual(['Sí', 'No']);
    expect(document.body.querySelector('#requirement-value-r-4')).not.toBeNull();

    page.click(options[0]);
    page.click(buttons('Enviar')[2]);

    expect(mutate).toHaveBeenCalledWith({
      input: { customerId: 'c-1', requirementId: 'r-4', value: 'Yes' },
    });
  });

  it('sends a PDF as a base64 data URI with its name and type', async () => {
    const input = document.body.querySelector<HTMLInputElement>('input[type="file"]')!;
    expect(input.getAttribute('accept')).toBe('application/pdf,image/png,image/jpeg');

    const file = new File(['%PDF-1.4'], 'domicilio.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    page.click(buttons('Enviar')[0]);

    expect(mutate).toHaveBeenCalledWith({
      input: {
        customerId: 'c-1',
        requirementId: 'r-1',
        documents: [
          expect.objectContaining({
            fileName: 'domicilio.pdf',
            mimeType: 'application/pdf',
            file: expect.stringMatching(/^data:application\/pdf;base64,/),
          }),
        ],
      },
    });
  });

  it('refuses files that are not PDF, PNG or JPEG', async () => {
    const input = document.body.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['GIF89a'], 'foto.gif', { type: 'image/gif' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    await act(async () => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(bodyText()).toContain('Formato no admitido');
    expect(buttons('Enviar')[0].disabled).toBe(true);
  });

  it('confirms the upload on the dynamic island', () => {
    changeValue(document.body.querySelector<HTMLInputElement>('#requirement-value-r-2')!, 'RM-42');
    page.click(buttons('Enviar')[1]);
    page.flush(() => submitOptions.onSuccess?.({}));

    expect(showSuccess).toHaveBeenCalled();
  });
});
