import { useFormContext, useWatch } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  getBusinessAccountPurposeLabel,
  getBusinessSourceOfFundsLabel,
  getExpectedAnnualRevenueLabel,
  getExpectedMonthlyPaymentLabel,
  getHighRiskActivityLabel,
} from '../../lib/kyc-questionnaire-options';
import { BUSINESS_SOURCE_OF_FUNDS_OPTIONS, BUSINESS_ACCOUNT_PURPOSE_OPTIONS, EXPECTED_ANNUAL_REVENUE_OPTIONS, EXPECTED_MONTHLY_PAYMENTS_OPTIONS, HIGH_RISK_ACTIVITIES_OPTIONS, type BusinessComplianceValues } from '@suite-user/features/bridge-kyc/lib/verify-identity.schema';

interface StepBusinessComplianceProps {
  form: ReturnType<typeof useFormContext<BusinessComplianceValues>>;
  getErrorsForField: (field: keyof BusinessComplianceValues) => string[];
  clearFieldError: (field: keyof BusinessComplianceValues) => void;
}

export function StepBusinessCompliance({ form, getErrorsForField, clearFieldError }: StepBusinessComplianceProps) {
  const { t } = useLingui();

  const highRiskActivities = useWatch({
    control: form.control,
    name: 'high_risk_activities',
  }) ?? [];

  const conductsMoneyServices = useWatch({
    control: form.control,
    name: 'conducts_money_services',
  }) ?? false;

  const watchedAccountPurpose = useWatch({
    control: form.control,
    name: 'account_purpose',
  });

  const showHighRiskExplanation = highRiskActivities.some(
    (activity) => activity !== 'none_of_the_above',
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t`Compliance Information`}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t`Help us understand your business activities`}</p>
      </div>

      <FormField
        control={form.control}
        name="source_of_funds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Source of Funds`}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select source of funds`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUSINESS_SOURCE_OF_FUNDS_OPTIONS.map((source) => (
                  <SelectItem key={source} value={source}>
                    {getBusinessSourceOfFundsLabel(source)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('source_of_funds').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account_purpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Account Purpose`}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select account purpose`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BUSINESS_ACCOUNT_PURPOSE_OPTIONS.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {getBusinessAccountPurposeLabel(purpose)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('account_purpose').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      {watchedAccountPurpose === 'other' && (
        <FormField
          control={form.control}
          name="account_purpose_other"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`Descripción del propósito de la cuenta (obligatoria si eliges "Otro")`}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t`Describe your account purpose`}
                  onChange={(e) => {
                    field.onChange(e);
                    clearFieldError('account_purpose_other');
                  }}
                />
              </FormControl>
              <FormMessage />
              {getErrorsForField('account_purpose_other').map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="estimated_annual_revenue_usd"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Ingresos anuales esperados (USD)`}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select revenue range`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EXPECTED_ANNUAL_REVENUE_OPTIONS.map((revenue) => (
                  <SelectItem key={revenue} value={revenue}>
                    {getExpectedAnnualRevenueLabel(revenue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('estimated_annual_revenue_usd').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="expected_monthly_payments_usd"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Expected Monthly Payments (USD)`}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t`Select range`} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {EXPECTED_MONTHLY_PAYMENTS_OPTIONS.map((range) => (
                  <SelectItem key={range} value={range}>
                    {getExpectedMonthlyPaymentLabel(range)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
            {getErrorsForField('expected_monthly_payments_usd').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="source_of_funds_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Source of Funds Description`}</FormLabel>
            <FormControl>
              <textarea
                {...field}
                placeholder={t`Provide additional details about your source of funds`}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('source_of_funds_description');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('source_of_funds_description').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium text-sm">{t`Risk Assessment`}</h3>

        <FormField
          control={form.control}
          name="high_risk_activities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t`High Risk Activities`}</FormLabel>
              <p className="text-sm text-muted-foreground">
                {t`Select all high-risk activities that apply to your business`}
              </p>
              <div className="space-y-2 pt-2">
                {HIGH_RISK_ACTIVITIES_OPTIONS.map((activity) => {
                  const isChecked = field.value?.includes(activity) ?? false;
                  return (
                    <FormItem key={activity} className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = field.value ?? [];
                            if (checked) {
                              field.onChange([...current, activity]);
                            } else {
                              field.onChange(current.filter((item) => item !== activity));
                            }
                            clearFieldError('high_risk_activities');
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{getHighRiskActivityLabel(activity)}</FormLabel>
                      </div>
                    </FormItem>
                  );
                })}
              </div>
              <FormMessage />
              {getErrorsForField('high_risk_activities').map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </FormItem>
          )}
        />

        {showHighRiskExplanation && (
          <FormField
            control={form.control}
            name="high_risk_activities_explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`High Risk Activities Explanation`}</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder={t`Please explain the nature of the high-risk activities your business engages in`}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError('high_risk_activities_explanation');
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField('high_risk_activities_explanation').map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="operates_in_prohibited_countries"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t`Operations in Prohibited Countries`}</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t`Business operates in countries under international sanctions`}
                </p>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conducts_money_services"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t`Money Services Business`}</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t`Business conducts money transmission or currency exchange services`}
                </p>
              </div>
            </FormItem>
          )}
        />

        {conductsMoneyServices && (
          <>
            <FormField
              control={form.control}
              name="conducts_money_services_using_bridge"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Uses Bridge for Money Services`}</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {t`Business uses Bridge to conduct money transmission or currency exchange`}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conducts_money_services_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Money Services Description`}</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      placeholder={t`Describe the nature of the money services your business conducts`}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError('conducts_money_services_description');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField('conducts_money_services_description').map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />
          </>
        )}
      </div>

      <FormField
        control={form.control}
        name="compliance_screening_explanation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {conductsMoneyServices
                ? t`Explicación del screening de cumplimiento`
                : t`Explicación del screening de cumplimiento (opcional)`}
            </FormLabel>
            <FormControl>
              <textarea
                {...field}
                placeholder={t`Provide any additional context for compliance screening`}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => {
                  field.onChange(e);
                  clearFieldError('compliance_screening_explanation');
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('compliance_screening_explanation').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />
    </div>
  );
}