/**
 * Guard: `gql()` must handle codegen registry misses safely.
 *
 * History: the generated fallback returned `{}` (serialized as
 * "[object Object]" on the wire, GRAPHQL_PARSE_FAILED), then briefly threw —
 * which crashed the whole render tree because some excluded documents are
 * evaluated at module load. The contract now: a registry miss PARSES the
 * source at runtime (the operation works when the backend resolver exists and
 * fails through the normal GraphQL error path when it does not) and logs a
 * console.error. If codegen regenerates the silent `{}` fallback, this test
 * fails so the safe version is restored before shipping.
 */
import { describe, expect, it, vi } from 'vitest';

import { gql } from '../generated/gql';

describe('gql registry guard', () => {
  it('parses an unregistered document at runtime instead of returning {} or throwing', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const document = gql('query ThisDocumentDoesNotExist { nope }');

    expect(document).toBeTruthy();
    expect((document as { kind?: string }).kind).toBe('Document');

    errorSpy.mockRestore();
  });

  it('logs the registry miss so it stays diagnosable', () => {
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    gql('query AnotherMissingOne { nope }');

    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
