/**
 * admin-loopay dispersiones (outbound withdrawals) queue query.
 *
 * Mirrors `src/modules/admin-loopay/dispersiones/**` on the backend.
 */

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { parse } from 'graphql';
import type {
  AdminDispersion,
  AdminDispersionQueueFilters,
  AdminPaginated,
  AdminPaginationInput,
} from '@/graphql/types/admin-loopay';

/** Vendor payout block (`metadata.providerPayout`) exposed on v2 dispersions. */
export interface AdminDispersionPayout {
  /** PLACED | AWAITING_FUNDS | EXECUTED | FAILED | BLOCKED | REJECTED | UNKNOWN | RETURNED */
  state: string;
  providerCode: string;
  terminalVendorStatus?: string | null;
  placedAt?: string | null;
  terminalAt?: string | null;
}

/** #413 what one gross withdrawal pays out (`metadata.payoutPlan`), decimal strings. */
export interface AdminDispersionPayoutPlan {
  gross: string;
  loopay_fee: string;
  network_component: string;
  /** What the ops account funds to the Mesta order: gross − fee − network component. */
  funding_amount: string;
  rounding_remainder: string;
}

/** #410 one stale alert raised for the withdrawal (`metadata.staleAlerts`). */
export interface AdminDispersionStaleAlert {
  /** `dispersion.sweep_unsettled` | `dispersion.payout_no_provider_event` | `awaiting_approval` */
  key: string;
  raised_at: string;
}

/** Queue row: the shared dispersion plus the v2-only fields. */
export interface AdminDispersionQueueRow extends AdminDispersion {
  /**
   * Non-null only on v2 rows (PENDING, COMPLETED, FAILED, CANCELLED; with the
   * #413 approval flow also AWAITING_APPROVAL, APPROVED, PROCESSING, FUNDING,
   * RETURNING, RETURN_MATCH_REQUIRED, REJECTED, RETURNED).
   */
  dispersion_state?: string | null;
  selected_provider?: string | null;
  payout?: AdminDispersionPayout | null;
  /** #413: SENT | SETTLED | REJECTED | UNKNOWN | BLOCKED */
  funding_status?: string | null;
  /** #413: SENT | COMPLETED | FAILED | REJECTED | UNKNOWN */
  return_status?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_required?: boolean;
  awaiting_approval_at?: string | null;
  payout_plan?: AdminDispersionPayoutPlan | null;
  stale_review_required?: boolean;
  stale_review_reason?: string | null;
  stale_review_flagged_at?: string | null;
  stale_alerts?: AdminDispersionStaleAlert[];
}

/** Queue filter, narrowed to one withdrawal state (`metadata.dispersion.state`) when set. */
export interface AdminDispersionQueueFilter extends AdminDispersionQueueFilters {
  dispersionState?: string;
}

export interface ListPendingDispersionesQuery {
  adminLoopay_listPendingDispersiones: AdminPaginated<AdminDispersionQueueRow>;
}

export interface ListPendingDispersionesQueryVariables {
  filter?: AdminDispersionQueueFilter;
  pagination?: AdminPaginationInput;
}

export const ListPendingDispersionesDocument = parse(/* GraphQL */ `
  query AdminLoopayListPendingDispersiones(
    $filter: DispersionQueueFiltersInput
    $pagination: PaginationInput
  ) {
    adminLoopay_listPendingDispersiones(
      filter: $filter
      pagination: $pagination
    ) {
      data {
        id
        reference_code
        customer_id
        customer_email
        client_id
        client_name
        wallet_id
        amount
        currency
        status
        held_amount
        funds_location
        beneficiary {
          id
          holder_name
          rail_code
          currency
          bank_details
        }
        created_at
        review_reason
        reviewed_at
        quote_rate
        quote_source_amount
        quote_source_currency
        quote_target_amount
        quote_target_currency
        fee_amount
        fee_source
        fee_currency
        settlement_amount
        settlement_currency
        settlement_rate
        settlement_bank_rate
        settlement_fees
        settlement_external_reference
        dispersion_state
        selected_provider
        payout {
          state
          providerCode
          terminalVendorStatus
          placedAt
          terminalAt
        }
        funding_status
        return_status
        approved_by
        approved_at
        approval_required
        awaiting_approval_at
        payout_plan {
          gross
          loopay_fee
          network_component
          funding_amount
          rounding_remainder
        }
        stale_review_required
        stale_review_reason
        stale_review_flagged_at
        stale_alerts {
          key
          raised_at
        }
      }
      total
      has_more
    }
  }
`) as unknown as TypedDocumentNode<
  ListPendingDispersionesQuery,
  ListPendingDispersionesQueryVariables
>;
