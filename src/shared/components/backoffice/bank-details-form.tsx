/**
 * Structured, rail-aware form for editing a `bankDetails` JSON object.
 *
 * Renders only the fields the selected rail needs and validates them per rail
 * before the parent can submit. A rail without a field definition gets a JSON
 * editor, so every rail can be linked.
 */

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  getRailFields,
  readBankField,
  validateBankDetails,
  type BankRailFieldDef,
} from './bank-rail-fields';

interface BankDetailsFormProps {
  railCode: string;
  value: Record<string, unknown>;
  onChange: (bankDetails: Record<string, unknown>) => void;
  /** When true, required fields with empty/invalid values show an error. */
  showErrors?: boolean;
}

export function BankDetailsForm({
  railCode,
  value,
  onChange,
  showErrors = false,
}: BankDetailsFormProps) {
  const fields = getRailFields(railCode);

  if (!fields) {
    // Keyed by rail so switching rails starts the editor from the new value.
    return <BankDetailsJsonEditor key={railCode} value={value} onChange={onChange} />;
  }

  const invalidLabels = showErrors
    ? new Set(validateBankDetails(railCode, value))
    : new Set<string>();

  const update = (field: BankRailFieldDef, raw: string) => {
    onChange({ ...value, [field.key]: raw });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fieldValue = readBankField(value, field.key);
          const invalid = invalidLabels.has(field.label);

          return (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`bank-field-${field.key}`}>
                {field.label}
                {field.required ? (
                  <span className="text-destructive"> *</span>
                ) : null}
              </Label>
              <Input
                id={`bank-field-${field.key}`}
                value={fieldValue}
                onChange={(event) => update(field, event.target.value)}
                maxLength={field.maxLength}
                className={
                  field.format === 'mono' || field.format === 'clabe'
                    ? 'font-mono tabular-nums'
                    : undefined
                }
              />
              {invalid ? (
                <p className="text-xs text-destructive">
                  <Trans>Campo obligatorio inválido.</Trans>
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const JSON_EXAMPLE = '{"account_number": "123456", "bank_name": "Banco"}';

/** `{...}` text as an object, or `null` when it is not a JSON object. */
function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function BankDetailsJsonEditor({
  value,
  onChange,
}: Pick<BankDetailsFormProps, 'value' | 'onChange'>) {
  const [text, setText] = useState(() =>
    Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : ''
  );
  const invalid = text.trim().length > 0 && parseJsonObject(text) === null;

  const handleChange = (raw: string) => {
    setText(raw);
    const parsed = raw.trim().length === 0 ? {} : parseJsonObject(raw);
    // Invalid JSON keeps the last valid object; the message tells ops to fix it.
    if (parsed) onChange(parsed);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        <Trans>
          Este riel no tiene campos predefinidos. Escriba los datos bancarios como JSON, por
          ejemplo:
        </Trans>{' '}
        <code className="font-mono">{JSON_EXAMPLE}</code>
      </p>
      <Textarea
        id="bank-details-json"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        rows={5}
        spellCheck={false}
        className="font-mono text-xs"
        aria-invalid={invalid}
      />
      {invalid ? (
        <p role="alert" className="text-xs text-destructive">
          <Trans>El JSON no es válido: debe ser un objeto entre llaves.</Trans>
        </p>
      ) : null}
    </div>
  );
}
