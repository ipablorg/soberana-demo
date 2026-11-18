import { defineConfig } from "@lingui/cli";
import { formatter } from "@lingui/format-po";

export default defineConfig({
  locales: ["en", "es", "pt", "fr", "de", "it", "ja"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/shared/i18n/locales/{locale}/messages",
      include: ["src"],
      exclude: ["**/node_modules/**"],
    },
  ],
  format: formatter({ origins: false }),
  compileNamespace: "es",
});

