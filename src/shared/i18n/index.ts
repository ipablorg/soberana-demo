/**
 * i18n Module - Powered by Lingui
 * 
 * Professional internationalization system with:
 * - Lingui macro-based translations
 * - ICU MessageFormat support
 * - Persistent language preference
 * - Backward compatibility with old system
 * 
 * @example New Lingui usage
 * ```tsx
 * import { Trans, useLingui } from '@lingui/react/macro';
 * 
 * function MyComponent() {
 *   const { t } = useLingui();
 *   return (
 *     <div>
 *       <h1><Trans>Welcome</Trans></h1>
 *       <p>{t`Loading...`}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @example Old system (still works during migration)
 * ```tsx
 * import { useTranslation } from '@/shared/i18n';
 * 
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <h1>{t.landing.hero.title}</h1>;
 * }
 * ```
 */

// New Lingui provider
export { LinguiProvider } from './LinguiProvider';

// Lingui core exports
export { i18n, loadLocale, type SupportedLocale } from './i18n';

// Language store for persistent preferences
export { useLanguageStore } from '@/shared/stores/useLanguageStore';

// Old system exports - for backward compatibility during migration
export { I18nProvider as OldI18nProvider, useTranslation } from './provider';
export type {
  Language,
  Translations,
} from './types';

