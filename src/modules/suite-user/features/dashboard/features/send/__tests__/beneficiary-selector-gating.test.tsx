/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import type { BeneficiaryResponse } from '@/shared/lib/beneficiaries-api';

import { BeneficiarySelector } from '../beneficiary-selector';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const beneficiary = (over: Record<string, unknown>) =>
  ({
    id: 'b',
    beneficiary_name: 'Ana',
    currency: 'MXN',
    review_status: 'APPROVED',
    rail: { code: 'spei' },
    ...over,
  }) as unknown as BeneficiaryResponse;

let page: MountedPage;

afterEach(() => page.unmount());

function rows() {
  return Array.from(page.container.querySelectorAll<HTMLButtonElement>('button[role="radio"]'));
}

describe('BeneficiarySelector gating (ported from the standalone /suite/send page)', () => {
  it('lets approved beneficiaries through and blocks the ones still in review', () => {
    const onSelect = vi.fn();
    page = mountPage(
      <BeneficiarySelector
        beneficiaries={[
          beneficiary({ id: 'ok' }),
          beneficiary({ id: 'wait', beneficiary_name: 'Luis', review_status: 'IN_REVIEW' }),
          beneficiary({
            id: 'no',
            beneficiary_name: 'Eva',
            review_status: 'REJECTED',
            review_reason: 'Datos incorrectos',
          }),
        ]}
        selectedBeneficiaryId={null}
        onSelect={onSelect}
      />
    );

    const [ok, wait, rejected] = rows();
    expect(ok.disabled).toBe(false);
    expect(wait.disabled).toBe(true);
    expect(rejected.disabled).toBe(true);
    expect(page.text()).toContain('Lo está revisando el proveedor');
    expect(page.text()).toContain('Datos incorrectos');

    page.click(wait);
    expect(onSelect).not.toHaveBeenCalled();
    page.click(ok);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disables beneficiaries on rails that are in maintenance', () => {
    const onSelect = vi.fn();
    page = mountPage(
      <BeneficiarySelector
        beneficiaries={[
          beneficiary({
            id: 'co',
            beneficiary_name: 'Camila',
            currency: 'COP',
            rail: { code: 'co_breb' },
          }),
        ]}
        selectedBeneficiaryId={null}
        onSelect={onSelect}
      />
    );

    expect(rows()[0].disabled).toBe(true);
    expect(page.text()).toContain('En mantenimiento');
    page.click(rows()[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
