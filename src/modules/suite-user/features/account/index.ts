/**
 * Account Feature - Barrel Export
 * 
 * Public API for the account management feature.
 */

// Pages
export { default as AccountCards } from './pages/cards';
export { default as CardPro } from './pages/card-pro';

// Hooks
export { useBankAccounts, useAvailableBanks } from './hooks/useBankAccounts';
export { useBridgeKYC } from './hooks/useBridgeKYC';
export { useGlobalConnectorsKYC } from './hooks/useGlobalConnectorsKYC';
export { useCanTransact } from './hooks/use-can-transact';
export { useCompanyProducts } from './hooks/useCompanyProducts';

// Types
export type {
  BankAccount,
  CreateBankAccountInput,
  BankAccountType,
  BankAccountStatus,
  PixKeyType,
} from './types/bank-account.types';
