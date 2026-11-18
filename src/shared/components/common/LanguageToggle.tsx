import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useLanguageStore } from '@/shared/i18n';
import { Languages, Check } from '@/shared/components/animated-icons';

type LanguageOption = {
  code: 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'ja';
  label: string;
  flag: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

interface LanguageToggleProps {
  availableLanguages?: LanguageOption['code'][];
}

export function LanguageToggle({ availableLanguages }: LanguageToggleProps = {}) {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const filteredLanguages = availableLanguages
    ? LANGUAGES.filter((lang) => availableLanguages.includes(lang.code))
    : LANGUAGES;

  const currentLanguage = filteredLanguages.find((lang) => lang.code === language) || filteredLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-medium">
          <Languages className="w-4 h-4" />
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="uppercase hidden sm:inline">{currentLanguage.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {filteredLanguages.map((lang) => (
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
