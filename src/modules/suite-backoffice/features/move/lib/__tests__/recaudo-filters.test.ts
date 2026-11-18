import { describe, expect, it } from 'vitest';

import {
  DEFAULT_RECAUDO_FILTERS,
  RECAUDO_SEARCH_MAX_LENGTH,
  RECAUDO_STATUSES,
  hasActiveRecaudoFilters,
  hasCustomRecaudoStatuses,
  recaudoFiltersReducer,
  resolveRecaudoCountKind,
  toRecaudoQueueFilter,
  toggleRecaudoStatus,
  type RecaudoFilterEdits,
  type RecaudoFilterValues,
} from '../recaudo-filters';

function edit(
  state: RecaudoFilterValues,
  changes: RecaudoFilterEdits,
): RecaudoFilterValues {
  return recaudoFiltersReducer(state, { type: 'edit', changes });
}

describe('DEFAULT_RECAUDO_FILTERS', () => {
  it('lists only pending deposits, the historical queue behaviour', () => {
    expect(DEFAULT_RECAUDO_FILTERS).toEqual({
      clientId: undefined,
      currency: '',
      providerCode: '',
      search: '',
      statuses: ['PENDING'],
    });
  });
});

describe('recaudoFiltersReducer', () => {
  it('applies an edit immediately, with no draft in between', () => {
    const next = edit(DEFAULT_RECAUDO_FILTERS, { clientId: 'client-2' });

    expect(next.clientId).toBe('client-2');
  });

  it('merges successive edits into the same state', () => {
    let state = edit(DEFAULT_RECAUDO_FILTERS, { currency: 'USDT' });
    state = edit(state, { clientId: 'client-2' });

    expect(state).toEqual({
      clientId: 'client-2',
      currency: 'USDT',
      providerCode: '',
      search: '',
      statuses: ['PENDING'],
    });
  });

  it('trims text and uppercases the currency as it is edited', () => {
    const next = edit(DEFAULT_RECAUDO_FILTERS, {
      currency: '  usdc ',
      providerCode: '  kirafin  ',
      search: '  Ana@Example.com ',
    });

    expect(next.currency).toBe('USDC');
    expect(next.providerCode).toBe('kirafin');
    expect(next.search).toBe('Ana@Example.com');
  });

  it('keeps the search as typed, case included', () => {
    expect(edit(DEFAULT_RECAUDO_FILTERS, { search: 'RC-AbC' }).search).toBe(
      'RC-AbC',
    );
  });

  it('caps the search at the length the backend accepts', () => {
    const next = edit(DEFAULT_RECAUDO_FILTERS, {
      search: 'x'.repeat(RECAUDO_SEARCH_MAX_LENGTH + 20),
    });

    expect(next.search).toHaveLength(RECAUDO_SEARCH_MAX_LENGTH);
  });

  it('keeps statuses unique and in canonical order', () => {
    const next = edit(DEFAULT_RECAUDO_FILTERS, {
      statuses: ['FAILED', 'PENDING', 'FAILED', 'COMPLETED'],
    });

    expect(next.statuses).toEqual(['PENDING', 'COMPLETED', 'FAILED']);
  });

  it('returns the same state when an edit changes nothing', () => {
    const state = edit(DEFAULT_RECAUDO_FILTERS, { currency: 'USDC' });

    expect(edit(state, { currency: ' usdc ' })).toBe(state);
  });

  it('treats an explicit undefined client as "all clients"', () => {
    let state = edit(DEFAULT_RECAUDO_FILTERS, { clientId: 'client-2' });
    state = edit(state, { clientId: undefined });

    expect(state.clientId).toBeUndefined();
  });

  it('resets every filter, statuses included, back to the default', () => {
    let state = edit(DEFAULT_RECAUDO_FILTERS, {
      clientId: 'client-2',
      currency: 'usdc',
      providerCode: 'kirafin',
      search: 'ana',
      statuses: ['COMPLETED', 'REJECTED'],
    });

    state = recaudoFiltersReducer(state, { type: 'reset' });

    expect(state).toEqual(DEFAULT_RECAUDO_FILTERS);
  });
});

describe('toggleRecaudoStatus', () => {
  it('adds a status keeping the canonical order', () => {
    expect(toggleRecaudoStatus(['FAILED'], 'COMPLETED')).toEqual([
      'COMPLETED',
      'FAILED',
    ]);
  });

  it('removes a status that is already selected', () => {
    expect(toggleRecaudoStatus(['PENDING', 'COMPLETED'], 'PENDING')).toEqual([
      'COMPLETED',
    ]);
  });

  it('can remove the last status, leaving an empty selection', () => {
    expect(toggleRecaudoStatus(['PENDING'], 'PENDING')).toEqual([]);
  });
});

