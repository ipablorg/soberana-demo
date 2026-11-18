import {
  getBeneficiaryRailCode,
  type BeneficiaryOutputRailSource,
} from '@/shared/lib/beneficiaries-api';

type RailShape = BeneficiaryOutputRailSource;

export const LOOPAYX_NO_QUOTE_OUTBOUND_RAILS = ['co_breb', 'ec_bank_transfer', 'ec_point_of_sale'] as const;

export function isLoopayXNoQuoteOutboundRailCode(code?: string | null): boolean {
  if (!code) {
    return false;
  }

  return LOOPAYX_NO_QUOTE_OUTBOUND_RAILS.includes(
    code as (typeof LOOPAYX_NO_QUOTE_OUTBOUND_RAILS)[number],
  );
}

export function isLoopayXNoQuoteOutboundRail(
  beneficiary?: RailShape | null,
): boolean {
  return isLoopayXNoQuoteOutboundRailCode(getBeneficiaryRailCode(beneficiary));
}
