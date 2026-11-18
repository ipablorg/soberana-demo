import { motion } from 'framer-motion';

interface OsSuggestionChipsProps {
  suggestions: Array<{ id: string; label: string }>;
  onSelect: (id: string) => void;
}

export function OsSuggestionChips({ suggestions, onSelect }: OsSuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-4 py-2">
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={suggestion.id}
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.25, ease: 'easeOut' as const }}
          onClick={() => onSelect(suggestion.id)}
          className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium hover:bg-primary/20 cursor-pointer transition-colors duration-150 border border-primary/10 hover:border-primary/30 max-w-full truncate"
        >
          {suggestion.label}
        </motion.button>
      ))}
    </div>
  );
}
