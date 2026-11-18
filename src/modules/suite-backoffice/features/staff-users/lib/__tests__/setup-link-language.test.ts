import { describe, expect, it } from 'vitest';

import { withSetupLinkLanguage } from '../setup-link-language';

describe('withSetupLinkLanguage', () => {
  it('switches the Firebase action page language to Spanish', () => {
    const link =
      'https://soberana-v2-test.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=abc&apiKey=key&lang=en';

    const localized = new URL(withSetupLinkLanguage(link, 'es'));

    expect(localized.searchParams.get('lang')).toBe('es');
    expect(localized.searchParams.get('oobCode')).toBe('abc');
    expect(localized.searchParams.get('mode')).toBe('resetPassword');
    expect(localized.host).toBe('soberana-v2-test.firebaseapp.com');
  });

  it('adds the language when the link has none', () => {
    const localized = new URL(
      withSetupLinkLanguage(
        'https://example.test/__/auth/action?mode=resetPassword&oobCode=abc',
        'es'
      )
    );

    expect(localized.searchParams.get('lang')).toBe('es');
  });

  it('returns a value that is not a URL unchanged', () => {
    expect(withSetupLinkLanguage('not a url', 'es')).toBe('not a url');
  });
});
