/**
 * `/backoffice/platform/staff-users` — staff user management (LOOPAY_ADMIN).
 *
 * Lists the staff directory via `adminLoopay_listStaffUsers`, creates staff
 * users from email, names and role only (the backend provisions the Firebase
 * user and returns a one-time password setup link) and manages role /
 * activation. Granting LOOPAY_ADMIN or changing any role asks for confirmation.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { ColumnDef } from '@tanstack/react-table';

import type {
  AdminStaffRole,
  AdminStaffUserEntity,
} from '@/graphql/types/admin-loopay';
import { DataTable } from '@/shared/components/common/DataTable';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Loader2, Plus, ShieldCheck } from '@/shared/components/animated-icons';
import { useAuthStore } from '@/shared/stores/auth-store';
import { staffRoleLabel } from '@/shared/lib/staff-roles';

import {
  useCreateStaffUser,
  useDeactivateStaffUser,
  useReactivateStaffUser,
  useStaffUsers,
  useUpdateStaffUser,
} from '../hooks/use-staff-users';
import { EMPTY_CELL, formatOpsDateTime } from '../../ops-review/lib/ops-formatting';
import { staffRowActions, staffStatusLabel } from '../lib/staff-status';
import { PasswordSetupLinkNotice } from '../components/password-setup-link-notice';
import {
  GRANTABLE_ROLES,
  buildCreateStaffInput,
  isRoleChangeConfirmationRequired,
} from '../lib/staff-role-change';

const EMPTY_CREATE_FORM = {
  email: '',
  firstName: '',
  lastName: '',
  staffRole: 'LOOPAY_OPERATIONS' as AdminStaffRole,
};

/**
 * Inactive rows are immutable. Any LOOPAY_ADMIN may edit another LOOPAY_ADMIN
 * (with confirmation); the caller's own row is locked separately because the
 * backend refuses self role changes and self deactivation.
 */
export function isProtectedStaffUser(user: AdminStaffUserEntity): boolean {
  return !user.is_active;
}

