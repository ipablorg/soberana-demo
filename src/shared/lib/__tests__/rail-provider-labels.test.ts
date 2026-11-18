import { describe, expect, it } from 'vitest';

import { providerDisplayName, railCodeLabel } from '../rail-provider-labels';

describe('railCodeLabel', () => {
  it('names the rail codes ops and customers see', () => {
    expect(railCodeLabel('ach')).toBe('ACH');
    expect(railCodeLabel('us_ach')).toBe('ACH');
    expect(railCodeLabel('ach_wire')).toBe('ACH / Wire');
    expect(railCodeLabel('wire')).toBe('Wire');
  });

  it('keeps an unknown code raw', () => {
    expect(railCodeLabel('new_rail')).toBe('new_rail');
    expect(railCodeLabel(null)).toBe('');
  });
});

describe('providerDisplayName', () => {
  it('names the virtual-account providers', () => {
    expect(providerDisplayName('mesta')).toBe('Mesta');
    expect(providerDisplayName('kirafin')).toBe('KiraFin');
  });

  it('keeps an unknown provider raw', () => {
    expect(providerDisplayName('acme')).toBe('acme');
  });
});
