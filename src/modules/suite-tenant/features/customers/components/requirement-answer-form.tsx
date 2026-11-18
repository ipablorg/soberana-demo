import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import type {
  TenantRequirement,
  TenantRequirementAnswer,
  TenantRequirementDocument,
} from '@/graphql/types/tenant';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { checkFile, readFileAsDataUrl } from '@/shared/lib/file-data-url';
import { NativeSelect } from '@/modules/suite-tenant/components/atoms/native-select';
import { FormField } from '@/modules/suite-tenant/components/molecules/form-field';
import {
  REQUIREMENT_MAX_BYTES,
  REQUIREMENT_MIME_TYPES,
  toRequirementAnswer,
  validateRequirementAnswer,
  type RequirementAnswerError,
} from '@/modules/suite-tenant/features/customers/lib/requirement-answer';

interface RequirementAnswerFormProps {
  requirement: TenantRequirement;
  pending: boolean;
  onSubmit: (answer: TenantRequirementAnswer) => void;
}

/** Answer one open provider requirement with a value and/or documents. */
export function RequirementAnswerForm({
  requirement,
  pending,
  onSubmit,
}: RequirementAnswerFormProps) {
  const { t } = useLingui();
  const [value, setValue] = useState('');
  const [documents, setDocuments] = useState<TenantRequirementDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const takesValue = requirement.kind !== 'DOCUMENT';
  const takesDocuments = requirement.kind !== 'VALUE';
  const options = requirement.options ?? [];
  const fieldId = `requirement-${requirement.id}`;

  const messages: Record<RequirementAnswerError, string> = {
    not_open: t`This requirement no longer takes answers.`,
    document_required: t`Attach at least one document.`,
    value_required: t`Enter a value.`,
    answer_required: t`Attach a document or enter a value.`,
    value_not_allowed: t`Pick one of the allowed answers.`,
    too_many_documents: t`Attach 10 documents at most.`,
  };

  const pickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const accepted: TenantRequirementDocument[] = [];
    for (const file of files) {
      if (checkFile(file, REQUIREMENT_MIME_TYPES, REQUIREMENT_MAX_BYTES)) {
        setError(t`Upload PDF, PNG or JPEG files up to 10 MB.`);
        return;
      }
      accepted.push({
        file_name: file.name,
        mime_type: file.type,
        file: await readFileAsDataUrl(file),
      });
    }
    setError(null);
    setDocuments(accepted);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const failure = validateRequirementAnswer(requirement, value, documents);
    if (failure) {
      setError(messages[failure]);
      return;
    }
    setError(null);
    onSubmit(toRequirementAnswer(value, documents));
  };

  return (
    <form onSubmit={submit} className="space-y-3" noValidate data-testid={`${fieldId}-form`}>
      {takesValue ? (
        <FormField id={`${fieldId}-value`} label={t`Answer`}>
          {options.length > 0 ? (
            <NativeSelect
              id={`${fieldId}-value`}
              value={value}
              placeholder={t`Choose an answer`}
              options={options.map((option) => ({ value: option, label: option }))}
              onChange={(event) => setValue(event.target.value)}
            />
          ) : (
            <Input
              id={`${fieldId}-value`}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </FormField>
      ) : null}
      {takesDocuments ? (
        <FormField
          id={`${fieldId}-files`}
          label={t`Documents`}
          hint={t`PDF, PNG or JPEG · 10 MB each · up to 10.`}
        >
          <Input
            id={`${fieldId}-files`}
            type="file"
            multiple
            accept={REQUIREMENT_MIME_TYPES.join(',')}
            onChange={(event) => void pickFiles(event)}
          />
        </FormField>
      ) : null}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Trans>Sending…</Trans> : <Trans>Send answer</Trans>}
      </Button>
    </form>
  );
}
