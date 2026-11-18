/**
 * Countries where the client operates with its customers. Without them the
 * client API rejects customer creation, so the card says so until they are set.
 * Defaults to the own country of the client (data the system already has).
 */

import { useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { Loader2 } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';

import { useCountryIso3Options } from '../../../lib/country-options';
import { useUpdateAllowedCountries } from '../hooks/use-commercial';
import { defaultAllowedCountries, readAllowedCountries } from '../lib/client-operation';
import { CountryMultiSelect } from './country-multi-select';

interface AllowedCountriesCardProps {
  clientId: string;
  clientCountry: string | null | undefined;
  config: unknown;
}

export function AllowedCountriesCard({
  clientId,
  clientCountry,
  config,
}: AllowedCountriesCardProps) {
  const { t } = useLingui();
  const options = useCountryIso3Options();
  const stored = readAllowedCountries(config);
  const [selected, setSelected] = useState<string[]>(
    stored ?? defaultAllowedCountries(clientCountry)
  );
  const update = useUpdateAllowedCountries(clientId);

  return (
    <section
      className="rounded-xl border border-border p-4 space-y-4"
      data-testid="allowed-countries-card"
    >
      <header className="space-y-1">
        <h3 className="text-base font-semibold">
          <Trans>Países del cliente</Trans>
        </h3>
        {stored === null ? (
          <p role="alert" className="text-sm text-destructive">
            <Trans>Sin países configurados el cliente no puede crear customers por la API.</Trans>
          </p>
        ) : null}
      </header>

      <CountryMultiSelect
        legend={t`Países donde el cliente opera con sus customers`}
        options={options}
        value={selected}
        onChange={setSelected}
        disabled={update.isPending}
      />

      <Button
        disabled={selected.length === 0 || update.isPending}
        onClick={() => update.mutate({ clientId, countries: selected })}
      >
        {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        <Trans>Guardar países</Trans>
      </Button>
    </section>
  );
}
