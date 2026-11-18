/**
 * Stand-in for `@lingui/react` in page tests.
 *
 * The Lingui macro compiles `@lingui/react/macro` down to `@lingui/react`
 * before Vitest resolves aliases, so mocking the macro entry point alone is not
 * enough — tests must mock `@lingui/react` itself, which is what this module is
 * for. It renders source messages verbatim so assertions can match the copy
 * that appears in the page source.
 */

import type { ReactNode } from 'react';

interface CompiledMessage {
  id?: unknown;
  message?: unknown;
  values?: Record<string, unknown>;
}

/**
 * Resolves a single top-level ICU plural, which is what `<Plural>` compiles to:
 * `{count, plural, one {# item} other {# items}}`. Exact `=N` cases win, then
 * `one` for 1, then `other`. Returns null when `message` is not such a plural.
 */
function resolvePlural(
  message: string,
  values?: Record<string, unknown>,
): string | null {
  const plural = /^\{(\w+),\s*plural,\s*([\s\S]+)\}$/.exec(message);
  if (!plural || !values) return null;

  const [, key, body] = plural;
  const count = Number(values[key as string]);
  const cases = new Map<string, string>();

  for (const match of (body as string).matchAll(/(=\d+|\w+)\s*\{([^}]*)\}/g)) {
    cases.set(match[1] as string, match[2] as string);
  }

  const chosen =
    cases.get(`=${count}`) ??
    (count === 1 ? cases.get('one') : undefined) ??
    cases.get('other') ??
    '';

  return chosen.replace(/#/g, String(count));
}

function interpolate(message: string, values?: Record<string, unknown>): string {
  if (!values) return message;

  const plural = resolvePlural(message, values);
  if (plural !== null) return plural;

  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** Handles both the tagged-template and the compiled-descriptor call shapes. */
export function translate(
  message: TemplateStringsArray | string | CompiledMessage,
  ...values: unknown[]
): string {
  if (typeof message === 'string') return message;

  if (Array.isArray(message)) {
    return message.reduce(
      (result: string, chunk: string, index: number) =>
        result + chunk + String(values[index] ?? ''),
      '',
    );
  }

  const descriptor = message as CompiledMessage;
  const raw = String(descriptor.message ?? descriptor.id ?? '');

  return interpolate(raw, descriptor.values);
}

export function useLingui() {
  return {
    t: translate,
    _: translate,
    i18n: { _: translate },
  };
}

export function Trans({
  children,
  message,
  id,
  values,
}: {
  children?: ReactNode;
  message?: string;
  id?: string;
  values?: Record<string, unknown>;
}) {
  if (children !== undefined) return <>{children}</>;

  return <>{interpolate(String(message ?? id ?? ''), values)}</>;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
