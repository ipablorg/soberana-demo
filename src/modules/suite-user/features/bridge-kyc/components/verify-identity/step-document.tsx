import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react/macro';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import {
  type VerifyIdentityValues,
} from '../../lib/verify-identity.schema';
import type { FieldError } from '../../lib/error-mapper';
import { getDocumentTypeOption, getDocumentTypeOptions } from '../../lib/document-type-options';
import {
  documentTypeRequiresBack,
  documentTypeRequiresPhoto,
  documentTypeShowsExpiration,
} from '../../lib/document-type-semantics';
import { resolveDocumentNumberPrefill } from '../../lib/document-number-prefill';
import { CountrySelect } from './country-select';
import { DocumentCapture, DocumentUploadCapture } from './document-capture';
import { FormFieldError } from './form-field-error';

function getSupportingDocumentLabel(purpose: string): string {
  switch (purpose) {
    case 'proof_of_address':
      return t`Proof of address`;
    case 'proof_of_source_of_funds':
      return t`Proof of source of funds`;
    case 'proof_of_source_of_wealth':
      return t`Proof of source of wealth`;
    case 'proof_of_tax_identification':
      return t`Proof of tax identification`;
    case 'proof_of_account_purpose':
      return t`Proof of account purpose`;
    case 'proof_of_relationship':
      return t`Proof of relationship`;
    case 'proof_of_individual_name_change':
      return t`Proof of name change`;
    case 'other':
      return t`Supporting document`;
    default:
      return purpose;
  }
}

interface StepProps {
  form: UseFormReturn<VerifyIdentityValues>;
  requiredDocumentPurposes?: string[];
  requiresSelfie?: boolean;
  getErrorsForField?: (field: keyof VerifyIdentityValues) => FieldError[];
  clearFieldError?: (field: keyof VerifyIdentityValues) => void;
}

