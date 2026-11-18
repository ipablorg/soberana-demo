import { describe, expect, it } from 'vitest';

import {
  ALL_CLIENTS_VALUE,
  sortClientOptions,
  toClientIdFilter,
  withClientFilter,
} from '../client-options';

describe('sortClientOptions', () => {
  it('lists active clients first and then orders by name', () => {
    // Arrange
    const options = [
      { client_id: 'c-3', client_name: 'Zeta', is_active: true },
      { client_id: 'c-1', client_name: 'Alfa', is_active: false },
      { client_id: 'c-2', client_name: 'Beta', is_active: true },
    ];

    // Act
    const sorted = sortClientOptions(options);

    // Assert
    expect(sorted.map((option) => option.client_id)).toEqual([
      'c-2',
      'c-3',
      'c-1',
    ]);
  });
});

describe('toClientIdFilter', () => {
  it('maps the all-clients sentinel to no filter', () => {
    // Arrange / Act
    const clientId = toClientIdFilter(ALL_CLIENTS_VALUE);

    // Assert
    expect(clientId).toBeUndefined();
  });

  it('keeps a concrete client id', () => {
    // Arrange / Act
    const clientId = toClientIdFilter('client-9');

    // Assert
    expect(clientId).toBe('client-9');
  });
});

describe('withClientFilter', () => {
  it('omits clientId when no client is selected', () => {
    // Arrange / Act
    const filter = withClientFilter({ status: 'PENDING' }, undefined);

    // Assert
    expect(filter).toEqual({ status: 'PENDING' });
  });

  it('adds clientId when a client is selected', () => {
    // Arrange / Act
    const filter = withClientFilter({ status: 'PENDING' }, 'client-9');

    // Assert
    expect(filter).toEqual({ status: 'PENDING', clientId: 'client-9' });
  });
});
