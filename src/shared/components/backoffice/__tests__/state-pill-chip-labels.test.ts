import { describe, expect, it } from 'vitest';

import { StatePillChipStatusLabel } from '../StatePillChip';

describe('StatePillChipStatusLabel', () => {
  it('translates the queue statuses ops sees to Spanish', () => {
    expect(StatePillChipStatusLabel('PENDING')).toBe('Pendiente');
    expect(StatePillChipStatusLabel('COMPLETED')).toBe('Completado');
    expect(StatePillChipStatusLabel('REJECTED')).toBe('Rechazado');
    expect(StatePillChipStatusLabel('PROCESSING')).toBe('En proceso');
    expect(StatePillChipStatusLabel('FAILED')).toBe('Fallido');
    expect(StatePillChipStatusLabel('ADDITIONAL_INFO_REQUIRED')).toBe('Info adicional');
    expect(StatePillChipStatusLabel('VERIFIED')).toBe('Verificado');
  });

  it('labels the KYC lifecycle and onboarding statuses instead of printing the raw enum', () => {
    expect(StatePillChipStatusLabel('NOT_INITIATED')).toBe('Sin iniciar');
    expect(StatePillChipStatusLabel('INITIATED')).toBe('Iniciado');
    expect(StatePillChipStatusLabel('PENDING_REVIEW')).toBe('Pendiente de revisión');
    expect(StatePillChipStatusLabel('LINKED')).toBe('Vinculado');
  });

  it('labels the beneficiary UNVERIFIED status (deactivate/reactivate confirmation)', () => {
    expect(StatePillChipStatusLabel('UNVERIFIED')).toBe('No verificado');
  });

  it('is case-insensitive so lowercase provider statuses also resolve', () => {
    expect(StatePillChipStatusLabel('pending')).toBe('Pendiente');
    expect(StatePillChipStatusLabel('completed')).toBe('Completado');
  });

  it('returns the raw status unchanged when no label is known', () => {
    expect(StatePillChipStatusLabel('WEIRD_STATUS')).toBe('WEIRD_STATUS');
  });
});

describe('StatePillChipStatusLabel — operational statuses', () => {
  it('labels customer, client and API key statuses in Spanish', () => {
    expect(StatePillChipStatusLabel('SUSPENDED')).toBe('Suspendido');
    expect(StatePillChipStatusLabel('FROZEN')).toBe('Congelado');
    expect(StatePillChipStatusLabel('OFFBOARDED')).toBe('Dado de baja');
    expect(StatePillChipStatusLabel('REVOKED')).toBe('Revocado');
    expect(StatePillChipStatusLabel('INACTIVE')).toBe('Inactivo');
    expect(StatePillChipStatusLabel('CLOSED')).toBe('Cerrado');
  });
});
