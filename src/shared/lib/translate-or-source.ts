/**
 * Translates a Lingui descriptor with the global instance, falling back to the
 * source (Spanish) text when no locale is active yet. For low-level UI
 * primitives (dialog/sheet close labels) that render outside any guarantee of
 * an active locale, e.g. in isolated component tests.
 */

import { i18n, type MessageDescriptor } from '@lingui/core';

export function translateOrSource(descriptor: MessageDescriptor): string {
  try {
    return i18n._(descriptor);
  } catch {
    return String(descriptor.message ?? descriptor.id);
  }
}
