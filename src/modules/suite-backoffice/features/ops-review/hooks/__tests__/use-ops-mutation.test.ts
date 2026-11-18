import { describe, it, expect, vi, beforeEach } from 'vitest';

type MutationOptions = { onError?: (error: Error) => void };

const hoisted = vi.hoisted(() => ({
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  invalidateQueries: vi.fn(),
  captured: { options: undefined as MutationOptions | undefined },
}));

vi.mock('sonner', () => ({ toast: { error: hoisted.toastError, success: hoisted.toastSuccess } }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries: hoisted.invalidateQueries }) }));
vi.mock('@/shared/hooks/use-graphql-mutation', () => ({
  useGraphQLMutation: (_document: unknown, options: MutationOptions) => {
    hoisted.captured.options = options;
    return {};
  },
}));

import { useOpsMutation } from '../use-ops-mutation';

function buildClientError(serverMessage: string) {
  const errors = [
    {
      message: serverMessage,
      extensions: { code: 'BAD_REQUEST', stacktrace: ['GraphQLError: boom', ' at Object.fetch (/app/node_modules/x.js:1:1)'] },
    },
  ];
  const response = { data: null, errors, status: 200 };
  return Object.assign(new Error(`${serverMessage}: ${JSON.stringify({ response })}`), { response });
}

describe('useOpsMutation — error toast', () => {
  beforeEach(() => {
    hoisted.toastError.mockClear();
    hoisted.captured.options = undefined;
  });

  it('shows a mapped, human description instead of the raw serialized ClientError', () => {
    useOpsMutation({} as never, {
      invalidate: [],
      successMessage: 'Cuenta vinculada',
      errorMessage: 'No se pudo vincular la cuenta',
    });

    hoisted.captured.options?.onError?.(buildClientError("Payment rail 'us_ash' not found"));

    expect(hoisted.toastError).toHaveBeenCalledTimes(1);
    const [headline, extra] = hoisted.toastError.mock.calls[0] as [string, { description: string }];
    expect(headline).toBe('No se pudo vincular la cuenta');
    expect(extra.description).toContain('ruta de pago');
    expect(extra.description).not.toMatch(/stacktrace|GraphQLError|\/app\/|node_modules|"errors"|\{"/i);
  });
});

describe('useOpsMutation — dynamic island feedback', () => {
  it('announces success and failure through the shared island', async () => {
    const { useDynamicIslandStore } = await import('@/shared/stores/useDynamicIslandStore');
    useOpsMutation({} as never, { invalidate: [], successMessage: 'Listo', errorMessage: 'Falló' });

    (hoisted.captured.options as { onSuccess?: (r: unknown) => void }).onSuccess?.({});
    expect(useDynamicIslandStore.getState().islandData).toMatchObject({ state: 'success', message: 'Listo' });

    hoisted.captured.options?.onError?.(new Error('x'));
    expect(useDynamicIslandStore.getState().islandData).toMatchObject({ state: 'error', message: 'Falló' });
  });
});

describe('useOpsMutation — soft failures', () => {
  it('shows the island error state (not success) when the result reports a failure', async () => {
    const { useDynamicIslandStore } = await import('@/shared/stores/useDynamicIslandStore');
    const onCompleted = vi.fn();
    hoisted.toastError.mockClear();
    useOpsMutation({} as never, {
      invalidate: [],
      successMessage: 'Reintento terminado',
      errorMessage: 'El reintento falló',
      failureOf: () => 'Proveedor no disponible (TIMEOUT)',
      onCompleted,
    });

    (hoisted.captured.options as { onSuccess?: (r: unknown) => void }).onSuccess?.({});

    expect(useDynamicIslandStore.getState().islandData).toMatchObject({
      state: 'error',
      message: 'El reintento falló',
    });
    expect(hoisted.toastError).toHaveBeenCalledWith('El reintento falló', {
      description: 'Proveedor no disponible (TIMEOUT)',
    });
    expect(onCompleted).toHaveBeenCalled();
  });
});

describe('useOpsMutation — failure follow-up', () => {
  beforeEach(() => {
    hoisted.invalidateQueries.mockClear();
    hoisted.toastError.mockClear();
  });

  it('refetches the invalidated keys and reports the description after a hard failure when asked', () => {
    const onFailed = vi.fn();
    useOpsMutation({} as never, {
      invalidate: [['admin-loopay', 'virtual-account-requests']],
      successMessage: 'Listo',
      errorMessage: 'Falló',
      invalidateOnError: true,
      onFailed,
    });

    hoisted.captured.options?.onError?.(buildClientError("Payment rail 'us_ash' not found"));

    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['admin-loopay', 'virtual-account-requests'],
    });
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed.mock.calls[0][0]).toContain('ruta de pago');
  });

  it('reports a soft failure description to onFailed', () => {
    const onFailed = vi.fn();
    useOpsMutation({} as never, {
      invalidate: [],
      successMessage: 'Listo',
      errorMessage: 'Falló',
      failureOf: () => 'VALIDATION_FAILED',
      onFailed,
    });

    (hoisted.captured.options as { onSuccess?: (r: unknown) => void }).onSuccess?.({});

    expect(onFailed).toHaveBeenCalledWith('VALIDATION_FAILED');
  });

  it('still does not refetch after a plain failure unless asked (previous behavior)', () => {
    useOpsMutation({} as never, {
      invalidate: [['admin-loopay', 'clients']],
      successMessage: 'Listo',
      errorMessage: 'Falló',
    });

    hoisted.captured.options?.onError?.(new Error('x'));

    expect(hoisted.invalidateQueries).not.toHaveBeenCalled();
    expect(hoisted.toastError).toHaveBeenCalledTimes(1);
  });
});
