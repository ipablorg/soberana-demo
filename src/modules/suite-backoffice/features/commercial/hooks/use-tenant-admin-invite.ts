/**
 * Staff invite of a client's tenant admin (epic 2026-11 S4,
 * `adminLoopay_inviteTenantAdmin`, LOOPAY_ADMIN / OPS_COMMERCIAL). The back
 * asks for a recent sign-in, which `graphqlClient.request` already handles.
 */

import { useLingui } from '@lingui/react/macro';

import {
  InviteTenantAdminDocument,
  type InviteTenantAdminMutation,
  type InviteTenantAdminMutationVariables,
} from '@/graphql/mutations/admin-loopay';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { commercialQueryKeys } from '../lib/commercial-logic';
import { inviteFailureOf } from '../lib/tenant-access';

export function useInviteTenantAdmin(
  clientId: string,
  onInvited: (result: InviteTenantAdminMutation) => void
) {
  const { t } = useLingui();

  return useOpsMutation<InviteTenantAdminMutation, InviteTenantAdminMutationVariables>(
    InviteTenantAdminDocument,
    {
      invalidate: [commercialQueryKeys.setup(clientId)],
      successMessage: t`Tenant admin invited`,
      errorMessage: t`We couldn't invite the tenant admin`,
      describeError: (error) => {
        switch (inviteFailureOf(error)) {
          case 'email-taken':
            return t`This email already belongs to another account. Use a different email.`;
          case 'client-not-found':
            return t`This client no longer exists.`;
          default:
            return undefined;
        }
      },
      onCompleted: onInvited,
    }
  );
}
