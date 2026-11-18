/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CATALOGUE_FIXTURE } from '@/modules/suite-user/features/beneficiaries/lib/__tests__/catalogue-fixture';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { SendDestinationPicker, type PickerBeneficiary } from '../send-destination-picker';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => (
    <select value={value ?? ''} onChange={(event) => onValueChange(event.target.value)}>
      <option value="" />
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

const person = (over: Partial<PickerBeneficiary>): PickerBeneficiary => ({
  id: 'b-1',
  beneficiary_name: 'Ana Perez',
  bank_name: 'Bancolombia',
  currency: 'COP',
  payment_rail: 'co_ach',
  country: 'COL',
  review_status: 'APPROVED',
  ...over,
});

let page: MountedPage;

function mount(beneficiaries: PickerBeneficiary[], onSelect = vi.fn(), extra: Record<string, unknown> = {}) {
  page = mountPage(
    <SendDestinationPicker
      beneficiaries={beneficiaries}
      catalogue={CATALOGUE_FIXTURE}
      catalogueLoading={false}
      catalogueError={false}
      onSelect={onSelect}
      onAddBeneficiary={vi.fn()}
      {...extra}
    />,
  );
  return onSelect;
}

function choose(select: HTMLSelectElement, value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function row(name: string): HTMLButtonElement {
  const match = Array.from(page.container.querySelectorAll<HTMLButtonElement>('button[data-beneficiary-id]')).find(
    (node) => node.textContent?.includes(name),
  );
  if (!match) throw new Error(`No row for ${name}. Rendered: ${page.text()}`);
  return match;
}

afterEach(() => {
  page.unmount();
});

describe('SendDestinationPicker', () => {
  it('opens on the country and rail where the user already has a beneficiary', () => {
    mount([person({})]);
    expect((page.container.querySelector('select') as HTMLSelectElement).value).toBe('CO');
    expect(page.text()).toContain('Ana Perez');
  });

  it('selecting an approved beneficiary calls onSelect', () => {
    const onSelect = mount([person({})]);
    page.click(row('Ana Perez'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'b-1' }));
  });

  it('lists an IN_REVIEW beneficiary disabled, with the review badge and a hint, and never selects it', () => {
    const onSelect = mount([person({ id: 'b-2', beneficiary_name: 'Luis Gomez', review_status: 'IN_REVIEW' })]);
    const button = row('Luis Gomez');
    expect(button.disabled).toBe(true);
    expect(page.text()).toContain('En revisión');
    expect(page.text()).toContain('Lo está revisando el proveedor');
    page.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('lists a REJECTED beneficiary disabled and shows the provider reason', () => {
    const onSelect = mount([
      person({ id: 'b-3', beneficiary_name: 'Mario Ruiz', review_status: 'REJECTED', review_reason: 'Documento no coincide' }),
    ]);
    expect(row('Mario Ruiz').disabled).toBe(true);
    expect(page.text()).toContain('Rechazado');
    expect(page.text()).toContain('Documento no coincide');
    page.click(row('Mario Ruiz'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('puts the approved ones first', () => {
    mount([
      person({ id: 'b-2', beneficiary_name: 'Luis Gomez', review_status: 'IN_REVIEW' }),
      person({ id: 'b-1', beneficiary_name: 'Ana Perez' }),
    ]);
    const names = Array.from(page.container.querySelectorAll('button[data-beneficiary-id]')).map((n) => n.getAttribute('data-beneficiary-id'));
    expect(names).toEqual(['b-1', 'b-2']);
  });

  it('asks for a rail when the country has several and shows only that rail\'s beneficiaries', () => {
    mount([
      person({ id: 'a', beneficiary_name: 'Ach Person', payment_rail: 'ach', country: 'USA', currency: 'USD' }),
      person({ id: 'w', beneficiary_name: 'Wire Person', payment_rail: 'wire', country: 'USA', currency: 'USD' }),
    ]);
    expect(page.text()).toContain('Elige la ruta');
    expect(page.container.querySelector('button[data-beneficiary-id]')).toBeNull();

    page.click(page.findByText('button', 'Wire (US)'));
    expect(page.text()).toContain('Wire Person');
    expect(page.text()).not.toContain('Ach Person');
  });

  it('changing the country shows the empty state when that rail has no saved beneficiary', () => {
    const onAdd = vi.fn();
    mount([person({})], vi.fn(), { onAddBeneficiary: onAdd });
    choose(page.container.querySelector('select') as HTMLSelectElement, 'DE');
    expect(page.text()).toContain('Aún no tienes cuentas en esta ruta');
    page.click(page.findByText('button', 'Agregar beneficiario'));
    expect(onAdd).toHaveBeenCalled();
  });

  it('shows a loading state while the catalogue loads', () => {
    mount([], vi.fn(), { catalogueLoading: true, catalogue: undefined });
    expect(page.container.querySelector('[data-testid="destination-loading"]')).not.toBeNull();
  });

  it('shows an error state when the catalogue fails', () => {
    mount([], vi.fn(), { catalogueError: true, catalogue: undefined });
    expect(page.text()).toContain('No pudimos cargar los países');
  });
});
