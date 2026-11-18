/**
 * Customer-facing transaction states.
 *
 * The internal lifecycle (CREATED/PENDING/PROCESSING/COMPLETED/FAILED/
 * REJECTED) is operations vocabulary: customers see three states plus a
 * review nuance. Custody data (vault ids, funds locations, provider
 * operations) never reaches this layer.
 */
export type CustomerTransactionState =
  | 'in_progress'
  | 'completed'
  | 'returned'
  | 'in_review';

/**
 * Maps the raw transaction status plus the backend's `refunded` flag onto
 * the customer state:
 *
 * - COMPLETED → completed
 * - FAILED/REJECTED with the money already back → returned
 * - FAILED/REJECTED without a credited refund → in_review (support path)
 * - everything else (CREATED/PENDING/PROCESSING/unknown) → in_progress
 */
export function resolveCustomerTransactionState(
  status: string,
  refunded: boolean,
): CustomerTransactionState {
  if (status === 'COMPLETED') {
    return 'completed';
  }

  if (status === 'FAILED' || status === 'REJECTED') {
    return refunded ? 'returned' : 'in_review';
  }

  return 'in_progress';
}
