import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { KYC_COUNTRY_CATALOG } from '@/shared/lib/kyc/static-catalog';
import { kycCountryDisplayName } from '@/shared/lib/kyc/country-display-name';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { type BusinessAddressValues } from '../../lib/verify-identity.schema';
import {
  PHYSICAL_ADDRESS_KEYS,
  REGISTERED_ADDRESS_KEYS,
  copyRegisteredToPhysical,
  isPhysicalSameAsRegistered,
  registeredCountryPrefill,
} from '../../lib/business-address-sync';

interface StepBusinessAddressProps {
  form: ReturnType<typeof useFormContext<BusinessAddressValues>>;
  getErrorsForField: (field: keyof BusinessAddressValues) => string[];
  clearFieldError: (field: keyof BusinessAddressValues) => void;
  lockedCountry?: string;
}

export function StepBusinessAddress({ form, getErrorsForField, clearFieldError, lockedCountry }: StepBusinessAddressProps) {
  const { t } = useLingui();
  const [samePhysical, setSamePhysical] = useState(() => isPhysicalSameAsRegistered(form.getValues()));
  const registeredValues = useWatch({ control: form.control, name: REGISTERED_ADDRESS_KEYS });

  // The tax id country (basic step) is the natural registered-address country.
  useEffect(() => {
    if (lockedCountry) return;
    const prefill = registeredCountryPrefill(
      form.getValues() as { registered_address_country?: string; tax_id_issuing_country?: string },
    );
    if (prefill) {
      form.setValue('registered_address_country', prefill, { shouldDirty: true, shouldValidate: false });
    }
  }, [form, lockedCountry]);

  // While "same as registered" is on, the physical address mirrors the registered one.
  useEffect(() => {
    if (!samePhysical) return;
    const mirrored = copyRegisteredToPhysical(form.getValues());
    PHYSICAL_ADDRESS_KEYS.forEach((key) => {
      if (form.getValues(key) !== mirrored[key]) {
        form.setValue(key, mirrored[key], { shouldDirty: true, shouldValidate: true });
      }
    });
  }, [form, samePhysical, registeredValues]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t`Business Addresses`}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t`Provide both registered and physical business addresses`}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm">{t`Registered Address`}</h3>
        
        <FormField
          control={form.control}
          name="registered_address_line_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Street Address`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t`Enter registered street address`}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError('registered_address_line_1');
                  }}
                />
              </FormControl>
              <FormMessage />
              {getErrorsForField('registered_address_line_1').map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registered_address_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`City`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`City`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('registered_address_city');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('registered_address_city').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registered_address_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`State/Province`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`State`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('registered_address_state');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('registered_address_state').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registered_address_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Postal Code`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`Postal code`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('registered_address_postal_code');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('registered_address_postal_code').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registered_address_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Country`}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={!!lockedCountry}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select country`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {KYC_COUNTRY_CATALOG.map((country) => (
                      <SelectItem key={country.iso3} value={country.iso3}>
                        {kycCountryDisplayName(country)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {getErrorsForField('registered_address_country').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium text-sm">{t`Physical Address`}</h3>

        <label className="flex items-start gap-3 text-sm">
          <Checkbox
            checked={samePhysical}
            onCheckedChange={(checked) => setSamePhysical(checked === true)}
          />
          <span>{t`La dirección física es la misma que la dirección de registro`}</span>
        </label>

        {!samePhysical && (
          <div className="space-y-4">
        <FormField
          control={form.control}
          name="physical_address_line_1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Street Address`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t`Enter physical street address`}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError('physical_address_line_1');
                  }}
                />
              </FormControl>
              <FormMessage />
              {getErrorsForField('physical_address_line_1').map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="physical_address_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`City`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`City`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('physical_address_city');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('physical_address_city').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="physical_address_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`State/Province`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`State`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('physical_address_state');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('physical_address_state').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="physical_address_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Postal Code`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`Postal code`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('physical_address_postal_code');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('physical_address_postal_code').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="physical_address_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Country`}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                  disabled={!!lockedCountry}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select country`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {KYC_COUNTRY_CATALOG.map((country) => (
                      <SelectItem key={country.iso3} value={country.iso3}>
                        {kycCountryDisplayName(country)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {getErrorsForField('physical_address_country').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />
        </div>
          </div>
        )}
      </div>
    </div>
  );
}