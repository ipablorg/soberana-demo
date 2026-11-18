import { useFormContext } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

interface StepBusinessDocumentsProps {
  form: ReturnType<typeof useFormContext>;
  getErrorsForField: (field: string) => string[];
  clearFieldError: (field: string) => void;
}

export function StepBusinessDocuments({ form, getErrorsForField, clearFieldError }: StepBusinessDocumentsProps) {
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{t`Business Documents`}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t`Upload required business verification documents`}
        </p>
      </div>

      <FormField
        control={form.control}
        name="proof_of_address_document"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Proof of Address`}</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      field.onChange(reader.result as string);
                      clearFieldError('proof_of_address_document');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('proof_of_address_document').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="business_formation_document"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t`Business Formation Document`}</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      field.onChange(reader.result as string);
                      clearFieldError('business_formation_document');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
            {getErrorsForField('business_formation_document').map((error, i) => (
              <p key={i} className="text-sm text-destructive">{error}</p>
            ))}
          </FormItem>
        )}
      />
    </div>
  );
}
