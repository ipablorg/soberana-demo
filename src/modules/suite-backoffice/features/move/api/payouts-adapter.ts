/**
 * Payouts Adapter
 *
 * Transforma datos del backend GraphQL al formato interno de la UI
 */

import type { Payout_ListByCountryQuery } from '@/graphql/generated/graphql';
import type { PayOut } from '../types';

type BackendPayoutItem = Payout_ListByCountryQuery['payout_listByCountry']['payouts'][number];

/**
 * Adapta un item de payout del backend al formato de la UI
 */
export function adaptPayoutItem(item: BackendPayoutItem): PayOut {
  return {
    id: item.id,
    uid: item.uid,
    state: item.state as PayOut['state'],
    createdAt: item.createdAt,
    scheduledAt: item.scheduledAt ?? undefined,
    transferredAt: item.trasnferedAt ?? undefined,  // Corrige el typo del backend
    amount: item.Amount,
    company: item.companyName ?? 'N/A',
    product: item.productName ?? 'N/A',
    beneficiaryName: item.beneficiaryName,
    documentNumber: item.documentNumber,
    bank: item.bankName ?? 'N/A',
    email: item.email ?? undefined,
    phone: item.phone ?? undefined,
    countryCode: item.countryCode ?? undefined,
    currencyCode: item.currencyCode ?? undefined,
    gateway: item.gateway ?? undefined,
    externalIdentifier: item.externalIdentifier ?? undefined,
    fixedFee: item.fixedFee,
    percentageFee: item.percentageFee,
  };
}

/**
 * Adapta un array de payouts del backend
 */
export function adaptPayouts(items: BackendPayoutItem[]): PayOut[] {
  return items.map(adaptPayoutItem);
}
