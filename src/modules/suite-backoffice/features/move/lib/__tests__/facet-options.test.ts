import { describe, expect, it } from 'vitest';

import {
  filterFacetOptions,
  mergeProviderCodes,
  nextFacetSelection,
  withSelectedOptions,
  type FacetOption,
} from '../facet-options';

const OPTIONS: FacetOption[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'COMPLETED', label: 'Aprobado' },
  { value: 'FAILED', label: 'Revertido' },
];

describe('filterFacetOptions', () => {
  it('returns every option for a blank query', () => {
    expect(filterFacetOptions(OPTIONS, '')).toEqual(OPTIONS);
    expect(filterFacetOptions(OPTIONS, '   ')).toEqual(OPTIONS);
  });

  it('matches the label ignoring case and accents', () => {
    expect(filterFacetOptions(OPTIONS, 'APROB')).toEqual([OPTIONS[1]]);
    expect(
      filterFacetOptions([{ value: 'a', label: 'Depósito' }], 'deposito'),
    ).toHaveLength(1);
  });

  it('also matches the raw value', () => {
    expect(filterFacetOptions(OPTIONS, 'failed')).toEqual([OPTIONS[2]]);
  });

  it('returns nothing when there is no match', () => {
    expect(filterFacetOptions(OPTIONS, 'zzz')).toEqual([]);
  });
});

describe('withSelectedOptions', () => {
  it('keeps the options untouched when every selection is listed', () => {
    expect(withSelectedOptions(OPTIONS, ['COMPLETED'])).toEqual(OPTIONS);
  });

  it('prepends selections missing from the options so they stay visible', () => {
    expect(withSelectedOptions(OPTIONS, ['EUR'])).toEqual([
      { value: 'EUR', label: 'EUR' },
      ...OPTIONS,
    ]);
  });
});

describe('nextFacetSelection', () => {
  it('toggles a value in a multiple facet', () => {
    expect(nextFacetSelection(['A'], 'B', true)).toEqual(['A', 'B']);
    expect(nextFacetSelection(['A', 'B'], 'A', true)).toEqual(['B']);
  });

  it('replaces the value in a single facet', () => {
    expect(nextFacetSelection(['A'], 'B', false)).toEqual(['B']);
  });

  it('clears the value when the selected one is picked again in a single facet', () => {
    expect(nextFacetSelection(['A'], 'A', false)).toEqual([]);
  });
});

describe('mergeProviderCodes', () => {
  it('adds the distinct provider codes of the rows, sorted', () => {
    expect(
      mergeProviderCodes(
        [],
        [
          { provider_code: 'kirafin' },
          { provider_code: 'bancolombia' },
          { provider_code: 'kirafin' },
        ],
      ),
    ).toEqual(['bancolombia', 'kirafin']);
  });

  it('ignores rows without a provider code', () => {
    expect(
      mergeProviderCodes(
        [],
        [{ provider_code: null }, { provider_code: '  ' }, {}],
      ),
    ).toEqual([]);
  });

  it('keeps what was seen before, so narrowing the filters never loses suggestions', () => {
    expect(
      mergeProviderCodes(['bancolombia'], [{ provider_code: 'kirafin' }]),
    ).toEqual(['bancolombia', 'kirafin']);
  });

  it('dedupes case-insensitively keeping the first spelling', () => {
    expect(
      mergeProviderCodes(['kirafin'], [{ provider_code: 'KIRAFIN' }]),
    ).toEqual(['kirafin']);
  });

  it('returns the same array when nothing new was learnt', () => {
    const known = ['kirafin'];

    expect(mergeProviderCodes(known, [{ provider_code: 'kirafin' }])).toBe(
      known,
    );
  });
});
