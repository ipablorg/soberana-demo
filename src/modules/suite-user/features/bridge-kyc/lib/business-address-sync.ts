export const ADDRESS_FIELD_SUFFIXES = [
  'line_1',
  'city',
  'state',
  'postal_code',
  'country',
] as const;

type AddressSuffix = (typeof ADDRESS_FIELD_SUFFIXES)[number];

export type RegisteredAddressKey = `registered_address_${AddressSuffix}`;
export type PhysicalAddressKey = `physical_address_${AddressSuffix}`;

export const REGISTERED_ADDRESS_KEYS: RegisteredAddressKey[] = ADDRESS_FIELD_SUFFIXES.map(
  (suffix) => `registered_address_${suffix}` as RegisteredAddressKey
);
export const PHYSICAL_ADDRESS_KEYS: PhysicalAddressKey[] = ADDRESS_FIELD_SUFFIXES.map(
  (suffix) => `physical_address_${suffix}` as PhysicalAddressKey
);

type AddressValues = Partial<Record<RegisteredAddressKey | PhysicalAddressKey, string | undefined>>;

/** Physical address fields mirroring the registered address, ready for `setValue`. */
export function copyRegisteredToPhysical(
  values: AddressValues
): Record<PhysicalAddressKey, string> {
  return Object.fromEntries(
    ADDRESS_FIELD_SUFFIXES.map((suffix) => [
      `physical_address_${suffix}`,
      values[`registered_address_${suffix}`] ?? '',
    ])
  ) as Record<PhysicalAddressKey, string>;
}

/** True when a non-empty registered address is already identical to the physical one. */
export function isPhysicalSameAsRegistered(values: AddressValues): boolean {
  const hasRegistered = ADDRESS_FIELD_SUFFIXES.some((suffix) =>
    Boolean(values[`registered_address_${suffix}`])
  );

  return (
    hasRegistered &&
    ADDRESS_FIELD_SUFFIXES.every(
      (suffix) =>
        (values[`registered_address_${suffix}`] ?? '') ===
        (values[`physical_address_${suffix}`] ?? '')
    )
  );
}

/**
 * The registered address usually sits in the country that issued the tax id:
 * start the registered-address country there. `null` when the user already
 * chose a country or the tax id country is unknown.
 */
export function registeredCountryPrefill(values: {
  registered_address_country?: string | null;
  tax_id_issuing_country?: string | null;
}): string | null {
  if (values.registered_address_country?.trim()) return null;
  const taxCountry = values.tax_id_issuing_country?.trim();
  return taxCountry ? taxCountry : null;
}
