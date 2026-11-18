import {
  getBeneficiaryBrebKey,
  getBeneficiaryRailCode,
  isBrebKeyBeneficiary,
  type BeneficiaryResponse,
} from '@/shared/lib/beneficiaries-api';

const BREB_KEY_BANK_DETAIL_KEYS = new Set(['breb_key', 'brebKey']);

export interface BeneficiaryRenderingModel {
  isBrebKey: boolean;
  railCode: string | null;
  brebKey: string | null;
  accountPreview: string;
  showAccountDetails: boolean;
  additionalBankDetails: Array<[string, unknown]>;
}

export function getBeneficiaryRenderingModel(
  beneficiary: BeneficiaryResponse,
): BeneficiaryRenderingModel {
  const isBrebKey = isBrebKeyBeneficiary(beneficiary);
  const brebKey = getBeneficiaryBrebKey(beneficiary);
  const railCode = getBeneficiaryRailCode(beneficiary);
  const showAccountDetails =
    !isBrebKey &&
    Boolean(
      beneficiary.account_number ||
      beneficiary.routing_number ||
      beneficiary.iban ||
      beneficiary.clabe ||
      beneficiary.pix_key ||
      beneficiary.bic,
    );

  return {
    isBrebKey,
    railCode,
    brebKey,
    accountPreview: getAccountPreview(beneficiary, { isBrebKey, brebKey }),
    showAccountDetails,
    additionalBankDetails: Object.entries(beneficiary.bank_details ?? {}).filter(
      ([key]) => !(isBrebKey && BREB_KEY_BANK_DETAIL_KEYS.has(key)),
    ),
  };
}

function getAccountPreview(
  beneficiary: BeneficiaryResponse,
  context: Pick<BeneficiaryRenderingModel, 'isBrebKey' | 'brebKey'>,
) {
  if (context.isBrebKey) {
    return context.brebKey ?? '—';
  }

  if (beneficiary.account_number) return `****${beneficiary.account_number.slice(-4)}`;
  if (beneficiary.iban) return `****${beneficiary.iban.slice(-4)}`;
  if (beneficiary.masked_account_number) return beneficiary.masked_account_number;
  return '';
}
