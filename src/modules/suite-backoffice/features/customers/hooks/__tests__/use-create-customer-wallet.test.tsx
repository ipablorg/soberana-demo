/* @vitest-environment jsdom */

/**
 * `useCreateCustomerWallet`: wraps `adminLoopay_createWallet` for the Customer
 * 360 dialog. The backend is idempotent, so the toast has to tell "created"
 * from "already had one" (`alreadyExisted`), the customer's wallet list must be
 * refetched either way, and failures are left to the dialog (no raw toast).
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminWalletResponse } from '@/graphql/types/admin-loopay';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { opsQueryKeys } from '../../../ops-review/lib/ops-query-keys';
import { useCreateCustomerWallet } from '../use-customers';

const request = vi.fn();
const toastSuccess = vi.fn();
const toastInfo = vi.fn();
const toastError = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    info: (...args: unknown[]) => toastInfo(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const CUSTOMER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';
const CLIENT_ID = '5a0c1e93-2b7d-4f6a-8c3d-222222222222';

function walletResponse(overrides: Partial<AdminWalletResponse> = {}): AdminWalletResponse {
  return {
    id: 'wallet-1',
    customerId: CUSTOMER_ID,
    clientId: CLIENT_ID,
    providerId: 'provider-1',
    providerCode: 'openfort',
    currency: 'USDC',
    walletType: 'CUSTODIAL',
    chain: 'solana',
    address: 'So1anaAddress',
    alias: null,
    balance: 0,
    status: 'ACTIVE',
    alreadyExisted: false,
    virtualAccountIds: [],
    createdAt: '2026-07-09T12:30:00.000Z',
    createdBy: 'admin-1',
    ...overrides,
  };
}

let page: MountedPage;
let queryClient: QueryClient;
let mutate: ReturnType<typeof useCreateCustomerWallet>['mutate'];
let error: ReturnType<typeof useCreateCustomerWallet>['error'];

function Harness({ onCompleted }: { onCompleted?: (wallet: AdminWalletResponse) => void }) {
  const mutation = useCreateCustomerWallet(onCompleted);
  mutate = mutation.mutate;
  error = mutation.error;
  return null;
}

// The exact key `useCustomerWallets` registers: base key + variables.
const WALLETS_QUERY_KEY = [
  ...opsQueryKeys.customerWallets(CUSTOMER_ID),
  { customerId: CUSTOMER_ID },
];

function seedWalletsQuery() {
  queryClient.setQueryData(WALLETS_QUERY_KEY, {
    adminLoopay_listWalletsByCustomer: [],
  });
}

function walletsQueryIsInvalidated(): boolean {
  return queryClient.getQueryState(WALLETS_QUERY_KEY)?.isInvalidated === true;
}

async function submit() {
  await act(async () => {
    mutate({
      input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID, chain: 'solana' },
    });
  });
}

function mountHarness(onCompleted?: (wallet: AdminWalletResponse) => void) {
  page = mountPage(
    <QueryClientProvider client={queryClient}>
      <Harness onCompleted={onCompleted} />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  request.mockReset();
  toastSuccess.mockClear();
  toastInfo.mockClear();
  toastError.mockClear();
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  seedWalletsQuery();
});

afterEach(() => {
  page?.unmount();
});

describe('useCreateCustomerWallet', () => {
  it('sends the input to adminLoopay_createWallet', async () => {
    request.mockResolvedValue({
      adminLoopay_createWallet: walletResponse(),
    });
    mountHarness();

    await submit();

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[1]).toEqual({
      input: { clientId: CLIENT_ID, customerId: CUSTOMER_ID, chain: 'solana' },
    });
  });

  it('toasts the created wallet with its currency and chain, refetches wallets and completes', async () => {
    const wallet = walletResponse();
    const onCompleted = vi.fn();
    request.mockResolvedValue({ adminLoopay_createWallet: wallet });
    mountHarness(onCompleted);

    await submit();

    expect(toastSuccess).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith('Billetera USDC creada en solana.');
    expect(toastInfo).not.toHaveBeenCalled();
    expect(walletsQueryIsInvalidated()).toBe(true);
    expect(onCompleted).toHaveBeenCalledWith(wallet);
  });

  it('says the customer already had the wallet when the backend returns an existing one', async () => {
    const wallet = walletResponse({
      alreadyExisted: true,
      currency: 'USDT',
      chain: 'tron',
    });
    const onCompleted = vi.fn();
    request.mockResolvedValue({ adminLoopay_createWallet: wallet });
    mountHarness(onCompleted);

    await submit();

    expect(toastInfo).toHaveBeenCalledTimes(1);
    expect(toastInfo).toHaveBeenCalledWith('Este cliente ya tenía una billetera USDT en tron.');
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(walletsQueryIsInvalidated()).toBe(true);
    expect(onCompleted).toHaveBeenCalledWith(wallet);
  });

  it('leaves failures to the dialog: no toast, no refetch, no completion', async () => {
    const onCompleted = vi.fn();
    const failure = new Error(
      `Customer ${CUSTOMER_ID} KYC status is REJECTED. KYC must be APPROVED`
    );
    request.mockRejectedValue(failure);
    mountHarness(onCompleted);

    await submit();

    expect(toastError).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
    expect(walletsQueryIsInvalidated()).toBe(false);
    expect(onCompleted).not.toHaveBeenCalled();
    // TanStack notifies observers on a macrotask; let React flush until then.
    for (let attempt = 0; attempt < 100 && error !== failure; attempt += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
    }
    expect(error).toBe(failure);
  });
});
