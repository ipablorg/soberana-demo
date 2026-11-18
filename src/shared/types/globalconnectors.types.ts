/**
 * GlobalConnectors Types
 * 
 * Types for international payment flows via Bridge.xyz
 */

export enum SourceCurrency {
  EUR = 'EUR',
  USD = 'USD',
  MXN = 'MXN',
  BRL = 'BRL',
}

export enum PaymentRail {
  ACH = 'ACH',
  SEPA = 'SEPA',
  SPEI = 'SPEI',
  PIX = 'PIX',
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
}

export interface Corridor {
  id: string;
  description: string;
  sourceCountry: string;
  sourceCurrency: string;
  sourceRail: string;
  destinationCountry: string;
  destinationCurrency: string;
  destinationRail: string;
  settlementCurrency: 'USDC';
  isBidirectional: boolean;
  flowType: 'fiat_to_fiat' | 'fiat_to_crypto' | 'crypto_to_fiat';
}

export interface DepositInstructions {
  currency: string;
  paymentRail: string;
  iban?: string;
  bic?: string;
  routingNumber?: string;
  accountNumber?: string;
  clabe?: string;
  pixKey?: string;
  bankName?: string;
  beneficiaryName?: string;
}

export interface PaymentFlowResponse {
  customerId: string;
  externalAccountId: string;
  virtualAccountId: string;
  depositInstructions: DepositInstructions;
  estimatedDeliveryTime?: string;
}

export interface DestinationAccountDetails {
  routingNumber?: string;
  accountNumber?: string;
  accountType?: AccountType;
  iban?: string;
  bic?: string;
  clabe?: string;
  pixKey?: string;
}

export interface CreatePaymentFlowInput {
  customerEmail: string;
  customerName: string;
  customerType: CustomerType;
  sourceCurrency: SourceCurrency;
  sourceCountry: string;
  destinationCurrency: string;
  destinationCountry: string;
  destinationAccountOwnerName: string;
  destinationFirstName: string;
  destinationLastName: string;
  destinationBankName: string;
  destinationPaymentRail: PaymentRail;
  destinationAccountDetails: DestinationAccountDetails;
  amount?: string;
}

