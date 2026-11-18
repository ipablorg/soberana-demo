/**
 * admin-loopay document contract
 *
 * The admin-loopay documents are hand-written (codegen needs a live backend),
 * so nothing else proves they parse or that they ask for the field names the
 * backend entities actually expose. This test is that proof.
 */

import { print } from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  GetCustomerKycDataDocument,
  GetDocumentDownloadUrlDocument,
  GetProviderRequirementDocumentUrlDocument,
  ListClientOptionsDocument,
  ListPendingBeneficiariesDocument,
  ListPendingDispersionesDocument,
  ListPendingEndorsementsDocument,
  ListPendingKycDocument,
  ListPendingRecaudosDocument,
  ListProviderLinkedAccountsDocument,
  ListProviderRequirementsDocument,
  ListVirtualAccountsDocument,
  ProviderRequirementCountsDocument,
} from '@/graphql/queries/admin-loopay';
import {
  ApproveDispersionDocument,
  ApproveRecaudoDocument,
  CompleteDispersionDocument,
  CreateRecaudoDocument,
  CreateWalletDocument,
  FailDispersionDocument,
  LinkBeneficiaryProviderIdDocument,
  LinkProviderCustomerDocument,
  LinkVirtualAccountDocument,
  LinkWalletAddressDocument,
  MoveToOpsVaultDocument,
  RejectDispersionDocument,
  RejectRecaudoDocument,
  RepairVirtualAccountRequestDocument,
  RequestKycAdditionalInfoDocument,
  ReverseRecaudoDocument,
  ReviewBeneficiaryDocument,
  ReviewEndorsementDocument,
  ReviewKycDocument,
  ReviewProviderRequirementDocument,
  SubmitProviderRequirementsDocument,
} from '@/graphql/mutations/admin-loopay';

/** Every document, keyed by the backend root field it must select. */
const DOCUMENTS_BY_ROOT_FIELD = {
  adminLoopay_listPendingKyc: ListPendingKycDocument,
  adminLoopay_getCustomerKycData: GetCustomerKycDataDocument,
  adminLoopay_getDocumentDownloadUrl: GetDocumentDownloadUrlDocument,
  adminLoopay_listPendingRecaudos: ListPendingRecaudosDocument,
  adminLoopay_listPendingDispersiones: ListPendingDispersionesDocument,
  adminLoopay_listPendingEndorsements: ListPendingEndorsementsDocument,
  adminLoopay_listPendingBeneficiaries: ListPendingBeneficiariesDocument,
  adminLoopay_listVirtualAccounts: ListVirtualAccountsDocument,
  adminLoopay_listProviderLinkedAccounts: ListProviderLinkedAccountsDocument,
  adminLoopay_listClientOptions: ListClientOptionsDocument,
  adminLoopay_reviewKyc: ReviewKycDocument,
  adminLoopay_requestKycAdditionalInfo: RequestKycAdditionalInfoDocument,
  adminLoopay_createRecaudo: CreateRecaudoDocument,
  adminLoopay_approveRecaudo: ApproveRecaudoDocument,
  adminLoopay_rejectRecaudo: RejectRecaudoDocument,
  adminLoopay_reverseRecaudo: ReverseRecaudoDocument,
  adminLoopay_approveDispersion: ApproveDispersionDocument,
  adminLoopay_completeDispersion: CompleteDispersionDocument,
  adminLoopay_rejectDispersion: RejectDispersionDocument,
  adminLoopay_failDispersion: FailDispersionDocument,
  adminLoopay_reviewEndorsement: ReviewEndorsementDocument,
  adminLoopay_reviewBeneficiary: ReviewBeneficiaryDocument,
  adminLoopay_linkBeneficiaryProviderId: LinkBeneficiaryProviderIdDocument,
  adminLoopay_linkVirtualAccount: LinkVirtualAccountDocument,
  adminLoopay_linkProviderCustomer: LinkProviderCustomerDocument,
  adminLoopay_createWallet: CreateWalletDocument,
  adminLoopay_linkWalletAddress: LinkWalletAddressDocument,
  adminLoopay_moveToOpsVault: MoveToOpsVaultDocument,
  adminLoopay_listProviderRequirements: ListProviderRequirementsDocument,
  adminLoopay_providerRequirementCounts: ProviderRequirementCountsDocument,
  adminLoopay_getProviderRequirementDocumentUrl: GetProviderRequirementDocumentUrlDocument,
  adminLoopay_reviewProviderRequirement: ReviewProviderRequirementDocument,
  adminLoopay_submitProviderRequirements: SubmitProviderRequirementsDocument,
  adminLoopay_repairVirtualAccountRequest: RepairVirtualAccountRequestDocument,
} as const;

