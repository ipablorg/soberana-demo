/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ReviewEndorsementResult } from '@/graphql/mutations/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';

import { EndorsementOnboardingResult } from '../endorsement-onboarding-result';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;

function resultWith(
  onboarding: ReviewEndorsementResult['onboarding'],
): ReviewEndorsementResult {
  return {
    id: 'e1',
    customer_id: 'c1',
    rail_code: 'co_breb',
    previous_status: 'PENDING',
    status: 'APPROVED',
    review_reason: null,
    activated_at: null,
    reviewed_by: 'u1',
    reviewed_at: '2026-07-09T12:30:00.000Z',
    onboarding,
  };
}

function renderResult(
  onboarding: ReviewEndorsementResult['onboarding'],
  onCompleteData?: () => void,
) {
  page = mountPage(
    <EndorsementOnboardingResult
      result={resultWith(onboarding)}
      onClose={vi.fn()}
      onCompleteData={onCompleteData}
    />,
  );
  // Radix dialogs render in a portal outside the mount container.
  return (document.body.textContent ?? '').replace(/\s+/g, ' ');
}

afterEach(() => {
  page?.unmount();
});

describe('EndorsementOnboardingResult', () => {
  it('shows "Cuenta creada" when the virtual account is active', () => {
    const text = renderResult({
      state: 'ACTIVE',
      provider_code: 'mesta',
      error_code: null,
      error_message: null,
      missing_fields: [],
      missing_field_details: [],
    });

    expect(text).toContain('Cuenta creada');
    expect(text).toContain('Mesta');
  });

  it('shows the provider blocker while the provider is still onboarding', () => {
    const text = renderResult({
      state: 'PROVIDER_ONBOARDING',
      provider_code: 'kirafin',
      error_code: 'KYC_PENDING',
      error_message: null,
      missing_fields: [],
      missing_field_details: [],
    });

    expect(text).toContain('En onboarding con el proveedor');
    expect(text).toContain('KYC_PENDING');
  });

  it('renders the failure message when the onboarding FAILED', () => {
    const text = renderResult({
      state: 'FAILED',
      provider_code: 'mesta',
      error_code: 'validation_error',
      error_message: 'address.state is not valid for US',
      missing_fields: [],
      missing_field_details: [],
    });

    expect(text).toContain('address.state is not valid for US');
    expect(text).not.toContain('Cuenta creada');
  });

  it('renders nothing when no onboarding was kicked', () => {
    const text = renderResult(null);

    expect(text).not.toContain('Resultado de la aprobación');
  });

  it('lists the missing data in Spanish and offers to complete it and retry', () => {
    const onCompleteData = vi.fn();
    const text = renderResult(
      {
        state: 'PROVIDER_ONBOARDING',
        provider_code: 'mesta',
        error_code: 'MESTA_MISSING_REGISTRATIONNUMBER',
        error_message: null,
        missing_fields: ['registrationNumber', 'numberOfEmployees', 'website'],
        missing_field_details: [],
      },
      onCompleteData,
    );

    expect(text).toContain('Número de registro de la empresa');
    expect(text).toContain('Número de empleados');
    expect(text).toContain('Sitio web o motivo por el que no tiene');

    const button = Array.from(document.body.querySelectorAll('button')).find(
      (node) => (node.textContent ?? '').trim() === 'Completar datos y reintentar',
    );
    expect(button).toBeDefined();
    page.click(button!);
    expect(onCompleteData).toHaveBeenCalledTimes(1);
  });

  it('does not offer the retry when nothing is missing', () => {
    const text = renderResult(
      {
        state: 'ACTIVE',
        provider_code: 'mesta',
        error_code: null,
        error_message: null,
        missing_fields: [],
        missing_field_details: [],
      },
      vi.fn(),
    );

    expect(text).not.toContain('Completar datos y reintentar');
  });

  it('explains a status code in a sentence and names the provider (N-6)', () => {
    const text = renderResult({
      state: 'SKIPPED',
      provider_code: 'kirafin',
      error_code: 'WALLET_NOT_PROVISIONED',
      error_message: null,
      missing_fields: [],
      missing_field_details: [],
    });

    expect(text).toContain('KiraFin');
    expect(text).toContain('El cliente todavía no tiene billetera: créela antes de reintentar el alta.');
    expect(text).not.toContain('WALLET_NOT_PROVISIONED');
  });

  it('labels a missing-data code by its key instead of the redacted provider message', () => {
    const text = renderResult({
      state: 'PROVIDER_ONBOARDING',
      provider_code: 'kirafin',
      error_code: 'KIRAFIN_RFI_PEP_STATUS',
      error_message: "kirafin requests field '<redacted>' before activation",
      missing_fields: [],
      missing_field_details: [],
    });

    expect(text).not.toContain('<redacted>');
    expect(text).toContain('¿Es una persona expuesta políticamente (PEP)?');
  });
});
