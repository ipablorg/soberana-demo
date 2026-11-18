import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('useCreateTransfer source contract', () => {
  it('uses authenticated GraphQL transport instead of the temporary REST helper', async () => {
    const source = await readSource('../use-create-transfer.ts');

    expect(source).toContain("TransactionsCreateTransfer");
    expect(source).toContain('graphqlClient.request');
    expect(source).toContain('destination_address: payload.to_address.trim()');
    expect(source).toContain('chain: payload.chain.toLowerCase()');
    expect(source).not.toContain('createCryptoTransfer,');
    expect(source).not.toContain("@/shared/lib/transactions-api");
  });
});
