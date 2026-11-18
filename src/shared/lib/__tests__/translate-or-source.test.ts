import { i18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { describe, expect, it } from 'vitest';

import { translateOrSource } from '../translate-or-source';

describe('translateOrSource', () => {
  it('falls back to the Spanish source when no locale is active (tests, early render)', () => {
    expect(translateOrSource(msg`Cerrar`)).toBe('Cerrar');
  });

  it('uses the active catalog when there is one', () => {
    const descriptor = msg`Cerrar`;
    i18n.loadAndActivate({ locale: 'en', messages: { [descriptor.id]: 'Close' } });

    expect(translateOrSource(descriptor)).toBe('Close');
  });
});
