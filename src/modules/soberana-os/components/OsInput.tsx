import { useState, useRef, useEffect } from 'react';
import { Send } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';

interface OsInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function OsInput({ onSend, disabled, placeholder }: OsInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="px-4 py-3 border-t border-border/30">
      <div className="flex items-center gap-2 bg-muted/50 border border-border/50 rounded-lg px-4 py-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder={placeholder ?? 'Ask Soberana anything...'}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none disabled:opacity-50"
        />
        <Button
          variant="default"
          size="icon"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="h-8 w-8 disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
