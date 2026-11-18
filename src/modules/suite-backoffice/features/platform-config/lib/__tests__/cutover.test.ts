import { describe, expect, it } from 'vitest';

import {
  activeClientIds,
  cutoverInputSignature,
  isValidCutoverReason,
  readDeadProviderJunctionsConflict,
  toCutoffInstant,
  toggleClientId,
} from '../cutover';

describe('cutoverInputSignature', () => {
  it('ignores the client selection order', () => {
    // Act
    const first = cutoverInputSignature(['b', 'a'], 'reason', '2026-01-01T00:00:00.000Z');
    const second = cutoverInputSignature(['a', 'b'], ' reason ', '2026-01-01T00:00:00.000Z');

    // Assert
    expect(first).toBe(second);
  });

  it('changes when the cutoff changes', () => {
    // Act
    const first = cutoverInputSignature(['a'], 'reason', '2026-01-01T00:00:00.000Z');
    const second = cutoverInputSignature(['a'], 'reason', '2026-01-02T00:00:00.000Z');

    // Assert
    expect(first).not.toBe(second);
  });
});

describe('toCutoffInstant', () => {
  const now = new Date('2026-09-13T12:00:00.000Z');

  it('rejects a cutoff in the future', () => {
    // Act
    const instant = toCutoffInstant('2027-01-01T00:00', now);

    // Assert
    expect(instant).toBeNull();
  });

  it.each([[''], ['not-a-date']])('rejects %j', (value) => {
    // Act
    const instant = toCutoffInstant(value, now);

    // Assert
    expect(instant).toBeNull();
  });

  it('returns an ISO instant for a past local date-time', () => {
    // Act
    const instant = toCutoffInstant('2026-01-01T10:00', now);

    // Assert
    expect(instant).toBe(new Date('2026-01-01T10:00').toISOString());
  });
});

describe('client selection', () => {
  it('lists only active clients for the select-all action', () => {
    // Act
    const ids = activeClientIds([
      { client_id: 'a', client_name: 'A', is_active: true },
      { client_id: 'b', client_name: 'B', is_active: false },
    ]);

    // Assert
    expect(ids).toEqual(['a']);
  });

  it('toggles a client in and out of the selection', () => {
    // Act
    const added = toggleClientId(['a'], 'b');
    const removed = toggleClientId(added, 'a');

    // Assert
    expect(added).toEqual(['a', 'b']);
    expect(removed).toEqual(['b']);
  });

  it.each([
    ['', false],
    ['   ', false],
    ['Purge', true],
    ['x'.repeat(1001), false],
  ])('validates the reason %j as %j', (reason, expected) => {
    // Act
    const valid = isValidCutoverReason(reason);

    // Assert
    expect(valid).toBe(expected);
  });
});

describe('readDeadProviderJunctionsConflict', () => {
  it('ignores unrelated errors', () => {
    // Act
    const conflict = readDeadProviderJunctionsConflict({
      response: { errors: [{ message: 'boom', extensions: { code: 'FORBIDDEN' } }] },
    });

    // Assert
    expect(conflict).toBeNull();
  });
});
