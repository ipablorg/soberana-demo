// @vitest-environment jsdom

/**
 * `AuthInitializer` mirrors the `auth_me` payload into the store through
 * `setAuth`, which also rewrites the persisted customer context. A mere token
 * rotation (session refresh) must not trigger that again.
 */

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@/shared/types/auth.types';
import { useSyncAuthMe } from '../use-sync-auth-me';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const userA = { id: 'a' } as unknown as AuthUser;
const userB = { id: 'b' } as unknown as AuthUser;

interface HarnessProps {
  authMe: AuthUser | null | undefined;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
}

function Harness({ authMe, token, setAuth }: HarnessProps) {
  useSyncAuthMe(authMe, token, setAuth);
  return null;
}

let root: Root | null = null;
let container: HTMLElement | null = null;

/** Renders (or re-renders) the harness on the same root so effects see prop changes. */
function render(props: HarnessProps) {
  if (!root) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root?.render(<Harness {...props} />);
  });
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('useSyncAuthMe', () => {
  it('applies the user once the payload and the token are both available', () => {
    const setAuth = vi.fn();

    render({ authMe: userA, token: 't1', setAuth });

    expect(setAuth).toHaveBeenCalledTimes(1);
    expect(setAuth).toHaveBeenCalledWith(userA, 't1');
  });

  it('does nothing without a token or without a payload', () => {
    const setAuth = vi.fn();

    render({ authMe: userA, token: null, setAuth });
    render({ authMe: undefined, token: 't1', setAuth });

    expect(setAuth).not.toHaveBeenCalled();
  });

  it('does not re-apply the user when only the token rotates', () => {
    const setAuth = vi.fn();

    render({ authMe: userA, token: 't1', setAuth });
    render({ authMe: userA, token: 't2', setAuth });

    expect(setAuth).toHaveBeenCalledTimes(1);
  });

  it('applies a new payload (a different sign-in) with the current token', () => {
    const setAuth = vi.fn();

    render({ authMe: userA, token: 't1', setAuth });
    render({ authMe: userB, token: 't1', setAuth });

    expect(setAuth).toHaveBeenCalledTimes(2);
    expect(setAuth).toHaveBeenLastCalledWith(userB, 't1');
  });

  it('applies the same payload again after a logout in between', () => {
    const setAuth = vi.fn();

    render({ authMe: userA, token: 't1', setAuth });
    render({ authMe: userA, token: null, setAuth });
    render({ authMe: userA, token: 't3', setAuth });

    expect(setAuth).toHaveBeenCalledTimes(2);
    expect(setAuth).toHaveBeenLastCalledWith(userA, 't3');
  });
});
