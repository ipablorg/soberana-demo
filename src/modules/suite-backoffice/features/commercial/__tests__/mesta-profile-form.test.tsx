/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { MestaProfileForm } from '../components/mesta-profile-form';
import { EMPTY_MESTA_PROFILE_FORM } from '../lib/mesta-profile';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

let page: MountedPage | null = null;

afterEach(() => {
  page?.unmount();
  page = null;
});

function typeInto(page: MountedPage, selector: string, value: string) {
  const input = page.container.querySelector<HTMLInputElement>(selector);
  if (!input) throw new Error(`No element for ${selector}`);
  page.flush(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

describe('MestaProfileForm', () => {
  it('renders the Mesta section with every business field', () => {
    page = mountPage(
      <MestaProfileForm value={EMPTY_MESTA_PROFILE_FORM} onChange={vi.fn()} idPrefix="t" />
    );

    const text = page.text();
    expect(text).toContain('Perfil de empresa para Mesta');
    for (const label of [
      'Teléfono',
      'Calle',
      'Ciudad',
      'Código postal',
      'Fecha de constitución',
      'Tipo de empresa',
      '¿Es una institución financiera?',
      'Número de empleados',
      'Volumen mensual estimado (USD)',
      'Monto promedio por transacción (USD)',
      'Países de las contrapartes',
      'Naturaleza de los pagos',
      'Origen de los fondos',
    ]) {
      expect(text).toContain(label);
    }
  });

  it('never asks for data the client record already holds', () => {
    page = mountPage(
      <MestaProfileForm value={EMPTY_MESTA_PROFILE_FORM} onChange={vi.fn()} idPrefix="t" />
    );

    const text = page.text();
    expect(text).not.toContain('Correo');
    expect(text).not.toContain('Email');
    expect(text).not.toContain('Tax ID');
    expect(text).not.toContain('Nombre');
  });

  it('uses a date picker for the registration date', () => {
    page = mountPage(
      <MestaProfileForm value={EMPTY_MESTA_PROFILE_FORM} onChange={vi.fn()} idPrefix="t" />
    );

    const date = page.container.querySelector<HTMLInputElement>('#t-registrationDate');
    expect(date?.type).toBe('date');
  });

  it('shows only the requested fields when a subset is given', () => {
    page = mountPage(
      <MestaProfileForm
        value={EMPTY_MESTA_PROFILE_FORM}
        onChange={vi.fn()}
        idPrefix="t"
        fields={['phone', 'sourceOfFunds']}
      />
    );

    const text = page.text();
    expect(text).toContain('Teléfono');
    expect(text).toContain('Origen de los fondos');
    expect(text).not.toContain('Calle');
    expect(text).not.toContain('Ciudad');
  });

  it('reports a change with the rest of the form intact', () => {
    const onChange = vi.fn();
    page = mountPage(
      <MestaProfileForm value={EMPTY_MESTA_PROFILE_FORM} onChange={onChange} idPrefix="t" />
    );

    typeInto(page, '#t-addressStreet', 'Calle 1 # 2-3');

    expect(onChange).toHaveBeenCalledWith({
      ...EMPTY_MESTA_PROFILE_FORM,
      addressStreet: 'Calle 1 # 2-3',
    });
  });

  it('shows the website reason field when the reason is missing', () => {
    page = mountPage(
      <MestaProfileForm
        value={EMPTY_MESTA_PROFILE_FORM}
        onChange={vi.fn()}
        idPrefix="t"
        fields={['websiteAbsenceReason']}
      />
    );

    expect(page.text()).toContain('Sitio web');
    expect(page.text()).toContain('Motivo por el que no tiene sitio web');
  });
});
