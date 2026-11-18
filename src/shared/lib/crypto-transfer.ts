export const EVM_CHAINS = [
  'ethereum',
  'base',
  'polygon',
  'arbitrum',
  'optimism',
] as const;

export interface DirectTransferContractFields {
  to_address: string;
  amount: string;
  currency: string;
  chain: string;
  client_reference_id?: string;
}

const DEFAULT_EXTERNAL_WALLET_DESTINATION_CURRENCIES = ['USDC', 'USDT'] as const;

const ADDRESS_PATTERNS = {
  evm: /^0x[a-fA-F0-9]{40}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
} as const;

export function isEvmChain(chain: string): boolean {
  return (EVM_CHAINS as readonly string[]).includes(chain.toLowerCase());
}

export function normalizeTransferChains(
  chains: string[] | null | undefined,
  fallbackChain?: string | null,
): string[] {
  const normalized = new Set(
    (chains ?? [])
      .map((chain) => chain.trim().toLowerCase())
      .filter(Boolean),
  );

  if (fallbackChain?.trim()) {
    normalized.add(fallbackChain.trim().toLowerCase());
  }

  return [...normalized];
}

export function getExternalWalletDestinationCurrencies(
  sourceCurrency?: string | null,
): string[] {
  const currencies = new Set<string>(
    DEFAULT_EXTERNAL_WALLET_DESTINATION_CURRENCIES,
  );

  if (sourceCurrency?.trim()) {
    currencies.add(sourceCurrency.trim().toUpperCase());
  }

  return [...currencies];
}

export function validateCryptoTransferAddress(address: string, chain: string): string | null {
  const trimmedAddress = address.trim();
  const normalizedChain = chain.trim().toLowerCase();

  if (!trimmedAddress) {
    return 'Enter a destination address.';
  }

  if (!normalizedChain) {
    return 'Select a destination network.';
  }

  if (isEvmChain(normalizedChain) && !ADDRESS_PATTERNS.evm.test(trimmedAddress)) {
    return 'Enter a valid EVM address that starts with 0x and has 40 hex characters.';
  }

  if (normalizedChain === 'solana' && !ADDRESS_PATTERNS.solana.test(trimmedAddress)) {
    return 'Enter a valid Solana address.';
  }

  if (normalizedChain === 'tron' && !ADDRESS_PATTERNS.tron.test(trimmedAddress)) {
    return 'Enter a valid Tron address.';
  }

  return null;
}

export function normalizeDirectTransferContractFields(
  fields: DirectTransferContractFields,
): DirectTransferContractFields {
  const clientReferenceId = fields.client_reference_id?.trim();

  return {
    to_address: fields.to_address.trim(),
    amount: fields.amount,
    currency: fields.currency.trim().toUpperCase(),
    chain: fields.chain.trim().toLowerCase(),
    client_reference_id: clientReferenceId ? clientReferenceId : undefined,
  };
}
