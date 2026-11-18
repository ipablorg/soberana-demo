// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantBeneficiary, TenantCustomer, TenantRail } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import { installCommandPolyfills } from '@/test/dom-polyfills';
import BeneficiariesList from '@/modules/suite-tenant/features/beneficiaries/pages/beneficiaries-list';
import BeneficiaryDetail from '@/modules/suite-tenant/features/beneficiaries/pages/beneficiary-detail';
import BeneficiaryNew from '@/modules/suite-tenant/features/beneficiaries/pages/beneficiary-new';
import {
  currentPath,
  renderTenant,
  respond,
  settle,
  type Handler,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

const CUSTOMER: TenantCustomer = {
  id: 'c0a8b1e2-1111-4111-8111-111111111111',
  external_id: 'ext-001',
  email: 'ana@acme.test',
  customer_type: 'individual',
  first_name: 'Ana',
  last_name: 'Gómez',
  kyc_status: 'APPROVED',
  customer_status: 'ACTIVE',
  created_at: '2026-11-01T10:00:00.000Z',
};

const SPEI: TenantRail = {
  id: 'r-spei',
  code: 'spei',
  name: 'SPEI',
  currency: 'MXN',
  country: 'MEX',
  enabled_capabilities: ['off_ramp'],
};

const PIX_IN: TenantRail = {
  id: 'r-pix-in',
  code: 'pix_in',
  currency: 'BRL',
  country: 'BRA',
  enabled_capabilities: ['on_ramp', 'payment_link'],
};

const BENEFICIARY: TenantBeneficiary = {
  id: 'b0a8b1e2-5555-4555-8555-555555555555',
  customer_id: CUSTOMER.id,
  country: 'MEX',
  beneficiary_name: 'Luis Pérez',
  currency: 'MXN',
  verification_status: 'VERIFIED',
  rail_code: 'spei',
  provider_code: 'mesta',
  review_status: 'APPROVED',
  masked_account_number: '***7897',
  alias: 'Luis MX',
  is_favorite: false,
  created_at: '2026-11-02T10:00:00.000Z',
};

const page1 = <T,>(data: T[]) => ({
  data,
  has_more: false,
  page: 1,
  page_size: 100,
  total: data.length,
  total_pages: 1,
});

// Radix checkboxes and switches measure themselves with ResizeObserver.
installCommandPolyfills();

let page: MountedPage | null = null;

function el<T extends Element>(selector: string, root: ParentNode = document.body): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

function select(selector: string, value: string) {
  const element = el<HTMLSelectElement>(selector);
  act(() => {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function callsOf(field: string) {
  return mocks.request.mock.calls.filter(([document]) => {
    const operation = (
      document as {
        definitions: Array<{ selectionSet: { selections: Array<{ name: { value: string } }> } }>;
      }
    ).definitions[0];
    return operation?.selectionSet.selections[0]?.name.value === field;
  });
}

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('BeneficiariesList (container)', () => {
  it('asks for a customer, then lists that customer’s beneficiaries', async () => {
    // `tenant_listBeneficiaries` answers the REST body: a bare array.
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => page1([CUSTOMER]),
        tenant_listBeneficiaries: () => [BENEFICIARY],
      })
    );
    page = renderTenant(<BeneficiariesList />, {
      path: '/tenant/beneficiaries',
      routePath: '/tenant/beneficiaries',
    });
    await settle(() => page?.text().includes('Pick a customer.') ?? false);
    expect(page.text()).toContain('Pick a customer.');

    select('#beneficiaries-customer', CUSTOMER.id);
    await settle(() => page?.text().includes('Luis MX') ?? false);

    expect(page.text()).toContain('Luis Pérez');
    expect(page.text()).toContain('Approved');
    expect(callsOf('tenant_listBeneficiaries')[0]?.[1]).toEqual({
      filters: { customer_id: CUSTOMER.id },
    });
  });

  it('also reads a list wrapped in `data`', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => page1([CUSTOMER]),
        tenant_listBeneficiaries: () => ({ data: [BENEFICIARY], total: 1 }),
      })
    );
    page = renderTenant(<BeneficiariesList />, {
      path: `/tenant/beneficiaries?customer_id=${CUSTOMER.id}`,
      routePath: '/tenant/beneficiaries',
    });
    await settle(() => page?.text().includes('Luis MX') ?? false);

    expect(page.text()).toContain('Luis Pérez');
  });

  it('says so when the customer has no beneficiaries', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => page1([CUSTOMER]),
        tenant_listBeneficiaries: () => [],
      })
    );
    page = renderTenant(<BeneficiariesList />, {
      path: `/tenant/beneficiaries?customer_id=${CUSTOMER.id}`,
      routePath: '/tenant/beneficiaries',
    });
    await settle(() => page?.text().includes('No beneficiaries yet.') ?? false);

    expect(page.text()).toContain('No beneficiaries yet.');
  });
});

