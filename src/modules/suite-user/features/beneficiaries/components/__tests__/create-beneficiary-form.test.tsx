/* @vitest-environment jsdom */

import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { CATALOGUE_FIXTURE } from '../../lib/__tests__/catalogue-fixture';
import { CreateBeneficiaryForm } from '../CreateBeneficiaryForm';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const mutate = vi.fn();
let catalogueState: { data: unknown; isLoading: boolean; error: unknown } = {
  data: CATALOGUE_FIXTURE,
  isLoading: false,
  error: null,
};

vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: () => ({ user: { customer_profile_id: 'cust-1' } }),
}));

vi.mock('../../hooks/use-rail-catalogue', () => ({
  useRailCatalogue: () => catalogueState,
}));

let requirementsState: { data: unknown } = { data: undefined };

let kycPrefill: Record<string, unknown> | null = null;
let customerProfile: Record<string, unknown> | null = null;
vi.mock('@/shared/hooks/use-customer-profile', () => ({
  useCustomerProfile: () => ({ profile: customerProfile, isLoading: false }),
}));

// Every `value` prop the Select mock received (undefined = uncontrolled).
const selectValueProps: Array<string | undefined> = [];
vi.mock('@/shared/hooks/use-kyc-next-steps', () => ({
  useKycNextSteps: () => ({ snapshot: kycPrefill ? { prefill: kycPrefill } : undefined }),
}));

vi.mock('@/shared/hooks/use-beneficiaries', () => ({
  useCreateBeneficiary: () => ({ mutate, isPending: false }),
  useCreateBeneficiaryFieldRequirements: () => requirementsState,
}));

// Radix Select needs layout APIs jsdom lacks: swap it for a native <select>.
vi.mock('@/shared/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
  }) => {
    selectValueProps.push(value);
    return (
      <select value={value ?? ''} onChange={(event) => onValueChange(event.target.value)}>
        <option value="" />
        {children}
      </select>
    );
  },
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

let page: MountedPage;

function selectCountry(code: string) {
  const select = page.container.querySelector('select') as HTMLSelectElement;
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, code);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function input(name: string): HTMLInputElement {
  const element = page.container.querySelector<HTMLInputElement>(`#rail-field-${name}`);
  if (!element) throw new Error(`No #rail-field-${name}. Rendered: ${page.text()}`);
  return element;
}

function mountForm(overrides: Partial<React.ComponentProps<typeof CreateBeneficiaryForm>> = {}) {
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const onCancel = vi.fn();
  page = mountPage(
    <CreateBeneficiaryForm
      onSuccess={onSuccess}
      onError={onError}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onSuccess, onError, onCancel };
}

function save() {
  page.click(page.findByText('button', 'Guardar'));
}

function fillSepa() {
  selectCountry('DE');
  changeValue(input('beneficiary_name'), 'Hans Muller');
  changeValue(input('tax_id'), 'DE123456789');
  changeValue(input('iban'), 'de89 3704 0044 0532 0130 00');
  fillAddress();
}

function fillAddress() {
  changeValue(input('address_line_1'), 'Calle 1 #2');
  changeValue(input('city'), 'Ciudad de Mexico');
  changeValue(input('postal_code'), '06600');
}

/** MX spei is served by Mesta in the sandbox catalogue. */
function useMexicoSpei() {
  catalogueState = {
    data: {
      countries: [
        {
          country: 'MX',
          rails: [
            {
              code: 'spei',
              name: 'SPEI',
              currency: 'MXN',
              directions: ['OUTBOUND'],
              beneficiary_supported: true,
              providers: [{ code: 'mesta', directions: ['OUTBOUND'], available: true }],
            },
          ],
        },
      ],
    },
    isLoading: false,
    error: null,
  };
}

beforeEach(() => {
  mutate.mockReset();
  catalogueState = { data: CATALOGUE_FIXTURE, isLoading: false, error: null };
  requirementsState = { data: undefined };
  kycPrefill = null;
});

afterEach(() => {
  page.unmount();
});

