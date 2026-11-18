import { describe, expect, it } from 'vitest';

import {
  availableRailsForProvider,
  findExistingMapping,
} from '../provider-rail-mappings';

const ROWS = [
  { id: 'm1', is_active: true, provider: { id: 'p1' }, rail: { id: 'r1' } },
  { id: 'm2', is_active: false, provider: { id: 'p1' }, rail: { id: 'r2' } },
  { id: 'm3', is_active: true, provider: { id: 'p2' }, rail: { id: 'r1' } },
];

const RAILS = [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }];

describe('findExistingMapping', () => {
  it('returns the mapping that joins the provider and the rail', () => {
    // Act
    const result = findExistingMapping(ROWS, 'p1', 'r2');

    // Assert
    expect(result).toBe(ROWS[1]);
  });

  it('returns undefined when the pair is not mapped yet', () => {
    // Act
    const result = findExistingMapping(ROWS, 'p2', 'r2');

    // Assert
    expect(result).toBeUndefined();
  });

  it.each([
    ['provider', '', 'r1'],
    ['rail', 'p1', ''],
    ['both', '', ''],
  ])('returns undefined while the %s is not chosen', (_label, providerId, railId) => {
    // Act
    const result = findExistingMapping(ROWS, providerId, railId);

    // Assert
    expect(result).toBeUndefined();
  });

  it('matches inactive mappings too', () => {
    // Act
    const result = findExistingMapping(ROWS, 'p1', 'r2');

    // Assert
    expect(result?.is_active).toBe(false);
  });
});

describe('availableRailsForProvider', () => {
  it('flags the rails already assigned to the provider, active or not', () => {
    // Act
    const result = availableRailsForProvider(RAILS, ROWS, 'p1');

    // Assert
    expect(result).toEqual([
      { rail: RAILS[0], assigned: true },
      { rail: RAILS[1], assigned: true },
      { rail: RAILS[2], assigned: false },
    ]);
  });

  it('ignores the mappings of other providers', () => {
    // Act
    const result = availableRailsForProvider(RAILS, ROWS, 'p2');

    // Assert
    expect(result.map(({ assigned }) => assigned)).toEqual([true, false, false]);
  });

  it('flags nothing before a provider is chosen', () => {
    // Act
    const result = availableRailsForProvider(RAILS, ROWS, '');

    // Assert
    expect(result.every(({ assigned }) => !assigned)).toBe(true);
    expect(result).toHaveLength(RAILS.length);
  });

  it('keeps the original rail order and never drops a rail', () => {
    // Act
    const result = availableRailsForProvider(RAILS, ROWS, 'p1');

    // Assert
    expect(result.map(({ rail }) => rail.id)).toEqual(['r1', 'r2', 'r3']);
  });
});
