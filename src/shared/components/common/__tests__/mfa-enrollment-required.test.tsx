/* @vitest-environment jsdom */

/**
 * The second-factor gate: "Configurar ahora" opens the enrollment screen of
 * the user's own app (suite settings for staff, the tenant security page for
 * tenant admins, who must never land on the customer onboarding).
 */

import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

import { mountPage, type MountedPage } from '@/test/dom-render';
import { MfaEnrollmentRequired } from '../mfa-enrollment-required';

let page: MountedPage | null = null;

afterEach(() => {
  page?.unmount();
  page = null;
});

function LocationProbe() {
  return <span data-testid="loc">{useLocation().pathname}</span>;
}

function mount(setupRoute?: string) {
  page = mountPage(
    <MemoryRouter initialEntries={['/gated']}>
      <LocationProbe />
      <Routes>
        <Route path="/gated" element={<MfaEnrollmentRequired setupRoute={setupRoute} />} />
        <Route path="*" element={<div>elsewhere</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function setUp() {
  page?.click(page.findByText('button', 'Configurar ahora'));
}

describe('MfaEnrollmentRequired', () => {
  it('sends staff to the suite settings by default', () => {
    mount();

    setUp();

    expect(page?.container.querySelector('[data-testid="loc"]')?.textContent).toBe(
      '/suite/settings'
    );
  });

  it('sends the user to the enrollment route it is given', () => {
    mount('/tenant/settings/security');

    setUp();

    expect(page?.container.querySelector('[data-testid="loc"]')?.textContent).toBe(
      '/tenant/settings/security'
    );
  });
});