describe('CreateBeneficiaryForm - country -> rail -> fields', () => {
  it('offers the countries that have a usable payout rail, and no others', () => {
    mountForm();
    const options = Array.from(page.container.querySelectorAll('select option')).map((o) =>
      o.getAttribute('value')
    );
    expect(options).toEqual(expect.arrayContaining(['CO', 'US', 'DE']));
    expect(options).not.toContain('BR');
    expect(options).not.toContain('EC');
    expect(options).not.toContain('MX');
  });

  it('shows no rail fields until a country is chosen', () => {
    mountForm();
    expect(page.container.querySelector('#rail-field-beneficiary_name')).toBeNull();
  });

  it("auto-selects the only rail of a country and shows that rail's fields", () => {
    mountForm();
    selectCountry('DE');
    expect(page.text()).toContain('SEPA');
    expect(input('beneficiary_name')).toBeTruthy();
  });

  it("never auto-selects a country's only rail when it is under maintenance (co_ach, #419)", () => {
    mountForm();
    selectCountry('CO');
    const ach = page.findByText<HTMLButtonElement>('button', 'ACH Colombia En mantenimiento');
    expect(ach.disabled).toBe(true);
    expect(page.container.querySelector('#rail-field-beneficiary_name')).toBeNull();
  });

  it('asks for a rail when the country has several, then shows its fields', () => {
    mountForm();
    selectCountry('US');
    expect(page.container.querySelector('#rail-field-routing_number')).toBeNull();
    expect(page.text()).toContain('ACH (US)');
    expect(page.text()).toContain('Wire (US)');
    expect(page.text()).toContain('SWIFT (USD)');
    expect(page.text()).not.toContain('USDT');

    page.click(page.findByText('button', 'Wire (US)'));
    expect(input('routing_number')).toBeTruthy();
    expect(page.container.querySelector('#rail-field-bic')).toBeNull();

    page.click(page.findByText('button', 'SWIFT (USD)'));
    expect(input('bic')).toBeTruthy();
    expect(page.container.querySelector('#rail-field-routing_number')).toBeNull();
  });

  it('tells the user the provider reviews the account before it can be used', () => {
    mountForm();
    selectCountry('DE');
    expect(page.text()).toMatch(/revis/i);
  });
});

