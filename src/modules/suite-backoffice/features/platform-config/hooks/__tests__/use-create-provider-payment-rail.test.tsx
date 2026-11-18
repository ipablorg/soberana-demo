/* @vitest-environment jsdom */

/**
 * Error handling of `useCreateProviderPaymentRail`: the backend rejects a
 * duplicate provider<->rail pair with a CONFLICT that quotes both UUIDs. The
 * operator must get a friendly message instead, and the mapping list must be
 * refetched so the table shows the row that already exists.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { platformQueryKeys } from '../../lib/platform-query-keys';
import { useCreateProviderPaymentRail } from '../use-platform-catalog';

const request = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => request(...args) },
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
  },
}));

const PROVIDER_ID = '0b6d2f6e-7f1c-4c1e-9d4e-111111111111';
const RAIL_ID = '5a0c1e93-2b7d-4f6a-8c3d-222222222222';
const FRIENDLY_CONFLICT =
  'Esta conexión ya existe. Revisa la tabla y actívala si está inactiva.';

function conflictError() {
  return {
    message: `ProviderPaymentRail mapping already exists for provider '${PROVIDER_ID}' and rail '${RAIL_ID}'`,
    response: {
      status: 200,
      errors: [
        {
          message: `ProviderPaymentRail mapping already exists for provider '${PROVIDER_ID}' and rail '${RAIL_ID}'`,
          extensions: { code: 'CONFLICT', status_code: 409 },
        },
      ],
    },
  };
}

let page: MountedPage;
let queryClient: QueryClient;
let invalidateSpy: MockInstance<QueryClient['invalidateQueries']>;
let mutate: ReturnType<typeof useCreateProviderPaymentRail>['mutate'];

function Harness({ onCompleted }: { onCompleted?: () => void }) {
  mutate = useCreateProviderPaymentRail(onCompleted).mutate;
  return null;
}

async function submit() {
  await act(async () => {
    mutate({
      input: { providerId: PROVIDER_ID, railId: RAIL_ID, isActive: true },
    });
  });
}

beforeEach(() => {
  request.mockReset();
  toastError.mockClear();
  toastSuccess.mockClear();
  queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
});

afterEach(() => {
  page?.unmount();
});

function mountHarness(onCompleted?: () => void) {
  page = mountPage(
    <QueryClientProvider client={queryClient}>
      <Harness onCompleted={onCompleted} />
    </QueryClientProvider>,
  );
}

describe('useCreateProviderPaymentRail', () => {
  it('replaces the technical CONFLICT message with a friendly one', async () => {
    // Arrange
    request.mockRejectedValue(conflictError());
    mountHarness();

    // Act
    await submit();

    // Assert
    expect(toastError).toHaveBeenCalledTimes(1);
    const [headline, options] = toastError.mock.calls[0] as [
      string,
      { description: string },
    ];
    expect(headline).toBe('No se pudo asignar el proveedor al riel');
    expect(options.description).toBe(FRIENDLY_CONFLICT);
    expect(JSON.stringify(toastError.mock.calls)).not.toContain(PROVIDER_ID);
    expect(JSON.stringify(toastError.mock.calls)).not.toContain(RAIL_ID);
  });

  it('refetches the mappings after a CONFLICT so the table shows the existing row', async () => {
    // Arrange
    request.mockRejectedValue(conflictError());
    mountHarness();

    // Act
    await submit();

    // Assert
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: [...platformQueryKeys.providerPaymentRails],
    });
  });

  it('shows the mapped (never raw) message and skips the refetch for any other failure', async () => {
    // Arrange
    request.mockRejectedValue(new Error('Database is down'));
    mountHarness();

    // Act
    await submit();

    // Assert
    expect(toastError).toHaveBeenCalledWith(
      'No se pudo asignar el proveedor al riel',
      { description: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta con soporte.' },
    );
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('does not run the completion callback when the create fails', async () => {
    // Arrange
    const onCompleted = vi.fn();
    request.mockRejectedValue(conflictError());
    mountHarness(onCompleted);

    // Act
    await submit();

    // Assert
    expect(onCompleted).not.toHaveBeenCalled();
  });
});
