import { describe, expect, it } from 'vitest';

import {
  actorLabel,
  feeModeLabel,
  feeOperationLabel,
  onboardingFailure,
} from '../commercial-labels';
import { onboardingStatusLabel } from '../commercial-labels';

const t = (d: { message?: string; id?: string }) => d.message ?? d.id ?? '';

describe('fee enum labels', () => {
  it('humanizes every FeeOperation', () => {
    expect(feeOperationLabel('VA_CREATION', t)).toBe('Creación de cuenta virtual');
    expect(feeOperationLabel('DEPOSIT', t)).toBe('Depósito');
    expect(feeOperationLabel('WITHDRAWAL', t)).toBe('Retiro');
    expect(feeOperationLabel('PAYOUT', t)).toBe('Pago');
    expect(feeOperationLabel('P2P', t)).toBe('P2P');
    expect(feeOperationLabel('CRYPTO_TRANSFER', t)).toBe('Transferencia cripto');
  });

  it('humanizes every FeeMode', () => {
    expect(feeModeLabel('FIXED', t)).toBe('Fijo');
    expect(feeModeLabel('PERCENT', t)).toBe('Porcentaje');
  });
});

describe('actorLabel', () => {
  it('shows the system when there is no actor', () => {
    expect(actorLabel(null)).toBe('Sistema');
  });

  it('prefers a resolved email/name over the raw id', () => {
    expect(actorLabel('a3e420e9-1111', { 'a3e420e9-1111': 'ana@loopay.com' })).toBe(
      'ana@loopay.com'
    );
  });

  it('never shows a full UUID when it cannot be resolved', () => {
    expect(actorLabel('a3e420e9-8c7b-4a1f-9d2e-111122223333')).toBe('Staff · a3e420e9');
  });
});

describe('onboardingFailure', () => {
  const base = {
    provider: 'mesta',
    providerCustomerId: null,
    retryable: true,
    skipped: false,
    verificationUrl: null,
  };

  it('reports a FAILED result with status and humanized reason', () => {
    const failure = onboardingFailure({
      ...base,
      status: 'FAILED',
      errorCode: 'PROVIDER_TIMEOUT',
      errorMessage: 'upstream timeout',
    });
    expect(failure?.status).toBe('FAILED');
    expect(failure?.reason).toContain('upstream timeout');
  });

  it('falls back to the error code when there is no message', () => {
    const failure = onboardingFailure({
      ...base,
      status: 'FAILED',
      errorCode: 'KIRAFIN_TIMEOUT',
      errorMessage: null,
    });
    expect(failure?.reason).toContain('KIRAFIN_TIMEOUT');
  });

  it('returns null when the attempt did not fail', () => {
    expect(
      onboardingFailure({ ...base, status: 'LINKED', errorCode: null, errorMessage: null })
    ).toBeNull();
  });
});

describe('onboardingStatusLabel', () => {
  const tr = (d: { message?: unknown; id: string }) => String(d.message ?? d.id);

  it('names the provider onboarding status instead of the raw enum', () => {
    expect(onboardingStatusLabel('LINKED', tr)).toBe('Vinculado');
    expect(onboardingStatusLabel('MANUAL', tr)).toBe('Vinculado manualmente');
    expect(onboardingStatusLabel('PENDING', tr)).toBe('Pendiente');
    expect(onboardingStatusLabel('FAILED', tr)).toBe('Fallido');
  });
});
