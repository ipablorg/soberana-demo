import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
}

/**
 * Lightweight copy-to-clipboard with ephemeral "copied" feedback.
 *
 * Returns `{ copied, copy }`. `copied` flips to `true` on a successful copy
 * and auto-resets to `false` after `resetAfterMs` (default 2000ms).
 *
 * Gracefully degrades:
 * - If `navigator.clipboard` is unavailable (SSR, insecure context, old
 *   browsers), `copy()` resolves to `false` and `copied` stays `false`.
 * - Timers are cleared on unmount to avoid state updates on unmounted
 *   components.
 */
export const useCopyToClipboard = (resetAfterMs = 2000): UseCopyToClipboardResult => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setCopied(false);
        return false;
      }
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, resetAfterMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
};
