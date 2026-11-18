// @vitest-environment jsdom

import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

import { mountPage, type MountedPage } from '@/test/dom-render';
import {
  getCrossEnvironmentLink,
  normalizeEnvironment,
  readDeploymentUrls,
} from '@/modules/suite-tenant/lib/tenant-environment';
import { TenantEnvironmentBar } from '@/modules/suite-tenant/components/organisms/tenant-environment-bar';

const URLS = {
  production: 'https://app.soberana.test/',
  sandbox: 'https://qa.soberana.test',
};

describe('normalizeEnvironment', () => {
  it('reads `production` as production and anything else as sandbox', () => {
    expect(normalizeEnvironment('production')).toBe('production');
    expect(normalizeEnvironment('sandbox')).toBe('sandbox');
    expect(normalizeEnvironment('development')).toBe('sandbox');
    expect(normalizeEnvironment(null)).toBe('sandbox');
  });
});

describe('readDeploymentUrls', () => {
  it('reads the two VITE_TENANT_* variables and treats blanks as missing', () => {
    expect(
      readDeploymentUrls({
        VITE_TENANT_PRODUCTION_URL: ' https://app.soberana.test ',
        VITE_TENANT_SANDBOX_URL: '   ',
      })
    ).toEqual({ production: 'https://app.soberana.test', sandbox: undefined });
  });
});

describe('getCrossEnvironmentLink', () => {
  it('points the sandbox at the same route on production', () => {
    expect(getCrossEnvironmentLink('sandbox', '/tenant/customers?page=2', URLS)).toEqual({
      target: 'production',
      href: 'https://app.soberana.test/tenant/customers?page=2',
    });
  });

  it('points production at the same route on the sandbox', () => {
    expect(getCrossEnvironmentLink('production', '/tenant/wallets/w-1', URLS)).toEqual({
      target: 'sandbox',
      href: 'https://qa.soberana.test/tenant/wallets/w-1',
    });
  });

  it('returns null when the other deployment URL is not configured', () => {
    expect(getCrossEnvironmentLink('sandbox', '/tenant', { sandbox: URLS.sandbox })).toBeNull();
    expect(getCrossEnvironmentLink('production', '/tenant', {})).toBeNull();
  });
});

describe('TenantEnvironmentBar', () => {
  let page: MountedPage | null = null;

  afterEach(() => {
    page?.unmount();
    page = null;
  });

  function mount(environment: string, urls: { production?: string; sandbox?: string }) {
    page = mountPage(
      <MemoryRouter initialEntries={['/tenant/customers?page=2']}>
        <TenantEnvironmentBar environment={environment} urls={urls} />
      </MemoryRouter>
    );
  }

  it('shows a Sandbox badge and a link to the same route in production', () => {
    mount('sandbox', URLS);

    expect(
      page?.container.querySelector('[data-testid="tenant-environment-badge"]')?.textContent
    ).toBe('Sandbox');
    const link = page?.container.querySelector<HTMLAnchorElement>(
      'a[data-testid="tenant-environment-switch"]'
    );
    expect(link?.textContent).toContain('Open in Production');
    expect(link?.getAttribute('href')).toBe('https://app.soberana.test/tenant/customers?page=2');
  });

  it('shows a Production badge and a link to the sandbox', () => {
    mount('production', URLS);

    expect(
      page?.container.querySelector('[data-testid="tenant-environment-badge"]')?.textContent
    ).toBe('Production');
    const link = page?.container.querySelector<HTMLAnchorElement>(
      'a[data-testid="tenant-environment-switch"]'
    );
    expect(link?.textContent).toContain('Open in Sandbox');
    expect(link?.getAttribute('href')).toBe('https://qa.soberana.test/tenant/customers?page=2');
  });

  it('hides the link when the other deployment URL is empty', () => {
    mount('sandbox', { sandbox: URLS.sandbox });

    expect(
      page?.container.querySelector('[data-testid="tenant-environment-badge"]')
    ).not.toBeNull();
    expect(page?.container.querySelector('a[data-testid="tenant-environment-switch"]')).toBeNull();
  });
});
