import { describe, expect, it } from 'vitest';

import {
  nextCountriesFailureLatch,
  resolveCountrySelectorView,
} from '../country-selector-view';

describe('resolveCountrySelectorView', () => {
  it('shows the selector as soon as countries are available', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 12,
        isLoading: false,
        hasFailed: false,
      }),
    ).toBe('ready');
  });

  it('keeps the selector when a background refetch failed but data exists', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 12,
        isLoading: false,
        hasFailed: true,
      }),
    ).toBe('ready');
  });

  it('shows the loading state only for the very first load', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 0,
        isLoading: true,
        hasFailed: false,
      }),
    ).toBe('loading');
  });

  it('shows the unavailable state when nothing loaded and the request failed', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 0,
        isLoading: false,
        hasFailed: true,
      }),
    ).toBe('unavailable');
  });

  it('stays on the unavailable state while a retry is in flight', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 0,
        isLoading: true,
        hasFailed: true,
      }),
    ).toBe('unavailable');
  });

  it('falls through to the selector for a successful empty list', () => {
    expect(
      resolveCountrySelectorView({
        countriesLength: 0,
        isLoading: false,
        hasFailed: false,
      }),
    ).toBe('ready');
  });
});

describe('nextCountriesFailureLatch', () => {
  it('latches on an error', () => {
    expect(
      nextCountriesFailureLatch({
        latched: false,
        hasError: true,
        isFetching: false,
      }),
    ).toBe(true);
  });

  it('holds the latch while a retry is running so the retry button can spin', () => {
    expect(
      nextCountriesFailureLatch({
        latched: true,
        hasError: false,
        isFetching: true,
      }),
    ).toBe(true);
  });

  it('releases the latch once a request settled without an error', () => {
    expect(
      nextCountriesFailureLatch({
        latched: true,
        hasError: false,
        isFetching: false,
      }),
    ).toBe(false);
  });

  it('stays released when nothing failed', () => {
    expect(
      nextCountriesFailureLatch({
        latched: false,
        hasError: false,
        isFetching: true,
      }),
    ).toBe(false);
  });
});
