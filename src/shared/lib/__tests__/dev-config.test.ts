import { afterEach, describe, expect, it, vi } from 'vitest';

import { isInternalProductSettingsEnabled } from '@/shared/lib/dev-config';

describe('isInternalProductSettingsEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns false in a production build regardless of DEV', () => {
    // `vi.stubEnv` patches `import.meta.env`; the helper reads it at call
    // time, so this mirrors a real `vite build` where PROD is true.
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', false);

    expect(isInternalProductSettingsEnabled()).toBe(false);
  });

  it('returns false in production even if DEV is somehow truthy', () => {
    // Hard safeguard: PROD wins over DEV, so a malformed env can never
    // surface internal product surfaces in a production bundle.
    vi.stubEnv('PROD', true);
    vi.stubEnv('DEV', true);

    expect(isInternalProductSettingsEnabled()).toBe(false);
  });

  it('returns true under the dev server (DEV true, PROD false)', () => {
    vi.stubEnv('PROD', false);
    vi.stubEnv('DEV', true);

    expect(isInternalProductSettingsEnabled()).toBe(true);
  });
});
