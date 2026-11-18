/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import ClientCommercialNew from '../pages/client-commercial-new';

const createMutate = vi.fn();
let availableProviders: readonly string[] = ['mesta', 'kirafin'];

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../hooks/use-commercial', () => ({
  useCreateAndOnboardClient: () => ({ mutate: createMutate, isPending: false }),
}));
vi.mock('../hooks/use-onboarding-providers', () => ({
  useOnboardingProviders: () => availableProviders,
}));
vi.mock('../../clients/hooks/use-clients', () => ({
  useTaxIdTypes: () => ({
    data: {
      adminLoopay_listTaxIdTypes: [
        { id: 'uuid-nit', name: 'NIT', countries: ['COL'] },
        { id: 'uuid-ein', name: 'EIN', countries: ['USA'] },
      ],
    },
  }),
}));
vi.mock('../../../lib/country-options', () => ({
  useCountryIso3Options: () => [
    { value: 'COL', label: 'Colombia (COL)' },
    { value: 'USA', label: 'Estados Unidos (USA)' },
  ],
}));

// Radix Select does not open in jsdom: a click on the stand-in picks the first option.
vi.mock('../../../components/option-select', () => ({
  OptionSelect: ({
    id,
    options,
    onChange,
  }: {
    id: string;
    options: readonly { value: string }[];
    onChange: (value: string) => void;
  }) => (
    <button
      id={id}
      type="button"
      role="combobox"
      aria-expanded="false"
      onClick={() => options[0] && onChange(options[0].value)}
    />
  ),
}));

let page: MountedPage | null = null;

beforeEach(() => {
  createMutate.mockReset();
  availableProviders = ['mesta', 'kirafin'];
});
afterEach(() => {
  page?.unmount();
  page = null;
});

const render = () =>
  mountPage(
    <MemoryRouter>
      <ClientCommercialNew />
    </MemoryRouter>
  );

describe('ClientCommercialNew', () => {
  it('shows the Mesta company profile section while Mesta is selected', () => {
    page = render();

    expect(page.text()).toContain('Perfil de empresa para Mesta');
  });

  it('hides the Mesta section when Mesta is not offered or unchecked', () => {
    availableProviders = ['kirafin'];
    page = render();

    expect(page.text()).not.toContain('Perfil de empresa para Mesta');
  });

  it('hides the Mesta section after unchecking Mesta', () => {
    page = render();
    const box = page.container.querySelector<HTMLElement>('button[aria-label="mesta"]');
    expect(box).not.toBeNull();

    page.click(box as Element);

    expect(page.text()).not.toContain('Perfil de empresa para Mesta');
  });

  it('tells the user what is missing before enabling the submit', () => {
    page = render();

    expect(page.text()).toContain('Mesta necesita estos datos de la empresa:');
    const submit = page.findByText<HTMLButtonElement>('button', 'Create and onboard');
    expect(submit.disabled).toBe(true);
  });

  it('renders the tax id type as a select, not a free-text input with a datalist', () => {
    page = render();

    const field = page.container.querySelector('#new-client-tax-id-type');
    expect(field?.tagName).toBe('BUTTON');
    expect(field?.getAttribute('role')).toBe('combobox');
    expect(page.container.querySelector('datalist')).toBeNull();
    expect(page.container.querySelector('input[list]')).toBeNull();
  });
  it('offers the countries where the client operates, defaulting to the client own country', () => {
    page = render();
    const checked = () =>
      Array.from(
        page!.container.querySelectorAll<HTMLElement>(
          'fieldset[data-testid="allowed-countries"] button[role="checkbox"]'
        )
      )
        .filter((node) => node.getAttribute('aria-checked') === 'true')
        .map((node) => node.getAttribute('aria-label'));

    expect(page.text()).toContain('Países donde el cliente opera con sus customers');
    expect(checked()).toEqual([]);

    const country = page.container.querySelector('#new-client-country') as Element;
    page.click(country);

    expect(checked()).toEqual(['Colombia (COL)']);
  });
});