describe('CreateBeneficiaryForm - submit', () => {
  it('blocks the submit and shows the field errors when the data is invalid', () => {
    mountForm();
    selectCountry('DE');
    changeValue(input('iban'), 'DE89');
    save();

    expect(mutate).not.toHaveBeenCalled();
    expect(page.text()).toContain('El IBAN no parece válido');
    expect(page.text()).toContain('Este dato es obligatorio');
  });

  it('submits the rail payload (ISO3 country, rail code, currency) when the data is valid', () => {
    mountForm();
    fillSepa();
    save();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      customer_id: 'cust-1',
      type: 'BANK_ACCOUNT',
      country: 'DEU',
      payment_rail: 'sepa',
      currency: 'EUR',
      beneficiary_name: 'Hans Muller',
      tax_id: 'DE123456789',
      iban: 'DE89370400440532013000',
    });
  });

  it('hands the created beneficiary to onSuccess', () => {
    const { onSuccess } = mountForm();
    fillSepa();
    save();

    const created = { id: 'b-1', beneficiary_name: 'Hans Muller', review_status: 'IN_REVIEW' };
    act(() => {
      mutate.mock.calls[0][1].onSuccess(created);
    });
    expect(onSuccess).toHaveBeenCalledWith(created);
  });

  it('maps a provider error to a human message and highlights the missing fields', () => {
    const { onError } = mountForm();
    fillSepa();
    save();

    act(() => {
      mutate.mock.calls[0][1].onError({
        response: {
          errors: [
            {
              message: 'raw',
              extensions: { code: 'BENEFICIARY_PROVIDER_FIELDS_MISSING', fields: ['bic'] },
            },
          ],
        },
      });
    });

    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Faltan datos'));
    expect(input('bic').getAttribute('aria-invalid')).toBe('true');
    expect(page.text()).toContain('El proveedor necesita este dato');
    expect(input('iban').getAttribute('aria-invalid')).toBe('false');
  });

  it('clears the highlight once the user edits that field', () => {
    mountForm();
    fillSepa();
    save();
    act(() => {
      mutate.mock.calls[0][1].onError({
        response: {
          errors: [
            {
              message: 'raw',
              extensions: { code: 'BENEFICIARY_PROVIDER_FIELDS_MISSING', fields: ['bic'] },
            },
          ],
        },
      });
    });
    changeValue(input('bic'), 'DEUTDEFF');
    expect(input('bic').getAttribute('aria-invalid')).toBe('false');
  });

  it('shows the mapped message inline unless hideInlineError is set', () => {
    mountForm();
    fillSepa();
    save();
    act(() => {
      mutate.mock.calls[0][1].onError({
        response: {
          errors: [{ message: 'raw', extensions: { code: 'BENEFICIARY_PROVIDER_REJECTED' } }],
        },
      });
    });
    expect(page.text()).toContain('rechazó los datos');
  });

  it('calls onCancel from the cancel button', () => {
    const { onCancel } = mountForm();
    page.click(page.findByText('button', 'Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('CreateBeneficiaryForm - catalogue states', () => {
  it('shows a loading skeleton while the catalogue loads', () => {
    catalogueState = { data: undefined, isLoading: true, error: null };
    mountForm();
    expect(page.container.querySelector('[data-testid="catalogue-loading"]')).not.toBeNull();
  });

  it('shows an error state when the catalogue fails', () => {
    catalogueState = { data: undefined, isLoading: false, error: new Error('boom') };
    mountForm();
    expect(page.text()).toContain('No pudimos cargar los países');
  });

  it('says so when no country has a usable rail', () => {
    catalogueState = { data: { countries: [] }, isLoading: false, error: null };
    mountForm();
    expect(page.text()).toContain('Todavía no hay países disponibles');
  });
});

describe('CreateBeneficiaryForm - address block (every rail)', () => {
  it('spei payload carries address_line_1, city and postal_code', () => {
    useMexicoSpei();
    mountForm();
    selectCountry('MX');
    changeValue(input('beneficiary_name'), 'Juan Perez');
    changeValue(input('tax_id'), 'PEPJ800101ABC');
    changeValue(input('clabe'), '012180001234567897');
    fillAddress();
    save();

    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({
      country: 'MEX',
      payment_rail: 'spei',
      address_line_1: 'Calle 1 #2',
      city: 'Ciudad de Mexico',
      postal_code: '06600',
    });
  });

  it('blocks spei without the address when Mesta serves the rail', () => {
    useMexicoSpei();
    mountForm();
    selectCountry('MX');
    changeValue(input('beneficiary_name'), 'Juan Perez');
    changeValue(input('tax_id'), 'PEPJ800101ABC');
    changeValue(input('clabe'), '012180001234567897');
    save();

    expect(mutate).not.toHaveBeenCalled();
    expect(input('address_line_1').getAttribute('aria-invalid')).toBe('true');
    expect(input('city').getAttribute('aria-invalid')).toBe('true');
    expect(input('postal_code').getAttribute('aria-invalid')).toBe('true');
    expect(input('state').getAttribute('aria-invalid')).toBe('false');
  });

  it('keeps the address optional when the back lists it as optional for a non-Mesta rail', () => {
    requirementsState = {
      data: {
        base_required: [],
        base_optional: [],
        rails: [{ rail: 'sepa', required: [], optional: [] }],
      },
    };
    catalogueState = {
      data: {
        countries: [
          {
            country: 'DE',
            rails: [
              {
                code: 'sepa',
                name: 'SEPA',
                currency: 'EUR',
                directions: ['OUTBOUND'],
                beneficiary_supported: true,
                providers: [{ code: 'kirafin', directions: ['OUTBOUND'], available: true }],
              },
            ],
          },
        ],
      },
      isLoading: false,
      error: null,
    };
    mountForm();
    selectCountry('DE');
    expect(page.container.querySelector('#rail-field-address_line_1')).not.toBeNull();
    expect(
      page.container.querySelector('label[for="rail-field-address_line_1"]')?.textContent
    ).toContain('(opcional)');
  });

  it('missing-fields 422 highlights the named address inputs', () => {
    useMexicoSpei();
    mountForm();
    selectCountry('MX');
    changeValue(input('beneficiary_name'), 'Juan Perez');
    changeValue(input('tax_id'), 'PEPJ800101ABC');
    changeValue(input('clabe'), '012180001234567897');
    fillAddress();
    save();

    act(() => {
      mutate.mock.calls[0][1].onError({
        response: {
          errors: [
            {
              message: 'raw',
              extensions: {
                code: 'BENEFICIARY_PROVIDER_FIELDS_MISSING',
                fields: ['address_line_1', 'city', 'postal_code'],
              },
            },
          ],
        },
      });
    });

    expect(input('address_line_1').getAttribute('aria-invalid')).toBe('true');
    expect(input('city').getAttribute('aria-invalid')).toBe('true');
    expect(input('postal_code').getAttribute('aria-invalid')).toBe('true');
    expect(input('clabe').getAttribute('aria-invalid')).toBe('false');
  });
});

describe('CreateBeneficiaryForm - S5 prefill from what we already know', () => {
  // Real shape of the snapshot prefill: address `street`, and no tax id (that comes from the profile).
  const PREFILL = {
    first_name: 'Ana',
    last_name: 'Pérez',
    customer_type: 'individual',
    address: { street: 'Calle 1 #2', city: 'Bogotá', state: 'DC', postal_code: '110111' },
  };

  beforeEach(() => {
    customerProfile = { tax_id: '1020304050' };
  });

  afterEach(() => {
    customerProfile = null;
  });

  it('prefills street, document and holder type of a business account (legal name, NIT, registered address)', () => {
    kycPrefill = {
      customer_type: 'business',
      business_name: 'Acme SAS',
      first_name: null,
      last_name: null,
      address: { street: 'Carrera 7 #8', city: 'Medellín', state: 'ANT', postal_code: '050001' },
    };
    customerProfile = { tax_id: '900123456', customer_type: 'business', business_name: 'Acme SAS' };
    mountForm();
    selectCountry('DE');
    expect(input('beneficiary_name').value).toBe('Acme SAS');
    expect(input('tax_id').value).toBe('900123456');
    expect(input('address_line_1').value).toBe('Carrera 7 #8');
  });

  it('prefills name, document and address for my own account (relationship = Soy yo)', () => {
    kycPrefill = PREFILL;
    mountForm();
    selectCountry('DE');
    expect(input('beneficiary_name').value).toBe('Ana Pérez');
    expect(input('tax_id').value).toBe('1020304050');
    expect(input('address_line_1').value).toBe('Calle 1 #2');
    expect(input('city').value).toBe('Bogotá');
  });

  it('keeps the prefilled fields editable', () => {
    kycPrefill = PREFILL;
    mountForm();
    selectCountry('DE');
    changeValue(input('beneficiary_name'), 'Ana P.');
    expect(input('beneficiary_name').value).toBe('Ana P.');
  });

  it('does not ask for the name of a third party from my data: switching to a third party clears the prefill', () => {
    kycPrefill = PREFILL;
    mountForm();
    selectCountry('DE');
    const relationship = Array.from(
      page.container.querySelectorAll<HTMLSelectElement>('select')
    ).find((el) => Array.from(el.options).some((o) => o.value === 'THIRD_PARTY'));
    expect(relationship).toBeDefined();
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    act(() => {
      setter?.call(relationship, 'THIRD_PARTY');
      relationship!.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(input('beneficiary_name').value).toBe('');
    expect(input('tax_id').value).toBe('');
  });

  it('leaves the form empty when we know nothing about the customer', () => {
    kycPrefill = null;
    mountForm();
    selectCountry('DE');
    expect(input('beneficiary_name').value).toBe('');
  });
});

describe('CreateBeneficiaryForm - controlled selects', () => {
  it('never hands a Select an undefined value (uncontrolled to controlled warning)', () => {
    selectValueProps.length = 0;
    mountForm();
    selectCountry('DE');
    expect(selectValueProps.length).toBeGreaterThan(0);
    expect(selectValueProps.filter((value) => value === undefined)).toEqual([]);
  });
});

describe('CreateBeneficiaryForm - S8 maintenance rails', () => {
  it('lists Colombia/Ecuador/Peru rails as "En mantenimiento", disabled', () => {
    catalogueState = {
      data: {
        countries: [
          {
            country: 'CO',
            rails: [
              {
                code: 'co_ach',
                name: 'ACH Colombia',
                currency: 'COP',
                directions: ['OUTBOUND'],
                beneficiary_supported: true,
                providers: [{ code: 'kirafin', directions: ['OUTBOUND'], available: true }],
              },
              {
                code: 'co_breb',
                name: 'Bre-B',
                currency: 'COP',
                directions: ['OUTBOUND'],
                beneficiary_supported: true,
                providers: [{ code: 'loopayx', directions: ['OUTBOUND'], available: true }],
              },
            ],
          },
        ],
      },
      isLoading: false,
      error: null,
    };
    mountForm();
    selectCountry('CO');
    const breb = page.findByText<HTMLButtonElement>('button', 'Bre-B En mantenimiento');
    expect(breb.disabled).toBe(true);
    const ach = page.findByText<HTMLButtonElement>('button', 'ACH Colombia En mantenimiento');
    expect(ach.disabled).toBe(true);
    page.click(breb);
    expect(page.container.querySelector('#rail-field-beneficiary_name')).toBeNull();
  });
});