describe('admin-loopay GraphQL documents', () => {
  it.each(Object.entries(DOCUMENTS_BY_ROOT_FIELD))(
    'parses %s into a single executable operation',
    (rootField, document) => {
      const definitions = (document as unknown as { definitions: unknown[] })
        .definitions;

      expect(definitions).toHaveLength(1);
      expect(print(document)).toContain(rootField);
    },
  );

  it('asks the KYC queue for the columns the review table renders', () => {
    const printed = print(ListPendingKycDocument);

    for (const field of [
      'first_name',
      'last_name',
      'customer_type',
      'country',
      'kyc_status',
      'submitted_at',
      'documents_count',
    ]) {
      expect(printed).toContain(field);
    }
  });

  it('asks the dispersion queue for the held amount and beneficiary summary', () => {
    const printed = print(ListPendingDispersionesDocument);

    expect(printed).toContain('held_amount');
    expect(printed).toContain('holder_name');
    expect(printed).toContain('bank_details');
    expect(printed).toContain('funds_location');
  });

  it.each([
    ['adminLoopay_listPendingKyc', ListPendingKycDocument],
    ['adminLoopay_listPendingRecaudos', ListPendingRecaudosDocument],
    ['adminLoopay_listPendingDispersiones', ListPendingDispersionesDocument],
    ['adminLoopay_listPendingEndorsements', ListPendingEndorsementsDocument],
    ['adminLoopay_listPendingBeneficiaries', ListPendingBeneficiariesDocument],
  ])('asks %s for the client name of every row', (_rootField, document) => {
    const printed = print(document);

    expect(printed).toContain('client_id');
    expect(printed).toContain('client_name');
  });

  it('asks the client options for id, name and active flag only', () => {
    const printed = print(ListClientOptionsDocument);

    for (const field of ['client_id', 'client_name', 'is_active']) {
      expect(printed).toContain(field);
    }
  });

  it('keys the ops-vault sweep by transaction, not by wallet', () => {
    const printed = print(MoveToOpsVaultDocument);

    expect(printed).toContain('$transactionId: ID!');
    expect(printed).not.toContain('walletId');
  });

  it('sends the legacy camelCase virtual-account filter shape', () => {
    const printed = print(ListVirtualAccountsDocument);

    expect(printed).toContain('$where: VirtualAccountFiltersInput');
    expect(printed).toContain('providerAccountId');
  });

  it('asks the KYC detail for the provider profile that prefills the retry (N-10)', () => {
    expect(print(GetCustomerKycDataDocument)).toContain('provider_profile');
  });

  it('sends the S21/S22 contract inputs and selects the contract fields', () => {
    expect(print(ListProviderRequirementsDocument)).toContain(
      '$filter: ProviderRequirementFilterInput',
    );
    expect(print(ProviderRequirementCountsDocument)).toContain('readyToSubmit');
    expect(print(ReviewProviderRequirementDocument)).toContain(
      '$input: ReviewProviderRequirementInput!',
    );
    expect(print(SubmitProviderRequirementsDocument)).toContain('errorMessage');
    expect(print(RepairVirtualAccountRequestDocument)).toContain('bankDetailsSource');
  });
});
