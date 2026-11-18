import { describe, expect, it } from 'vitest';

import { resolveCustomerTransactionState } from '../resolve-customer-transaction-state';

describe('resolveCustomerTransactionState', () => {
  it.each(['CREATED', 'PENDING', 'PROCESSING', 'SOMETHING_NEW'])(
    'maps %s to in_progress regardless of the refund flag',
    (status) => {
      expect(resolveCustomerTransactionState(status, false)).toBe(
        'in_progress',
      );
      expect(resolveCustomerTransactionState(status, true)).toBe(
        'in_progress',
      );
    },
  );

  it('maps COMPLETED to completed', () => {
    expect(resolveCustomerTransactionState('COMPLETED', false)).toBe(
      'completed',
    );
  });

  it.each(['FAILED', 'REJECTED'])(
    'maps %s to returned only when the refund was credited',
    (status) => {
      expect(resolveCustomerTransactionState(status, true)).toBe('returned');
      expect(resolveCustomerTransactionState(status, false)).toBe('in_review');
    },
  );
});
