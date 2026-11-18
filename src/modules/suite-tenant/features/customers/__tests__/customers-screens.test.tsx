// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ request: vi.fn(), toastError: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('sonner', () => ({ toast: { error: mocks.toastError, success: vi.fn() } }));
vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: mocks.request },
  setAuthToken: vi.fn(),
  clearHeaders: vi.fn(),
}));

import type { TenantCustomer, TenantRequirement } from '@/graphql/types/tenant';
import { changeValue, submitForm } from '@/test/dom-input';
import type { MountedPage } from '@/test/dom-render';
import CustomersList from '@/modules/suite-tenant/features/customers/pages/customers-list';
import CustomerDetail from '@/modules/suite-tenant/features/customers/pages/customer-detail';
import CustomerNew from '@/modules/suite-tenant/features/customers/pages/customer-new';
import {
  validateCustomerForm,
  toCreateCustomerInput,
  EMPTY_CUSTOMER_FORM,
} from '@/modules/suite-tenant/features/customers/lib/customer-form';
import { validateRequirementAnswer } from '@/modules/suite-tenant/features/customers/lib/requirement-answer';

import {
  currentPath,
  graphQLError,
  renderTenant,
  respond,
  settle,
} from '@/modules/suite-tenant/__tests__/tenant-harness';

const CUSTOMER: TenantCustomer = {
  id: 'c0a8b1e2-1111-4111-8111-111111111111',
  external_id: 'ext-001',
  email: 'ana@acme.test',
  customer_type: 'individual',
  first_name: 'Ana',
  last_name: 'Gómez',
  business_name: null,
  tax_id: '900123',
  tax_id_type: 'CC',
  country: 'COL',
  kyc_status: 'PENDING_REVIEW',
  customer_status: 'PENDING_KYC',
  kyc_link: 'https://kyc.example/abc',
  created_at: '2026-11-01T10:00:00.000Z',
};

const REQUIREMENT: TenantRequirement = {
  id: 'r0a8b1e2-2222-4222-8222-222222222222',
  customer_id: CUSTOMER.id,
  provider: 'kirafin',
  rail_code: 'us_ach',
  key: 'high_risk_industries',
  kind: 'VALUE',
  status: 'REQUESTED',
  options: ['Yes', 'No'],
};

let page: MountedPage | null = null;

beforeEach(() => {
  mocks.request.mockReset();
  mocks.toastError.mockReset();
});

afterEach(() => {
  page?.unmount();
  page = null;
});

function input(selector: string): HTMLInputElement {
  const element = page?.container.querySelector<HTMLInputElement>(selector);
  if (!element) throw new Error(`missing ${selector}`);
  return element;
}

describe('CustomersList (container)', () => {
  it('lists the customers of the page and asks for page 1', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => ({
          data: [CUSTOMER],
          has_more: false,
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        }),
      })
    );
    page = renderTenant(<CustomersList />);
    await settle(() => page?.text().includes('Ana Gómez') ?? false);

    expect(page.text()).toContain('Ana Gómez');
    expect(page.text()).toContain('ext-001');
    expect(page.text()).toContain('Pending review');
    expect(mocks.request.mock.calls[0]?.[1]).toEqual({ filters: { page: 1, page_size: 20 } });
    expect(
      page.container.querySelector(`a[href="/tenant/customers/${CUSTOMER.id}"]`)
    ).not.toBeNull();
  });

  it('shows the empty state', async () => {
    mocks.request.mockImplementation(
      respond({
        tenant_listCustomers: () => ({
          data: [],
          has_more: false,
          page: 1,
          page_size: 20,
          total: 0,
          total_pages: 0,
        }),
      })
    );
    page = renderTenant(<CustomersList />);
    await settle(() => page?.text().includes('No customers yet.') ?? false);

    expect(page.text()).toContain('No customers yet.');
  });
});

