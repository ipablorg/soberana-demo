/**
 * Read-only, rail-aware renderer for a `bankDetails` JSON column.
 *
 * Structured rails show labeled fields (account numbers in `font-mono` with a
 * copy button); unknown rails fall back to a collapsible raw-JSON view so ops
 * never approves a payout to an invisible account.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Check, Copy } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  displayBankFieldValue,
  getRailFields,
  readBankField,
} from './bank-rail-fields';

interface BankDetailsDisplayProps {
  bankDetails: unknown;
  railCode: string;
}

export function BankDetailsDisplay({
  bankDetails,
  railCode,
}: BankDetailsDisplayProps) {
  const { t } = useLingui();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fields = getRailFields(railCode);

  if (!fields) {
    return <RawBankDetails bankDetails={bankDetails} />;
  }

  const hasAnyValue = fields.some(
    (field) => readBankField(bankDetails, field.key).length > 0,
  );

  if (!hasAnyValue) {
    return (
      <p className="text-sm text-muted-foreground">
        <Trans>Sin datos bancarios registrados.</Trans>
      </p>
    );
  }

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Clipboard may be unavailable (permissions / non-secure context);
      // failing silently is fine — the value is still visible.
    }
  };

  return (
    <dl className="space-y-2">
      {fields.map((field) => {
        const raw = readBankField(bankDetails, field.key);
        const value = displayBankFieldValue(raw, field);
        if (value.length === 0) return null;

        const isMono = field.format === 'mono' || field.format === 'clabe';

        return (
          <div key={field.key} className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <dt className="text-xs text-muted-foreground">{field.label}</dt>
              <dd
                className={`break-all text-sm ${isMono ? 'font-mono tabular-nums' : 'font-medium'}`}
              >
                {value}
              </dd>
            </div>
            {isMono ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2"
                aria-label={t`Copiar`}
                onClick={() => handleCopy(field.key, raw)}
              >
                {copiedKey === field.key ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            ) : null}
          </div>
        );
      })}
    </dl>
  );
}

function RawBankDetails({ bankDetails }: { bankDetails: unknown }) {
  const empty =
    bankDetails === null ||
    bankDetails === undefined ||
    (typeof bankDetails === 'object' &&
      Object.keys(bankDetails as object).length === 0);

  if (empty) {
    return (
      <p className="text-sm text-muted-foreground">
        <Trans>Sin datos bancarios registrados.</Trans>
      </p>
    );
  }

  let pretty: string;
  try {
    pretty = JSON.stringify(bankDetails, null, 2);
  } catch {
    pretty = String(bankDetails);
  }

  return (
    <details className="rounded-md border p-3">
      <summary className="cursor-pointer text-sm font-medium">
        <Trans>Datos bancarios (JSON)</Trans>
      </summary>
      <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
        {pretty}
      </pre>
    </details>
  );
}
