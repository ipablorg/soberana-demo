/**
 * DocsLanguageToggle - Language Selector for Documentation
 * 
 * Only Spanish and English. Uses docs-specific store (default: español).
 */

import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useDocsLanguageStore } from '@/shared/stores/useDocsLanguageStore';
import { Languages, Check } from '@/shared/components/animated-icons';

type DocsLanguageOption = {
  code: 'en' | 'es';
  label: string;
  flag: string;
};

const DOCS_LANGUAGES: DocsLanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function DocsLanguageToggle() {
  const language = useDocsLanguageStore((state) => state.language);
  const setLanguage = useDocsLanguageStore((state) => state.setLanguage);

  const currentLanguage = DOCS_LANGUAGES.find((lang) => lang.code === language) ?? DOCS_LANGUAGES[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-medium">
          <Languages className="w-4 h-4" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="uppercase">{currentLanguage.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {DOCS_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.label}</span>
                <span className="text-xs text-muted-foreground uppercase">{lang.code}</span>
              </div>
            </div>
            {language === lang.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

