import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('send flow source contract', () => {
  it('keeps quote panels optional and beneficiary-only semantics', async () => {
    const [sendFlow, sendFlowHook, amountInput, reviewPanel, sendPage] = await Promise.all([
      readSource('../send-flow.tsx'),
      readSource('../hooks/use-send-flow.ts'),
      readSource('../amount-input.tsx'),
      readSource('../review-panel.tsx'),
      readSource('../../../../send/pages/send.tsx'),
    ]);

    expect(sendFlow).toContain('isLoopayXNoQuoteOutboundRail(selected)');
    expect(sendFlow).toContain('showQuote={!isNoQuoteOutbound}');
    expect(amountInput).toContain('showQuote?: boolean;');
    expect(amountInput).toContain('useQuoteRate(showQuote ? quoteInput : null)');
    expect(amountInput).toContain('const canContinue = isAmountValid;');
    expect(amountInput).toContain('{showQuote && !!quote && isAmountValid && (');
    expect(reviewPanel).toContain('const isNoQuoteOutbound = isLoopayXNoQuoteOutboundRail(beneficiary);');
    expect(reviewPanel).toContain('const { quote } = useQuoteRate(isNoQuoteOutbound ? null : quoteInput);');
    expect(reviewPanel).toContain('const { rate: referenceRate } = useIndicativeRate(');
    expect(reviewPanel).toContain('const referenceOnlyDisplay = getLoopayXReferenceOnlyDisplay({');
    // Dispersion v2 submission: source-denominated (wallet currency)
    // via transactions_createDispersion — never the off-ramp mutation
    // and never the beneficiary's destination currency.
    expect(reviewPanel).toContain('useCreateDispersion');
    expect(reviewPanel).toContain('currency: walletCurrency,');
    expect(reviewPanel).not.toContain('resolveOffRampSubmitPayload');
    expect(reviewPanel).not.toContain('useCreateOffRamp');
    expect(reviewPanel).not.toContain('transactions_createOffRamp');
    expect(reviewPanel).not.toMatch(/\bcurrency:\s*toCurrency,/);
    expect(reviewPanel).toContain('{!isNoQuoteOutbound && quote ? (');
    expect(reviewPanel).toContain('{isNoQuoteOutbound && referenceOnlyDisplay ? (');
    expect(reviewPanel).toContain('disabled={isPending}');
    expect(reviewPanel).toContain('Reference rate only');
    expect(reviewPanel).toContain('const mapped = mapError(err);');
    expect(sendPage).toContain('disabled={!isAmountValid}');
    expect(sendPage).toContain("balance?.spendable_balance ?? '0'");
    expect(sendFlowHook).toContain("balance?.spendable_balance ?? '0'");
    expect(sendFlow).not.toContain('err instanceof Error ? err.message');
  });
});
