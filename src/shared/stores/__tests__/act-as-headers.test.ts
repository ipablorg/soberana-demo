// @vitest-environment jsdom

/**
 * Identity headers on the real GraphQL client (epic 2026-11 S5): act-as and
 * view-as never travel together (the backend answers 400
 * IDENTITY_HEADERS_CONFLICT), and logging out drops both.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/hooks/useKYC', () => ({ clearKycLink: vi.fn() }));

import { getHeaders, setActAsHeader, setViewAsHeader } from '@/shared/lib/graphql-client';
import { memoryStorage } from '@/test/memory-storage';
import { useAuthStore } from '../auth-store';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  setActAsHeader(null);
  setViewAsHeader(null);
});

describe('identity headers', () => {
  it('acting as a client clears view-as', () => {
    setViewAsHeader('customer-1');

    setActAsHeader(CLIENT_ID);

    expect(getHeaders()['x-act-as-client']).toBe(CLIENT_ID);
    expect(getHeaders()['x-view-as-customer']).toBe('');
  });

  it('viewing as a customer clears act-as', () => {
    setActAsHeader(CLIENT_ID);

    setViewAsHeader('customer-1');

    expect(getHeaders()['x-view-as-customer']).toBe('customer-1');
    expect(getHeaders()['x-act-as-client']).toBe('');
  });

  it('leaving act-as leaves the view-as header alone', () => {
    setActAsHeader(null);

    expect(getHeaders()['x-act-as-client']).toBe('');
  });

  it('logging out drops the act-as header', () => {
    setActAsHeader(CLIENT_ID);

    useAuthStore.getState().clearAuth();

    expect(getHeaders()['x-act-as-client']).toBe('');
  });
});
