import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('receive wallet source contract', () => {
  it('removes per-surface wallets[0] heuristics from receive flows', async () => {
    const sources = await Promise.all([
      readSource('../pages/receive.tsx'),
      readSource('../components/receive-options-card.tsx'),
      readSource('../components/PaymentLinkForm.tsx'),
      readSource('../../dashboard/features/receive/hooks/use-user-accounts.ts'),
    ]);

    for (const source of sources) {
      expect(source).not.toContain('wallets[0]');
    }
  });

  it('threads one explicit receiveWalletId through the receive page and account hook', async () => {
    const [receivePage, paymentLinkForm, useUserAccounts] = await Promise.all([
      readSource('../pages/receive.tsx'),
      readSource('../components/PaymentLinkForm.tsx'),
      readSource('../../dashboard/features/receive/hooks/use-user-accounts.ts'),
    ]);

    expect(receivePage).toContain('useReceiveWallet');
    expect(receivePage).toContain('receiveWalletId={receiveWalletId}');

    // The new-account request is wallet-agnostic: it goes through virtualAccounts_request.
    expect(receivePage).toContain('<ReceiveOptionsCard />');

    expect(paymentLinkForm).toContain('receiveWalletId: string | undefined;');
    expect(paymentLinkForm).toContain('wallet_id: receiveWalletId');

    expect(useUserAccounts).toContain('const { receiveWalletId } = useReceiveWallet();');
  });
});
