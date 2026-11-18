import { describe, expect, it } from 'vitest';

import type { AdminDispersionQueueRow } from '@/graphql/queries/admin-loopay';

import {
  buildApproveWithdrawalInput,
  canApproveWithdrawal,
  canRejectWithdrawal,
  canRetryFunding,
  canRetryReturn,
  isInApprovalFlowLock,
  queueFilterOf,
  staleAlertKind,
  withdrawalDecisionFailureOf,
} from '../dispersion-approval';
import { canCancelDispersion, canCompleteManually, canFailDispersion } from '../dispersion-payout';

function row(overrides: Partial<AdminDispersionQueueRow> = {}): AdminDispersionQueueRow {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    reference_code: 'WD-ABC-123',
    customer_id: 'customer-1',
    customer_email: 'ana@example.com',
    client_id: 'client-1',
    client_name: 'Trokera',
    wallet_id: 'wallet-1',
    amount: '10',
    currency: 'USDT',
    status: 'PENDING',
    held_amount: '10',
    beneficiary: null,
    funds_location: 'ops_vault',
    created_at: '2026-11-01T00:00:00.000Z',
    review_reason: null,
    reviewed_at: null,
    quote_rate: null,
    quote_source_amount: null,
    quote_source_currency: null,
    quote_target_amount: null,
    quote_target_currency: null,
    fee_amount: null,
    fee_source: null,
    fee_currency: null,
    settlement_amount: null,
    settlement_currency: null,
    settlement_rate: null,
    settlement_bank_rate: null,
    settlement_fees: null,
    settlement_external_reference: null,
    dispersion_state: 'AWAITING_APPROVAL',
    approval_required: true,
    payout: null,
    ...overrides,
  };
}

function payout(state: string): AdminDispersionQueueRow['payout'] {
  return {
    state,
    providerCode: 'mesta',
    terminalVendorStatus: null,
    placedAt: null,
    terminalAt: null,
  };
}

function graphQLError(extensions: Record<string, unknown>) {
  return Object.assign(new Error('GraphQL error'), {
    response: { errors: [{ message: 'refused', extensions }] },
  });
}

describe('withdrawal approval decisions (#413)', () => {
  it('approves and rejects a PENDING withdrawal waiting for the approval', () => {
    expect(canApproveWithdrawal(row())).toBe(true);
    expect(canRejectWithdrawal(row())).toBe(true);
  });

  it('never approves a row outside AWAITING_APPROVAL', () => {
    expect(canApproveWithdrawal(row({ dispersion_state: 'PENDING' }))).toBe(false);
    expect(canApproveWithdrawal(row({ dispersion_state: null }))).toBe(false);
    expect(canApproveWithdrawal(row({ dispersion_state: 'APPROVED' }))).toBe(false);
  });

  it('rejects an APPROVED withdrawal only when no Mesta order exists (placement REJECTED or BLOCKED)', () => {
    expect(
      canRejectWithdrawal(row({ dispersion_state: 'APPROVED', payout: payout('REJECTED') }))
    ).toBe(true);
    expect(
      canRejectWithdrawal(row({ dispersion_state: 'APPROVED', payout: payout('BLOCKED') }))
    ).toBe(true);
    expect(
      canRejectWithdrawal(row({ dispersion_state: 'APPROVED', payout: payout('UNKNOWN') }))
    ).toBe(false);
    expect(
      canRejectWithdrawal(
        row({ status: 'PROCESSING', dispersion_state: 'PROCESSING', payout: payout('PLACED') })
      )
    ).toBe(false);
  });

  it('approves with the gross in the ops vault and the trimmed note', () => {
    expect(buildApproveWithdrawalInput('  ok ops  ')).toEqual({
      fundsLocation: 'ops_vault',
      note: 'ok ops',
    });
    expect(buildApproveWithdrawalInput('   ')).toEqual({ fundsLocation: 'ops_vault' });
  });
});

