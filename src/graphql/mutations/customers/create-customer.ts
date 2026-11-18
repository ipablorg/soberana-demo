import { gql } from '@/graphql/generated';

/**
 * CreateCustomer Mutation
 *
 * Creates a customer profile via Bridge KYC Links API (POST /v0/kyc_links).
 * This initiates the full KYC flow (not just ToS acceptance).
 * The backend creates CustomerProfile + CustomerProviderKyc records.
 *
 * Input requires: email, first_name, last_name, kyc_method
 * The backend resolves the user from the auth token.
 */
export const CreateCustomerDocument = gql(`
  mutation CreateCustomer($input: CreateCustomerInput!) {
    customers_create(input: $input) {
      id
      customer_type
      business_name
      kyc_status
      kyc_link
      tos_link
      next_required_action
      kyc_snapshot {
        lifecycle
        provider_customer_state
        onboarding_mode
        prefill
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
  }
`);
