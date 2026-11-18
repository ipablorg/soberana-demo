/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { BankDetailsDisplay } from '../bank-details-display';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

describe('BankDetailsDisplay', () => {
  it('renders labeled fields for a structured rail', () => {
    page = mountPage(
      <BankDetailsDisplay
        railCode="spei"
        bankDetails={{ clabe: '123456789012345678', bank_code: '002' }}
      />,
    );

    const rendered = page.text();

    expect(rendered).toContain('CLABE');
    expect(rendered).toContain('1234 5678 9012 3456 78');
    expect(rendered).toContain('Código de banco');
    expect(rendered).toContain('002');
  });

  it('shows the empty message when the structured rail has no values', () => {
    page = mountPage(<BankDetailsDisplay railCode="sepa" bankDetails={{}} />);

    expect(page.text()).toContain('Sin datos bancarios registrados.');
  });

  it('falls back to a collapsible raw-JSON view for an unknown rail', () => {
    page = mountPage(
      <BankDetailsDisplay
        railCode="custom_rail"
        bankDetails={{ foo: 'bar', nested: { x: 1 } }}
      />,
    );

    const summary = page.container.querySelector('summary');
    expect(summary?.textContent).toContain('Datos bancarios');

    const pre = page.container.querySelector('pre');
    expect(pre?.textContent).toContain('"foo": "bar"');
  });

  it('shows the empty message when an unknown rail has no payload', () => {
    page = mountPage(<BankDetailsDisplay railCode="custom_rail" bankDetails={null} />);

    expect(page.text()).toContain('Sin datos bancarios registrados.');
  });

  it('names the account type instead of the raw value (N-6)', () => {
    page = mountPage(
      <BankDetailsDisplay
        railCode="us_ach"
        bankDetails={{ routingNumber: '021000021', accountNumber: '9999', accountType: 'checking' }}
      />,
    );

    expect(page.text()).toContain('Corriente');
    expect(page.text()).not.toContain('checking');
    expect(page.text()).toContain('Número de ruta (routing)');
  });
});
