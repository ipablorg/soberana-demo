import type { VirtualAccount } from '@/shared/hooks/use-deposit-instructions';
import {
  getReceiveRailCurrency,
  getReceiveRailLabel,
} from '@/shared/lib/receive-presentation';

export interface ReceiveEndorsement {
  id: string;
  payment_rail: string;
  status: string;
  created_at: string;
  /** Backend-owned receive readiness: ready | waiting | unavailable. */
  readiness?: string | null;
  /** What backs the rail: virtual_account | payment_link | none. */
  artifact_type?: string | null;
}

export interface ReceiveActivationActionLink {
  type: 'kyc' | 'tos';
  url: string;
}

export interface ReceiveRail {
  code: string;
  name: string;
  description: string | null;
}

export type ReceiveAccountStatus = 'active' | 'pending' | 'not_requested';
export type ReceiveMode = 'virtual_account' | 'payment_link' | 'waiting' | 'not_requested';

export interface ReceiveAccountViewModel {
  id: string;
  currency: string;
  paymentRail: string;
  status: ReceiveAccountStatus;
  receiveMode: ReceiveMode;
  railName?: string;
  deposit: VirtualAccount | null;
  usePaymentLink?: boolean;
  endorsementStatus?: string;
  /** Backend-owned receive readiness (ready | waiting | unavailable). */
  readiness?: string | null;
  /** What backs the rail (virtual_account | payment_link | none). */
  artifactType?: string | null;
  actionLink?: ReceiveActivationActionLink | null;
}

interface BuildReceiveAccountsInput {
  virtualAccounts: VirtualAccount[];
  endorsements: ReceiveEndorsement[];
  paymentLinkRails?: Set<string>;
  rails?: ReceiveRail[];
  excludedRails: Set<string>;
}

function normalizeVirtualAccountStatus(status: string): ReceiveAccountStatus {
  return status === 'active' || status === 'ACTIVE' ? 'active' : 'pending';
}

function isApprovedEndorsement(status: string): boolean {
  return status === 'approved' || status === 'active' || status === 'ACTIVE';
}

function toCurrency(paymentRail: string): string {
  return getReceiveRailCurrency(paymentRail) ?? paymentRail.toUpperCase();
}

function addAccount(
  accounts: Map<string, ReceiveAccountViewModel>,
  account: ReceiveAccountViewModel,
): void {
  const railKey = account.paymentRail.toLowerCase();

  const existingAccount = accounts.get(railKey);

  if (!existingAccount) {
    accounts.set(railKey, account);
    return;
  }

  const nextPriority = getReceiveAccountPriority(account);
  const existingPriority = getReceiveAccountPriority(existingAccount);

  if (nextPriority > existingPriority) {
    accounts.set(railKey, account);
    return;
  }

  if (nextPriority < existingPriority) {
    return;
  }

  accounts.set(railKey, {
    ...existingAccount,
    endorsementStatus: existingAccount.endorsementStatus ?? account.endorsementStatus,
    actionLink: existingAccount.actionLink ?? account.actionLink,
    deposit: existingAccount.deposit ?? account.deposit,
    readiness: existingAccount.readiness ?? account.readiness,
    artifactType: existingAccount.artifactType ?? account.artifactType,
  });
}

function getReceiveAccountPriority(account: ReceiveAccountViewModel): number {
  switch (account.receiveMode) {
    case 'virtual_account':
      return 4;
    case 'payment_link':
      return 3;
    case 'waiting':
      return 2;
    case 'not_requested':
      return 1;
    default:
      return 0;
  }
}

export function buildReceiveAccounts({
  virtualAccounts,
  endorsements,
  paymentLinkRails = new Set<string>(),
  rails = [],
  excludedRails,
}: BuildReceiveAccountsInput): ReceiveAccountViewModel[] {
  const accounts = new Map<string, ReceiveAccountViewModel>();

  for (const virtualAccount of virtualAccounts) {
    addAccount(accounts, {
      id: virtualAccount.id,
      currency: virtualAccount.currency,
      paymentRail: virtualAccount.payment_rail,
      status: normalizeVirtualAccountStatus(virtualAccount.status),
      receiveMode:
        normalizeVirtualAccountStatus(virtualAccount.status) === 'active'
          ? 'virtual_account'
          : 'waiting',
      railName: getReceiveRailLabel({ railCode: virtualAccount.payment_rail }),
      deposit: virtualAccount,
    });
  }

  for (const endorsement of endorsements) {
    const railLower = endorsement.payment_rail.toLowerCase();

    if (excludedRails.has(railLower)) {
      continue;
    }

    // not_initiated = rail exists in the catalog but the user hasn't
    // activated it. Skip so the rails-catalog loop below synthesizes a
    // `not_requested` row instead.
    if (endorsement.status === 'not_initiated') {
      continue;
    }

    if (isApprovedEndorsement(endorsement.status)) {
      // Approved → active (payment link rail) or pending (waiting for
      // the virtual account to be provisioned).
      const isPaymentLinkRail = paymentLinkRails.has(railLower);

      addAccount(accounts, {
        id: endorsement.id,
        currency: toCurrency(endorsement.payment_rail),
        paymentRail: endorsement.payment_rail,
        status: isPaymentLinkRail ? 'active' : 'pending',
        receiveMode: isPaymentLinkRail ? 'payment_link' : 'waiting',
        railName: getReceiveRailLabel({ railCode: endorsement.payment_rail }),
        deposit: null,
        usePaymentLink: isPaymentLinkRail,
        endorsementStatus: endorsement.status,
        readiness: endorsement.readiness ?? null,
        artifactType: endorsement.artifact_type ?? null,
      });
    } else {
      // Non-approved, non-not_initiated (pending, in_review, …) → the
      // endorsement was requested but is not yet approved. Show it as
      // pending so the user sees the rail is in flight.
      addAccount(accounts, {
        id: endorsement.id,
        currency: toCurrency(endorsement.payment_rail),
        paymentRail: endorsement.payment_rail,
        status: 'pending',
        receiveMode: 'waiting',
        railName: getReceiveRailLabel({ railCode: endorsement.payment_rail }),
        deposit: null,
        endorsementStatus: endorsement.status,
        readiness: endorsement.readiness ?? null,
        artifactType: endorsement.artifact_type ?? null,
      });
    }
  }

  for (const rail of rails) {
    const railLower = rail.code.toLowerCase();

    if (excludedRails.has(railLower) || accounts.has(railLower)) {
      continue;
    }

    addAccount(accounts, {
      id: `rail-${rail.code}`,
      currency: toCurrency(rail.code),
      paymentRail: rail.code,
      status: 'not_requested',
      receiveMode: 'not_requested',
      railName: getReceiveRailLabel({ railCode: rail.code, railName: rail.name }),
      deposit: null,
    });
  }

  return [...accounts.values()];
}
