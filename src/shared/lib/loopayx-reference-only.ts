import { isLoopayXNoQuoteOutboundRailCode } from './loopayx-send-rails';

type LoopayXReferenceOnlyInput = {
  railCode?: string | null;
  amount: string;
  indicativeRate?: string | null;
};

export type LoopayXReferenceOnlyDisplay = {
  rate: number;
  estimatedReceive: number;
  receiveCurrency: 'COP' | 'USD';
  semantics: 'indicative' | 'parity';
};

const ECUADOR_PARITY_RATE = 1;

function parsePositiveAmount(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parsePositiveRate(value?: string | null): number | null {
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function getLoopayXReferenceOnlyDisplay(
  input: LoopayXReferenceOnlyInput,
): LoopayXReferenceOnlyDisplay | null {
  const normalizedRail = input.railCode?.trim().toLowerCase();
  if (!isLoopayXNoQuoteOutboundRailCode(normalizedRail)) {
    return null;
  }

  const amount = parsePositiveAmount(input.amount);
  if (!amount) {
    return null;
  }

  if (normalizedRail === 'ec_bank_transfer') {
    return {
      rate: ECUADOR_PARITY_RATE,
      estimatedReceive: amount,
      receiveCurrency: 'USD',
      semantics: 'parity',
    };
  }

  const rate = parsePositiveRate(input.indicativeRate);
  if (!rate) {
    return null;
  }

  return {
    rate,
    estimatedReceive: amount * rate,
    receiveCurrency: 'COP',
    semantics: 'indicative',
  };
}

/**
 * Resolve the off-ramp submit payload (currency + amount).
 * - LoopayX no-quote rails: source-denominated per backend contract —
 *   currency is the wallet currency (e.g. USDT) and the entered amount
 *   passes through unchanged. LoopayX funding is a P2P transfer to the
 *   funding wallet; the COP/USD estimate shown to the user is
 *   reference-only and never submitted.
 * - Other rails: destination currency with the entered amount.
 */
export function resolveOffRampSubmitPayload(input: {
  isNoQuoteOutbound: boolean;
  sourceCurrency: string;
  destinationCurrency: string;
  amount: string;
}): { currency: string; amount: string } {
  if (input.isNoQuoteOutbound) {
    return { currency: input.sourceCurrency, amount: input.amount };
  }
  return { currency: input.destinationCurrency, amount: input.amount };
}
