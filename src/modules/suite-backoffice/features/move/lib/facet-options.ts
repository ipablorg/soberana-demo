/**
 * Pure helpers behind the faceted filters of the deposit queue (option
 * filtering, selection rules, provider suggestions).
 */

import type { ReactNode } from 'react';

export interface FacetOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ProviderRow {
  provider_code?: string | null;
}

/** Lower-cased and accent-stripped, so "DEPOSITO" finds "Depósito". */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

/** Options whose label or value contains the query; all of them when blank. */
export function filterFacetOptions(
  options: readonly FacetOption[],
  query: string,
): FacetOption[] {
  const needle = fold(query);
  if (!needle) return [...options];

  return options.filter(
    (option) =>
      fold(option.label).includes(needle) || fold(option.value).includes(needle),
  );
}

/** Prepends selected values that are not listed, so they never disappear. */
export function withSelectedOptions(
  options: readonly FacetOption[],
  selected: readonly string[],
): FacetOption[] {
  const missing = selected
    .filter((value) => !options.some((option) => option.value === value))
    .map((value) => ({ value, label: value }));

  return [...missing, ...options];
}

/** Multiple facets toggle; single facets replace, or clear on a repeat pick. */
export function nextFacetSelection(
  selected: readonly string[],
  value: string,
  multiple: boolean,
): string[] {
  if (multiple) {
    return selected.includes(value)
      ? selected.filter((current) => current !== value)
      : [...selected, value];
  }

  return selected.includes(value) ? [] : [value];
}

/**
 * Accumulates the distinct provider codes seen in the loaded rows. There is no
 * provider list the queue's staff role may call, so suggestions are learnt from
 * the rows; keeping earlier codes means narrowing the filters never empties the
 * list. Returns `known` itself when nothing new was learnt.
 */
export function mergeProviderCodes(
  known: readonly string[],
  rows: readonly ProviderRow[],
): string[] {
  const seen = new Set(known.map((code) => code.toLowerCase()));
  const added: string[] = [];

  for (const row of rows) {
    const code = row.provider_code?.trim();
    if (!code || seen.has(code.toLowerCase())) continue;

    seen.add(code.toLowerCase());
    added.push(code);
  }

  return added.length
    ? [...known, ...added].sort((left, right) => left.localeCompare(right))
    : (known as string[]);
}
