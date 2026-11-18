import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { WalletsDepositInstructions } from '@/graphql/queries/soberana/wallets-deposit-instructions.query';

export interface VirtualAccount {
  id: string;
  payment_rail: string;
  currency: string;
  status: string;
  account_number: string | null;
  account_type: string | null;
  bank_name: string | null;
  beneficiary_address: string | null;
  beneficiary_name: string | null;
  clabe: string | null;
  iban: string | null;
  nit: string | null;
  reference: string | null;
  routing_number: string | null;
  swift_code: string | null;
  /** BIC code (same value as swift_code on rails that populate both). */
  bic: string | null;
  sort_code: string | null;
  br_code: string | null;
  account_holder_name: string | null;
  bank_address: string | null;
  bank_beneficiary_name: string | null;
  bank_beneficiary_address: string | null;
  /** Payment rails this account accepts (subset of the rail catalog). */
  payment_rails: string[] | null;
  /** S22: true when Loopay staff registered the account by hand with typed bank details. */
  linked_manually?: boolean | null;
  /** S22: when Loopay staff linked the account by hand. */
  linked_at?: string | null;
}

interface DepositInstructionsResult {
  wallets_depositInstructions: {
    customer_id: string;
    wallet_id: string;
    /** Crypto deposit network of the wallet (e.g. tron); null when none. */
    network: string | null;
    virtual_accounts: VirtualAccount[];
  };
}

export function useDepositInstructions(walletId: string | undefined, customerId: string | undefined) {
  const query = useGraphQLQuery(
    ['wallets', 'depositInstructions', walletId, customerId],
    WalletsDepositInstructions as never,
    { walletId: walletId!, customerId: customerId! },
    {
      enabled: !!walletId && !!customerId,
    }
  );

  const result = (query.data as DepositInstructionsResult | undefined)?.wallets_depositInstructions;

  return {
    depositInstructions: result ?? null,
    virtualAccounts: result?.virtual_accounts ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
