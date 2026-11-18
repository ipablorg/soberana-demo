/**
 * Provider sandbox simulators (Compliance → Beneficiarios).
 *
 * The availability query is the only gate the UI trusts: when the back does
 * not report a sandbox host (or the staff role lacks access) the data is
 * missing and no simulator control renders.
 */

import { useLingui } from '@lingui/react/macro';

import {
  StartProviderBeneficiaryVerificationDocument,
  type StartProviderBeneficiaryVerificationMutation,
  type StartProviderBeneficiaryVerificationMutationVariables,
  SimulateProviderBeneficiaryVerificationDocument,
  type SimulateProviderBeneficiaryVerificationMutation,
  type SimulateProviderBeneficiaryVerificationMutationVariables,
} from '@/graphql/mutations/admin-loopay';
import {
  ProviderSandboxAvailabilityDocument,
  type ProviderSandboxAvailabilityQuery,
  type ProviderSandboxAvailabilityQueryVariables,
} from '@/graphql/queries/admin-loopay';
import { useGraphQLQuery } from '@/shared/hooks/use-graphql-query';

import { useOpsMutation } from '../../ops-review/hooks/use-ops-mutation';
import { OPS_QUERY_ROOT, opsQueryKeys } from '../../ops-review/lib/ops-query-keys';

const SANDBOX_AVAILABILITY_KEY = [OPS_QUERY_ROOT, 'provider-sandbox-availability'] as const;

const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useProviderSandboxAvailability() {
  return useGraphQLQuery<
    ProviderSandboxAvailabilityQuery,
    ProviderSandboxAvailabilityQueryVariables
  >([...SANDBOX_AVAILABILITY_KEY], ProviderSandboxAvailabilityDocument, undefined, {
    staleTime: FIVE_MINUTES_MS,
    retry: false,
  });
}

export function useSimulateProviderBeneficiary(onCompleted?: () => void) {
  const { t } = useLingui();

  return useOpsMutation<
    SimulateProviderBeneficiaryVerificationMutation,
    SimulateProviderBeneficiaryVerificationMutationVariables
  >(SimulateProviderBeneficiaryVerificationDocument, {
    invalidate: [opsQueryKeys.allBeneficiaries, opsQueryKeys.beneficiariesQueue],
    successMessage: t`Simulación enviada al sandbox; el proveedor responderá por webhook`,
    errorMessage: t`No se pudo simular la verificación en el sandbox`,
    onCompleted,
  });
}

export function useStartProviderBeneficiaryVerification() {
  const { t } = useLingui();

  return useOpsMutation<
    StartProviderBeneficiaryVerificationMutation,
    StartProviderBeneficiaryVerificationMutationVariables
  >(StartProviderBeneficiaryVerificationDocument, {
    invalidate: [opsQueryKeys.allBeneficiaries, opsQueryKeys.beneficiariesQueue],
    successMessage: t`Verificación iniciada en el proveedor; el resultado llega por webhook`,
    errorMessage: t`No se pudo iniciar la verificación en el proveedor`,
  });
}