describe('toRecaudoQueueFilter', () => {
  it('omits statuses for the default pending-only view (backend default)', () => {
    expect(toRecaudoQueueFilter(DEFAULT_RECAUDO_FILTERS)).toEqual({});
    expect(toRecaudoQueueFilter(DEFAULT_RECAUDO_FILTERS)).not.toHaveProperty(
      'statuses',
    );
  });

  it('sends the selected statuses when they differ from the default', () => {
    expect(
      toRecaudoQueueFilter({
        ...DEFAULT_RECAUDO_FILTERS,
        statuses: ['COMPLETED', 'REJECTED'],
      }),
    ).toEqual({ statuses: ['COMPLETED', 'REJECTED'] });
  });

  it('sends a single non-pending status', () => {
    expect(
      toRecaudoQueueFilter({ ...DEFAULT_RECAUDO_FILTERS, statuses: ['FAILED'] }),
    ).toEqual({ statuses: ['FAILED'] });
  });

  it('reads an empty selection as "every status" instead of the pending default', () => {
    expect(
      toRecaudoQueueFilter({ ...DEFAULT_RECAUDO_FILTERS, statuses: [] }),
    ).toEqual({ statuses: [...RECAUDO_STATUSES] });
  });

  it('omits blank fields and only spreads what is set', () => {
    expect(
      toRecaudoQueueFilter({
        ...DEFAULT_RECAUDO_FILTERS,
        currency: 'USDC',
      }),
    ).toEqual({ currency: 'USDC' });
  });

  it('includes the client, currency, provider, search and statuses when all are set', () => {
    expect(
      toRecaudoQueueFilter({
        clientId: 'client-2',
        currency: 'USDC',
        providerCode: 'kirafin',
        search: 'ana',
        statuses: ['COMPLETED'],
      }),
    ).toEqual({
      clientId: 'client-2',
      currency: 'USDC',
      providerCode: 'kirafin',
      search: 'ana',
      statuses: ['COMPLETED'],
    });
  });

  it('sends the trimmed search and keeps the pending-only default alongside it', () => {
    expect(
      toRecaudoQueueFilter({ ...DEFAULT_RECAUDO_FILTERS, search: '  ana ' }),
    ).toEqual({ search: 'ana' });
  });

  it.each([[''], ['   ']])('omits a blank search (%p)', (search) => {
    expect(
      toRecaudoQueueFilter({ ...DEFAULT_RECAUDO_FILTERS, search }),
    ).not.toHaveProperty('search');
  });

  it('never exposes a clientId key while every client is selected', () => {
    expect(toRecaudoQueueFilter(DEFAULT_RECAUDO_FILTERS)).not.toHaveProperty(
      'clientId',
    );
  });
});

describe('hasActiveRecaudoFilters', () => {
  it('is false for the default state, pending-only included', () => {
    expect(hasActiveRecaudoFilters(DEFAULT_RECAUDO_FILTERS)).toBe(false);
  });

  it('is true once any text or client filter is set', () => {
    expect(
      hasActiveRecaudoFilters(edit(DEFAULT_RECAUDO_FILTERS, { currency: 'U' })),
    ).toBe(true);
    expect(
      hasActiveRecaudoFilters(
        edit(DEFAULT_RECAUDO_FILTERS, { clientId: 'client-2' }),
      ),
    ).toBe(true);
    expect(
      hasActiveRecaudoFilters(
        edit(DEFAULT_RECAUDO_FILTERS, { providerCode: 'kira' }),
      ),
    ).toBe(true);
  });

  it('counts a search as an active filter', () => {
    expect(
      hasActiveRecaudoFilters(edit(DEFAULT_RECAUDO_FILTERS, { search: 'ana' })),
    ).toBe(true);
  });

  it('is true when the statuses differ from pending-only', () => {
    expect(
      hasActiveRecaudoFilters(
        edit(DEFAULT_RECAUDO_FILTERS, { statuses: ['COMPLETED'] }),
      ),
    ).toBe(true);
    expect(
      hasActiveRecaudoFilters(
        edit(DEFAULT_RECAUDO_FILTERS, { statuses: ['PENDING', 'COMPLETED'] }),
      ),
    ).toBe(true);
    expect(
      hasActiveRecaudoFilters(edit(DEFAULT_RECAUDO_FILTERS, { statuses: [] })),
    ).toBe(true);
  });

  it('ignores whitespace-only text', () => {
    expect(
      hasActiveRecaudoFilters(
        edit(DEFAULT_RECAUDO_FILTERS, { providerCode: '   ', search: '  ' }),
      ),
    ).toBe(false);
  });
});

describe('resolveRecaudoCountKind', () => {
  it.each(RECAUDO_STATUSES)('names the single %s selection', (status) => {
    expect(resolveRecaudoCountKind([status])).toBe(status);
  });

  it('falls back to the generic label for several statuses', () => {
    expect(resolveRecaudoCountKind(['PENDING', 'COMPLETED'])).toBe('MIXED');
  });

  it('falls back to the generic label when nothing is selected (every status)', () => {
    expect(resolveRecaudoCountKind([])).toBe('MIXED');
  });
});

describe('hasCustomRecaudoStatuses', () => {
  it('is false for the pending-only default', () => {
    expect(hasCustomRecaudoStatuses(['PENDING'])).toBe(false);
  });

  it('is true for any other selection, an empty one included', () => {
    expect(hasCustomRecaudoStatuses(['COMPLETED'])).toBe(true);
    expect(hasCustomRecaudoStatuses(['PENDING', 'FAILED'])).toBe(true);
    expect(hasCustomRecaudoStatuses([])).toBe(true);
  });
});
