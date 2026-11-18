import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('send page source contract', () => {
  it('keeps Bridge quote behavior and submits source-denominated dispersions', async () => {
    const source = await readSource('../send.tsx');

    expect(source).toContain("'@/shared/lib/loopayx-reference-only'");
    expect(source).toContain('getLoopayXReferenceOnlyDisplay');
    expect(source).toContain('const referenceOnlyDisplay = getLoopayXReferenceOnlyDisplay({');
    // Dispersion v2 submission: source-denominated (wallet currency)
    // via transactions_createDispersion — never the off-ramp mutation
    // and never the beneficiary's destination currency.
    expect(source).toContain('useCreateDispersion');
    expect(source).toContain('currency: walletCurrency,');
    // Mandatory idempotency key, stable across retries (see idempotency-key.ts).
    expect(source).toContain('client_reference_id: intentKey.getKey(),');
    expect(source).toContain('useConfirmIntentKey');
    expect(source).not.toContain('resolveOffRampSubmitPayload');
    expect(source).not.toContain('useCreateOffRamp');
    expect(source).not.toContain('transactions_createOffRamp');
    expect(source).toContain("import { isLoopayXNoQuoteOutboundRail } from '@/shared/lib/loopayx-send-rails';");
    expect(source).toContain('const isNoQuoteOutbound = isLoopayXNoQuoteOutboundRail(selectedBeneficiary);');
    expect(source).toContain('showQuote={!isNoQuoteOutbound}');
    expect(source).toContain('const { quote } = useQuoteRate(isNoQuoteOutbound ? null : quoteInput);');
    expect(source).toContain('const { rate: referenceRate } = useIndicativeRate(');
    expect(source).not.toMatch(/\bcurrency:\s*toCurrency,/);
    expect(source).not.toContain('resolveNoQuoteSubmitAmount');
    expect(source).toContain('{!isNoQuoteOutbound && quote ? (');
    expect(source).toContain('{isNoQuoteOutbound && referenceOnlyDisplay ? (');
    expect(source).toContain('Reference rate only');
  });

  it('picks country -> rail -> beneficiary and refuses beneficiaries the provider has not approved', async () => {
    const source = await readSource('../send.tsx');

    expect(source).toContain('SendDestinationPicker');
    expect(source).toContain('useRailCatalogue');
    // Defence in depth next to the disabled rows and the back gate.
    expect(source).toContain('!isBeneficiarySelectable(b)');
  });
});
