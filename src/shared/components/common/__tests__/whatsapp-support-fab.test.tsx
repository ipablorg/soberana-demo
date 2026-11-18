/* @vitest-environment jsdom */

import { i18n } from '@lingui/core';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

import { WhatsAppSupportFab } from '../whatsapp-support-fab';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className} data-testid="fab">
        {children}
      </div>
    ),
  },
}));

let page: MountedPage;
beforeAll(() => i18n.loadAndActivate({ locale: 'es', messages: {} }));
afterEach(() => page.unmount());

describe('WhatsAppSupportFab', () => {
  it('lifts above the client mobile dock (data-suite-dock) and stays hidden in the backoffice', () => {
    page = mountPage(
      <TooltipProvider>
        <WhatsAppSupportFab />
      </TooltipProvider>
    );
    const cls = page.container.querySelector('[data-testid="fab"]')?.className ?? '';

    expect(cls).toContain('html[data-suite-dock]');
    expect(cls).toContain('safe-area-inset-bottom');
    expect(cls).toContain('html[data-surface=backoffice]');
  });

  it('hides on phones while a Receive/Send flow is open so it never covers the panel', () => {
    page = mountPage(
      <TooltipProvider>
        <WhatsAppSupportFab />
      </TooltipProvider>
    );
    const cls = page.container.querySelector('[data-testid="fab"]')?.className ?? '';

    expect(cls).toContain('[html[data-suite-flow-open]_&]:max-md:hidden');
  });
});