export default function StaffUsers() {
  const { t } = useLingui();

  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<AdminStaffRole | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createConfirming, setCreateConfirming] = useState(false);
  const [editConfirming, setEditConfirming] = useState(false);
  const [createdNotice, setCreatedNotice] = useState<{
    email: string;
    link: string | null;
  } | null>(null);
  const myEmail = useAuthStore((state) => state.user?.email);
  const [editingUser, setEditingUser] = useState<AdminStaffUserEntity | null>(
    null,
  );
  // Empty while editing a legacy user: they must pick one of the three roles.
  const [editRole, setEditRole] = useState<AdminStaffRole | ''>('');
  const [pendingDeactivation, setPendingDeactivation] =
    useState<AdminStaffUserEntity | null>(null);

  const where = useMemo(
    () => ({
      ...(searchFilter.trim() && {
        email: { contains: searchFilter.trim() },
      }),
      ...(roleFilter && { staff_role: roleFilter }),
    }),
    [searchFilter, roleFilter],
  );

  const { data, isLoading } = useStaffUsers(where);
  const createStaffUser = useCreateStaffUser((result) => {
    const created = result.adminLoopay_createStaffUser;

    setCreateOpen(false);
    setCreateConfirming(false);
    setCreateForm(EMPTY_CREATE_FORM);
    setCreatedNotice({
      email: created.email,
      link: created.passwordSetupLink ?? null,
    });
  });
  const updateStaffUser = useUpdateStaffUser(() => {
    setEditingUser(null);
    setEditConfirming(false);
  });
  const reactivateStaffUser = useReactivateStaffUser();
  const deactivateStaffUser = useDeactivateStaffUser(() =>
    setPendingDeactivation(null),
  );

  const users = data?.adminLoopay_listStaffUsers.data ?? [];

  const columns = useMemo<ColumnDef<AdminStaffUserEntity>[]>(
    () => [
      {
        accessorKey: 'email',
        header: t`Email`,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.email}</span>
        ),
      },
      {
        id: 'name',
        header: t`Nombre`,
        cell: ({ row }) =>
          [row.original.first_name, row.original.last_name]
            .filter(Boolean)
            .join(' ') || EMPTY_CELL,
      },
      {
        accessorKey: 'staff_role',
        header: t`Rol`,
        cell: ({ row }) => staffRoleLabel(row.original.staff_role),
      },
      {
        accessorKey: 'is_active',
        header: t`Estado`,
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
            {staffStatusLabel(row.original.is_active)}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: t`Creado`,
        cell: ({ row }) => formatOpsDateTime(row.original.created_at),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          const actions = staffRowActions({
            isActive: user.is_active,
            isSelf:
              myEmail !== undefined &&
              user.email.toLowerCase() === myEmail.toLowerCase(),
          });

          return (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!actions.canEdit}
                onClick={() => {
                  setEditRole(
                    user.staff_role && GRANTABLE_ROLES.includes(user.staff_role)
                      ? user.staff_role
                      : '',
                  );
                  setEditingUser(user);
                }}
              >
                <Trans>Editar</Trans>
              </Button>
              {actions.toggle === 'reactivate' ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reactivateStaffUser.isPending}
                  onClick={() =>
                    reactivateStaffUser.mutate({
                      id: user.id,
                      input: { isActive: true },
                    })
                  }
                >
                  <Trans>Reactivar</Trans>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actions.toggle === null}
                  onClick={() => setPendingDeactivation(user)}
                >
                  <Trans>Desactivar</Trans>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [t, myEmail, reactivateStaffUser],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t`Usuarios del backoffice`}
        subtitle={t`Gestión de staff y roles (solo super administrador)`}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            <Trans>Nuevo usuario staff</Trans>
          </Button>
          <Button
            size="sm"
            variant={roleFilter === null ? 'default' : 'outline'}
            onClick={() => setRoleFilter(null)}
          >
            <Trans>Todos</Trans>
          </Button>
          {GRANTABLE_ROLES.map((role) => (
            <Button
              key={role}
              size="sm"
              variant={roleFilter === role ? 'default' : 'outline'}
              onClick={() => setRoleFilter(role)}
            >
              {staffRoleLabel(role)}
            </Button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          minWidth="900px"
          emptyMessage={t`No hay usuarios staff para estos filtros`}
          toolbar={
            <div className="space-y-2">
              <Label htmlFor="staff-search">
                <Trans>Buscar por email</Trans>
              </Label>
              <Input
                id="staff-search"
                value={searchFilter}
                onChange={(event) => setSearchFilter(event.target.value)}
                className="w-72"
              />
            </div>
          }
        />
      </section>

      {/* Create dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateConfirming(false);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              <Trans>Nuevo usuario staff</Trans>
            </DialogTitle>
            <DialogDescription>
              <Trans>
                Solo necesitamos email, nombre y rol. Si la persona aún no tiene
                acceso, le generamos un enlace para que defina su contraseña.
              </Trans>
            </DialogDescription>
          </DialogHeader>

          {createConfirming ? (
            <div className="space-y-2 py-2" role="alert">
              <p className="text-sm font-medium">
                {createForm.staffRole === 'LOOPAY_ADMIN' ? (
                  <Trans>
                    Va a crear a {createForm.email} como super administrador:
                    tendrá acceso a todo el backoffice y podrá crear otros
                    super administradores.
                  </Trans>
                ) : (
                  <Trans>
                    Va a crear a {createForm.email} con el rol{' '}
                    {staffRoleLabel(createForm.staffRole)}.
                  </Trans>
                )}
              </p>
            </div>
          ) : (
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="staff-email">
                <Trans>Email</Trans>
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={createForm.email}
                onChange={(event) =>
                  setCreateForm({ ...createForm, email: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff-first-name">
                  <Trans>Nombre</Trans>
                </Label>
                <Input
                  id="staff-first-name"
                  value={createForm.firstName}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      firstName: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-last-name">
                  <Trans>Apellido</Trans>
                </Label>
                <Input
                  id="staff-last-name"
                  value={createForm.lastName}
                  onChange={(event) =>
                    setCreateForm({
                      ...createForm,
                      lastName: event.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">
                <Trans>Rol</Trans>
              </Label>
              <select
                id="staff-role"
                value={createForm.staffRole}
                onChange={(event) =>
                  setCreateForm({
                    ...createForm,
                    staffRole: event.target.value as AdminStaffRole,
                  })
                }
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                {GRANTABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {staffRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                createConfirming
                  ? setCreateConfirming(false)
                  : setCreateOpen(false)
              }
            >
              {createConfirming ? <Trans>Volver</Trans> : <Trans>Cancelar</Trans>}
            </Button>
            <Button
              disabled={createStaffUser.isPending || !createForm.email.trim()}
              onClick={() => {
                if (!createConfirming && createForm.staffRole === 'LOOPAY_ADMIN') {
                  setCreateConfirming(true);
                  return;
                }
                createStaffUser.mutate({
                  input: buildCreateStaffInput(createForm),
                });
              }}
            >
              {createStaffUser.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {createConfirming ? <Trans>Confirmar y crear</Trans> : <Trans>Crear</Trans>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit role dialog */}
      <Dialog
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
            setEditConfirming(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          {editingUser && (
            <>
              <DialogHeader>
                <DialogTitle>{editingUser.email}</DialogTitle>
                <DialogDescription>
                  <Trans>Cambia el rol del usuario staff</Trans>
                </DialogDescription>
              </DialogHeader>
              {editConfirming ? (
                <div className="space-y-2 py-2" role="alert">
                  <p className="text-sm font-medium">
                    {editRole === 'LOOPAY_ADMIN' ? (
                      <Trans>
                        Va a otorgar el rol de super administrador a{' '}
                        {editingUser.email}: tendrá acceso a todo el backoffice.
                      </Trans>
                    ) : (
                      <Trans>
                        Va a cambiar el rol de {editingUser.email} de{' '}
                        {staffRoleLabel(editingUser.staff_role)} a{' '}
                        {staffRoleLabel(editRole)}.
                      </Trans>
                    )}
                  </p>
                </div>
              ) : (
              <div className="space-y-2 py-2">
                <Label htmlFor="edit-role">
                  <Trans>Rol</Trans>
                </Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(event) =>
                    setEditRole(event.target.value as AdminStaffRole | '')
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {editRole === '' && (
                    <option value="" disabled>
                      {t`Elige un rol`}
                    </option>
                  )}
                  {GRANTABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {staffRoleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    editConfirming
                      ? setEditConfirming(false)
                      : setEditingUser(null)
                  }
                >
                  {editConfirming ? <Trans>Volver</Trans> : <Trans>Cancelar</Trans>}
                </Button>
                <Button
                  disabled={
                    updateStaffUser.isPending ||
                    editRole === '' ||
                    !isRoleChangeConfirmationRequired(
                      editingUser.staff_role,
                      editRole,
                    )
                  }
                  onClick={() => {
                    if (editRole === '') return;
                    if (!editConfirming) {
                      setEditConfirming(true);
                      return;
                    }
                    updateStaffUser.mutate({
                      id: editingUser.id,
                      input: { staffRole: editRole },
                    });
                  }}
                >
                  {updateStaffUser.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editConfirming ? <Trans>Confirmar cambio</Trans> : <Trans>Guardar</Trans>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {createdNotice && (
        <PasswordSetupLinkNotice
          email={createdNotice.email}
          link={createdNotice.link}
          onClose={() => setCreatedNotice(null)}
        />
      )}

      {/* Deactivation confirm */}
      <Dialog
        open={pendingDeactivation !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeactivation(null);
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          {pendingDeactivation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <Trans>Desactivar usuario staff</Trans>
                </DialogTitle>
                <DialogDescription>
                  <Trans>
                    Se revocarán sus sesiones y perderá el acceso al
                    backoffice. {pendingDeactivation.email}
                  </Trans>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPendingDeactivation(null)}
                >
                  <Trans>Cancelar</Trans>
                </Button>
                <Button
                  variant="destructive"
                  disabled={deactivateStaffUser.isPending}
                  onClick={() =>
                    deactivateStaffUser.mutate({ id: pendingDeactivation.id })
                  }
                >
                  {deactivateStaffUser.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <Trans>Desactivar</Trans>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
