/* @vitest-environment jsdom */

import { readFileSync } from 'fs';
import { join } from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { useDynamicIslandStore } from '@/shared/stores/useDynamicIslandStore';

// The route module pulls in the whole app layout; this test only needs the
// redirect component, so the heavy neighbours are stubbed.
vi.mock('@/modules/suite-user/layouts/app-layout', () => ({ AppLayout: () => null }));
vi.mock('../protected-route', () => ({
  ProtectedRoute: ({ children }: { children: unknown }) => children,
}));
vi.mock('@/shared/components/common/TransactionGuard', () => ({
  TransactionGuard: ({ children }: { children: unknown }) => children,
}));

import { OpenIslandFlow } from '../suite-user-routes';

const routesSource = readFileSync(join(__dirname, '..', 'suite-user-routes.tsx'), 'utf-8');

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname}</div>;
}

let page: MountedPage;

function mountAt(path: string) {
  page = mountPage(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/suite/receive" element={<OpenIslandFlow mode="receive" />} />
        <Route path="/suite/send" element={<OpenIslandFlow mode="send" />} />
        <Route path="/suite/dashboard" element={<Where />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useDynamicIslandStore.getState().reset();
});

afterEach(() => page.unmount());

describe('S6 — /suite/receive and /suite/send open the dashboard island flow', () => {
  it('/suite/receive lands on the dashboard with the receive flow active', () => {
    mountAt('/suite/receive');
    expect(page.container.querySelector('[data-testid="where"]')?.textContent).toBe(
      '/suite/dashboard'
    );
    expect(useDynamicIslandStore.getState().mode).toBe('receive');
  });

  it('/suite/send lands on the dashboard with the send flow active', () => {
    mountAt('/suite/send');
    expect(page.container.querySelector('[data-testid="where"]')?.textContent).toBe(
      '/suite/dashboard'
    );
    expect(useDynamicIslandStore.getState().mode).toBe('send');
  });

  it('no longer mounts the standalone Send / Receive pages', () => {
    expect(routesSource).not.toContain("features/receive/pages/receive'");
    expect(routesSource).not.toContain("features/send/pages/send'");
    expect(routesSource).toContain('<OpenIslandFlow mode="receive" />');
    expect(routesSource).toContain('<OpenIslandFlow mode="send" />');
  });
});

describe('cleanup — stale Bridge KYC entry', () => {
  it('bridge-kyc-start is only a redirect to verify-identity, not a page', () => {
    expect(routesSource).not.toContain('BridgeKYCPage');
    expect(routesSource).toMatch(
      /path="bridge-kyc-start"[\s\S]{0,120}Navigate to="\/suite\/verify-identity"/
    );
  });

  it('nothing links to /suite/bridge-kyc-start any more', () => {
    const sovy = join(
      __dirname,
      '..',
      '..',
      '..',
      'modules',
      'suite-user',
      'features',
      'sovy',
      'hooks'
    );
    for (const file of ['use-zentinel-chat.ts', 'use-zentinel-pending-action.ts']) {
      expect(readFileSync(join(sovy, file), 'utf-8')).not.toContain('/suite/bridge-kyc-start');
    }
  });
});
