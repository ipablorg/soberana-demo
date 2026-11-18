/* @vitest-environment jsdom */

import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { StaffMfaAlert } from '../staff-mfa-alert';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;

afterEach(() => page?.unmount());

describe('StaffMfaAlert', () => {
  it('starts at the content column, clearing the fixed rail and sidebar', () => {
    page = mountPage(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <StaffMfaAlert />
      </MemoryRouter>
    );

    const alert = page.container.querySelector('[role="alert"]') as HTMLElement;

    expect(alert.style.marginLeft).toBe('var(--backoffice-content-offset, 0px)');
    expect(page.text()).toContain('Configúrala ahora para proteger el backoffice.');
  });
});
