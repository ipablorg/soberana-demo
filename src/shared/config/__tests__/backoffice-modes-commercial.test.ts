import { describe, expect, it } from 'vitest';

import {
  BACKOFFICE_MODES,
  COMMERCIAL_ROUTE,
  PLATFORM_CONFIG_ROUTE,
  getBackofficeSections,
} from '../backoffice-modes.config';

function allUrls(canAccessCommercial: boolean | undefined): string[] {
  return BACKOFFICE_MODES.flatMap((mode) =>
    getBackofficeSections(
      mode.id,
      canAccessCommercial === undefined ? undefined : { canAccessCommercial },
    ).flatMap((group) => group.items.map((item) => item.url)),
  );
}

describe('backoffice navigation commercial entry', () => {
  it.each([[undefined], [false]])(
    'omits the commercial entry from every mode when access is %s',
    (canAccessCommercial) => {
      // Act
      const urls = allUrls(canAccessCommercial);

      // Assert
      expect(urls).not.toContain(COMMERCIAL_ROUTE);
    },
  );

  it('lists the commercial entry once when the role grants access', () => {
    // Act
    const urls = allUrls(true);

    // Assert
    expect(urls.filter((url) => url === COMMERCIAL_ROUTE)).toHaveLength(1);
  });

  it('does not unlock the platform entry through the commercial flag', () => {
    // Act
    const urls = allUrls(true);

    // Assert
    expect(urls).not.toContain(PLATFORM_CONFIG_ROUTE);
  });
});
