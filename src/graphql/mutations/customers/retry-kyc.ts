import { gql } from '@/graphql/generated';
import type { CreateCustomerInput } from '@/graphql/generated/graphql';
import type { CustomerKycSnapshot } from '@/graphql/queries/customers/get-kyc-snapshot';

export interface RetryKycMutation {
  customers_retryKyc: CustomerKycSnapshot;
}

export interface RetryKycMutationInput extends CreateCustomerInput {
  customer_id: string;
  endorsement?: string;
  redirect_uri?: string;
}

export interface RetryKycMutationVariables {
  input: RetryKycMutationInput;
}

export const RetryKycDocument = gql(`
  mutation RetryKyc($input: RetryKycInput!) {
    customers_retryKyc(input: $input) {
      lifecycle
      provider_customer_state
      tos {
        accepted
        url
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
