/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { useCountryStore } from '@/shared/stores/useCountryStore';
import { CountrySelector } from '../CountrySelector';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const useCountriesMock = vi.fn();
const refetch = vi.fn();
let sidebarState: 'expanded' | 'collapsed' = 'expanded';

vi.mock('@/modules/suite-backoffice/hooks/useCountries', () => ({
  useCountries: () => useCountriesMock(),
}));

vi.mock('@/shared/components/ui/sidebar', () => ({
  useSidebar: () => ({ state: sidebarState }),
}));

// Stable references: the component syncs `countries` into the store from an
// effect, so a fresh array per render would loop forever.
const NO_COUNTRIES: never[] = [];
const COUNTRIES = [
  { id: '1', name: 'Colombia', isoCode: 'co', currency: { cc: 'COP' } },
];

const FAILED = {
  countries: NO_COUNTRIES,
  isLoading: false,
  isFetching: false,
  error: new Error('boom'),
  refetch,
};

const RETRYING = { ...FAILED, isLoading: true, isFetching: true, error: null };

let page: MountedPage;

/** The retry control: labelled by text when expanded, by aria-label when collapsed. */
function retryButton(): HTMLButtonElement | null {
  return (
    Array.from(page.container.querySelectorAll('button')).find(
      (button) =>
        button.textContent?.trim() === 'Reintentar' ||
        button.getAttribute('aria-label') === 'Reintentar',
    ) ?? null
  );
}

beforeEach(() => {
  useCountriesMock.mockReset();
  refetch.mockReset();
  sidebarState = 'expanded';
});

afterEach(() => {
  page?.unmount();
});

describe('CountrySelector when countries cannot be loaded', () => {
  it('shows a quiet empty state instead of a red alert', async () => {
    useCountriesMock.mockReturnValue(FAILED);
    page = mountPage(<CountrySelector />);

    expect(page.text()).toContain('No pudimos cargar los países');
    expect(page.container.innerHTML).not.toContain('destructive');
    expect(retryButton()?.textContent?.trim()).toBe('Reintentar');
  });

  it('calls refetch when the retry button is pressed', async () => {
    useCountriesMock.mockReturnValue(FAILED);
    page = mountPage(<CountrySelector />);

    const button = retryButton();
    if (!button) throw new Error('Retry button not rendered');
    page.click(button);

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the empty state and busies the retry button while retrying', async () => {
    useCountriesMock.mockReturnValue(FAILED);
    page = mountPage(<CountrySelector />);

    // React Query flips the errored query back to `pending` while it retries.
    useCountriesMock.mockReturnValue(RETRYING);
    page.flush(() => useCountryStore.setState({}));

    expect(page.text()).not.toContain('Cargando países');
    expect(page.text()).toContain('No pudimos cargar los países');
    expect(retryButton()?.disabled).toBe(true);
    expect(retryButton()?.getAttribute('aria-busy')).toBe('true');
  });

  it('shows only a compact retry control when the sidebar is collapsed', async () => {
    sidebarState = 'collapsed';
    useCountriesMock.mockReturnValue(FAILED);
    page = mountPage(<CountrySelector />);

    const button = retryButton();
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-label')).toBe('Reintentar');
    expect(page.text()).not.toContain('No pudimos cargar los países');
  });
});

describe('CountrySelector when countries load', () => {
  it('still renders the selector if a background refetch failed', async () => {
    useCountriesMock.mockReturnValue({
      ...FAILED,
      countries: COUNTRIES,
    });
    page = mountPage(<CountrySelector />);

    expect(retryButton()).toBeNull();
    expect(page.container.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('shows the loading state on the very first load', async () => {
    useCountriesMock.mockReturnValue({
      ...FAILED,
      isLoading: true,
      isFetching: true,
      error: null,
    });
    page = mountPage(<CountrySelector />);

    expect(page.text()).toContain('Cargando países');
    expect(retryButton()).toBeNull();
  });
});