export function StepDocument({
  form,
  requiredDocumentPurposes = [],
  requiresSelfie = false,
  getErrorsForField,
  clearFieldError,
}: StepProps) {
  const { t } = useLingui();
  const type = form.watch('type');
  const issuingCountry = form.watch('issuing_country');
  const requiresBack = documentTypeRequiresBack(type);
  const requiresPhoto = documentTypeRequiresPhoto(type);
  const documentTypeOptions = getDocumentTypeOptions(issuingCountry);
  const selectedDocumentType = getDocumentTypeOption(issuingCountry, type);
  const showsExpiration = documentTypeShowsExpiration(issuingCountry, type);
  const documentNumberLabel = selectedDocumentType?.numberLabel ?? t`Document number`;
  const documentNumberPlaceholder = selectedDocumentType?.numberPlaceholder;
  const otherDocumentPlaceholder = selectedDocumentType?.descriptionPlaceholder ?? t`e.g. California driver license`;
  const taxId = form.watch('tax_id');
  const taxIdType = form.watch('tax_id_type');
  const currentNumber = form.watch('number');
  // Once the user edits the number (even to clear it) the prefill never comes back.
  const [numberEdited, setNumberEdited] = useState(false);
  const reusedNumber = resolveDocumentNumberPrefill({
    documentType: type,
    currentNumber,
    taxId,
    taxIdType,
    userEdited: numberEdited,
  });

  // A US document is the SSN/ITIN already typed as tax id: reuse it, never ask twice.
  useEffect(() => {
    if (!reusedNumber) return;
    form.setValue('number', reusedNumber, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
  }, [form, reusedNumber]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Government identity document`}</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  clearFieldError?.('type');
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDocumentType?.helperText && (
                <FormDescription>{selectedDocumentType.helperText}</FormDescription>
              )}
              <FormFieldError errors={getErrorsForField?.('type')} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issuing_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Issuing country`}</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError?.('issuing_country');
                  }}
                  placeholder={t`Select country`}
                />
              </FormControl>
              {issuingCountry === 'USA' && (
                <FormDescription>
                  {t`Para documentos emitidos en EE. UU. solo aceptamos SSN o ITIN, por eso cambiamos el tipo de documento.`}
                </FormDescription>
              )}
              <FormFieldError errors={getErrorsForField?.('issuing_country')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{documentNumberLabel}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={documentNumberPlaceholder}
                  onChange={(e) => {
                    setNumberEdited(true);
                    field.onChange(e);
                    clearFieldError?.('number');
                  }}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('number')} />
              <FormMessage />
            </FormItem>
          )}
        />

        {showsExpiration && (
          <FormField
            control={form.control}
            name="expiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Expiration date`}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError?.('expiration');
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {selectedDocumentType?.expirationMode === 'required'
                    ? t`This document usually expires, so we need that date.`
                    : t`Add an expiration date only if your document has one.`}
                </FormDescription>
                <FormFieldError errors={getErrorsForField?.('expiration')} />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {type === 'OTHER' && (
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Document description`}</FormLabel>
              <FormControl>
                <Input
                  placeholder={otherDocumentPlaceholder}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('description');
                  }}
                />
              </FormControl>
              <FormDescription>
                {t`Tell us which government document you are uploading so we can keep the backend contract mapped safely.`}
              </FormDescription>
              <FormFieldError errors={getErrorsForField?.('description')} />
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <Separator />

      {requiresPhoto && (
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            {t`Government document photos`}
          </p>
          <p className="mb-3 text-sm text-muted-foreground">
            {requiresBack
              ? t`Upload both sides of the government identity document you selected.`
              : t`Upload the required page or front of the government identity document you selected.`}
          </p>
          <div className={requiresBack ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : ''}>
            <FormField
              control={form.control}
              name="image_front"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DocumentCapture
                      label={t`Front`}
                      value={field.value || undefined}
                      onChange={(value) => {
                        field.onChange(value ?? '');
                        clearFieldError?.('image_front');
                      }}
                    />
                  </FormControl>
                  <FormFieldError errors={getErrorsForField?.('image_front')} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresBack && (
              <FormField
                control={form.control}
                name="image_back"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DocumentCapture
                        label={t`Back`}
                        value={field.value || undefined}
                        onChange={(value) => {
                          field.onChange(value);
                          clearFieldError?.('image_back');
                        }}
                      />
                    </FormControl>
                    <FormFieldError errors={getErrorsForField?.('image_back')} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      )}

      {requiresSelfie && (
        <div className="space-y-3 rounded-xl bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">{t`Selfie verification`}</p>
          <p className="text-sm text-muted-foreground">
            {t`Take a clear selfie only if still required for this review.`}
          </p>
          <FormField
            control={form.control}
            name="selfie"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DocumentCapture
                    label={t`Take a selfie`}
                    value={field.value || undefined}
                    onChange={(value) => {
                      field.onChange(value ?? '');
                      clearFieldError?.('selfie');
                    }}
                  />
                </FormControl>
                <FormFieldError errors={getErrorsForField?.('selfie')} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {requiredDocumentPurposes.length > 0 && (
        <div className="space-y-4 rounded-xl bg-muted/30 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t`Supporting documents`}</p>
            <p className="text-sm text-muted-foreground">
              {t`Upload only the supporting proof still needed for this review.`}
            </p>
          </div>

          {requiredDocumentPurposes.map((purpose, index) => (
            <div key={`${purpose}-${index}`} className="space-y-3 rounded-lg border border-border/60 bg-card p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {getSupportingDocumentLabel(purpose)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t`Use a recent and clearly readable document.`}
                </p>
              </div>

              <FormField
                control={form.control}
                name={`supporting_documents.${index}.purpose`}
                render={({ field }) => (
                  <input type="hidden" {...field} value={purpose} />
                )}
              />

              <FormField
                control={form.control}
                name={`supporting_documents.${index}.file`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DocumentUploadCapture
                        label={t`Upload document`}
                        value={field.value || undefined}
                        onChange={(value) => {
                          field.onChange(value ?? '');
                          clearFieldError?.(`supporting_documents.${index}.file` as keyof VerifyIdentityValues);
                        }}
                      />
                    </FormControl>
                    <FormFieldError errors={getErrorsForField?.(`supporting_documents.${index}.file` as keyof VerifyIdentityValues)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
