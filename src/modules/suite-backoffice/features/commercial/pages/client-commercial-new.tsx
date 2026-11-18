/**
 * `/backoffice/commercial/clients/new` — create a client and onboard it at the
 * selected providers in one step. A provider failure does not undo the client:
 * the per-provider outcome is shown with a link to the client detail.
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';

import type { OnboardingResult } from '@/graphql/mutations/admin-commercial';
import { Loader2 } from '@/shared/components/animated-icons';
import { PageHeader } from '@/shared/components/common/PageHeader';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import { OptionSelect } from '../../../components/option-select';
import { MestaProfileForm } from '../components/mesta-profile-form';
import { useCountryIso3Options } from '../../../lib/country-options';
import { CountryMultiSelect } from '../components/country-multi-select';

import { useTaxIdTypes } from '../../clients/hooks/use-clients';
import { formatOpsText } from '../../ops-review/lib/ops-formatting';
import { useCreateAndOnboardClient } from '../hooks/use-commercial';
import { useOnboardingProviders } from '../hooks/use-onboarding-providers';
import { onboardingStatusLabel } from '../lib/commercial-labels';
import { describeMissingMestaFields } from '../lib/mesta-labels';
import {
  EMPTY_MESTA_PROFILE_FORM,
  buildMestaProfileInput,
  defaultTaxIdTypeId,
  missingMestaFields,
  taxIdTypeOptions,
  type MestaProfileForm as MestaProfileFormState,
} from '../lib/mesta-profile';
import {
  EMPTY_CREATE_CLIENT_FORM,
  buildCreateAndOnboardInput,
  effectiveAllowedCountries,
  isCreateClientFormValid,
  onboardingBadgeVariant,
  type CreateClientFormState,
  type OnboardingProvider,
} from '../lib/commercial-logic';

interface CreatedState {
  clientId: string;
  name: string;
  results: OnboardingResult[];
}

export default function ClientCommercialNew() {
  const { t } = useLingui();
  const [form, setForm] = useState<CreateClientFormState>(EMPTY_CREATE_CLIENT_FORM);
  const availableProviders = useOnboardingProviders();
  const countryOptions = useCountryIso3Options();
  const [mestaForm, setMestaForm] = useState<MestaProfileFormState>(EMPTY_MESTA_PROFILE_FORM);
  const [created, setCreated] = useState<CreatedState | null>(null);

  // The tax id type is a catalog: the select stores its id and shows its code.
  const { data: taxIdTypesData } = useTaxIdTypes();
  const taxIdTypes = taxIdTypesData?.adminLoopay_listTaxIdTypes ?? [];

  const create = useCreateAndOnboardClient((result) => {
    const payload = result.adminLoopay_createAndOnboardClient;
    setCreated({
      clientId: payload.client.id,
      name: payload.client.name,
      results: payload.results,
    });
    setForm(EMPTY_CREATE_CLIENT_FORM);
    setMestaForm(EMPTY_MESTA_PROFILE_FORM);
  });

  const setField = <K extends keyof CreateClientFormState>(
    key: K,
    value: CreateClientFormState[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const toggleProvider = (provider: OnboardingProvider, checked: boolean) =>
    setField(
      'providers',
      checked
        ? [...form.providers.filter((p) => p !== provider), provider]
        : form.providers.filter((p) => p !== provider),
    );

  // Only providers the catalog still offers can be submitted.
  const effectiveForm: CreateClientFormState = {
    ...form,
    providers: form.providers.filter((p) => availableProviders.includes(p)),
  };
  const mestaSelected = effectiveForm.providers.includes('mesta');
  const mestaMissing = mestaSelected ? missingMestaFields(mestaForm) : [];
  const canSubmit =
    isCreateClientFormValid(effectiveForm) && mestaMissing.length === 0 && !create.isPending;

  const submit = () =>
    create.mutate({
      input: {
        ...buildCreateAndOnboardInput(effectiveForm),
        ...(mestaSelected ? { onboardingProfile: buildMestaProfileInput(mestaForm) } : {}),
      },
    });

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader
        title={t`Create and onboard client`}
        subtitle={t`Creates the client and onboards it at the selected providers`}
      />

      {created ? (
        <section className="rounded-xl border border-border p-4 space-y-3" role="status">
          <h2 className="text-base font-semibold">
            <Trans>{created.name} was created</Trans>
          </h2>
          <ul className="space-y-1 text-sm">
            {created.results.map((result) => (
              <li key={result.provider} className="flex flex-wrap items-center gap-2">
                <span className="font-medium uppercase">{result.provider}</span>
                <Badge variant={onboardingBadgeVariant(result.status)}>
                  {onboardingStatusLabel(result.status, (d) => t(d))}
                </Badge>
                {result.missingFields && result.missingFields.length > 0 ? (
                  <span className="text-xs text-destructive">
                    {describeMissingMestaFields(result.missingFields, (d) => t(d))}
                  </span>
                ) : result.errorCode ? (
                  <span className="font-mono text-xs">{formatOpsText(result.errorCode)}</span>
                ) : null}
                {result.verificationUrl ? (
                  <a
                    className="text-primary underline"
                    href={result.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Trans>Verification form</Trans>
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link to={`/backoffice/commercial/clients/${created.clientId}`}>
              <Trans>Open client</Trans>
            </Link>
          </Button>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new-client-name">
            <Trans>Name</Trans>
          </Label>
          <Input
            id="new-client-name"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-client-email">
            <Trans>Email</Trans>
          </Label>
          <Input
            id="new-client-email"
            type="email"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-client-tax-id">
            <Trans>Tax ID</Trans>
          </Label>
          <Input
            id="new-client-tax-id"
            value={form.taxId}
            onChange={(event) => setField('taxId', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-client-tax-id-type">
            <Trans>Tax ID type</Trans>
          </Label>
          <OptionSelect
            id="new-client-tax-id-type"
            value={form.taxIdTypeId}
            onChange={(value) => setField('taxIdTypeId', value)}
            options={taxIdTypeOptions(taxIdTypes, form.country)}
            placeholder={t`Select a tax ID type`}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-client-country">
            <Trans>Country</Trans>
          </Label>
          <OptionSelect
            id="new-client-country"
            value={form.country}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                country: value,
                taxIdTypeId:
                  current.taxIdTypeId || (defaultTaxIdTypeId(taxIdTypes, value) ?? ''),
              }))
            }
            options={countryOptions}
            placeholder={t`Select a country`}
          />
        </div>
      </div>

      <CountryMultiSelect
        legend={t`Países donde el cliente opera con sus customers`}
        options={countryOptions}
        value={effectiveAllowedCountries(form)}
        onChange={(next) => setField('allowedCountries', next)}
        disabled={create.isPending}
      />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          <Trans>Onboard at providers</Trans>
        </legend>
        <div className="flex flex-wrap gap-4">
          {availableProviders.map((provider) => (
            <label key={provider} className="flex items-center gap-2 text-sm uppercase">
              <Checkbox
                checked={effectiveForm.providers.includes(provider)}
                onCheckedChange={(checked) => toggleProvider(provider, checked === true)}
                aria-label={provider}
              />
              {provider}
            </label>
          ))}
        </div>
      </fieldset>

      {mestaSelected ? (
        <section className="space-y-2" aria-live="polite">
          <MestaProfileForm
            value={mestaForm}
            onChange={setMestaForm}
            idPrefix="new-client-mesta"
            disabled={create.isPending}
          />
          {mestaMissing.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              {describeMissingMestaFields(mestaMissing, (d) => t(d))}
            </p>
          ) : null}
        </section>
      ) : null}

      <Button disabled={!canSubmit} onClick={submit}>
        {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        <Trans>Create and onboard</Trans>
      </Button>
    </div>
  );
}
