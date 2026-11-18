import { describe, expect, it } from 'vitest';

import {
  PLATFORM_CONFIG_ROUTE,
  getBackofficeSections,
} from '../backoffice-modes.config';
import { BACKOFFICE_MODES } from '../backoffice-modes.config';

function allUrls(canAccessPlatformConfig: boolean | undefined): string[] {
  return BACKOFFICE_MODES.flatMap((mode) =>
    getBackofficeSections(
      mode.id,
      canAccessPlatformConfig === undefined ? undefined : { canAccessPlatformConfig },
    ).flatMap((group) => group.items.map((item) => item.url)),
  );
}

describe('backoffice navigation platform entry', () => {
  it.each([[undefined], [false]])(
    'omits the platform entry from every mode when access is %s',
    (canAccessPlatformConfig) => {
      // Act
      const urls = allUrls(canAccessPlatformConfig);

      // Assert
      expect(urls).not.toContain(PLATFORM_CONFIG_ROUTE);
    },
  );

  it('lists the platform entry once when the role grants access', () => {
    // Act
    const urls = allUrls(true);

    // Assert
    expect(urls.filter((url) => url === PLATFORM_CONFIG_ROUTE)).toHaveLength(1);
  });
});
