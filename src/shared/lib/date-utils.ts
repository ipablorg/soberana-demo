/**
 * Date Utilities
 * 
 * Centralized date formatting functions for backend communication.
 * All dates are converted to ISO 8601 format in UTC timezone.
 * 
 * @module shared/lib/date-utils
 */

import { startOfDay, endOfDay } from 'date-fns';

/**
 * Converts a Date to ISO 8601 string representing the start of that day (00:00:00.000Z)
 * 
 * @param date - Date object to convert
 * @returns ISO 8601 string in UTC (e.g., "2024-01-15T00:00:00.000Z")
 * 
 * @example
 * ```ts
 * const date = new Date('2024-01-15T14:30:00');
 * formatDateForBackend(date); // "2024-01-15T00:00:00.000Z"
 * ```
 */
export function formatDateForBackend(date: Date): string {
  return startOfDay(date).toISOString();
}

/**
 * Converts a Date to ISO 8601 string representing the end of that day (23:59:59.999Z)
 * 
 * @param date - Date object to convert
 * @returns ISO 8601 string in UTC (e.g., "2024-01-15T23:59:59.999Z")
 * 
 * @example
 * ```ts
 * const date = new Date('2024-01-15T14:30:00');
 * formatDateEndForBackend(date); // "2024-01-15T23:59:59.999Z"
 * ```
 */
export function formatDateEndForBackend(date: Date): string {
  return endOfDay(date).toISOString();
}

/**
 * Converts a date range to ISO 8601 strings for backend filtering
 * 
 * - `from` date is converted to start of day (00:00:00.000Z)
 * - `to` date is converted to end of day (23:59:59.999Z)
 * 
 * This ensures the full range is covered when filtering by creation dates.
 * 
 * @param range - Object with optional from and to Date objects
 * @returns Object with createdFrom and createdTo as ISO strings, or undefined if dates are missing
 * 
 * @example
 * ```ts
 * const range = {
 *   from: new Date('2024-01-01'),
 *   to: new Date('2024-01-31')
 * };
 * formatDateRangeForBackend(range);
 * // {
 * //   createdFrom: "2024-01-01T00:00:00.000Z",
 * //   createdTo: "2024-01-31T23:59:59.999Z"
 * // }
 * ```
 */
export function formatDateRangeForBackend(range: {
  from?: Date;
  to?: Date;
}): { createdFrom: string; createdTo: string } | undefined {
  if (!range.from || !range.to) {
    return undefined;
  }

  return {
    createdFrom: formatDateForBackend(range.from),
    createdTo: formatDateEndForBackend(range.to),
  };
}
