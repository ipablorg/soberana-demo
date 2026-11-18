/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { ToggleConfirmationDialog } from '../toggle-confirmation-dialog';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@/shared/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

describe('ToggleConfirmationDialog', () => {
  it('states the blast radius and entity name for a deactivate', () => {
    page = mountPage(
      <ToggleConfirmationDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        entityType="proveedor"
        entityName="Fireblocks"
        action="deactivate"
      />,
    );

    const rendered = page.text();

    expect(rendered).toContain('proveedor');
    expect(rendered).toContain('Fireblocks');
    expect(rendered).toContain('TODOS los clients');
  });

  it("N8: talks about this customer's account when closing a customer virtual account", () => {
    page = mountPage(
      <ToggleConfirmationDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        entityType="cuenta virtual"
        entityName="ach_wire"
        action="close"
        scope="customer"
      />,
    );

    const rendered = page.text();

    expect(rendered).toContain('ach_wire');
    expect(rendered).toContain('Solo afecta a la cuenta de este cliente');
    expect(rendered).not.toContain('TODOS los clients');
  });

  it('calls onConfirm when the action button is clicked', () => {
    const onConfirm = vi.fn();

    page = mountPage(
      <ToggleConfirmationDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        entityType="riel"
        entityName="SEPA"
        action="activate"
      />,
    );

    page.click(page.findByText('button', 'Activar'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
