/* @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { CompleteProviderProfileDialog } from '../complete-provider-profile-dialog';

const mutate = vi.fn();
const usePrefillMock = vi.fn();
let capturedOnCompleted: ((result: unknown) => void) | undefined;
let capturedOnFailed: ((description: string) => void) | undefined;

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-provider-onboarding-retry', () => ({
  useProviderProfilePrefill: (customerId: string) => usePrefillMock(customerId),
  useRetryEndorsementOnboarding: (
    onCompleted: (result: unknown) => void,
    onFailed?: (description: string) => void,
  ) => {
    capturedOnCompleted = onCompleted;
    capturedOnFailed = onFailed;
    return { mutate, isPending: false };
  },
}));

const DETAIL = {
  adminLoopay_getCustomerKycData: {
    customer: { tax_id: '900123456', first_name: 'Acme SAS', last_name: '' },
    kyc_data: { businessLegalName: 'Acme SAS', phone: '+573001112233' },
  },
};

let page: MountedPage;

function bodyText(): string {
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

function input(id: string): HTMLInputElement | null {
  return document.body.querySelector<HTMLInputElement>(`#${id}`);
}

function button(label: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll('button')).find(
    (node) => (node.textContent ?? '').trim() === label,
  );
}

beforeEach(() => {
  mutate.mockReset();
  usePrefillMock.mockReset();
  usePrefillMock.mockReturnValue({ data: DETAIL, isLoading: false });
});

afterEach(() => {
  page?.unmount();
});

describe('CompleteProviderProfileDialog', () => {
  it('prefills the registration number from the stored provider profile (N-10)', () => {
    usePrefillMock.mockReturnValue({
      data: {
        adminLoopay_getCustomerKycData: {
          ...DETAIL.adminLoopay_getCustomerKycData,
          provider_profile: { registrationNumber: 'RM-2019-0042' },
        },
      },
      isLoading: false,
    });

    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['registrationNumber']}
        onClose={vi.fn()}
      />,
    );

    expect(input('provider-profile-registrationNumber')?.value).toBe('RM-2019-0042');
  });

  it('asks only the missing data, prefilled with what the customer already has', () => {
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['registrationNumber', 'phone', 'businessName']}
        onClose={vi.fn()}
      />,
    );

    expect(usePrefillMock).toHaveBeenCalledWith('c-1');
    // The tax id is never offered as the registration number (NF-3).
    expect(input('provider-profile-registrationNumber')?.value).toBe('');
    expect(bodyText()).toContain('Número del registro mercantil, distinto del ID fiscal');
    expect(input('provider-profile-phone')?.value).toBe('+573001112233');
    expect(input('provider-profile-numberOfEmployees')).toBeNull();
    expect(input('provider-profile-addressStreet')).toBeNull();
    // Data the backoffice cannot complete here is listed, not asked.
    expect(bodyText()).toContain('Razón social');
  });

  it('saves the completed data and retries the onboarding', () => {
    const onRetried = vi.fn();
    const onClose = vi.fn();
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['phone']}
        onClose={onClose}
        onRetried={onRetried}
      />,
    );

    page.click(button('Guardar y reintentar')!);

    expect(mutate).toHaveBeenCalledWith({
      endorsementId: 'e-1',
      providerProfile: { phone: '+573001112233' },
    });

    const result = { state: 'ACTIVE', missing_fields: [] };
    page.flush(() => capturedOnCompleted?.({ adminLoopay_retryEndorsementOnboarding: result }));
    expect(onRetried).toHaveBeenCalledWith(result);
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps the retry disabled while an asked field is empty', () => {
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['numberOfEmployees']}
        onClose={vi.fn()}
      />,
    );

    expect(button('Guardar y reintentar')?.disabled).toBe(true);
  });

  it('keeps the dialog open and shows the provider error when the retry fails', () => {
    const onRetried = vi.fn();
    const onClose = vi.fn();
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['phone']}
        onClose={onClose}
        onRetried={onRetried}
      />,
    );

    page.click(button('Guardar y reintentar')!);
    const failed = { state: 'FAILED', missing_fields: [], error_message: 'VALIDATION_FAILED' };
    page.flush(() => {
      capturedOnFailed?.('VALIDATION_FAILED');
      capturedOnCompleted?.({ adminLoopay_retryEndorsementOnboarding: failed });
    });

    expect(onClose).not.toHaveBeenCalled();
    expect(onRetried).not.toHaveBeenCalled();
    const alert = document.body.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('VALIDATION_FAILED');
  });

  it('keeps the dialog open and shows the error when the call itself fails', () => {
    const onClose = vi.fn();
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['phone']}
        onClose={onClose}
      />,
    );

    page.click(button('Guardar y reintentar')!);
    page.flush(() => capturedOnFailed?.('No pudimos conectar con el servidor'));

    expect(onClose).not.toHaveBeenCalled();
    expect(document.body.querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos conectar con el servidor',
    );
  });

  it('asks the registered-address country with a country select, not an ISO free text', () => {
    usePrefillMock.mockReturnValue({
      data: {
        adminLoopay_getCustomerKycData: {
          customer: { tax_id: '900123456', first_name: 'Ana', last_name: 'Ruiz' },
          kyc_data: { registeredAddress: { street: 'Cra 1', city: 'Bogotá', country: 'CO' } },
        },
      },
      isLoading: false,
    });
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['registeredAddress']}
        onClose={vi.fn()}
      />,
    );

    const country = document.body.querySelector('#provider-profile-addressCountry');
    expect(country?.tagName).toBe('BUTTON');
    expect(country?.textContent).toContain('Colombia');
    expect(bodyText()).not.toContain('código ISO');
  });

  it('asks the industry and lists the OPS_CHECKLIST items as a checklist without inputs', () => {
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['businessIndustry', 'associated_persons:nationality', 'ein']}
        missingFieldDetails={[
          { key: 'businessIndustry', group: 'business_profile', kind: 'PROFILE_FIELD' },
          { key: 'associated_persons:nationality', group: 'associated_persons', kind: 'OPS_CHECKLIST' },
          { key: 'ein', group: 'provider_request', kind: 'OPS_CHECKLIST' },
        ]}
        onClose={vi.fn()}
      />,
    );

    expect(document.body.querySelector('#provider-profile-businessIndustry')?.tagName).toBe('BUTTON');
    const checklist = document.body.querySelector('[data-testid="ops-checklist"]');
    // Grouped by section (N-6): the person fields sit under owners and representatives.
    expect(checklist?.textContent).toContain('Propietarios y representantesNacionalidad');
    expect(checklist?.textContent).toContain('EIN');
    expect(checklist?.querySelector('input')).toBeNull();
  });

  it('stays open and lists what the provider still asks after a retry that is still blocked (N-4)', () => {
    const onRetried = vi.fn();
    const onClose = vi.fn();
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['phone', 'identifying_information:file_bylaws']}
        missingFieldDetails={[
          { key: 'phone', group: 'business_profile', kind: 'PROFILE_FIELD' },
          {
            key: 'identifying_information:file_bylaws',
            group: 'identifying_information',
            kind: 'OPS_CHECKLIST',
          },
        ]}
        onClose={onClose}
        onRetried={onRetried}
      />,
    );

    page.click(button('Guardar y reintentar')!);
    const stillBlocked = {
      state: 'PROVIDER_ONBOARDING',
      provider_code: 'kirafin',
      error_code: null,
      error_message: null,
      missing_fields: ['identifying_information:file_bylaws', 'pep_status'],
      missing_field_details: [
        {
          key: 'identifying_information:file_bylaws',
          group: 'identifying_information',
          kind: 'OPS_CHECKLIST',
        },
        { key: 'pep_status', group: 'provider_request', kind: 'OPS_CHECKLIST' },
      ],
    };
    page.flush(() =>
      capturedOnCompleted?.({ adminLoopay_retryEndorsementOnboarding: stillBlocked }),
    );

    expect(onClose).not.toHaveBeenCalled();
    expect(onRetried).not.toHaveBeenCalled();
    const result = document.body.querySelector('[data-testid="retry-still-blocked"]');
    expect(result?.textContent).toContain('El proveedor todavía pide:');
    expect(result?.textContent).toContain('Estatutos de la empresa');
    expect(result?.textContent).toContain('¿Es una persona expuesta políticamente (PEP)?');
    // The form now asks only what is left: the phone was accepted.
    expect(input('provider-profile-phone')).toBeNull();
  });

  it('groups the provider checklist into documents, ownership and questionnaire (N-6)', () => {
    page = mountPage(
      <CompleteProviderProfileDialog
        endorsementId="e-1"
        customerId="c-1"
        missingFields={['identifying_information:file_bylaws', 'associated_persons:ssn', 'pep_status']}
        missingFieldDetails={[
          { key: 'identifying_information:file_bylaws', group: 'identifying_information', kind: 'OPS_CHECKLIST' },
          { key: 'associated_persons:ssn', group: 'associated_persons', kind: 'OPS_CHECKLIST' },
          { key: 'pep_status', group: 'provider_request', kind: 'OPS_CHECKLIST' },
        ]}
        onClose={vi.fn()}
      />,
    );

    const checklist = document.body.querySelector('[data-testid="ops-checklist"]')?.textContent ?? '';
    expect(checklist).toContain('Documentos');
    expect(checklist).toContain('Estatutos de la empresa');
    expect(checklist).toContain('Propietarios y representantes');
    expect(checklist).toContain('Cuestionario de cumplimiento');
  });
});
