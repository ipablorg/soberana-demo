// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantMe, TenantRailCatalogue } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import TenantRails from '@/modules/suite-tenant/features/rails/pages/tenant-rails';
import { renderTenant, respond, settle } from '@/modules/suite-tenant/__tests__/tenant-harness';

const TENANT: TenantMe = {
  client_id: 'cl-1',
  name: 'Acme',
  status: 'ACTIVE',
  api_key_prefix: 'lpk',
  environment: 'sandbox',
  enabled_rails: [
    { code: 'spei', currency: 'MXN', country: 'MEX' },
    { code: 'ach', currency: 'USD', country: 'USA' },
  ],
};

const CATALOGUE: TenantRailCatalogue = {
  countries: [
    {
      country: 'MX',
      rails: [
        {
          code: 'spei',
          name: 'SPEI',
          currency: 'MXN',
          directions: ['INBOUND', 'OUTBOUND'],
          beneficiary_supported: true,
          providers: [{ code: 'mesta', directions: ['INBOUND', 'OUTBOUND'], available: true }],
        },
      ],
    },
    {
      country: 'BR',
      rails: [
        {
          code: 'pix',
          name: 'PIX',
          currency: 'BRL',
          directions: ['OUTBOUND'],
          beneficiary_supported: true,
          providers: [{ code: 'mesta', directions: ['OUTBOUND'], available: false }],
        },
      ],
    },
  ],
};

let page: MountedPage | null = null;

function el<T extends Element>(selector: string): T {
  const element = page?.container.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function catalogueCalls() {
  return mocks.request.mock.calls.filter(([document]) => {
    const operation = (
      document as {
        definitions: Array<{ selectionSet: { selections: Array<{ name: { value: string } }> } }>;
      }
    ).definitions[0];
    return operation?.selectionSet.selections[0]?.name.value === 'tenant_railCatalogue';
  });
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.request.mockImplementation(
    respond({
      tenant_me: () => TENANT,
      tenant_railCatalogue: (variables) =>
        variables.country
          ? {
              countries: CATALOGUE.countries.filter((entry) => entry.country === variables.country),
            }
          : CATALOGUE,
    })
  );
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('TenantRails (container)', () => {
  async function mountRails() {
    page = renderTenant(<TenantRails />);
    await settle(() => page?.container.querySelector('[data-testid="rail-catalogue"]') !== null);
  }

  it('shows the client’s enabled rails from tenant_me', async () => {
    await mountRails();

    const enabled = el('[data-testid="enabled-rails"]').textContent ?? '';
    expect(enabled).toContain('spei');
    expect(enabled).toContain('MXN');
    expect(enabled).toContain('ach');
  });

  it('lists the whole catalogue with directions and providers', async () => {
    await mountRails();

    expect(catalogueCalls()[0]?.[1]).toEqual({});
    const catalogue = el('[data-testid="rail-catalogue"]').textContent ?? '';
    expect(catalogue).toContain('SPEI');
    expect(catalogue).toContain('PIX');
    expect(catalogue).toContain('Receive');
    expect(catalogue).toContain('Send');
    expect(catalogue).toContain('mesta');
  });

  it('filters the catalogue by country (upper-cased)', async () => {
    await mountRails();

    changeValue(el<HTMLInputElement>('#rails-country'), 'mx');
    submitForm(el<HTMLFormElement>('[data-testid="rails-filter"]'));
    // The filtered catalogue replaces the skeleton once it lands.
    await settle(() => {
      const catalogue = page?.container.querySelector('[data-testid="rail-catalogue"]');
      return Boolean(catalogue) && !(catalogue?.textContent ?? '').includes('PIX');
    });

    expect(catalogueCalls().at(-1)?.[1]).toEqual({ country: 'MX' });
    expect(el('[data-testid="rail-catalogue"]').textContent).toContain('SPEI');
  });

  it('refuses a country code that is not ISO alpha-2 or alpha-3', async () => {
    await mountRails();
    const before = catalogueCalls().length;

    changeValue(el<HTMLInputElement>('#rails-country'), 'Mexico');
    submitForm(el<HTMLFormElement>('[data-testid="rails-filter"]'));
    await settle();

    expect(catalogueCalls()).toHaveLength(before);
    expect(el('[data-testid="rails-country-error"]').textContent).toBe(
      'Use a two- or three-letter ISO code.'
    );
  });
});
