import { describe, expect, it } from 'vitest';
import {
  copyRegisteredToPhysical,
  isPhysicalSameAsRegistered,
  registeredCountryPrefill,
} from '../business-address-sync';

const registered = {
  registered_address_line_1: '1 Main St',
  registered_address_city: 'Miami',
  registered_address_state: 'FL',
  registered_address_postal_code: '33101',
  registered_address_country: 'USA',
};

describe('copyRegisteredToPhysical', () => {
  it('mirrors every registered address field into its physical counterpart', () => {
    expect(copyRegisteredToPhysical(registered)).toEqual({
      physical_address_line_1: '1 Main St',
      physical_address_city: 'Miami',
      physical_address_state: 'FL',
      physical_address_postal_code: '33101',
      physical_address_country: 'USA',
    });
  });

  it('fills missing registered fields with empty strings', () => {
    expect(
      copyRegisteredToPhysical({ registered_address_city: 'Miami' }).physical_address_state
    ).toBe('');
  });
});

describe('isPhysicalSameAsRegistered', () => {
  it('is true when both addresses match', () => {
    expect(
      isPhysicalSameAsRegistered({ ...registered, ...copyRegisteredToPhysical(registered) })
    ).toBe(true);
  });

  it('is false when any field differs or nothing was typed yet', () => {
    expect(
      isPhysicalSameAsRegistered({
        ...registered,
        ...copyRegisteredToPhysical(registered),
        physical_address_city: 'Orlando',
      })
    ).toBe(false);
    expect(isPhysicalSameAsRegistered({})).toBe(false);
  });
});

describe('registeredCountryPrefill', () => {
  it('starts the registered-address country from the tax id issuing country', () => {
    expect(
      registeredCountryPrefill({ registered_address_country: '', tax_id_issuing_country: 'COL' })
    ).toBe('COL');
  });

  it('never replaces a country the user already chose, and does nothing without a tax id country', () => {
    expect(
      registeredCountryPrefill({ registered_address_country: 'USA', tax_id_issuing_country: 'COL' })
    ).toBeNull();
    expect(registeredCountryPrefill({ registered_address_country: '' })).toBeNull();
  });
});
