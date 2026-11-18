import { useFormContext, useWatch } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { BUSINESS_TYPE_OPTIONS, BUSINESS_INDUSTRY_OPTIONS, type BusinessBasicValues } from '../../lib/verify-identity.schema';
import { getBusinessIndustryLabel, getBusinessTypeLabel } from '../../lib/kyc-questionnaire-options';
import { KYC_COUNTRY_CATALOG, getTaxIdTypeOptions } from '@/shared/lib/kyc/static-catalog';
import { EMPLOYEE_RANGE_OPTIONS } from '../../lib/business-provider-profile';

interface StepBusinessBasicProps {
  form: ReturnType<typeof useFormContext<BusinessBasicValues>>;
  getErrorsForField: (field: keyof BusinessBasicValues) => string[];
  clearFieldError: (field: keyof BusinessBasicValues) => void;
}

export function StepBusinessBasic({ form, getErrorsForField, clearFieldError }: StepBusinessBasicProps) {
  const { t } = useLingui();

  const taxIdCountry = useWatch({
    control: form.control,
    name: 'tax_id_issuing_country',
  });
  const taxIdTypeOptions = taxIdCountry ? getTaxIdTypeOptions(taxIdCountry, 'business') : [];
  const website = useWatch({ control: form.control, name: 'primary_website' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t`Business Information`}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t`Tell us about your business entity`}</p>
      </div>

      <FormField
        control={form.control}
        name="business_legal_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Legal Business Name`}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t`Enter the official legal name`}
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('business_legal_name');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('business_legal_name').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="business_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Business Type`}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select business type`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUSINESS_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getBusinessTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('business_type').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="business_industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Industry`}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                clearFieldError('business_industry');
              }}
              value={field.value ?? ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select industry`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUSINESS_INDUSTRY_OPTIONS.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {getBusinessIndustryLabel(industry)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('business_industry').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="incorporation_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Incorporation Date`}</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('incorporation_date');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('incorporation_date').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="primary_website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Primary Website (optional)`}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="https://example.com"
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('primary_website');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('primary_website').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      {website?.trim() ? null : (
        <FormField
          control={form.control}
          name="website_absence_reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`¿Por qué la empresa no tiene sitio web?`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t`Por ejemplo: vendemos solo por redes sociales`}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError('website_absence_reason');
                  }}
                />
              </FormControl>
              <FormMessage />
              {getErrorsForField('website_absence_reason').map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="tax_id_issuing_country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Tax ID Issuing Country`}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select country`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {KYC_COUNTRY_CATALOG.map((country) => (
                  <SelectItem key={country.iso3} value={country.iso3}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('tax_id_issuing_country').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_id_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Tax ID Type`}</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
              disabled={!taxIdTypeOptions.length}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select tax ID type`} />
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
            <FormMessage />
            {getErrorsForField('tax_id_type').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tax_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Número de identificación fiscal`}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t`Enter the business tax ID number`}
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('tax_id');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('tax_id').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="registration_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Número de registro de la empresa`}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={t`Ej.: matrícula mercantil o número de registro estatal`}
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('registration_number');
                }}
              />
            </FormControl>
            <p className="text-xs text-muted-foreground">
              {t`Número del registro mercantil, distinto del ID fiscal`}
            </p>
            <FormMessage />
            {getErrorsForField('registration_number').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="number_of_employees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Número de empleados`}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                clearFieldError('number_of_employees');
              }}
              value={field.value ?? ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Selecciona un rango`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EMPLOYEE_RANGE_OPTIONS.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('number_of_employees').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_financial_institution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`¿La empresa es una institución financiera?`}</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(value === 'yes')}
              value={field.value ? 'yes' : 'no'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no">{t`No`}</SelectItem>
                <SelectItem value="yes">{t`Sí`}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="business_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Business Description`}</FormLabel>
            <FormControl>
              <textarea
                {...field}
                placeholder={t`Briefly describe your business activities`}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('business_description');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('business_description').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_dao"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{t`Is this a DAO?`}</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}