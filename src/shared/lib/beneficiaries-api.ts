/**
 * Beneficiaries — shared types
 *
 * Create/list/findById run through GraphQL (see `use-beneficiaries.ts`
 * and `src/graphql/queries/soberana/`). `CreateBeneficiaryPayload`
 * mirrors the GraphQL `CreateBeneficiaryInput` *target* contract
 * documented by the backend (Align GQL beneficiaries_create with REST
 * API), which adds tax_id_type / sort_code / account_type /
 * external_identifier / wallet_address / chain / coin on top of the
 * codegen output. Re-run `npm run codegen` once the backend bumps the
 * schema deployment to drop this manual extension.
 *
 * Delete runs via GraphQL (`beneficiaries_delete`) in `use-beneficiaries.ts`.
 */

import { SEPA_COUNTRY_CODES } from '@/shared/constants/sepa-countries';
import { getHeaders } from '@/shared/lib/graphql-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export type BeneficiaryBankDetails = Record<string, unknown>;

export interface BeneficiaryRailInfo {
  id: string;
  code: string;
  name: string;
  currency: string;
  country: string;
}

export interface BeneficiaryOutputRailSource {
  payment_rail?: string | null;
  rail?: Pick<BeneficiaryRailInfo, 'code'> | null;
  bank_details?: BeneficiaryBankDetails | null;
}

export interface BeneficiaryResponse {
  id: string;
  customer_id: string;
  beneficiary_name: string;
  tax_id: string;
  country: string;
  payment_rail: string | null;
  relationship: string | null;
  holder_type: string | null;
  currency: string | null;
  verification_status: string;
  masked_account_number: string | null;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  routing_number: string | null;
  iban: string | null;
  clabe: string | null;
  pix_key: string | null;
  bic: string | null;
  alias: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  rail: BeneficiaryRailInfo | null;
  bank_details: BeneficiaryBankDetails | null;
}

export type BeneficiaryType = 'BANK_ACCOUNT' | 'PIX' | 'BREB_KEY';

const BREB_KEY_DETAIL_KEYS = ['breb_key', 'brebKey'] as const;

function stringFromBankDetail(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value);
  }

  return null;
}

export function getBeneficiaryRailCode(
  beneficiary: BeneficiaryOutputRailSource | null | undefined
): string | null {
  const code = beneficiary?.rail?.code ?? beneficiary?.payment_rail;
  if (typeof code !== 'string') return null;

  const trimmed = code.trim();
  return trimmed || null;
}

export function getBeneficiaryBrebKey(
  beneficiary: BeneficiaryOutputRailSource | null | undefined
): string | null {
  const bankDetails = beneficiary?.bank_details;
  if (!bankDetails) return null;

  for (const key of BREB_KEY_DETAIL_KEYS) {
    const value = stringFromBankDetail(bankDetails[key]);
    if (value) return value;
  }

  return null;
}

export function isBrebKeyBeneficiary(
  beneficiary: BeneficiaryOutputRailSource | null | undefined
): boolean {
  return getBeneficiaryRailCode(beneficiary)?.toLowerCase() === 'co_breb' ||
    getBeneficiaryBrebKey(beneficiary) !== null;
}

export type BeneficiaryCountry =
  | 'COL' | 'BRA' | 'USA' | 'MEX'
  | 'PER' | 'CHL' | 'ECU'
  | (typeof SEPA_COUNTRY_CODES)[number];

export interface CreateBeneficiaryPayload {
  customer_id: string;
  type: BeneficiaryType;
  country: string;
  beneficiary_name: string;
  /** Optional for Bre-B when backend defaults apply. */
  tax_id?: string;
  /** Required for Colombian bank accounts and optional for Bre-B when backend defaults apply: 'CC' | 'CE' | 'NIT'. */
  tax_id_type?: string;
  /** Rail code (e.g. 'co_ach', 'co_breb', 'ach', 'spei', 'pix', 'sepa'). Never a railId UUID. */
  payment_rail?: string;
  relationship?: string;
  holder_type?: 'INDIVIDUAL' | 'BUSINESS';
  bank_code?: string;
  account_number?: string;
  pix_key?: string;
  /** Required for COL + BREB_KEY (`co_breb`). */
  breb_key?: string;
  routing_number?: string;
  account_number_us?: string;
  clabe?: string;
  iban?: string;
  bic?: string;
  /** GBR Faster Payments. */
  sort_code?: string;
  /** Lowercase per backend contract: 'savings' | 'checking'. */
  account_type?: 'savings' | 'checking';
  bank_name?: string;
  currency?: string;
  alias?: string;
  is_favorite?: boolean;
  address_line_1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  /** External provider correlation ID. */
  external_identifier?: string;
  /** Crypto / stablecoin destination. */
  wallet_address?: string;
  /** Blockchain: 'ethereum' | 'tron' | 'solana' | etc. */
  chain?: string;
  /** Token ticker: 'USDT' | 'USDC' | etc. */
  coin?: string;
}

export interface UpdateBeneficiaryPayload {
  alias?: string;
  is_favorite?: boolean;
  beneficiary_name?: string;
}

function authHeaders(): Record<string, string> {
  const headers = getHeaders();
  return {
    'Content-Type': 'application/json',
    ...(headers.Authorization ? { Authorization: headers.Authorization } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message: string;
    try {
      const body = await res.json();
      message = body.message || body.error || JSON.stringify(body);
    } catch {
      message = await res.text();
    }
    throw new Error(message);
  }
  return res.json();
}

export async function createBeneficiary(
  data: CreateBeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const res = await fetch(`${API_BASE}/v1/beneficiaries`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<BeneficiaryResponse>(res);
}

export async function updateBeneficiary(
  id: string,
  data: UpdateBeneficiaryPayload
): Promise<BeneficiaryResponse> {
  const res = await fetch(`${API_BASE}/v1/beneficiaries/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<BeneficiaryResponse>(res);
}
