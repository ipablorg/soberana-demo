import { describe, expect, it } from 'vitest';

import { clientNameFor, kycStatusLabel } from '../ops-labels';

describe('kycStatusLabel', () => {
  it.each([
    ['NOT_INITIATED', 'Sin iniciar'],
    ['INITIATED', 'Iniciado'],
    ['PENDING_REVIEW', 'Pendiente de revisión'],
    ['ADDITIONAL_INFO_REQUIRED', 'Falta información'],
    ['APPROVED', 'Aprobado'],
    ['REJECTED', 'Rechazado'],
    ['EXPIRED', 'Vencido'],
  ])('labels %s as "%s"', (status, label) => {
    expect(kycStatusLabel(status)).toBe(label);
  });

  it('keeps an unknown status readable', () => {
    expect(kycStatusLabel('WEIRD_STATE')).toBe('WEIRD_STATE');
  });
});

describe('clientNameFor', () => {
  const options = [{ client_id: 'c-1', client_name: 'Acme Tenant', is_active: true }];

  it('returns the tenant name instead of the UUID', () => {
    expect(clientNameFor(options, 'c-1')).toBe('Acme Tenant');
  });

  it('falls back to a shortened id while the names have not loaded', () => {
    expect(clientNameFor([], '5a0c1e93-2b7d-4f6a-8c3d-222222222222')).toBe('5a0c1e93…');
  });
});
