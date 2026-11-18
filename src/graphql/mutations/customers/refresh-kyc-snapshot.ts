import { gql } from '@/graphql/generated';
import type { CustomerKycSnapshot } from '@/graphql/queries/customers/get-kyc-snapshot';

export interface RefreshKycSnapshotMutation {
  customers_refreshKycSnapshot: CustomerKycSnapshot;
}

export interface RefreshKycSnapshotMutationVariables {
  input: {
    customer_id: string;
  };
}

export const RefreshKycSnapshotDocument = gql(`
  mutation RefreshKycSnapshot($input: RefreshKycSnapshotInput!) {
      customers_refreshKycSnapshot(input: $input) {
        lifecycle
        provider_customer_state
        onboarding_mode
        prefill
      tos {
        accepted
        url
      }
      next_step {
        code
        route
        rail
        country
      }
      requirements {
        missing {
          fields
          document_purposes
          questionnaire_fields
        }
        pending {
          kind
          key
          status
        }
        issues {
          code
          target_type
          target_key
          message
          retryable
        }
      }
      reasons {
        code
        target_type
        target_key
        message
        retryable
      }
      actions
      freshness {
        snapshot_generated_at
        provider_checked_at
        webhook_updated_at
        last_reconciliation_source
        reconciliation_state
      }
    }
  }
`);
