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
import { FormFieldError } from './form-field-error';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import type { VerifyIdentityValues } from '../../lib/verify-identity.schema';
import {
  buildAccountPurposeOptions,
  buildActingAsIntermediaryOptions,
  buildEmploymentStatusOptions,
  buildExpectedMonthlyPaymentOptions,
  buildMostRecentOccupationOptions,
  buildSourceOfFundsOptions,
} from '../../lib/kyc-questionnaire-options';

interface QuestionnaireSectionProps {
  form: UseFormReturn<VerifyIdentityValues>;
  requiredFields: string[];
}

function includesField(requiredFields: string[], field: string): boolean {
  return requiredFields.includes(field);
}

export function QuestionnaireSection({ form, requiredFields }: QuestionnaireSectionProps) {
  const { t } = useLingui();

  const isSourceOfFundsRequired = includesField(requiredFields, 'source_of_funds');
  const isEmploymentRequired = includesField(requiredFields, 'employment_status');
  const isAccountPurposeRequired = includesField(requiredFields, 'account_purpose');
  const isVolumeRequired = includesField(requiredFields, 'expected_monthly_payments_usd');
  const isIntermediaryRequired = includesField(requiredFields, 'acting_as_intermediary');
  const isOccupationRequired = includesField(requiredFields, 'most_recent_occupation');

  const sourceOfFundsOptions = buildSourceOfFundsOptions();
  const employmentStatusOptions = buildEmploymentStatusOptions();
  const accountPurposeOptions = buildAccountPurposeOptions();
  const expectedMonthlyPaymentOptions = buildExpectedMonthlyPaymentOptions();
  const mostRecentOccupationOptions = buildMostRecentOccupationOptions();
  const actingAsIntermediaryOptions = buildActingAsIntermediaryOptions();

  return (
    <div className="space-y-5 rounded-xl bg-muted/30 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{t`Additional information`}</p>
        <p className="text-sm text-muted-foreground">
          {t`We only ask for the additional details needed to continue your verification.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isSourceOfFundsRequired && (
          <FormField
            control={form.control}
            name="source_of_funds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Source of funds`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select source of funds`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sourceOfFundsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEmploymentRequired && (
          <FormField
            control={form.control}
            name="employment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Employment status`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select employment status`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employmentStatusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isAccountPurposeRequired && (
          <FormField
            control={form.control}
            name="account_purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Account purpose`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select account purpose`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountPurposeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isAccountPurposeRequired && form.watch('account_purpose') === 'other' && (
          <FormField
            control={form.control}
            name="account_purpose_other"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Account purpose description (required for "other")`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t`Describe your account purpose`}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError?.('account_purpose_other');
                    }}
                  />
                </FormControl>
                <FormFieldError errors={getErrorsForField?.('account_purpose_other')} />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isVolumeRequired && (
          <FormField
            control={form.control}
            name="expected_monthly_payments_usd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Expected monthly payments`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select volume range`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expectedMonthlyPaymentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isOccupationRequired && (
          <FormField
            control={form.control}
            name="most_recent_occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Occupation`}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t`Select occupation`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mostRecentOccupationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>

      {isIntermediaryRequired && (
        <FormField
          control={form.control}
          name="acting_as_intermediary"
          render={({ field }) => (
            <FormItem className="space-y-3 rounded-lg border border-border/60 bg-card px-4 py-3">
              <div className="space-y-1">
                <FormLabel>{t`Are you acting as an intermediary?`}</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {t`Tell us if you are sending or receiving funds on behalf of someone else.`}
                </p>
              </div>
              <FormControl>
                <RadioGroup
                  className="grid grid-cols-2 gap-2"
                  value={field.value ? 'true' : 'false'}
                  onValueChange={(value) => {
                    field.onChange(value === 'true');
                  }}
                >
                  {actingAsIntermediaryOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`acting-as-intermediary-${option.value}`}
                      />
                      <label
                        className="cursor-pointer text-sm font-medium"
                        htmlFor={`acting-as-intermediary-${option.value}`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
