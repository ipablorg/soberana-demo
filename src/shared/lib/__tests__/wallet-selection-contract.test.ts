import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('wallet main operational alignment source contract', () => {
  it('requests backend default_wallet and threads it through shared selectors', async () => {
    const [
      walletsQuery,
      useWallets,
      useReceiveWallet,
      sendFlowHook,
      dashboardPage,
      sendPage,
    ] = await Promise.all([
      readSource('../../../graphql/queries/soberana/wallets-list-by-customer.query.ts'),
      readSource('../../hooks/use-wallets.ts'),
      readSource('../../hooks/use-receive-wallet.ts'),
      readSource('../../../modules/suite-user/features/dashboard/features/send/hooks/use-send-flow.ts'),
      readSource('../../../modules/suite-user/features/dashboard/pages/conversational-home.tsx'),
      readSource('../../../modules/suite-user/features/send/pages/send.tsx'),
    ]);

    expect(walletsQuery).toContain('default_wallet');
    expect(useWallets).toContain('defaultWallet: result?.default_wallet ?? null');
    expect(useReceiveWallet).toContain('resolveWalletSelection(walletsQuery.wallets, walletsQuery.defaultWallet)');
    expect(sendFlowHook).toContain('resolveWalletSelection(wallets, defaultWallet)');
    expect(dashboardPage).toContain('resolveWalletSelection(wallets, defaultWallet)');
    expect(sendPage).toContain('resolveWalletSelection(wallets, defaultWallet)');
  });

  it('removes hardcoded USDC quote inputs from send surfaces', async () => {
    const [sendPage, amountInput, reviewPanel] = await Promise.all([
      readSource('../../../modules/suite-user/features/send/pages/send.tsx'),
      readSource('../../../modules/suite-user/features/dashboard/features/send/amount-input.tsx'),
      readSource('../../../modules/suite-user/features/dashboard/features/send/review-panel.tsx'),
    ]);

    expect(sendPage).toContain("from_currency: walletCurrency");
    expect(sendPage).not.toContain("from_currency: 'USDC'");
    expect(amountInput).toContain('walletCurrency: string;');
    expect(amountInput).toContain('from_currency: walletCurrency');
    expect(amountInput).not.toContain("from_currency: 'USDC'");
    expect(reviewPanel).toContain('walletCurrency: string;');
    expect(reviewPanel).toContain('from_currency: walletCurrency');
    expect(reviewPanel).not.toContain("from_currency: 'USDC'");
  });

  it('sends external-wallet destination currency independently from the source wallet asset', async () => {
    const [sendPage, sendFlow, transferHook] = await Promise.all([
      readSource('../../../modules/suite-user/features/send/pages/send.tsx'),
      readSource('../../../modules/suite-user/features/dashboard/features/send/send-flow.tsx'),
      readSource('../../hooks/use-create-transfer.ts'),
    ]);

    expect(sendPage).toContain('destinationCurrency');
    expect(sendPage).toContain('currency: destinationCurrency');
    expect(sendPage).toContain('Bridge puede rutear o swapear');
    expect(sendFlow).toContain('externalWalletCurrency');
    expect(sendFlow).toContain('currency: destinationCurrency');
    expect(sendFlow).toContain('Bridge resuelve el ruteo o swap');
    expect(transferHook).toContain('currency: normalized.currency');
  });
});
