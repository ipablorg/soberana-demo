// @vitest-environment jsdom

/**
 * Act-as banner (epic 2026-11 S5): whose backoffice this is, who is acting,
 * and the way back to the commercial client detail. "Exit" only navigates:
 * `StaffRoute` ends act-as when the detail mounts (see
 * `src/app/routes/__tests__/act-as-transition.test.tsx`), so the tenant guard
 * never sees the restored staff member and redirects it elsewhere.
 */

import { act } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ endActAs: vi.fn(), clear: vi.fn() }));

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@/shared/lib/query-client', () => ({ queryClient: { clear: mocks.clear } }));

import { useActAsStore } from '@/shared/stores/act-as-store';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { ActAsBanner } from '../act-as-banner';

const CLIENT_ID = '3f2b8a52-6c1d-4c2e-9a41-0d6f7c3b9e10';

let page: MountedPage | null = null;

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

function mount() {
  page = mountPage(
    <MemoryRouter initialEntries={['/tenant/customers']}>
      <LocationProbe />
      <Routes>
        <Route
          path="/tenant/*"
          element={<ActAsBanner clientName="Acme SAS" staffEmail="ana@loopay.test" />}
        />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  mocks.endActAs.mockReset();
  mocks.clear.mockReset();
  useActAsStore.setState({ clientId: CLIENT_ID, staffUser: null, endActAs: mocks.endActAs });
});

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('ActAsBanner', () => {
  it('names the client and the staff member acting', () => {
    mount();

    expect(page?.container.querySelector('[role="status"]')).not.toBeNull();
    expect(page?.text()).toContain('You are acting as an admin of Acme SAS as ana@loopay.test');
  });

  it('returns to the client detail, leaving the identity switch to the staff route', () => {
    mount();
    const exit = page?.container.querySelector<HTMLButtonElement>('[data-testid="exit-act-as"]');

    act(() => {
      exit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mocks.endActAs).not.toHaveBeenCalled();
    expect(mocks.clear).not.toHaveBeenCalled();
    expect(page?.container.querySelector('[data-testid="loc"]')?.textContent).toBe(
      `/backoffice/commercial/clients/${CLIENT_ID}`
    );
  });
});
