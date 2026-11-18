import { describe, expect, it } from 'vitest';

import { buildSetupChecklist, remainingReadinessIssues, type SetupInput } from '../client-setup';

const READY: SetupInput = {
  client: { name: 'Acme SAS', taxId: '900123', country: 'COL' },
  onboarding: [{ providerCode: 'mesta', status: 'LINKED' }],
  readiness: { missingPairings: [], issueKeys: [], deadProviderJunctionsActive: 0 },
  activeRailCount: 2,
  activeFeeOperations: ['DEPOSIT', 'WITHDRAWAL'],
  apiKeyPrefix: 'lp_live_ab12',
  apiKeyRotatedAt: '2026-10-01T12:00:00Z',
  clientStatus: 'ACTIVE',
  firstCustomerApproved: true,
  firstVirtualAccountOpen: true,
};

const statusOf = (input: SetupInput) =>
  Object.fromEntries(buildSetupChecklist(input).map((step) => [step.id, step.status]));

describe('buildSetupChecklist (#411 Setup screen)', () => {
  it('lists the six steps top to bottom, the last one informational', () => {
    const steps = buildSetupChecklist(READY);

    expect(steps.map((step) => step.id)).toEqual([
      'client',
      'providers',
      'rails',
      'fees',
      'api-key',
      'first-customer',
    ]);
    expect(steps.map((step) => step.status)).toEqual([
      'done',
      'done',
      'done',
      'done',
      'done',
      'done',
    ]);
    expect(steps[5].informational).toBe(true);
    expect(steps.slice(0, 5).every((step) => !step.informational)).toBe(true);
  });

  it('marks the client missing without a name, tax id or country', () => {
    expect(statusOf({ ...READY, client: { name: 'Acme', taxId: '', country: 'COL' } }).client).toBe(
      'missing'
    );
    expect(statusOf({ ...READY, client: null }).client).toBe('missing');
  });

  it('needs a registration at some provider and none missing for the enabled rails', () => {
    expect(statusOf({ ...READY, onboarding: [] }).providers).toBe('missing');
    expect(
      statusOf({ ...READY, onboarding: [{ providerCode: 'mesta', status: 'FAILED' }] }).providers
    ).toBe('missing');
    expect(
      statusOf({ ...READY, onboarding: [{ providerCode: 'kirafin', status: 'MANUAL' }] }).providers
    ).toBe('done');

    const missing = buildSetupChecklist({
      ...READY,
      readiness: { missingPairings: ['kirafin'], issueKeys: [], deadProviderJunctionsActive: 0 },
    }).find((step) => step.id === 'providers');
    expect(missing?.status).toBe('missing');
    expect(missing?.missingProviders).toEqual(['kirafin']);
  });

  it('needs at least one enabled rail and no "no live rail" finding', () => {
    expect(statusOf({ ...READY, activeRailCount: 0 }).rails).toBe('missing');
    expect(
      statusOf({
        ...READY,
        readiness: {
          missingPairings: [],
          issueKeys: [{ key: 'readiness.no_live_rail', params: {} }],
          deadProviderJunctionsActive: 0,
        },
      }).rails
    ).toBe('missing');
  });

  it('marks the rails missing while an active junction still points to a dead provider', () => {
    const rails = buildSetupChecklist({
      ...READY,
      readiness: { missingPairings: [], issueKeys: [], deadProviderJunctionsActive: 2 },
    }).find((step) => step.id === 'rails');

    expect(rails?.status).toBe('missing');
    expect(rails?.reason).toBe('dead-provider-junctions');
    expect(rails?.actionTab).toBe('operation');
  });

  it('marks providers and rails missing when readiness has no row (the client is not active)', () => {
    const steps = buildSetupChecklist({ ...READY, readiness: null });
    const byId = Object.fromEntries(steps.map((step) => [step.id, step]));

    expect(byId.providers.status).toBe('missing');
    expect(byId.providers.reason).toBe('client-not-active');
    expect(byId.rails.status).toBe('missing');
    expect(byId.rails.reason).toBe('client-not-active');
  });

  it('needs both a deposit and a withdrawal fee', () => {
    expect(statusOf({ ...READY, activeFeeOperations: ['DEPOSIT'] }).fees).toBe('missing');
    expect(statusOf({ ...READY, activeFeeOperations: ['WITHDRAWAL', 'VA_CREATION'] }).fees).toBe(
      'missing'
    );
    expect(statusOf({ ...READY, activeFeeOperations: [] }).fees).toBe('missing');
  });

  it('needs an issued API key: a fresh client (creation prefix, never rotated) has none', () => {
    // createClient always stores a prefix, but nobody ever saw that key.
    const fresh = { ...READY, apiKeyPrefix: 'lp_live_ab12', apiKeyRotatedAt: null };

    expect(statusOf(fresh)['api-key']).toBe('missing');
    expect(statusOf({ ...fresh, apiKeyRotatedAt: undefined })['api-key']).toBe('missing');
  });

  it('treats a revoked key as missing even after an earlier issue', () => {
    expect(
      statusOf({ ...READY, apiKeyRotatedAt: '2026-10-01T12:00:00Z', clientStatus: 'REVOKED' })[
        'api-key'
      ]
    ).toBe('missing');
  });

  it('reports the first approved customer and virtual account as pending, never as missing', () => {
    const step = buildSetupChecklist({
      ...READY,
      firstCustomerApproved: false,
      firstVirtualAccountOpen: false,
    }).find((entry) => entry.id === 'first-customer');

    expect(step?.status).toBe('pending');
    expect(step?.firstCustomerApproved).toBe(false);
    expect(step?.firstVirtualAccountOpen).toBe(false);
  });

  it('points each missing step at the tab that fixes it', () => {
    const steps = buildSetupChecklist({
      ...READY,
      onboarding: [],
      activeRailCount: 0,
      activeFeeOperations: [],
      apiKeyRotatedAt: null,
    });
    const tabs = Object.fromEntries(steps.map((step) => [step.id, step.actionTab]));

    expect(tabs).toEqual({
      client: null,
      providers: 'onboarding',
      rails: 'operation',
      fees: 'fees',
      'api-key': 'api-key',
      'first-customer': null,
    });
  });

  it('counts the required steps done (the informational one never counts)', () => {
    const steps = buildSetupChecklist({
      ...READY,
      apiKeyRotatedAt: null,
      firstCustomerApproved: false,
    });

    expect(steps.filter((step) => !step.informational && step.status === 'done')).toHaveLength(4);
  });

  it('lists the readiness issues no step already covers', () => {
    const issues = remainingReadinessIssues({
      missingPairings: ['kirafin'],
      deadProviderJunctionsActive: 1,
      issueKeys: [
        { key: 'readiness.no_live_rail', params: {} },
        { key: 'readiness.dead_provider_junctions', params: { count: 1 } },
        { key: 'readiness.provider_not_onboarded', params: { provider: 'kirafin' } },
        { key: 'readiness.wallet_defaults_missing', params: { fields: ['walletDefaultChain'] } },
        { key: 'readiness.no_wallet_provider', params: {} },
      ],
    });

    expect(issues.map((issue) => issue.key)).toEqual([
      'readiness.wallet_defaults_missing',
      'readiness.no_wallet_provider',
    ]);
    expect(remainingReadinessIssues(null)).toEqual([]);
  });
});