describe('BeneficiaryNew (container)', () => {
  const handlers: Record<string, Handler> = {
    tenant_listCustomers: () => page1([CUSTOMER]),
    tenant_listRails: () => [SPEI, PIX_IN],
    tenant_createBeneficiary: () => BENEFICIARY,
  };

  async function mountNew() {
    mocks.request.mockImplementation(respond(handlers));
    page = renderTenant(<BeneficiaryNew />, {
      path: '/tenant/beneficiaries/new',
      routePath: '/tenant/beneficiaries/new',
    });
    await settle(
      () => document.body.querySelector('#bf-payment_rail option[value="spei"]') !== null
    );
  }

  it('offers only the payout rails of the client', async () => {
    await mountNew();

    const options = Array.from(el<HTMLSelectElement>('#bf-payment_rail').options).map(
      (option) => option.value
    );
    expect(options).toEqual(['', 'spei']);
  });

  it('does not submit without the required fields of the rail', async () => {
    await mountNew();
    select('#bf-customer_id', CUSTOMER.id);
    select('#bf-payment_rail', 'spei');

    submitForm(el<HTMLFormElement>('[data-testid="beneficiary-form"]'));
    await settle();

    expect(callsOf('tenant_createBeneficiary')).toHaveLength(0);
    expect(document.body.querySelector('[data-testid="bf-clabe-error"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="bf-tax_id-error"]')).not.toBeNull();
    expect(document.body.querySelector('[data-testid="bf-beneficiary_name-error"]')).not.toBeNull();
  });

  it('creates a SPEI beneficiary with the documented REST body and opens it', async () => {
    await mountNew();
    select('#bf-customer_id', CUSTOMER.id);
    select('#bf-payment_rail', 'spei');
    changeValue(el<HTMLInputElement>('#bf-beneficiary_name'), ' Luis Pérez ');
    changeValue(el<HTMLInputElement>('#bf-clabe'), '012180001234567897');
    changeValue(el<HTMLInputElement>('#bf-tax_id'), 'PEPL800101AAA');
    changeValue(el<HTMLInputElement>('#bf-address_line_1'), 'Av Reforma 1');
    changeValue(el<HTMLInputElement>('#bf-city'), 'Mexico City');
    changeValue(el<HTMLInputElement>('#bf-postal_code'), '06600');
    changeValue(el<HTMLInputElement>('#bf-alias'), 'Luis MX');

    submitForm(el<HTMLFormElement>('[data-testid="beneficiary-form"]'));
    await settle(() => callsOf('tenant_createBeneficiary').length > 0);

    expect(callsOf('tenant_createBeneficiary')[0]?.[1]).toEqual({
      input: {
        customer_id: CUSTOMER.id,
        payment_rail: 'spei',
        type: 'BANK_ACCOUNT',
        country: 'MEX',
        beneficiary_name: 'Luis Pérez',
        holder_type: 'INDIVIDUAL',
        clabe: '012180001234567897',
        tax_id: 'PEPL800101AAA',
        address_line_1: 'Av Reforma 1',
        city: 'Mexico City',
        postal_code: '06600',
        alias: 'Luis MX',
      },
    });
    await settle(() => currentPath(page!) !== '/tenant/beneficiaries/new');
    expect(currentPath(page!)).toBe(`/tenant/beneficiaries/${BENEFICIARY.id}`);
  });
});

