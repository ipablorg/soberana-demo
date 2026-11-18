import type { UseFormReturn } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import type { VerifyIdentityValues } from '../../lib/verify-identity.schema';
import type { FieldError } from '../../lib/error-mapper';
import { CountrySelect } from './country-select';
import { FormFieldError } from './form-field-error';

interface StepProps {
  form: UseFormReturn<VerifyIdentityValues>;
  lockedCountry?: string | null;
  getErrorsForField?: (field: keyof VerifyIdentityValues) => FieldError[];
  clearFieldError?: (field: keyof VerifyIdentityValues) => void;
}

export function StepAddress({ form, lockedCountry, getErrorsForField, clearFieldError }: StepProps) {
  const { t } = useLingui();

  const selectedCountry = form.watch('country');
  const isCountryLocked = Boolean(lockedCountry) && lockedCountry === selectedCountry;

  return (
    <div className="space-y-5">
      <FormField
        control={form.control}
        name="address_line_1"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Street address`}</FormLabel>
            <FormControl>
              <Input
                placeholder={t`e.g. 123 Main St, Apt 4B`}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError?.('address_line_1');
                }}
              />
            </FormControl>
            <FormFieldError errors={getErrorsForField?.('address_line_1')} />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`City`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('city');
                  }}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('city')} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`State / Province`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('state');
                  }}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('state')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Postal code`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError?.('postal_code');
                  }}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('postal_code')} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Country`}</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    clearFieldError?.('country');
                  }}
                  placeholder={t`Select country`}
                  disabled={isCountryLocked}
                />
              </FormControl>
              <FormFieldError errors={getErrorsForField?.('country')} />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isCountryLocked && (
        <p className="text-xs text-muted-foreground">
          {t`We locked this country to match your existing customer profile.`}
        </p>
      )}
    </div>
  );
}
