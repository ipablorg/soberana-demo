import { Sparkles } from '@/shared/components/animated-icons';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(suggestion)}
          disabled={disabled}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors duration-150 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3 text-primary shrink-0" />
          {suggestion}
        </button>
      ))}
    </>
  );
}
