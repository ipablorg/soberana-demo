/**
 * #411 Setup screen: the checklist that leaves one client ready to operate,
 * top to bottom. Each step is done or missing and names the tab that fixes it;
 * the last one (first approved customer and virtual account) is informational.
 * Pure logic: no React, no i18n.
 */

import type { FeeOperation } from '@/graphql/queries/admin-commercial';

export type SetupStepId = 'client' | 'providers' | 'rails' | 'fees' | 'api-key' | 'first-customer';

/** Tabs of the commercial client detail a step links to. */
export type SetupTab = 'onboarding' | 'operation' | 'fees' | 'api-key';

export type SetupStepStatus = 'done' | 'missing' | 'pending';

export interface SetupReadinessIssueKey {
  key: string;
  params: Record<string, unknown>;
}

export interface SetupReadiness {
  missingPairings: readonly string[];
  issueKeys: readonly SetupReadinessIssueKey[];
  deadProviderJunctionsActive: number;
}

/** Why a step is missing when its own facts are not the cause. */
export type SetupStepReason = 'client-not-active' | 'dead-provider-junctions';

export interface SetupInput {
  client: { name: string; taxId: string | null; country: string | null } | null;
  onboarding: readonly { providerCode: string; status: string }[];
  /**
   * `adminLoopay_platformReadiness(clientId)` row. Readiness only covers ACTIVE
   * clients, so null means the client is not active (or has no row yet).
   */
  readiness: SetupReadiness | null;
  activeRailCount: number;
  activeFeeOperations: readonly FeeOperation[];
  /**
   * Current key prefix. Never proof of an issued key: createClient always
   * stores one nobody saw, and revoking writes a new one.
   */
  apiKeyPrefix: string | null | undefined;
  /** Set by "Generar" (`adminLoopay_regenerateClientApiKey`) only. */
  apiKeyRotatedAt: string | null | undefined;
  /** Client status; REVOKED means the key no longer works. */
  clientStatus: string | null | undefined;
  firstCustomerApproved: boolean;
  firstVirtualAccountOpen: boolean;
}

export interface SetupStep {
  id: SetupStepId;
  status: SetupStepStatus;
  informational: boolean;
  /** Tab with the action that completes the step; null when there is none. */
  actionTab: SetupTab | null;
  reason?: SetupStepReason;
  /** providers: providers of enabled rails the client is not registered at. */
  missingProviders?: string[];
  /** first-customer: the two informational facts. */
  firstCustomerApproved?: boolean;
  firstVirtualAccountOpen?: boolean;
}

const REGISTERED = new Set(['LINKED', 'MANUAL']);
const REQUIRED_FEES: readonly FeeOperation[] = ['DEPOSIT', 'WITHDRAWAL'];
const NO_LIVE_RAIL = 'readiness.no_live_rail';
/** Readiness issues a checklist step already reports. */
const COVERED_ISSUES = new Set([
  NO_LIVE_RAIL,
  'readiness.dead_provider_junctions',
  'readiness.provider_not_onboarded',
]);

const filled = (value: string | null | undefined) => (value ?? '').trim().length > 0;

export function buildSetupChecklist(input: SetupInput): SetupStep[] {
  const clientDone =
    input.client !== null &&
    filled(input.client.name) &&
    filled(input.client.taxId) &&
    filled(input.client.country);

  const readiness = input.readiness;
  const notActive: SetupStepReason | undefined = readiness ? undefined : 'client-not-active';

  const missingProviders = [...(readiness?.missingPairings ?? [])];
  const registered = input.onboarding.some((row) => REGISTERED.has(row.status));
  const providersDone = readiness !== null && registered && missingProviders.length === 0;

  const noLiveRail = (readiness?.issueKeys ?? []).some((issue) => issue.key === NO_LIVE_RAIL);
  const deadJunctions = (readiness?.deadProviderJunctionsActive ?? 0) > 0;
  const railsDone =
    readiness !== null && input.activeRailCount > 0 && !noLiveRail && !deadJunctions;
  const railsReason: SetupStepReason | undefined =
    notActive ?? (deadJunctions ? 'dead-provider-junctions' : undefined);

  const feesDone = REQUIRED_FEES.every((operation) =>
    input.activeFeeOperations.includes(operation)
  );
  const apiKeyDone = filled(input.apiKeyRotatedAt) && input.clientStatus !== 'REVOKED';
  const firstDone = input.firstCustomerApproved && input.firstVirtualAccountOpen;

  const required = (
    id: SetupStepId,
    done: boolean,
    tab: SetupTab | null,
    reason?: SetupStepReason
  ): SetupStep => ({
    id,
    status: done ? 'done' : 'missing',
    informational: false,
    actionTab: done ? null : tab,
    ...(done || !reason ? {} : { reason }),
  });

  return [
    required('client', clientDone, null),
    { ...required('providers', providersDone, 'onboarding', notActive), missingProviders },
    required('rails', railsDone, 'operation', railsReason),
    required('fees', feesDone, 'fees'),
    required('api-key', apiKeyDone, 'api-key'),
    {
      id: 'first-customer',
      status: firstDone ? 'done' : 'pending',
      informational: true,
      actionTab: null,
      firstCustomerApproved: input.firstCustomerApproved,
      firstVirtualAccountOpen: input.firstVirtualAccountOpen,
    },
  ];
}

/** Readiness issues of the client that no checklist step already reports, in backend order. */
export function remainingReadinessIssues(
  readiness: SetupReadiness | null
): SetupReadinessIssueKey[] {
  return (readiness?.issueKeys ?? []).filter((issue) => !COVERED_ISSUES.has(issue.key));
}