describe('withdrawal retries (#413)', () => {
  it('retries a BLOCKED placement of an approved withdrawal and a BLOCKED funding of a placed order', () => {
    expect(canRetryFunding(row({ dispersion_state: 'APPROVED', payout: payout('BLOCKED') }))).toBe(
      true
    );
    expect(
      canRetryFunding(
        row({ status: 'PROCESSING', dispersion_state: 'PROCESSING', funding_status: 'BLOCKED' })
      )
    ).toBe(true);
  });

  it('offers no funding retry while nothing is blocked', () => {
    expect(canRetryFunding(row())).toBe(false);
    expect(canRetryFunding(row({ dispersion_state: 'APPROVED', payout: payout('UNKNOWN') }))).toBe(
      false
    );
    expect(
      canRetryFunding(
        row({ status: 'PROCESSING', dispersion_state: 'FUNDING', funding_status: 'SENT' })
      )
    ).toBe(false);
  });

  it('retries a return still RETURNING whose last attempt failed, was rejected or never started', () => {
    expect(canRetryReturn(row({ dispersion_state: 'RETURNING', return_status: 'FAILED' }))).toBe(
      true
    );
    expect(canRetryReturn(row({ dispersion_state: 'RETURNING', return_status: 'REJECTED' }))).toBe(
      true
    );
    expect(canRetryReturn(row({ dispersion_state: 'RETURNING', return_status: null }))).toBe(true);
  });

  it('never retries a return that is sent or unknown, or a row that is not RETURNING', () => {
    expect(canRetryReturn(row({ dispersion_state: 'RETURNING', return_status: 'SENT' }))).toBe(
      false
    );
    expect(canRetryReturn(row({ dispersion_state: 'RETURNING', return_status: 'UNKNOWN' }))).toBe(
      false
    );
    expect(canRetryReturn(row({ dispersion_state: 'FAILED', return_status: 'FAILED' }))).toBe(
      false
    );
  });
});

describe('manual actions on a row in the approval flow (#413 M2)', () => {
  it.each(['AWAITING_APPROVAL', 'APPROVED', 'FUNDING', 'RETURNING', 'RETURN_MATCH_REQUIRED'])(
    'offers no manual complete, cancel or fail in %s',
    (state) => {
      const locked = row({ dispersion_state: state });

      expect(isInApprovalFlowLock(locked)).toBe(true);
      expect(canCompleteManually(locked)).toBe(false);
      expect(canCancelDispersion(locked)).toBe(false);
      expect(canFailDispersion({ ...locked, status: 'PROCESSING' })).toBe(false);
    }
  );

  it('keeps the manual actions of a v2 PENDING row outside the flow', () => {
    const pending = row({ dispersion_state: 'PENDING', approval_required: false });

    expect(isInApprovalFlowLock(pending)).toBe(false);
    expect(canCompleteManually(pending)).toBe(true);
    expect(canCancelDispersion(pending)).toBe(true);
  });
});

describe('queue views', () => {
  it('maps the approval view to PENDING rows in AWAITING_APPROVAL', () => {
    expect(queueFilterOf('AWAITING_APPROVAL')).toEqual({
      status: 'PENDING',
      dispersionState: 'AWAITING_APPROVAL',
    });
    expect(queueFilterOf('PENDING')).toEqual({ status: 'PENDING' });
    expect(queueFilterOf('PROCESSING')).toEqual({ status: 'PROCESSING' });
  });
});

describe('stale alerts (#410)', () => {
  it('names each stale alert the scan raises', () => {
    expect(staleAlertKind('dispersion.sweep_unsettled')).toBe('sweep-unsettled');
    expect(staleAlertKind('dispersion.payout_no_provider_event')).toBe('payout-no-event');
    expect(staleAlertKind('awaiting_approval')).toBe('awaiting-approval');
    expect(staleAlertKind('dispersion.awaiting_approval_stale')).toBe('awaiting-approval');
    expect(staleAlertKind('something.else')).toBe('other');
  });
});

describe('decision failures', () => {
  it('explains a missing second factor', () => {
    expect(
      withdrawalDecisionFailureOf(graphQLError({ code: 'FORBIDDEN', error_code: 'MFA_REQUIRED' }))
    ).toBe('mfa-required');
  });

  it('explains a conflict (the row moved meanwhile)', () => {
    expect(
      withdrawalDecisionFailureOf(
        graphQLError({ code: 'CONFLICT', error_code: 'WITHDRAWAL_IN_APPROVAL_FLOW' })
      )
    ).toBe('conflict');
    expect(withdrawalDecisionFailureOf(graphQLError({ code: 'CONFLICT' }))).toBe('conflict');
  });

  it('leaves any other failure to the generic message', () => {
    expect(
      withdrawalDecisionFailureOf(graphQLError({ code: 'INTERNAL_SERVER_ERROR' }))
    ).toBeUndefined();
    expect(withdrawalDecisionFailureOf(new Error('network'))).toBeUndefined();
  });
});
