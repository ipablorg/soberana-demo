import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';

import { Check, Copy } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';

interface CopyButtonProps {
  value: string;
  /** Accessible name; defaults to "Copy". */
  label?: string;
}

/** Copies `value` to the clipboard and confirms with a check mark. */
export function CopyButton({ value, label }: CopyButtonProps) {
  const { t } = useLingui();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void copy()}
      aria-label={label ?? t`Copy`}
      data-testid="copy-button"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="ml-1.5">{copied ? t`Copied` : (label ?? t`Copy`)}</span>
    </Button>
  );
}
