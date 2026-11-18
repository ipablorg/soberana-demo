import { useFormContext, useFieldArray } from 'react-hook-form';
import { useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/components/ui/button';
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Plus, Trash2 } from '@/shared/components/animated-icons';
import { KYC_COUNTRY_CATALOG } from '@/shared/lib/kyc/static-catalog';
import { kycCountryDisplayName } from '@/shared/lib/kyc/country-display-name';
import { useAuthStore } from '@/shared/stores/auth-store';
import { buildSelfUboPrefill, selfUboPrefillPatch } from '../../lib/ubo-self-prefill';
import { DOCUMENT_TYPES, type UboValues } from '../../lib/verify-identity.schema';
import { USA_DOCUMENT_TYPES, documentTypeRequiresPhoto, isUsaDocumentType } from '../../lib/document-type-semantics';

interface StepBusinessUBOsProps {
  form: ReturnType<typeof useFormContext<{ ubos: UboValues[] }>>;
  getErrorsForField: (field: string) => string[];
  clearFieldError: (field: string) => void;
}

export function StepBusinessUBOs({ form, getErrorsForField, clearFieldError }: StepBusinessUBOsProps) {
  const { t } = useLingui();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ubos',
  });

  const user = useAuthStore((state) => state.user);
  const selfPrefill = buildSelfUboPrefill(user);

  const fillWithMyData = (index: number) => {
    if (!selfPrefill) return;
    // Only empty fields: a name the user already typed is never blanked or replaced.
    const patch = selfUboPrefillPatch(form.getValues(`ubos.${index}`) ?? {}, selfPrefill);
    (Object.keys(patch) as (keyof typeof patch)[]).forEach((key) => {
      form.setValue(`ubos.${index}.${key}`, patch[key] as string, { shouldDirty: true, shouldValidate: true });
    });
  };

  const addUbo = () => {
    append({
      first_name: '',
      last_name: '',
      email: '',
      birth_date: '',
      nationality: '',
      nationalities: [],
      place_of_birth_country: '',
      place_of_birth_city: '',
      residential_address_line_1: '',
      residential_address_city: '',
      residential_address_subdivision: '',
      residential_address_postal_code: '',
      residential_address_country: '',
      has_ownership: false,
      has_control: false,
      is_signer: false,
      is_director: false,
      identifying_document: {
        type: 'PASSPORT',
        issuing_country: '',
        number: '',
        description: '',
        expiration: '',
        image_front: '',
        image_back: '',
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t`Ultimate Beneficial Owners (UBOs)`}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t`Add individuals who own 25% or more of the business`}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addUbo}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {t`Add UBO`}
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-sm text-muted-foreground">{t`No UBOs added yet. Click "Add UBO" to start.`}</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 p-4 border rounded-lg relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <div className="flex flex-wrap items-center gap-2 pr-10">
            <h3 className="font-medium text-sm">{t`UBO ${index + 1}`}</h3>
            {selfPrefill && (
              <Button type="button" variant="outline" size="sm" onClick={() => fillWithMyData(index)}>
                {t`Soy yo`}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`ubos.${index}.first_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`First Name`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`First name`}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.first_name`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.first_name`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.last_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Last Name`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`Last name`}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.last_name`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.last_name`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name={`ubos.${index}.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Email`}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@example.com"
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError(`ubos.${index}.email`);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField(`ubos.${index}.email`).map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`ubos.${index}.birth_date`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t`Date of Birth`}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      field.onChange(e);
                      clearFieldError(`ubos.${index}.birth_date`);
                    }}
                  />
                </FormControl>
                <FormMessage />
                {getErrorsForField(`ubos.${index}.birth_date`).map((error, i) => (
                  <p key={i} className="text-sm text-destructive">{error}</p>
                ))}
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`ubos.${index}.nationality`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Nationality`}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select nationality`} />
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
                  {getErrorsForField(`ubos.${index}.nationality`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">{t`Place of Birth (Optional)`}</h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`ubos.${index}.place_of_birth_country`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Country`}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    {getErrorsForField(`ubos.${index}.place_of_birth_country`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`ubos.${index}.place_of_birth_city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`City (optional)`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t`City`}
                        onChange={(e) => {
                          field.onChange(e);
                          clearFieldError(`ubos.${index}.place_of_birth_city`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.place_of_birth_city`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">{t`Residential Address (Required)`}</h4>

            <FormField
              control={form.control}
              name={`ubos.${index}.residential_address_line_1`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Street Address`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`Street address`}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.residential_address_line_1`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.residential_address_line_1`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`ubos.${index}.residential_address_city`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`City`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t`City`}
                        onChange={(e) => {
                          field.onChange(e);
                          clearFieldError(`ubos.${index}.residential_address_city`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.residential_address_city`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`ubos.${index}.residential_address_subdivision`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`State/Province`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t`State`}
                        onChange={(e) => {
                          field.onChange(e);
                          clearFieldError(`ubos.${index}.residential_address_subdivision`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.residential_address_subdivision`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`ubos.${index}.residential_address_postal_code`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Postal Code`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t`Postal code`}
                        onChange={(e) => {
                          field.onChange(e);
                          clearFieldError(`ubos.${index}.residential_address_postal_code`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.residential_address_postal_code`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`ubos.${index}.residential_address_country`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Country`}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    {getErrorsForField(`ubos.${index}.residential_address_country`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">{t`Identifying Document`}</h4>
            
            <FormField
              control={form.control}
              name={`ubos.${index}.identifying_document.type`}
              render={({ field }) => {
                const issuingCountry = form.watch(`ubos.${index}.identifying_document.issuing_country`);
                // Bridge only accepts SSN/ITIN for US-issued identifying
                // documents; SSN/ITIN are US-only types elsewhere.
                const availableTypes = issuingCountry === 'USA'
                  ? USA_DOCUMENT_TYPES
                  : DOCUMENT_TYPES.filter((type) => !isUsaDocumentType(type));
                return (
                  <FormItem>
                    <FormLabel>{t`Document Type`}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t`Select document type`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.identifying_document.type`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                );
              }}
            />

            {form.watch(`ubos.${index}.identifying_document.type`) === 'OTHER' && (
              <FormField
                control={form.control}
                name={`ubos.${index}.identifying_document.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t`Document description (required for OTHER)`}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t`Describe the document type`}
                        onChange={(e) => {
                          field.onChange(e);
                          clearFieldError(`ubos.${index}.identifying_document.description`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {getErrorsForField(`ubos.${index}.identifying_document.description`).map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name={`ubos.${index}.identifying_document.issuing_country`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Issuing Country`}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t`Select issuing country`} />
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
                  {getErrorsForField(`ubos.${index}.identifying_document.issuing_country`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.identifying_document.number`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Document Number (optional)`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t`Document number`}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.identifying_document.number`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.identifying_document.number`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.identifying_document.expiration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Expiration Date (optional)`}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.identifying_document.expiration`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.identifying_document.expiration`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            {(() => {
              // SSN/ITIN (US-issued) are number-only entries — no photo upload.
              const docType = form.watch(`ubos.${index}.identifying_document.type`);
              if (!documentTypeRequiresPhoto(docType)) return null;
              return (
                <>
                  <FormField
                    control={form.control}
                    name={`ubos.${index}.identifying_document.image_front`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t`Front Document Image`}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  field.onChange(reader.result as string);
                                  clearFieldError(`ubos.${index}.identifying_document.image_front`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {getErrorsForField(`ubos.${index}.identifying_document.image_front`).map((error, i) => (
                          <p key={i} className="text-sm text-destructive">{error}</p>
                        ))}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ubos.${index}.identifying_document.image_back`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t`Back Document Image (optional)`}</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  field.onChange(reader.result as string);
                                  clearFieldError(`ubos.${index}.identifying_document.image_back`);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {getErrorsForField(`ubos.${index}.identifying_document.image_back`).map((error, i) => (
                          <p key={i} className="text-sm text-destructive">{error}</p>
                        ))}
                      </FormItem>
                    )}
                  />
                </>
              );
            })()}
          </div>

          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium text-sm">{t`Ownership & Roles`}</h4>

            <FormField
              control={form.control}
              name={`ubos.${index}.has_ownership`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Has ownership (25%+)`}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.has_control`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Has control`}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.is_signer`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Is signer`}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.is_director`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t`Is director`}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.title`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Cargo (si ejerce control)`}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder={t`Ej.: CEO, CFO`}
                      onChange={(e) => {
                        field.onChange(e);
                        clearFieldError(`ubos.${index}.title`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.title`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`ubos.${index}.ownership_percentage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t`Ownership Percentage (if owner)`}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      min={0}
                      max={100}
                      placeholder="25"
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        clearFieldError(`ubos.${index}.ownership_percentage`);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {getErrorsForField(`ubos.${index}.ownership_percentage`).map((error, i) => (
                    <p key={i} className="text-sm text-destructive">{error}</p>
                  ))}
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}