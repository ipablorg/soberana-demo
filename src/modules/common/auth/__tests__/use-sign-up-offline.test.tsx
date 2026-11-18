// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const requestMock = vi.fn();

vi.mock('@/shared/lib/graphql-client', () => ({
  graphqlClient: { request: (...args: unknown[]) => requestMock(...args) },
}));

vi.mock('../pages/firebase-public-auth-flow', () => ({
  buildResetPasswordActionCodeSettings: () => undefined,
}));

import { useSignUp } from '../api/use-sign-up';

type SignUp = ReturnType<typeof useSignUp>;

describe('useSignUp while the network is down', () => {
  beforeEach(() => {
    requestMock.mockReset();
    onlineManager.setOnline(false);
  });

  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it('attempts the request and reports the failure instead of staying paused forever', async () => {
    // Arrange
    requestMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const onError = vi.fn();
    let hook: SignUp | undefined;

    function Harness() {
      hook = useSignUp({ onError });
      return null;
    }

    const container = document.createElement('div');
    const root = createRoot(container);
    const client = new QueryClient();

    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <Harness />
        </QueryClientProvider>
      );
    });

    // Act
    await act(async () => {
      hook?.signUp({
        email: 'a@b.test',
        password: 'Passw0rd!x',
        firstName: 'A',
        lastName: 'B',
        policy: true,
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    // Assert
    expect(requestMock).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(hook?.isLoading).toBe(false);

    await act(async () => {
      root.unmount();
    });
  });
});
