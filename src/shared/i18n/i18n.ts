/**
 * Lingui i18n Configuration
 * 
 * Initializes the i18n instance with locale loading
 * Supports: EN, ES, PT, FR, DE, IT, JA
 */

import { i18n } from "@lingui/core";
import { messages as enMessages } from "./locales/en/messages.mjs";
import { messages as esMessages } from "./locales/es/messages.mjs";
import { messages as ptMessages } from "./locales/pt/messages.mjs";
import { messages as frMessages } from "./locales/fr/messages.mjs";
import { messages as deMessages } from "./locales/de/messages.mjs";
import { messages as itMessages } from "./locales/it/messages.mjs";
import { messages as jaMessages } from "./locales/ja/messages.mjs";

export type SupportedLocale = "en" | "es" | "pt" | "fr" | "de" | "it" | "ja";

// Load all messages synchronously
i18n.load({
  en: enMessages,
  es: esMessages,
  pt: ptMessages,
  fr: frMessages,
  de: deMessages,
  it: itMessages,
  ja: jaMessages,
});

// Activate English by default
i18n.activate("en");

/**
 * Load and activate a specific locale
 */
export function loadLocale(locale: SupportedLocale) {
  i18n.activate(locale);
}

export { i18n };

