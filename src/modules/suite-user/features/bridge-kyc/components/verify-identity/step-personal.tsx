import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
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
import type { VerifyIdentityValues } from '../../lib/verify-identity.schema';
import type { FieldError } from '../../lib/error-mapper';
import {
  getDefaultTaxIdType,
  getTaxIdTypeOption,
  getTaxIdTypeOptions,
  isAllowedTaxIdType,
} from '../../lib/tax-id-type-options';
import { CountrySelect } from './country-select';
import { QuestionnaireSection } from './questionnaire-section';
import { FormFieldError } from './form-field-error';

interface StepProps {
  form: UseFormReturn<VerifyIdentityValues>;
  requiredQuestionnaireFields?: string[];
  getErrorsForField?: (field: keyof VerifyIdentityValues) => FieldError[];
  clearFieldError?: (field: keyof VerifyIdentityValues) => void;
}

export function StepPersonal({ form, requiredQuestionnaireFields = [], getErrorsForField, clearFieldError }: StepProps) {
  const { t } = useLingui();
  const nationality = form.watch('nationality');
  const taxIdType = form.watch('tax_id_type');
  const taxIdTypeOptions = getTaxIdTypeOptions(nationality);
  const selectedTaxIdType = getTaxIdTypeOption(nationality, taxIdType);

  useEffect(() => {
    if (!nationality || taxIdTypeOptions.length === 0) {
      return;
    }

    if (!taxIdType || !isAllowedTaxIdType(nationality, taxIdType)) {
      form.setValue('tax_id_type', getDefaultTaxIdType(nationality), {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: true,
      });
    }
  }, [form, nationality, taxIdType, taxIdTypeOptions]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="birth_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Date of birth`}</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                className="w-full dark:bg-white dark:text-black"
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('birth_date');
                }}
              />
            </FormControl>
            <FormFieldError errors={getErrorsForField?.('birth_date')} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="nationality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Nationality`}</FormLabel>
            <FormControl>
              <CountrySelect
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError?.('nationality');
                }}
                placeholder={t`Select your nationality`}
              />
            </FormControl>
            <FormFieldError errors={getErrorsForField?.('nationality')} />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additional_nationality"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Additional nationality (optional)`}</FormLabel>
            <FormControl>
              <CountrySelect
                value={field.value ?? ''}
                onChange={(value) => {
                  field.onChange(value);
                  clearFieldError?.('additional_nationality');
                }}
                placeholder={t`Select an additional nationality`}
              />
            </FormControl>
            <FormFieldError errors={getErrorsForField?.('additional_nationality')} />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2 rounded-xl bg-muted/30 p-4 sm:p-5">
        <p className="text-sm font-medium text-foreground">{t`Place of birth (optional)`}</p>
        <p className="text-sm text-muted-foreground">
          {t`Provide this when it is available for your identity verification.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="place_of_birth_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Country of birth`}</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError?.('place_of_birth_country');
                  }}
                  placeholder={t`Select country of birth`}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('place_of_birth_country')} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="place_of_birth_city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`City of birth`}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t`e.g. Berlin`}
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('place_of_birth_city');
                  }}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('place_of_birth_city')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2 rounded-xl bg-muted/30 p-4 sm:p-5">
        <p className="text-sm font-medium text-foreground">{t`Fiscal / tax identification`}</p>
        <p className="text-sm text-muted-foreground">
          {t`Choose the tax identifier you use in your country for fiscal or tax reporting. This is separate from your government identity document.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="tax_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Tax identification number`}</FormLabel>
              <FormControl>
                <Input
                  placeholder={selectedTaxIdType?.placeholder ?? t`e.g. 12345678`}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('tax_id');
                  }}
                />
              </FormControl>
              <FormDescription>{t`Enter the fiscal or tax number required in your country.`}</FormDescription>
              <FormFieldError errors={getErrorsForField?.('tax_id')} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tax_id_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Tax identifier type`}</FormLabel>
              {taxIdTypeOptions.length > 0 ? (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    clearFieldError?.('tax_id_type');
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select tax identifier type`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {taxIdTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input
                    placeholder={t`e.g. Tax number, fiscal code, or national tax ID`}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError?.('tax_id_type');
                    }}
                  />
                </FormControl>
              )}
              <FormDescription>
                {taxIdTypeOptions.length > 0
                  ? t`We show the fiscal identifiers commonly used for the selected nationality.`
                  : t`If your country is not listed yet, enter the fiscal identifier label used locally.`}
              </FormDescription>
              <FormFieldError errors={getErrorsForField?.('tax_id_type')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <QuestionnaireSection form={form} requiredFields={requiredQuestionnaireFields} />
    </div>
  );
}
