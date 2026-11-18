import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestMock, capturedOptions } = vi.hoisted(() => ({
  requestMock: vi.fn(),
  capturedOptions: { current: undefined as undefined | { mutationFn: (p: unknown) => Promise<unknown> } },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: (options: { mutationFn: (p: unknown) => Promise<unknown> }) => {
    capturedOptions.current = options;
    return {};
  },
}));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: requestMock },
}));

import { useCreateTransfer } from '../use-create-transfer';

const basePayload = {
  wallet_id: 'w1',
  to_address: '0x' + 'a'.repeat(40),
  amount: '10',
  currency: 'usdt',
  chain: 'Ethereum',
};

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');
  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('useCreateTransfer idempotency key', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({
      transactions_createTransfer: { transaction_id: 't', status: 'PENDING', message: 'm' },
    });
    useCreateTransfer();
  });

  it('forwards the trimmed client_reference_id', async () => {
    await capturedOptions.current!.mutationFn({ ...basePayload, client_reference_id: ' key-1 ' });
    expect(requestMock.mock.calls[0][1].input.client_reference_id).toBe('key-1');
  });

  it.each(['', '   ', undefined])('rejects a missing/blank key (%j) without calling the API', async (key) => {
    await expect(
      capturedOptions.current!.mutationFn({ ...basePayload, client_reference_id: key }),
    ).rejects.toThrow('client_reference_id is required');
    expect(requestMock).not.toHaveBeenCalled();
  });
});

describe('off-ramp and p2p hooks', () => {
  it.each(['../use-create-off-ramp.ts', '../use-create-p2p.ts'])(
    '%s types client_reference_id as required',
    async (file) => {
      const source = await readSource(file);
      expect(source).toMatch(/^\s+client_reference_id: string;$/m);
      expect(source).not.toContain('client_reference_id?');
    },
  );
});
