import { useLanguageStore } from '@/shared/i18n';
import { getVaultsContent, type VaultsContent } from '../content/vaults-content';
import type { Language } from '../content/sidebar-content';

export function useVaultsContent(): VaultsContent {
  const language = useLanguageStore((state) => state.language);
  const docsLanguage: Language = language === 'en' ? 'en' : 'es';
  return getVaultsContent(docsLanguage);
}
