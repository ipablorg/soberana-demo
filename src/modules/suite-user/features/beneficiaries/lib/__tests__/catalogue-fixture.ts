import type { RailCatalogue } from '../rail-catalogue';

const provider = (code: string, directions: string[], available = true) => ({
  code,
  directions,
  available,
});

/** Shape of `rails_catalogue` as the back returns it (Phase 8 S3). */
export const CATALOGUE_FIXTURE: RailCatalogue = {
  countries: [
    {
      country: 'US',
      rails: [
        {
          code: 'ach',
          name: 'ACH (US)',
          currency: 'USD',
          directions: ['INBOUND', 'OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['INBOUND', 'OUTBOUND']), provider('kirafin', ['OUTBOUND'])],
        },
        {
          code: 'wire',
          name: 'Wire (US)',
          currency: 'USD',
          directions: ['INBOUND', 'OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['INBOUND', 'OUTBOUND'])],
        },
        {
          code: 'swift',
          name: 'SWIFT (USD)',
          currency: 'USD',
          directions: ['OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['OUTBOUND'])],
        },
        {
          code: 'usdt_tron',
          name: 'USDT (Tron)',
          currency: 'USDT',
          directions: ['INBOUND', 'OUTBOUND'],
          beneficiary_supported: false,
          providers: [provider('kirafin', ['INBOUND', 'OUTBOUND'])],
        },
      ],
    },
    {
      country: 'CO',
      rails: [
        {
          code: 'co_ach',
          name: 'ACH Colombia',
          currency: 'COP',
          directions: ['OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('kirafin', ['OUTBOUND'])],
        },
      ],
    },
    {
      country: 'MX',
      rails: [
        {
          code: 'spei',
          name: 'SPEI',
          currency: 'MXN',
          directions: ['INBOUND', 'OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['INBOUND', 'OUTBOUND'], false)],
        },
      ],
    },
    {
      country: 'BR',
      rails: [
        {
          code: 'pix',
          name: 'PIX',
          currency: 'BRL',
          directions: ['INBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['INBOUND'])],
        },
      ],
    },
    {
      country: 'EC',
      rails: [
        {
          code: 'ec_bank_transfer',
          name: 'Transferencia Ecuador',
          currency: 'USD',
          directions: ['OUTBOUND'],
          beneficiary_supported: true,
          providers: [],
        },
      ],
    },
    {
      country: 'DE',
      rails: [
        {
          code: 'sepa',
          name: 'SEPA',
          currency: 'EUR',
          directions: ['OUTBOUND'],
          beneficiary_supported: true,
          providers: [provider('mesta', ['OUTBOUND'])],
        },
      ],
    },
  ],
};
