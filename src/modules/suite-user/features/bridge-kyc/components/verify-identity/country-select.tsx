import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { Check, ChevronDown } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';
import { KYC_COUNTRY_CATALOG } from '@/shared/lib/kyc/static-catalog';
import { kycCountryDisplayName } from '@/shared/lib/kyc/country-display-name';

/** Catalog countries named in the user's language (the catalog keeps English names). */
function localizedCountries() {
  return KYC_COUNTRY_CATALOG.map((country) => ({
    code: country.iso3,
    name: kycCountryDisplayName(country),
  }));
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, placeholder, disabled }: CountrySelectProps) {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const countries = localizedCountries();

  const selected = countries.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal h-10"
        >
          {selected ? (
            <span>{selected.name}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? t`Select country`}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={t`Search country...`} />
          <CommandList>
            <CommandEmpty>{t`No country found.`}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code}`}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.code ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {country.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
