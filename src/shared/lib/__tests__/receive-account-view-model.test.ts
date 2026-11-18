import { describe, expect, it } from 'vitest';

import { buildReceiveAccounts } from '../receive-account-view-model';

const rails = [
  { code: 'ach', name: 'ACH', description: null },
  { code: 'wire', name: 'Wire', description: null },
  { code: 'spei', name: 'SPEI', description: null },
];

describe('buildReceiveAccounts', () => {
  it('keeps approved payment-link-only endorsements as active receive accounts', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [
        {
          id: 'endorsement-ach',
          payment_rail: 'ach',
          status: 'approved',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      paymentLinkRails: new Set(['ach']),
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'ach',
          status: 'active',
          receiveMode: 'payment_link',
          usePaymentLink: true,
          deposit: null,
        }),
      ]),
    );
  });

  it('keeps pending virtual accounts without synthesizing extra rail rows', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [
        {
          id: 'va-wire',
          payment_rail: 'wire',
          currency: 'USD',
          status: 'pending',
          account_number: null,
          account_type: null,
          bank_name: null,
          beneficiary_address: null,
          beneficiary_name: null,
          clabe: null,
          iban: null,
          nit: null,
          reference: null,
          routing_number: null,
          swift_code: null,
          bic: null,
          payment_rails: null,
          sort_code: null,
          br_code: null,
          account_holder_name: null,
          bank_address: null,
          bank_beneficiary_name: null,
          bank_beneficiary_address: null,
        },
      ],
      endorsements: [],
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'wire',
          status: 'pending',
          receiveMode: 'waiting',
          deposit: expect.objectContaining({ id: 'va-wire' }),
        }),
      ]),
    );
    expect(
      accounts.some(
        (account) => account.paymentRail === 'wire' && account.status === 'not_requested',
      ),
    ).toBe(false);
  });

  it('adds not_requested rails only when there is no account or approved endorsement yet', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [],
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'spei',
          status: 'not_requested',
        }),
      ]),
    );
  });

  it('prefers the existing account row when an approved endorsement shares the same rail', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [
        {
          id: 'va-wire',
          payment_rail: 'wire',
          currency: 'USD',
          status: 'pending',
          account_number: null,
          account_type: null,
          bank_name: null,
          beneficiary_address: null,
          beneficiary_name: null,
          clabe: null,
          iban: null,
          nit: null,
          reference: null,
          routing_number: null,
          swift_code: null,
          bic: null,
          payment_rails: null,
          sort_code: null,
          br_code: null,
          account_holder_name: null,
          bank_address: null,
          bank_beneficiary_name: null,
          bank_beneficiary_address: null,
        },
      ],
      endorsements: [
        {
          id: 'endorsement-wire',
          payment_rail: 'wire',
          status: 'approved',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      paymentLinkRails: new Set(['pix']),
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'wire',
          status: 'pending',
          receiveMode: 'waiting',
          deposit: expect.objectContaining({ id: 'va-wire' }),
        }),
      ]),
    );
  });

  it('keeps approved endorsements waiting when the rail is not payment-link capable', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [
        {
          id: 'endorsement-sepa',
          payment_rail: 'sepa',
          status: 'approved',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      paymentLinkRails: new Set(['pix']),
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'sepa',
          status: 'pending',
          receiveMode: 'waiting',
          usePaymentLink: false,
          deposit: null,
        }),
      ]),
    );
  });

  it('shows non-approved endorsements as pending when the rail was requested but not yet approved', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [
        {
          id: 'endorsement-sepa-pending',
          payment_rail: 'sepa',
          status: 'pending',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      paymentLinkRails: new Set(['pix']),
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'sepa',
          status: 'pending',
          receiveMode: 'waiting',
          deposit: null,
          endorsementStatus: 'pending',
        }),
      ]),
    );
    expect(
      accounts.some(
        (account) => account.paymentRail === 'sepa' && account.status === 'not_requested',
      ),
    ).toBe(false);
  });

  it('lets not_initiated endorsements fall through to the rails catalog as not_requested', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [
        {
          id: 'endorsement-spei-not-initiated',
          payment_rail: 'spei',
          status: 'not_initiated',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'spei',
          status: 'not_requested',
        }),
      ]),
    );
    expect(
      accounts.some(
        (account) => account.paymentRail === 'spei' && account.status === 'pending',
      ),
    ).toBe(false);
  });

  it('keeps active rows authoritative over a pending endorsement on the same rail', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [
        {
          id: 'va-ach',
          payment_rail: 'ach',
          currency: 'USD',
          status: 'ACTIVE',
          account_number: null,
          account_type: null,
          bank_name: null,
          beneficiary_address: null,
          beneficiary_name: null,
          clabe: null,
          iban: null,
          nit: null,
          reference: null,
          routing_number: null,
          swift_code: null,
          bic: null,
          payment_rails: null,
          sort_code: null,
          br_code: null,
          account_holder_name: null,
          bank_address: null,
          bank_beneficiary_name: null,
          bank_beneficiary_address: null,
        },
      ],
      endorsements: [
        {
          id: 'endorsement-ach-pending',
          payment_rail: 'ach',
          status: 'pending',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      rails,
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'ach',
          status: 'active',
          receiveMode: 'virtual_account',
          deposit: expect.objectContaining({ id: 'va-ach' }),
        }),
      ]),
    );
  });

  it('stores normalized rail labels for mapped and catalog-backed rails', () => {
    const accounts = buildReceiveAccounts({
      virtualAccounts: [],
      endorsements: [
        {
          id: 'endorsement-ec-bank-transfer',
          payment_rail: 'ec_bank_transfer',
          status: 'approved',
          created_at: '2026-06-23T00:00:00.000Z',
        },
      ],
      rails: [
        ...rails,
        { code: 'faster_payments', name: 'FASTER_PAYMENTS', description: null },
      ],
      excludedRails: new Set<string>(),
    });

    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          paymentRail: 'ec_bank_transfer',
          railName: 'ECU Transferencia',
          currency: 'USD',
        }),
        expect.objectContaining({
          paymentRail: 'faster_payments',
          railName: 'GBR',
          currency: 'GBP',
        }),
      ]),
    );
  });
});
