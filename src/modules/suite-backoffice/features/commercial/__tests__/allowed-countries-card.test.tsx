/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { AllowedCountriesCard } from '../components/allowed-countries-card';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';
const updateMutate = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));
vi.mock('../hooks/use-commercial', () => ({
  useUpdateAllowedCountries: () => ({ mutate: updateMutate, isPending: false }),
}));
vi.mock('../../../lib/country-options', () => ({
  useCountryIso3Options: () => [
    { value: 'COL', label: 'Colombia (COL)' },
    { value: 'USA', label: 'Estados Unidos (USA)' },
    { value: 'MEX', label: 'México (MEX)' },
  ],
}));

let page: MountedPage | null = null;

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  page?.unmount();
  page = null;
});

const box = (p: MountedPage, label: string) =>
  p.container.querySelector<HTMLElement>(
    `button[role="checkbox"][aria-label="${label}"]`
  ) as HTMLElement;

describe('AllowedCountriesCard', () => {
  it('preselects the client own country and warns when nothing is configured yet', () => {
    page = mountPage(<AllowedCountriesCard clientId={CLIENT_ID} clientCountry="COL" config={{}} />);

    expect(box(page, 'Colombia (COL)').getAttribute('aria-checked')).toBe('true');
    expect(box(page, 'Estados Unidos (USA)').getAttribute('aria-checked')).toBe('false');
    expect(page.text()).toContain('no puede crear customers');
  });

  it('shows the stored list instead of the default', () => {
    page = mountPage(
      <AllowedCountriesCard
        clientId={CLIENT_ID}
        clientCountry="COL"
        config={{ allowedCustomerCountries: ['USA'] }}
      />
    );

    expect(box(page, 'Estados Unidos (USA)').getAttribute('aria-checked')).toBe('true');
    expect(box(page, 'Colombia (COL)').getAttribute('aria-checked')).toBe('false');
  });

  it('saves the selected countries', () => {
    page = mountPage(<AllowedCountriesCard clientId={CLIENT_ID} clientCountry="COL" config={{}} />);

    page.click(box(page, 'Estados Unidos (USA)'));
    page.click(page.findByText('button', 'Guardar países'));

    expect(updateMutate).toHaveBeenCalledWith({
      clientId: CLIENT_ID,
      countries: ['COL', 'USA'],
    });
  });

  it('blocks saving an empty selection', () => {
    page = mountPage(<AllowedCountriesCard clientId={CLIENT_ID} clientCountry="COL" config={{}} />);

    page.click(box(page, 'Colombia (COL)'));

    expect(page.findByText<HTMLButtonElement>('button', 'Guardar países').disabled).toBe(true);
  });
});
