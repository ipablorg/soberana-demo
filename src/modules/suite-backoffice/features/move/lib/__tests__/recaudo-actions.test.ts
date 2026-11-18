import { describe, expect, it } from 'vitest';

import {
  availableRecaudoActions,
  canDecideRecaudo,
  canReverseRecaudo,
} from '../recaudo-actions';

describe('availableRecaudoActions', () => {
  it('offers approve then reject on a pending deposit', () => {
    expect(availableRecaudoActions('PENDING')).toEqual(['approve', 'reject']);
  });

  it('offers only reversal once the deposit has been credited', () => {
    expect(availableRecaudoActions('COMPLETED')).toEqual(['reverse']);
  });

  it('offers nothing for any other status', () => {
    expect(availableRecaudoActions('REJECTED')).toEqual([]);
    expect(availableRecaudoActions('FAILED')).toEqual([]);
    expect(availableRecaudoActions('')).toEqual([]);
  });

  it('stays consistent with the individual guards', () => {
    ['PENDING', 'COMPLETED', 'REJECTED'].forEach((status) => {
      const actions = availableRecaudoActions(status);

      expect(actions.includes('approve')).toBe(canDecideRecaudo(status));
      expect(actions.includes('reject')).toBe(canDecideRecaudo(status));
      expect(actions.includes('reverse')).toBe(canReverseRecaudo(status));
    });
  });
});
