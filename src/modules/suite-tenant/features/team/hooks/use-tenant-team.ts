/** Tenant admins (team): list, invite and remove. Invite/remove need a recent sign-in + second factor. */

import { useLingui } from '@lingui/react/macro';

import {
  TenantInviteAdminDocument,
  TenantRemoveAdminDocument,
  type TenantInviteAdminMutation,
} from '@/graphql/mutations/tenant';
import { TenantListTeamDocument } from '@/graphql/queries/tenant';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';
import { useTenantMutation } from '@/modules/suite-tenant/hooks/use-tenant-mutation';
import { tenantQueryKeys } from '@/modules/suite-tenant/lib/tenant-query-keys';

export function useTenantTeam() {
  return useGraphQLQuery([...tenantQueryKeys.team], TenantListTeamDocument);
}

export function useInviteTenantAdmin(onCompleted: (result: TenantInviteAdminMutation) => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantInviteAdminDocument, {
    invalidate: [tenantQueryKeys.team],
    successMessage: t`Admin invited.`,
    errorMessage: t`We couldn't invite the admin`,
    messagesByCode: {
      TENANT_ADMIN_EMAIL_TAKEN: t`That email already belongs to another account.`,
    },
    onCompleted,
  });
}

export function useRemoveTenantAdmin(onCompleted?: () => void) {
  const { t } = useLingui();

  return useTenantMutation(TenantRemoveAdminDocument, {
    invalidate: [tenantQueryKeys.team],
    successMessage: t`Admin removed.`,
    errorMessage: t`We couldn't remove the admin`,
    messagesByCode: {
      TENANT_ADMIN_SELF_REMOVAL: t`You can't remove yourself.`,
      LAST_TENANT_ADMIN: t`Your team needs at least one admin.`,
    },
    onCompleted,
  });
}
