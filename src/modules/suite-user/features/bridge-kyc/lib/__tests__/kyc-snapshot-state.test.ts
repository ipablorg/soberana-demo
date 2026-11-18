import { describe, expect, it } from 'vitest';

import {
  buildKycSupportHref,
  deriveKycSnapshotState,
  formatPendingRequirementLabel,
  formatRequirementLabel,
  hasExecutableKycRecovery,
  hasOutstandingRequirements,
  pickPrimaryKycAction,
  shouldEscalateKycToSupport,
  shouldPollKycLifecycle,
} from '../kyc-snapshot-state';

describe('kyc-snapshot-state', () => {
  it('derives resume and refresh actions from an additional-info snapshot', () => {
    const state = deriveKycSnapshotState({
      lifecycle: 'ADDITIONAL_INFO_REQUIRED',
      provider_customer_state: 'incomplete',
      tos: { accepted: false, url: 'https://bridge.test/tos' },
      requirements: {
        missing: {
          fields: ['tax_id'],
          document_purposes: ['proof_of_address'],
          questionnaire_fields: ['source_of_funds'],
        },
        pending: [],
        issues: [],
      },
      reasons: [
        {
          code: 'proof_of_address',
          target_type: 'document_purpose',
          target_key: 'proof_of_address',
          message: 'We need an updated proof of address document.',
          retryable: true,
        },
      ],
      actions: ['accept_tos', 'resume', 'reconcile'],
      freshness: {
        snapshot_generated_at: '2026-06-26T10:00:00.000Z',
        provider_checked_at: '2026-06-26T10:00:00.000Z',
        webhook_updated_at: null,
        last_reconciliation_source: 'resume',
        reconciliation_state: 'stale',
      },
    });

    expect(state.needsResume).toBe(true);
    expect(state.needsManualRefresh).toBe(true);
    expect(state.canAcceptTos).toBe(true);
    expect(pickPrimaryKycAction(state)).toBe('accept_tos');
  });

  it('treats FAILED as terminal and non-polling', () => {
    const state = deriveKycSnapshotState({
      lifecycle: 'FAILED',
      provider_customer_state: 'paused',
      tos: { accepted: true, url: null },
      requirements: {
        missing: { fields: [], document_purposes: [], questionnaire_fields: [] },
        pending: [],
        issues: [],
      },
      reasons: [],
      actions: ['contact_support'],
      freshness: {
        snapshot_generated_at: '2026-06-26T10:00:00.000Z',
        provider_checked_at: null,
        webhook_updated_at: null,
        last_reconciliation_source: 'manual_refresh',
        reconciliation_state: 'refresh_failed',
      },
    });

    expect(state.isFailed).toBe(true);
    expect(state.isTerminal).toBe(true);
    expect(shouldPollKycLifecycle('FAILED')).toBe(false);
  });

  it('keeps retryable terminal states executable even when support is also available', () => {
    const state = deriveKycSnapshotState({
      lifecycle: 'REJECTED',
      provider_customer_state: 'rejected',
      tos: { accepted: true, url: null },
      requirements: {
        missing: { fields: ['tax_id'], document_purposes: [], questionnaire_fields: [] },
        pending: [],
        issues: [],
      },
      reasons: [],
      actions: ['resume', 'contact_support'],
      freshness: {
        snapshot_generated_at: '2026-06-26T10:00:00.000Z',
        provider_checked_at: null,
        webhook_updated_at: null,
        last_reconciliation_source: 'resume',
        reconciliation_state: 'fresh',
      },
    });

    expect(hasExecutableKycRecovery(state)).toBe(true);
    expect(shouldEscalateKycToSupport(state)).toBe(false);
    expect(pickPrimaryKycAction(state)).toBe('resume');
  });

  it('escalates to support when contact_support is the only remaining action', () => {
    const state = deriveKycSnapshotState({
      lifecycle: 'FAILED',
      provider_customer_state: 'failed',
      tos: { accepted: true, url: null },
      requirements: {
        missing: { fields: [], document_purposes: [], questionnaire_fields: [] },
        pending: [],
        issues: [],
      },
      reasons: [],
      actions: ['contact_support'],
      freshness: {
        snapshot_generated_at: '2026-06-26T10:00:00.000Z',
        provider_checked_at: null,
        webhook_updated_at: null,
        last_reconciliation_source: 'manual_refresh',
        reconciliation_state: 'refresh_failed',
      },
    });

    expect(hasExecutableKycRecovery(state)).toBe(false);
    expect(shouldEscalateKycToSupport(state)).toBe(true);
    expect(pickPrimaryKycAction(state)).toBe('reconcile');
  });

  it('builds a support mailto with lifecycle and customer context', () => {
    const href = buildKycSupportHref({
      lifecycle: 'EXPIRED',
      customerStatus: 'under_review',
      customerId: 'cust_123',
    });

    expect(href).toContain('mailto:legal@loopay.com');
    expect(decodeURIComponent(href)).toContain('KYC support request — EXPIRED');
    expect(decodeURIComponent(href)).toContain('Customer profile ID: cust_123');
  });

  it('formats known requirement labels', () => {
    expect(formatRequirementLabel('field', 'tax_id')).toBe('Tax ID');
    expect(formatRequirementLabel('document', 'proof_of_address')).toBe('Proof of address');
    expect(formatRequirementLabel('questionnaire', 'source_of_funds')).toBe('Source of funds');
  });

  it('formats pending requirement labels by editability', () => {
    expect(formatPendingRequirementLabel('field', 'tax_id')).toBe('Tax ID submitted');
    expect(formatPendingRequirementLabel('document_purpose', 'proof_of_address')).toBe('Proof of address submitted');
    expect(formatPendingRequirementLabel('review', 'bridge_review')).toBe('Review in progress');
    expect(formatPendingRequirementLabel('field', 'external_account')).toBe('External account setup needed');
    expect(formatPendingRequirementLabel('field', 'terms_of_service_v2')).toBe('Updated Terms of Service acceptance needed');
    expect(formatPendingRequirementLabel('field', 'post_processing')).toBe('Post-processing in progress');
  });

  it('detects outstanding requirements from the snapshot', () => {
    expect(
      hasOutstandingRequirements({
        lifecycle: 'ADDITIONAL_INFO_REQUIRED',
        provider_customer_state: 'incomplete',
        tos: { accepted: true, url: null },
        requirements: {
          missing: {
            fields: [],
            document_purposes: ['proof_of_address'],
            questionnaire_fields: [],
          },
          pending: [],
          issues: [],
        },
        reasons: [],
        actions: ['resume'],
        freshness: {
          snapshot_generated_at: '2026-06-26T10:00:00.000Z',
          provider_checked_at: '2026-06-26T10:00:00.000Z',
          webhook_updated_at: null,
          last_reconciliation_source: 'resume',
          reconciliation_state: 'fresh',
        },
      }),
    ).toBe(true);
  });
});
