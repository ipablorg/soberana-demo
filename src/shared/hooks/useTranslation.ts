/**
 * @deprecated This hook is deprecated. Use the new i18n system instead:
 * 
 * ```ts
 * import { useTranslation } from '@/shared/i18n';
 * 
 * const { t, language, setLanguage, toggleLanguage } = useTranslation();
 * ```
 * 
 * The new system provides:
 * - Full TypeScript support
 * - Better organization (separated by module)
 * - More features (setLanguage, toggleLanguage)
 * - Context-based (no direct store access)
 */

import { useTranslation as useNewTranslation } from '@/shared/i18n';

/**
 * @deprecated Use `import { useTranslation } from '@/shared/i18n'` instead
 */
export function useTranslation() {
  console.warn(
    'DEPRECATION WARNING: useTranslation from @/shared/hooks is deprecated. ' +
    'Please use the new i18n system: import { useTranslation } from "@/shared/i18n"'
  );
  
  return useNewTranslation();
}
