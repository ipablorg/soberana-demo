import { gql } from '@/graphql/generated';

export const KYC_SNAPSHOT_LIFECYCLES = [
  'NOT_INITIATED',
  'INITIATED',
  'PENDING_REVIEW',
  'ADDITIONAL_INFO_REQUIRED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'FAILED',
] as const;

export type KycSnapshotLifecycle = (typeof KYC_SNAPSHOT_LIFECYCLES)[number];

export const KYC_SNAPSHOT_ACTIONS = [
  'accept_tos',
  'submit',
  'resume',
  'retry',
  'reconcile',
  'contact_support',
] as const;

export type KycSnapshotAction = (typeof KYC_SNAPSHOT_ACTIONS)[number];

export interface CustomerKycReason {
  code: string;
  target_type: 'field' | 'document_purpose' | 'customer';
  target_key: string;
  message: string;
  retryable: boolean;
}

export interface CustomerKycRequirementPending {
  kind: 'field' | 'document_purpose' | 'review';
  key: string;
  status: 'submitted' | 'under_review';
}

export interface CustomerKycNextStep {
  code: string;
  route: string;
  rail?: string | null;
  country?: string | null;
}

export interface CustomerKycSnapshot {
  lifecycle: KycSnapshotLifecycle;
  provider_customer_state: string;
  onboarding_mode?: 'api' | 'kyc_link' | null;
  prefill?: Record<string, unknown> | null;
  tos: {
    accepted: boolean;
    url: string | null;
  };
  next_step?: CustomerKycNextStep | null;
  requirements: {
    missing: {
      fields: string[];
      document_purposes: string[];
      questionnaire_fields: string[];
    };
    pending: CustomerKycRequirementPending[];
    issues: CustomerKycReason[];
  };
  reasons: CustomerKycReason[];
  actions: KycSnapshotAction[];
  freshness: {
    snapshot_generated_at: string;
    provider_checked_at: string | null;
    webhook_updated_at: string | null;
    last_reconciliation_source:
      | 'create'
      | 'submit'
      | 'resume'
      | 'manual_refresh'
      | 'retry'
      | 'webhook';
    reconciliation_state: 'fresh' | 'stale' | 'refresh_failed';
  };
}

export interface GetKycSnapshotQuery {
  customers_getKycSnapshot: CustomerKycSnapshot;
}

export interface GetKycSnapshotQueryVariables {
  customerId: string;
}

export const GetKycSnapshotDocument = gql(`
  query GetKycSnapshot($customerId: String!) {
    customers_getKycSnapshot(customerId: $customerId) {
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
