const RAIL_TO_COUNTRY: Record<string, string> = {
  ach: 'USA',
  wire: 'USA',
  us_ach: 'USA',
  us_wire: 'USA',
  pix: 'BRA',
  br_ted: 'BRA',
  spei: 'MEX',
  co_ach: 'COL',
  co_breb: 'COL',
  ec_bank_transfer: 'ECU',
  ec_point_of_sale: 'ECU',
  sepa: 'EUR',
  iban: 'EUR',
};

interface PayerDetailsInput {
  full_name: string;
  document_type: string;
  document_number: string;
  email: string;
  phone: string;
}

interface BuildPaymentLinkInputParams {
  amount: string;
  currency: string;
  customerId: string;
  receiveWalletId: string;
  paymentMethod?: string;
  payerDetails?: PayerDetailsInput;
  returnUrl?: string;
}

interface PaymentLinkInputContract {
  amount: string;
  currency: string;
  customer_id: string;
  wallet_id: string;
  payment_method?: string | undefined;
  country?: string | undefined;
  purpose: 'PERSONAL_ACCOUNT';
  payer_details?: PayerDetailsInput | undefined;
  return_url?: string | undefined;
}

function normalizePaymentMethod(paymentMethod: string): string {
  return paymentMethod.toLowerCase() === 'co_breb' ? 'co_breb' : paymentMethod;
}

function railToCountry(rail: string): string | undefined {
  return RAIL_TO_COUNTRY[rail.toLowerCase()];
}

export function isEcuadorPaymentRail(rail: string | undefined): boolean {
  return ['ec_bank_transfer', 'ec_point_of_sale'].includes(
    rail?.toLowerCase() || '',
  );
}

export function buildPaymentLinkInput({
  amount,
  currency,
  customerId,
  receiveWalletId,
  paymentMethod,
  payerDetails,
  returnUrl,
}: BuildPaymentLinkInputParams): PaymentLinkInputContract {
  const normalizedPaymentMethod = paymentMethod
    ? normalizePaymentMethod(paymentMethod)
    : undefined;

    const isEcuador = isEcuadorPaymentRail(paymentMethod);

  return {
    amount,
    currency,
    customer_id: customerId,
    wallet_id: receiveWalletId,
    ...(normalizedPaymentMethod
      ? { payment_method: normalizedPaymentMethod }
      : {}),
    ...(paymentMethod ? { country: railToCountry(paymentMethod) } : {}),
    purpose: 'PERSONAL_ACCOUNT',
    ...(isEcuador && payerDetails && returnUrl
      ? { payer_details: payerDetails, return_url: returnUrl }
      : {}),
  };
}