describe('BeneficiaryDetail (container)', () => {
  async function mountDetail(extra: Record<string, Handler> = {}) {
    mocks.request.mockImplementation(
      respond({
        tenant_getBeneficiary: () => BENEFICIARY,
        tenant_deleteBeneficiary: () => true,
        tenant_deactivateBeneficiary: () => ({ ...BENEFICIARY, verification_status: 'UNVERIFIED' }),
        tenant_reactivateBeneficiary: () => BENEFICIARY,
        tenant_updateBeneficiary: () => BENEFICIARY,
        ...extra,
      })
    );
    page = renderTenant(<BeneficiaryDetail />, {
      path: `/tenant/beneficiaries/${BENEFICIARY.id}`,
      routePath: '/tenant/beneficiaries/:beneficiaryId',
    });
    await settle(() => page?.text().includes('Luis Pérez') ?? false);
  }

  it('shows the review state and account', async () => {
    await mountDetail();

    expect(page?.text()).toContain('***7897');
    expect(page?.text()).toContain('Approved');
    expect(page?.text()).toContain('mesta');
  });

  it('deletes only after confirming, then returns to the list', async () => {
    await mountDetail();

    click(el('[data-testid="delete-beneficiary"]'));
    await settle(
      () => document.body.querySelector('[data-testid="confirm-delete-beneficiary"]') !== null
    );
    expect(callsOf('tenant_deleteBeneficiary')).toHaveLength(0);

    click(el('[data-testid="confirm-delete-beneficiary"]'));
    await settle(() => callsOf('tenant_deleteBeneficiary').length > 0);

    expect(callsOf('tenant_deleteBeneficiary')[0]?.[1]).toEqual({ id: BENEFICIARY.id });
    await settle(() => currentPath(page!) !== `/tenant/beneficiaries/${BENEFICIARY.id}`);
    expect(page?.text()).toContain('other-route');
  });

  it('deactivates only after confirming', async () => {
    await mountDetail();

    click(el('[data-testid="deactivate-beneficiary"]'));
    await settle(
      () => document.body.querySelector('[data-testid="confirm-deactivate-beneficiary"]') !== null
    );
    expect(callsOf('tenant_deactivateBeneficiary')).toHaveLength(0);

    click(el('[data-testid="confirm-deactivate-beneficiary"]'));
    await settle(() => callsOf('tenant_deactivateBeneficiary').length > 0);
    expect(callsOf('tenant_deactivateBeneficiary')[0]?.[1]).toEqual({ id: BENEFICIARY.id });
  });

  it('reactivates a deactivated beneficiary without a dialog', async () => {
    await mountDetail({
      tenant_getBeneficiary: () => ({ ...BENEFICIARY, verification_status: 'UNVERIFIED' }),
    });

    expect(document.body.querySelector('[data-testid="deactivate-beneficiary"]')).toBeNull();
    click(el('[data-testid="reactivate-beneficiary"]'));
    await settle(() => callsOf('tenant_reactivateBeneficiary').length > 0);
    expect(callsOf('tenant_reactivateBeneficiary')[0]?.[1]).toEqual({ id: BENEFICIARY.id });
  });

  it('updates alias, name and favorite', async () => {
    await mountDetail();

    changeValue(el<HTMLInputElement>('#bf-edit-alias'), 'Luis payroll');
    click(el<HTMLInputElement>('#bf-edit-favorite'));
    submitForm(el<HTMLFormElement>('[data-testid="beneficiary-edit-form"]'));
    await settle(() => callsOf('tenant_updateBeneficiary').length > 0);

    expect(callsOf('tenant_updateBeneficiary')[0]?.[1]).toEqual({
      id: BENEFICIARY.id,
      input: { alias: 'Luis payroll', beneficiary_name: 'Luis Pérez', is_favorite: true },
    });
  });
});
