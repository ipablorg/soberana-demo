/**
 * Global search of the deposit queue.
 *
 * One field that searches every identifier of a deposit on the backend (user,
 * reference, wallet, client, provider…). Typed text applies after a short
 * debounce and immediately on Enter; Escape and the clear button empty it at
 * once. `value` is the applied search, so a change made elsewhere (reset) is
 * mirrored in the input.
 */

import { useEffect, useRef, useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import { Search, X } from '@/shared/components/animated-icons';
import { Input } from '@/shared/components/ui/input';
import { useDebounce } from '@/shared/hooks/use-debounce';

import { RECAUDO_SEARCH_MAX_LENGTH } from '../lib/recaudo-filters';

export const RECAUDO_SEARCH_DEBOUNCE_MS = 350;

interface RecaudoSearchInputProps {
  /** Applied search. */
  value: string;
  onChange: (value: string) => void;
}

export function RecaudoSearchInput({
  value,
  onChange,
}: RecaudoSearchInputProps) {
  const { t } = useLingui();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  // Mirror changes made elsewhere, without eating whitespace still being typed.
  useEffect(() => {
    setDraft((current) => (current.trim() === value ? current : value));
  }, [value]);

  const debouncedDraft = useDebounce(draft, RECAUDO_SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    const next = debouncedDraft.trim();
    if (next !== valueRef.current) onChangeRef.current(next);
  }, [debouncedDraft]);

  const commit = (next: string) => {
    const trimmed = next.trim();
    if (trimmed !== valueRef.current) onChange(trimmed);
  };

  const clear = () => {
    setDraft('');
    commit('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit(draft);
      return;
    }

    if (event.key === 'Escape' && draft !== '') {
      event.preventDefault();
      clear();
    }
  };

  return (
    <div className="relative w-72 sm:w-80">
      <Search
        size={16}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={inputRef}
        type="search"
        aria-label={t`Buscar depósitos`}
        value={draft}
        maxLength={RECAUDO_SEARCH_MAX_LENGTH}
        placeholder={t`Buscar por usuario, referencia, billetera, cliente…`}
        className="h-8 pl-8 pr-8 text-xs [&::-webkit-search-cancel-button]:hidden"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {draft !== '' && (
        <button
          type="button"
          aria-label={t`Limpiar búsqueda`}
          onClick={() => {
            clear();
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
