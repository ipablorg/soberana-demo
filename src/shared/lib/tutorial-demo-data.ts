/**
 * tutorial-demo-data.ts
 *
 * Realistic mock data returned by shared hooks when `useTutorialDemoStore.isDemoMode`
 * is true. Shapes must match the interfaces in their respective hook files exactly.
 * These constants are used exclusively during the onboarding tutorial so that
 * KYC-pending users (no real wallets / accounts) see a meaningful walkthrough.
 */

// ── Wallet ─────────────────────────────────────────────────────────────────

export const DEMO_WALLET = {
  id: 'demo-wallet-usdc',
  customer_id: 'demo-customer',
  currency: 'USDC',
  chain: 'polygon',
  status: 'active',
  alias: 'Mi billetera USDC',
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  created_at: '2024-01-01T00:00:00.000Z',
};

export const DEMO_DEFAULT_WALLET = {
  currency: 'USDC',
  chain: 'polygon',
};

// ── Balance ────────────────────────────────────────────────────────────────

export const DEMO_BALANCE = {
  wallet_id: 'demo-wallet-usdc',
  currency: 'USDC',
  available_balance: '1250.00',
  spendable_balance: '1250.00',
  pending_balance: '0.00',
  total_balance: '1250.00',
  updated_at: new Date().toISOString(),
};

// ── Virtual accounts (deposit instructions) ───────────────────────────────

export const DEMO_VIRTUAL_ACCOUNTS = [
  {
    id: 'demo-va-usd',
    payment_rail: 'ach',
    currency: 'USD',
    status: 'active',
    account_number: '4532****8901',
    account_type: 'checking',
    bank_name: 'Bank of America',
    beneficiary_name: 'Demo User',
    beneficiary_address: '123 Main St, Miami FL 33101',
    clabe: null,
    iban: null,
    nit: null,
    reference: 'REF-DEMO-001',
    routing_number: '026009593',
    swift_code: 'BOFAUS3N',
  },
  {
    id: 'demo-va-cop',
    payment_rail: 'co_ach',
    currency: 'COP',
    status: 'active',
    account_number: null,
    account_type: 'savings',
    bank_name: 'Bancolombia',
    beneficiary_name: 'Demo User',
    beneficiary_address: null,
    clabe: null,
    iban: null,
    nit: '900123456-7',
    reference: 'REF-DEMO-002',
    routing_number: null,
    swift_code: null,
  },
];

// ── Quote rates  (USDC → local currency) ──────────────────────────────────
// Keys are the `to_currency` code. Values are the exchange rate as string.

export const DEMO_RATES: Record<string, string> = {
  COP: '4150.00',
  MXN: '17.20',
  PEN: '3.72',
  BRL: '5.65',
  CLP: '942.00',
  ARS: '988.50',
  USD: '1.00',
  EUR: '0.92',
};

// ── Rails ──────────────────────────────────────────────────────────────────
// Only includes rails present in RAIL_TO_CURRENCY (use-user-accounts.ts) so
// that `not_requested` rows always resolve to a proper currency label.

export const DEMO_RAILS = [
  { code: 'ach',     name: 'ACH (USA)',       description: 'Transferencias bancarias en dólares' },
  { code: 'wire',    name: 'Wire Transfer',   description: 'Transferencias internacionales SWIFT' },
  { code: 'sepa',    name: 'SEPA (Europa)',   description: 'Transferencias en euros' },
  { code: 'spei',    name: 'SPEI (México)',   description: 'Pagos interbancarios en pesos MXN' },
  { code: 'pix',     name: 'PIX (Brasil)',    description: 'Transferencias instantáneas en reales' },
  { code: 'co_ach',  name: 'ACH Colombia',   description: 'Transferencias bancarias en pesos COP' },
  { code: 'co_breb', name: 'Bancolombia Red', description: 'Red de pagos Bancolombia' },
];

// ── Beneficiaries ──────────────────────────────────────────────────────────
// Saved beneficiaries for demo money-out flows (send/dispersion). Shaped like
// BeneficiaryResponse from @/shared/lib/beneficiaries-api.

export const DEMO_BENEFICIARIES = [
  {
    id: 'demo-beneficiary-ach',
    customer_id: 'demo-customer',
    beneficiary_name: 'María González',
    tax_id: 'SGT123456ABC',
    country: 'US',
    payment_rail: 'ach',
    relationship: 'family',
    holder_type: 'individual',
    currency: 'USD',
    verification_status: 'verified',
    masked_account_number: '****4821',
    bank_name: 'Chase Bank',
    bank_code: 'CHASUS33',
    account_number: null,
    routing_number: '021000021',
    iban: null,
    clabe: null,
    pix_key: null,
    bic: null,
    alias: null,
    is_favorite: true,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    rail: { id: 'ach-us', code: 'ach', name: 'ACH', currency: 'USD', country: 'US' },
    bank_details: null,
  },
  {
    id: 'demo-beneficiary-pix',
    customer_id: 'demo-customer',
    beneficiary_name: 'João Silva',
    tax_id: '123.456.789-00',
    country: 'BR',
    payment_rail: 'pix',
    relationship: 'supplier',
    holder_type: 'individual',
    currency: 'BRL',
    verification_status: 'verified',
    masked_account_number: null,
    bank_name: 'Nubank',
    bank_code: null,
    account_number: null,
    routing_number: null,
    iban: null,
    clabe: null,
    pix_key: 'joao@nubank.com.br',
    bic: null,
    alias: null,
    is_favorite: false,
    created_at: '2026-01-02T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
    rail: { id: 'pix-br', code: 'pix', name: 'PIX', currency: 'BRL', country: 'BR' },
    bank_details: null,
  },
];
