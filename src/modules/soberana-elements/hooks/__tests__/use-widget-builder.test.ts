import { describe, it, expect, beforeEach } from 'vitest';
import { useElementsStore } from '../../stores/use-elements-store';

// Tests for the use-widget-builder hook logic via the underlying Zustand store.
// The hook is a thin selector layer — we test the store actions and canAdvance logic
// here to avoid React dependency in pure-logic tests.

function getStore() {
  return useElementsStore.getState();
}

beforeEach(() => {
  getStore().resetBuilder();
});

// ─── Builder initial state ────────────────────────────────────
describe('useElementsStore builder — initial state', () => {
  it('starts at step 0', () => {
    expect(getStore().builder.step).toBe(0);
  });

  it('has no type selected initially', () => {
    expect(getStore().builder.config.type).toBeUndefined();
  });

  it('isDirty is false initially', () => {
    expect(getStore().builder.isDirty).toBe(false);
  });
});

// ─── setBuilderType ───────────────────────────────────────────
describe('useElementsStore builder — setBuilderType', () => {
  it('sets the widget type', () => {
    getStore().setBuilderType('payment-button');
    expect(getStore().builder.config.type).toBe('payment-button');
  });

  it('marks builder as dirty', () => {
    getStore().setBuilderType('kyc-module');
    expect(getStore().builder.isDirty).toBe(true);
  });
});

// ─── setBuilderName ───────────────────────────────────────────
describe('useElementsStore builder — setBuilderName', () => {
  it('sets the widget name', () => {
    getStore().setBuilderName('My Widget');
    expect(getStore().builder.config.name).toBe('My Widget');
  });
});

// ─── setBuilderRails ──────────────────────────────────────────
describe('useElementsStore builder — setBuilderRails', () => {
  it('sets enabled rails', () => {
    getStore().setBuilderRails(['USDC_BASE', 'USDT_POLYGON']);
    expect(getStore().builder.config.enabledRails).toEqual(['USDC_BASE', 'USDT_POLYGON']);
  });

  it('replaces rails (not merges)', () => {
    getStore().setBuilderRails(['USDC_BASE']);
    getStore().setBuilderRails(['FIAT_PSE']);
    expect(getStore().builder.config.enabledRails).toEqual(['FIAT_PSE']);
  });
});

// ─── setBuilderFeatures ───────────────────────────────────────
describe('useElementsStore builder — setBuilderFeatures', () => {
  it('merges feature flags', () => {
    getStore().setBuilderFeatures({ zentinelTooltips: true });
    getStore().setBuilderFeatures({ oneClickOffRamp: true });
    const { features } = getStore().builder.config;
    expect(features?.zentinelTooltips).toBe(true);
    expect(features?.oneClickOffRamp).toBe(true);
  });
});

// ─── advanceBuilder / backBuilder ────────────────────────────
describe('useElementsStore builder — step navigation', () => {
  it('advanceBuilder increments step', () => {
    getStore().advanceBuilder();
    expect(getStore().builder.step).toBe(1);
  });

  it('backBuilder decrements step', () => {
    getStore().advanceBuilder();
    getStore().advanceBuilder();
    getStore().backBuilder();
    expect(getStore().builder.step).toBe(1);
  });

  it('backBuilder does not go below 0', () => {
    getStore().backBuilder();
    expect(getStore().builder.step).toBe(0);
  });

  it('setBuilderStep sets step directly', () => {
    getStore().setBuilderStep(3);
    expect(getStore().builder.step).toBe(3);
  });
});

// ─── resetBuilder ────────────────────────────────────────────
describe('useElementsStore builder — resetBuilder', () => {
  it('resets step to 0', () => {
    getStore().advanceBuilder();
    getStore().advanceBuilder();
    getStore().resetBuilder();
    expect(getStore().builder.step).toBe(0);
  });

  it('clears type and name', () => {
    getStore().setBuilderType('kyc-module');
    getStore().setBuilderName('Test');
    getStore().resetBuilder();
    expect(getStore().builder.config.type).toBeUndefined();
    expect(getStore().builder.config.name).toBeUndefined();
  });

  it('sets isDirty to false', () => {
    getStore().setBuilderType('kyc-module');
    getStore().resetBuilder();
    expect(getStore().builder.isDirty).toBe(false);
  });
});

// ─── canAdvance logic (mirrored from hook) ────────────────────
describe('canAdvance logic', () => {
  const canAdvance = (): boolean => {
    const { step, config } = getStore().builder;
    if (step === 0) return Boolean(config.type);
    if (step === 1) return Boolean(config.theme?.companyName?.trim());
    if (step === 2) return (config.enabledRails?.length ?? 0) > 0;
    return true;
  };

  it('step 0: false when no type selected', () => {
    expect(canAdvance()).toBe(false);
  });

  it('step 0: true when type is selected', () => {
    getStore().setBuilderType('payment-button');
    expect(canAdvance()).toBe(true);
  });

  it('step 1: false when companyName is empty', () => {
    getStore().setBuilderStep(1);
    getStore().setBuilderTheme({ companyName: '' } as never);
    expect(canAdvance()).toBe(false);
  });

  it('step 1: false when companyName is only whitespace', () => {
    getStore().setBuilderStep(1);
    getStore().setBuilderTheme({ companyName: '   ' } as never);
    expect(canAdvance()).toBe(false);
  });

  it('step 2: false when no rails selected', () => {
    getStore().setBuilderStep(2);
    getStore().setBuilderRails([]);
    expect(canAdvance()).toBe(false);
  });

  it('step 2: true when at least one rail selected', () => {
    getStore().setBuilderStep(2);
    getStore().setBuilderRails(['USDC_BASE']);
    expect(canAdvance()).toBe(true);
  });

  it('step 3+: always true', () => {
    getStore().setBuilderStep(3);
    expect(canAdvance()).toBe(true);
  });
});
