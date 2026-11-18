import { readFileSync } from 'fs';
import { join } from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

import { useDynamicIslandStore as sharedStore } from '@/shared/stores/useDynamicIslandStore';
import { useDynamicIslandStore as dashboardStore } from '@/modules/suite-user/features/dashboard/stores/useDynamicIslandStore';
import { useDynamicIslandStore as linksStore } from '@/modules/loopay-links/stores/useDynamicIslandStore';

const SRC = join(__dirname, '..', '..', '..', '..', '..', '..');
const read = (...parts: string[]) => readFileSync(join(SRC, ...parts), 'utf-8');

beforeEach(() => sharedStore.getState().reset());

describe('S6 — one dynamic island, one store', () => {
  it('the dashboard and loopay-links stores are the shared store (same object)', () => {
    expect(dashboardStore).toBe(sharedStore);
    expect(linksStore).toBe(sharedStore);
  });

  it('keeps the wizard API the wizards and the backoffice import', () => {
    const state = sharedStore.getState();
    for (const key of ['setStep', 'hide', 'show', 'reset'] as const) {
      expect(typeof state[key]).toBe('function');
    }
    for (const key of ['isVisible', 'currentStep', 'totalSteps', 'stepName', 'progress'] as const) {
      expect(key in state).toBe(true);
    }
  });

  it('setStep narrates wizard progress through the same island state the dashboard renders', () => {
    sharedStore.getState().setStep(1, 4, 'Datos');
    const state = sharedStore.getState();
    expect(state.isVisible).toBe(true);
    expect(state.currentStep).toBe(1);
    expect(state.progress).toBe(50);
    expect(state.islandData).toMatchObject({
      state: 'step-progress',
      stepName: 'Datos',
      stepNumber: 2,
      totalSteps: 4,
      progress: 50,
    });
  });

  it('hide returns the island to idle and reset clears everything, flows included', () => {
    const store = sharedStore.getState();
    store.setMode('receive');
    store.setStep(0, 3, 'Uno');
    sharedStore.getState().hide();
    expect(sharedStore.getState().isVisible).toBe(false);
    expect(sharedStore.getState().islandData.state).toBe('idle');
    sharedStore.getState().reset();
    expect(sharedStore.getState().mode).toBe('idle');
    expect(sharedStore.getState().progress).toBe(0);
  });

  it('still exposes the flow API of the dashboard island', () => {
    const state = sharedStore.getState();
    for (const key of [
      'setMode',
      'selectCurrency',
      'selectBeneficiary',
      'setIslandState',
      'showSuccess',
      'showError',
    ] as const) {
      expect(typeof state[key]).toBe('function');
    }
  });

  it('shared and dashboard components are one implementation', () => {
    const shared = read('shared', 'components', 'DynamicIsland.tsx');
    const dashboard = read(
      'modules',
      'suite-user',
      'features',
      'dashboard',
      'components',
      'dynamic-island.tsx'
    );
    expect(shared).toContain('export function DynamicIsland');
    expect(shared).toContain('showBalance');
    expect(dashboard).toContain("export * from '@/shared/components/DynamicIsland'");
    expect(dashboard).not.toContain('function DynamicIsland');
  });
});
