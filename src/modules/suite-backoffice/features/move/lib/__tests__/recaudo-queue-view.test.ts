import { describe, expect, it } from 'vitest';

import {
  recaudoStatusBadgeVariant,
  resolvePendingCount,
} from '../recaudo-queue-view';

describe('resolvePendingCount', () => {
  it('reports loading while the first response has not arrived', () => {
    expect(
      resolvePendingCount({ isLoading: true, total: undefined, rowsLength: 0 }),
    ).toEqual({ status: 'loading' });
  });

  it('uses the server total, not the size of the loaded page', () => {
    expect(
      resolvePendingCount({ isLoading: false, total: 137, rowsLength: 50 }),
    ).toEqual({ status: 'ready', count: 137 });
  });

  it('falls back to the number of rows when the API sends no total', () => {
    expect(
      resolvePendingCount({ isLoading: false, total: undefined, rowsLength: 4 }),
    ).toEqual({ status: 'ready', count: 4 });
  });

  it('falls back to the number of rows when the total is not a valid count', () => {
    expect(
      resolvePendingCount({ isLoading: false, total: Number.NaN, rowsLength: 3 }),
    ).toEqual({ status: 'ready', count: 3 });
    expect(
      resolvePendingCount({ isLoading: false, total: -1, rowsLength: 3 }),
    ).toEqual({ status: 'ready', count: 3 });
  });

  it('reports a genuine zero instead of hiding it', () => {
    expect(
      resolvePendingCount({ isLoading: false, total: 0, rowsLength: 0 }),
    ).toEqual({ status: 'ready', count: 0 });
  });

  it('is unavailable when the query settled without any data', () => {
    expect(
      resolvePendingCount({
        isLoading: false,
        total: undefined,
        rowsLength: 0,
        hasData: false,
      }),
    ).toEqual({ status: 'unavailable' });
  });
});

describe('recaudoStatusBadgeVariant', () => {
  it('renders pending deposits with the solid amber warning badge', () => {
    expect(recaudoStatusBadgeVariant('PENDING')).toBe('warning-solid');
    expect(recaudoStatusBadgeVariant('pending')).toBe('warning-solid');
  });

  it('renders approved as success, rejected as destructive and reversed as muted', () => {
    expect(recaudoStatusBadgeVariant('COMPLETED')).toBe('success');
    expect(recaudoStatusBadgeVariant('rejected')).toBe('destructive');
    expect(recaudoStatusBadgeVariant('FAILED')).toBe('secondary');
  });

  it('leaves unknown statuses to the shared StatePillChip mapping', () => {
    expect(recaudoStatusBadgeVariant('PROCESSING')).toBeUndefined();
    expect(recaudoStatusBadgeVariant('')).toBeUndefined();
  });
});
