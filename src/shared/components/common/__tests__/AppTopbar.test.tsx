// @vitest-environment jsdom

/**
 * AppTopbar user menu (issue #362): a staff user who also owns a suite account
 * (`customer_profile_id`) gets a working "go to my account" entry; staff-only
 * users get no broken link; no dead (handler-less) items remain; logout is intact.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

const navigate = vi.fn();
const logout = vi.fn();
let pathname = '/backoffice/dashboard';
let user: Record<string, unknown> | null = null;

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ pathname }),
}));
vi.mock('@/shared/hooks/use-auth', () => ({
  useAuth: () => ({ user, logout }),
}));
vi.mock('@/app/providers/theme-provider', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: vi.fn() }),
}));
vi.mock('@/shared/components/common/UserAvatarChip', () => ({
  UserAvatarChip: () => <span>chip</span>,
}));
vi.mock('@/shared/components/common/BrandingStudioSheet', () => ({
  BrandingStudioSheet: () => null,
}));
vi.mock('@/shared/stores/useAgenticChat', () => ({
  useAgenticChat: () => ({
    operations: [],
    setCurrentOperation: vi.fn(),
    createOperation: vi.fn(),
    open: vi.fn(),
  }),
}));

import { mountPage, type MountedPage } from '@/test/dom-render';
import { AppTopbar } from '../AppTopbar';

let page: MountedPage | null = null;

function openUserMenu() {
  const trigger = document.querySelector<HTMLElement>('[aria-label="Menú de usuario"]')!;
  act(() => {
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
}

function menuItems(): string[] {
  return Array.from(document.querySelectorAll('[role="menuitem"]')).map((n) =>
    (n.textContent ?? '').trim(),
  );
}

function item(label: string): HTMLElement {
  const match = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
    (n) => (n.textContent ?? '').trim() === label,
  );
  if (!match) throw new Error(`No menuitem "${label}". Items: ${menuItems().join(' | ')}`);
  return match;
}

beforeEach(() => {
  navigate.mockClear();
  logout.mockClear();
  pathname = '/backoffice/dashboard';
  user = { email: 's@x.com', staff_roles: ['OPS_KYC'], roles: [] };
});

afterEach(() => {
  page?.unmount();
  page = null;
  document.body.innerHTML = '';
});

describe('AppTopbar user menu', () => {
  it('shows "Go to my account" for staff with a suite account and navigates to /suite/dashboard', () => {
    user = { ...user, customer_profile_id: 'cust-1' };
    page = mountPage(<AppTopbar />);
    openUserMenu();
    page.flush(() => item('Go to my account').click());
    expect(navigate).toHaveBeenCalledWith('/suite/dashboard');
  });

  it('hides the account entry for staff without customer_profile_id', () => {
    page = mountPage(<AppTopbar />);
    openUserMenu();
    expect(menuItems()).not.toContain('Go to my account');
  });

  it('leaves no handler-less "Mi perfil" / "Configuración" items in the backoffice', () => {
    user = { ...user, customer_profile_id: 'cust-1' };
    page = mountPage(<AppTopbar />);
    openUserMenu();
    expect(menuItems()).not.toContain('Mi perfil');
    expect(menuItems()).not.toContain('Configuración');
  });

  it('wires Settings to /suite/settings inside the suite', () => {
    pathname = '/suite/dashboard';
    page = mountPage(<AppTopbar />);
    openUserMenu();
    page.flush(() => item('Settings').click());
    expect(navigate).toHaveBeenCalledWith('/suite/settings');
  });

  it('does not offer the account entry inside the suite itself', () => {
    pathname = '/suite/dashboard';
    user = { ...user, customer_profile_id: 'cust-1' };
    page = mountPage(<AppTopbar />);
    openUserMenu();
    expect(menuItems()).not.toContain('Go to my account');
  });

  it('keeps logout calling the existing handler and redirecting to /login', () => {
    page = mountPage(<AppTopbar />);
    openUserMenu();
    page.flush(() => item('Logout').click());
    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
