/* @vitest-environment jsdom */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import type { AdminStaffUserEntity } from '@/graphql/types/admin-loopay';
import { act } from 'react';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
// Statically imported so the page's module graph is transformed during
// collection instead of inside the first (timed) test.
import StaffUsers, { isProtectedStaffUser } from '../staff-users';

const staffUsersMock = vi.fn();
const createMutate = vi.fn();
const updateMutate = vi.fn();
const deactivateMutate = vi.fn();

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

vi.mock('../../hooks/use-staff-users', () => ({
  useStaffUsers: () => staffUsersMock(),
  useCreateStaffUser: (onCompleted: () => void) => ({
    mutate: createMutate,
    isPending: false,
    onCompleted,
  }),
  useUpdateStaffUser: (onCompleted: () => void) => ({
    mutate: updateMutate,
    isPending: false,
    onCompleted,
  }),
  useReactivateStaffUser: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateStaffUser: (onCompleted: () => void) => ({
    mutate: deactivateMutate,
    isPending: false,
    onCompleted,
  }),
}));

vi.mock('@/shared/components/common/DataTable', () => ({
  DataTable: ({
    columns,
    data,
    emptyMessage,
  }: {
    columns: Array<{ cell?: (ctx: { row: { original: AdminStaffUserEntity } }) => unknown }>;
    data: AdminStaffUserEntity[];
    emptyMessage: string;
  }) => (
    <div data-testid="staff-table">
      {data.length === 0
        ? emptyMessage
        : data.map((u) => (
            <div key={u.id}>
              {columns.map((column, index) => (
                <span key={index}>
                  {column.cell ? (column.cell({ row: { original: u } }) as React.ReactNode) : null}
                </span>
              ))}
            </div>
          ))}
    </div>
  ),
}));

const superuser: AdminStaffUserEntity = {
  id: '00000000-0000-4000-9000-000000000001',
  email: 'bootstrap@loopay.com',
  role: 'CLIENT_USER',
  staff_role: 'LOOPAY_ADMIN',
  first_name: 'Super',
  last_name: 'Admin',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const opsUser: AdminStaffUserEntity = {
  ...superuser,
  id: '00000000-0000-4000-9000-000000000002',
  email: 'ops.kyc@loopay.com',
  staff_role: 'OPS_KYC',
};

describe('StaffUsers page', () => {
  let page: MountedPage;

  beforeEach(() => {
    vi.clearAllMocks();
    staffUsersMock.mockReturnValue({
      data: {
        adminLoopay_listStaffUsers: { data: [superuser, opsUser], total: 2 },
      },
      isLoading: false,
    });
  });

  it('lists the staff users returned by the query', () => {
    page = mountPage(<StaffUsers />);

    expect(page.text()).toContain('bootstrap@loopay.com');
    expect(page.text()).toContain('ops.kyc@loopay.com');
  });

  it('shows role labels in Spanish and marks legacy roles', () => {
    page = mountPage(<StaffUsers />);

    expect(page.text()).toContain('Super administrador');
    expect(page.text()).toContain('Cumplimiento KYC (legado)');
    expect(page.text()).not.toContain('OPS_KYC');
  });

  it('lets a LOOPAY_ADMIN manage other superusers but protects inactive rows', () => {
    // Arrange & Act & Assert — only inactive rows are immutable; superusers are editable.
    expect(isProtectedStaffUser(superuser)).toBe(false);
    expect(isProtectedStaffUser({ ...opsUser, is_active: false })).toBe(true);
    expect(isProtectedStaffUser(opsUser)).toBe(false);
  });
  describe('edit dialog for a legacy user', () => {
    const editButtons = () =>
      Array.from(document.body.querySelectorAll('button')).filter(
        (node) => (node.textContent ?? '').trim() === 'Editar',
      ) as HTMLButtonElement[];
    const select = () => document.body.querySelector('#edit-role') as HTMLSelectElement;
    const saveButton = () =>
      Array.from(document.body.querySelectorAll('button')).find(
        (node) => (node.textContent ?? '').trim() === 'Guardar',
      ) as HTMLButtonElement;

    it('forces choosing one of the three roles before saving', () => {
      page = mountPage(<StaffUsers />);
      page.click(editButtons()[1]);

      expect(Array.from(select().options).map((option) => option.value)).toEqual([
        '',
        'LOOPAY_ADMIN',
        'LOOPAY_OPERATIONS',
        'OPS_COMMERCIAL',
      ]);
      expect(select().value).toBe('');
      expect(saveButton().disabled).toBe(true);
    });

    it('keeps a current grantable role selected', () => {
      page = mountPage(<StaffUsers />);
      page.click(editButtons()[0]);

      expect(select().value).toBe('LOOPAY_ADMIN');
      expect(Array.from(select().options).map((option) => option.value)).not.toContain('');
    });
  });

  describe('create form', () => {
    const bodyButton = (label: string): HTMLButtonElement => {
      const match = Array.from(document.body.querySelectorAll('button')).find(
        (node) => (node.textContent ?? '').trim() === label,
      );
      if (!match) throw new Error(`No button "${label}". Body: ${document.body.textContent}`);
      return match as HTMLButtonElement;
    };
    const chooseRole = (role: string) => {
      const select = document.body.querySelector('#staff-role') as HTMLSelectElement;
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
      act(() => {
        setter?.call(select, role);
        select.dispatchEvent(new Event('change', { bubbles: true }));
      });
    };
    const openCreate = () => {
      page = mountPage(<StaffUsers />);
      page.click(page.findByText('button', 'Nuevo usuario staff'));
    };

    it('asks only email, first name, last name and role (no Firebase UID)', () => {
      openCreate();

      expect(document.body.querySelector('#staff-uid')).toBeNull();
      expect(document.body.textContent).not.toContain('Firebase UID');
      for (const id of ['#staff-email', '#staff-first-name', '#staff-last-name', '#staff-role']) {
        expect(document.body.querySelector(id)).not.toBeNull();
      }
    });

    it('creates a regular role straight away without the Firebase UID', () => {
      openCreate();
      changeValue(document.body.querySelector('#staff-email') as HTMLInputElement, 'ana@loopay.com');
      chooseRole('OPS_COMMERCIAL');

      page.click(bodyButton('Crear'));

      expect(createMutate).toHaveBeenCalledWith({
        input: { email: 'ana@loopay.com', staffRole: 'OPS_COMMERCIAL' },
      });
    });

    it('offers only super administrador, operaciones and comercial with Spanish labels', () => {
      openCreate();

      const options = Array.from(
        (document.body.querySelector('#staff-role') as HTMLSelectElement).options,
      ).map((option) => [option.value, option.textContent]);

      expect(options).toEqual([
        ['LOOPAY_ADMIN', 'Super administrador'],
        ['LOOPAY_OPERATIONS', 'Operaciones'],
        ['OPS_COMMERCIAL', 'Comercial'],
      ]);
    });

    it('requires a confirmation step before granting LOOPAY_ADMIN', () => {
      openCreate();
      changeValue(document.body.querySelector('#staff-email') as HTMLInputElement, 'boss@loopay.com');
      chooseRole('LOOPAY_ADMIN');

      page.click(bodyButton('Crear'));
      expect(createMutate).not.toHaveBeenCalled();
      expect(document.body.textContent).toContain('super administrador');

      page.click(bodyButton('Confirmar y crear'));
      expect(createMutate).toHaveBeenCalledWith({
        input: { email: 'boss@loopay.com', staffRole: 'LOOPAY_ADMIN' },
      });
    });
  });
});
