/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { StateChangeConfirmationModal } from '../StateChangeConfirmationModal';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

function render(fromState: string, toState: string) {
  page = mountPage(
    <StateChangeConfirmationModal
      open
      onClose={() => {}}
      onConfirm={() => {}}
      selectedCount={1}
      fromState={fromState}
      toState={toState}
      entityType="payin"
    />
  );
}

describe('StateChangeConfirmationModal', () => {
  it('shows Spanish status labels instead of raw enum values', () => {
    render('PENDING', 'COMPLETED');

    const text = page.text();
    expect(text).toContain('Pendiente');
    expect(text).toContain('Completado');
    expect(text).not.toContain('PENDING');
    expect(text).not.toContain('COMPLETED');
  });

  it('labels customer statuses too', () => {
    render('ACTIVE', 'SUSPENDED');

    const text = page.text();
    expect(text).toContain('Activo');
    expect(text).toContain('Suspendido');
    expect(text).not.toContain('SUSPENDED');
  });

  it('keeps an already-labelled state unchanged', () => {
    render('Aprobado', 'Rechazado');

    expect(page.text()).toContain('Aprobado');
    expect(page.text()).toContain('Rechazado');
  });
});