describe('CustomerDetail (container)', () => {
  const handlers = {
    tenant_getCustomer: () => CUSTOMER,
    tenant_listCustomerRails: () => ({
      customer_id: CUSTOMER.id,
      endorsements: [{ payment_rail: 'co_breb', status: 'pending', country: 'COL' }],
    }),
    tenant_listCustomerRequirements: () => ({ data: [REQUIREMENT] }),
    tenant_submitCustomerRequirement: () => ({ ...REQUIREMENT, status: 'UPLOADED' }),
    tenant_retryCustomerKyc: () => ({ id: CUSTOMER.id, kyc_link: 'https://kyc.example/new' }),
  };

  async function mountDetail() {
    mocks.request.mockImplementation(respond(handlers));
    page = renderTenant(<CustomerDetail />, {
      path: `/tenant/customers/${CUSTOMER.id}`,
      routePath: '/tenant/customers/:customerId',
    });
    await settle(() => page?.text().includes('high_risk_industries') ?? false);
  }

  it('renders status, KYC link, rails and requirements', async () => {
    await mountDetail();

    const text = page?.text() ?? '';
    expect(text).toContain('Ana Gómez');
    expect(text).toContain('Pending kyc');
    expect(
      page?.container.querySelector('[data-testid="customer-kyc-link"]')?.textContent
    ).toContain('https://kyc.example/abc');
    expect(page?.container.querySelector('[data-testid="customer-rails"]')?.textContent).toContain(
      'co_breb'
    );
    expect(text).toContain('high_risk_industries');
    const railsCall = mocks.request.mock.calls.find(
      ([, variables]) => 'include_pending' in (variables ?? {})
    );
    expect(railsCall?.[1]).toEqual({ id: CUSTOMER.id, include_pending: true });
  });

  it('submits a requirement answer with the REST body', async () => {
    await mountDetail();
    const form = page?.container.querySelector<HTMLFormElement>(
      `[data-testid="requirement-${REQUIREMENT.id}-form"]`
    );
    const select = page?.container.querySelector<HTMLSelectElement>(
      `#requirement-${REQUIREMENT.id}-value`
    );
    if (!form || !select) throw new Error('requirement form missing');

    page?.flush(() => {
      select.value = 'No';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    submitForm(form);
    await settle(() =>
      mocks.request.mock.calls.some(
        ([, variables]) => (variables as { requirement_id?: string })?.requirement_id
      )
    );

    const call = mocks.request.mock.calls.find(
      ([, variables]) => (variables as { requirement_id?: string })?.requirement_id
    );
    expect(call?.[1]).toEqual({
      id: CUSTOMER.id,
      requirement_id: REQUIREMENT.id,
      input: { value: 'No' },
    });
  });

  it('does not submit an empty VALUE answer', async () => {
    await mountDetail();
    const form = page?.container.querySelector<HTMLFormElement>(
      `[data-testid="requirement-${REQUIREMENT.id}-form"]`
    );
    if (!form) throw new Error('requirement form missing');

    submitForm(form);
    await settle();

    expect(page?.text()).toContain('Enter a value.');
    expect(
      mocks.request.mock.calls.some(
        ([, variables]) => (variables as { requirement_id?: string })?.requirement_id
      )
    ).toBe(false);
  });

  it('retries KYC with the chosen rail', async () => {
    await mountDetail();
    const select = page?.container.querySelector<HTMLSelectElement>('#retry-endorsement');
    const form = page?.container.querySelector<HTMLFormElement>('[data-testid="retry-kyc-form"]');
    if (!select || !form) throw new Error('retry form missing');

    page?.flush(() => {
      select.value = 'pix';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    submitForm(form);
    await settle(() =>
      mocks.request.mock.calls.some(
        ([, variables]) => (variables as { input?: unknown })?.input !== undefined
      )
    );

    const call = mocks.request.mock.calls.find(
      ([, variables]) => (variables as { input?: unknown })?.input !== undefined
    );
    expect(call?.[1]).toEqual({ id: CUSTOMER.id, input: { endorsement: 'pix' } });
  });
});

describe('CustomerNew (container)', () => {
  it('blocks submission and names the missing fields', async () => {
    mocks.request.mockImplementation(respond({}));
    page = renderTenant(<CustomerNew />);
    const form = page.container.querySelector<HTMLFormElement>('[data-testid="customer-form"]');
    if (!form) throw new Error('form missing');

    submitForm(form);
    await settle();

    expect(
      page.container.querySelector('[data-testid="customer-external_id-error"]')?.textContent
    ).toBe('Required.');
    expect(page.container.querySelector('[data-testid="customer-email-error"]')).not.toBeNull();
    expect(mocks.request).not.toHaveBeenCalled();
  });

  it('creates the customer with the kyc_link body and opens its detail', async () => {
    mocks.request.mockImplementation(respond({ tenant_createCustomer: () => CUSTOMER }));
    page = renderTenant(<CustomerNew />, {
      path: '/tenant/customers/new',
      routePath: '/tenant/customers/new',
    });

    changeValue(input('#customer-external_id'), 'ext-001');
    changeValue(input('#customer-email'), 'ana@acme.test');
    changeValue(input('#customer-first_name'), 'Ana');
    changeValue(input('#customer-last_name'), 'Gómez');
    changeValue(input('#customer-tax_id'), '900123');
    changeValue(input('#customer-tax_id_type'), 'CC');
    changeValue(input('#customer-country'), 'col');
    submitForm(
      page.container.querySelector<HTMLFormElement>(
        '[data-testid="customer-form"]'
      ) as HTMLFormElement
    );
    await settle(() => currentPath(page as MountedPage) !== '/tenant/customers/new');

    expect(mocks.request.mock.calls[0]?.[1]).toEqual({
      input: {
        external_id: 'ext-001',
        email: 'ana@acme.test',
        customer_type: 'individual',
        first_name: 'Ana',
        last_name: 'Gómez',
        tax_id: '900123',
        tax_id_type: 'CC',
        country: 'COL',
        kyc_method: 'kyc_link',
      },
    });
    expect(currentPath(page)).toBe(`/tenant/customers/${CUSTOMER.id}`);
  });

  it('shows the back validation message when creation fails', async () => {
    mocks.request.mockImplementation(async () => {
      throw graphQLError('VALIDATION_ERROR', 'external_id already exists', 'BAD_REQUEST');
    });
    page = renderTenant(<CustomerNew />);
    changeValue(input('#customer-external_id'), 'ext-001');
    changeValue(input('#customer-email'), 'ana@acme.test');
    changeValue(input('#customer-first_name'), 'Ana');
    changeValue(input('#customer-last_name'), 'Gómez');
    changeValue(input('#customer-tax_id'), '900123');
    changeValue(input('#customer-tax_id_type'), 'CC');
    submitForm(
      page.container.querySelector<HTMLFormElement>(
        '[data-testid="customer-form"]'
      ) as HTMLFormElement
    );
    await settle(() => mocks.toastError.mock.calls.length > 0);

    expect(mocks.toastError).toHaveBeenCalledWith("We couldn't create the customer", {
      description: 'external_id already exists',
    });
  });
});

describe('customer form rules', () => {
  it('requires the business name (not first/last name) for a business', () => {
    const errors = validateCustomerForm({
      ...EMPTY_CUSTOMER_FORM,
      customer_type: 'business',
      external_id: 'b-1',
      email: 'ops@biz.test',
      tax_id: '1',
      tax_id_type: 'NIT',
    });
    expect(errors).toEqual({ business_name: 'required' });
    expect(
      toCreateCustomerInput({
        ...EMPTY_CUSTOMER_FORM,
        customer_type: 'business',
        business_name: 'Biz SAS',
        first_name: 'ignored',
      })
    ).not.toHaveProperty('first_name');
  });

  it('rejects a country that is not ISO alpha-3', () => {
    expect(validateCustomerForm({ ...EMPTY_CUSTOMER_FORM, country: 'CO' }).country).toBe('country');
  });

  it('only lets open requirements take an answer, and enforces the closed vocabulary', () => {
    expect(validateRequirementAnswer({ ...REQUIREMENT, status: 'UPLOADED' }, 'No', [])).toBe(
      'not_open'
    );
    expect(validateRequirementAnswer(REQUIREMENT, 'Maybe', [])).toBe('value_not_allowed');
    expect(validateRequirementAnswer(REQUIREMENT, 'no', [])).toBeNull();
    expect(
      validateRequirementAnswer({ ...REQUIREMENT, kind: 'DOCUMENT', options: null }, '', [])
    ).toBe('document_required');
  });
});
