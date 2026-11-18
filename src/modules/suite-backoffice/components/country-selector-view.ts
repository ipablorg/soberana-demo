/**
 * Pure view rules for the sidebar country selector.
 *
 * TanStack Query resets an errored query with no data back to `pending` while
 * it retries, which would swap the "unavailable" state for the loading state
 * and make the retry button vanish mid-click. The failure is therefore latched
 * until a request settles without an error.
 */

export type CountrySelectorView = 'loading' | 'unavailable' | 'ready';

interface CountrySelectorViewInput {
  countriesLength: number;
  isLoading: boolean;
  /** An error is present now, or a previous attempt failed and a retry runs. */
  hasFailed: boolean;
}

export function resolveCountrySelectorView({
  countriesLength,
  isLoading,
  hasFailed,
}: CountrySelectorViewInput): CountrySelectorView {
  if (countriesLength > 0) return 'ready';
  if (hasFailed) return 'unavailable';
  if (isLoading) return 'loading';

  return 'ready';
}

interface FailureLatchInput {
  latched: boolean;
  hasError: boolean;
  isFetching: boolean;
}

export function nextCountriesFailureLatch({
  latched,
  hasError,
  isFetching,
}: FailureLatchInput): boolean {
  if (hasError) return true;

  return latched && isFetching;
}
