/**
 * Lingui I18nProvider Wrapper
 * 
 * Integrates Lingui's I18nProvider with Zustand language store
 * for persistent language preference
 */

import { ReactNode, useEffect } from "react";
import { I18nProvider as LinguiI18nProvider } from "@lingui/react";
import { useLanguageStore } from "@/shared/stores/useLanguageStore";
import { i18n, loadLocale, type SupportedLocale } from "./i18n";

interface LinguiProviderProps {
  children: ReactNode;
}

/**
 * LinguiProvider - Provides Lingui internationalization with persistent language
 * 
 * Features:
 * - Lingui-powered translations
 * - Language persistence via Zustand
 * - Automatic locale switching
 * 
 * Usage:
 * ```tsx
 * <LinguiProvider>
 *   <App />
 * </LinguiProvider>
 * ```
 */
export function LinguiProvider({ children }: LinguiProviderProps) {
  const language = useLanguageStore((state) => state.language);

  // Activate locale when language changes
  useEffect(() => {
    loadLocale(language as SupportedLocale);
  }, [language]);

  return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
}

