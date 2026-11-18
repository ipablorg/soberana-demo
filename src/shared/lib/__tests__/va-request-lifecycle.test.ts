import { describe, expect, it } from 'vitest';
import {
  resolveVaRequestLifecycle,
  VA_REQUEST_STEPS,
} from '../va-request-lifecycle';

describe('resolveVaRequestLifecycle', () => {
  it('an active deposit short-circuits to the active phase', () => {
    const result = resolveVaRequestLifecycle({
      status: 'pending',
      readiness: 'waiting',
      artifactType: 'none',
      hasActiveDeposit: true,
    });

    expect(result).toEqual({ phase: 'active', stepIndex: 3 });
  });

  it('a fresh request with no endorsement is not_requested', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'not_initiated',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'not_requested', stepIndex: 0 });

    expect(
      resolveVaRequestLifecycle({ status: undefined, hasActiveDeposit: false }),
    ).toEqual({ phase: 'not_requested', stepIndex: 0 });
  });

  it('a pending endorsement is in operations review', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'pending',
        readiness: 'waiting',
        artifactType: 'none',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'ops_review', stepIndex: 1 });
  });

  it('unknown in-flight statuses fall back to operations review (never fake progress)', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'in_review',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'ops_review', stepIndex: 1 });
  });

  it('approved without a backing artifact is onboarding', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'approved',
        readiness: 'waiting',
        artifactType: 'none',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'onboarding', stepIndex: 2 });

    expect(
      resolveVaRequestLifecycle({
        status: 'approved',
        readiness: 'waiting',
        artifactType: 'virtual_account',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'onboarding', stepIndex: 2 });
  });

  it('approved with ready virtual-account artifact is active', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'approved',
        readiness: 'ready',
        artifactType: 'virtual_account',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'active', stepIndex: 3 });
  });

  it('blockers surface with their reason at the review step', () => {
    expect(
      resolveVaRequestLifecycle({ status: 'rejected', hasActiveDeposit: false }),
    ).toEqual({ phase: 'blocked', stepIndex: 1, blocker: 'rejected' });

    expect(
      resolveVaRequestLifecycle({ status: 'frozen', hasActiveDeposit: false }),
    ).toEqual({ phase: 'blocked', stepIndex: 1, blocker: 'frozen' });

    expect(
      resolveVaRequestLifecycle({ status: 'additional_info', hasActiveDeposit: false }),
    ).toEqual({ phase: 'blocked', stepIndex: 1, blocker: 'additional_info' });
  });

  it('approved but unavailable readiness is a blocked rail', () => {
    expect(
      resolveVaRequestLifecycle({
        status: 'approved',
        readiness: 'unavailable',
        artifactType: 'none',
        hasActiveDeposit: false,
      }),
    ).toEqual({ phase: 'blocked', stepIndex: 1, blocker: 'unavailable' });
  });

  it('statuses are normalized case- and whitespace-insensitively', () => {
    expect(
      resolveVaRequestLifecycle({ status: ' Pending ', hasActiveDeposit: false }),
    ).toEqual({ phase: 'ops_review', stepIndex: 1 });

    expect(
      resolveVaRequestLifecycle({ status: 'APPROVED', readiness: 'Ready', artifactType: 'VIRTUAL_ACCOUNT', hasActiveDeposit: false }),
    ).toEqual({ phase: 'active', stepIndex: 3 });
  });

  it('exposes the four customer-facing steps in order', () => {
    expect(VA_REQUEST_STEPS).toEqual([
      'request',
      'ops_review',
      'onboarding',
      'active',
    ]);
  });
});
