import { useEffect, useState, useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Check, ChevronDown, Loader2, Search, Globe2 } from '@/shared/components/animated-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Input } from '@/shared/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useSidebar } from '@/shared/components/ui/sidebar';
import { useCountryStore, CountryCode } from '@/shared/stores/useCountryStore';
import { useCountries, type Country } from '@/modules/suite-backoffice/hooks/useCountries';
import { cn } from '@/shared/lib/utils';
import { CountriesUnavailable } from './countries-unavailable';
import {
  nextCountriesFailureLatch,
  resolveCountrySelectorView,
} from './country-selector-view';

export function CountrySelector() {
  const { t } = useLingui();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { state } = useSidebar();
  const { selectedCountry, setCountry, setCountries } = useCountryStore();
  const { countries, isLoading, isFetching, error, refetch } = useCountries();
  const isCollapsed = state === 'collapsed';

  // Keeps the "unavailable" view (and its busy retry button) on screen while a
  // retry runs; see country-selector-view for why.
  const [hasFailedBefore, setHasFailedBefore] = useState(false);
  useEffect(() => {
    setHasFailedBefore((latched) =>
      nextCountriesFailureLatch({
        latched,
        hasError: Boolean(error),
        isFetching,
      }),
    );
  }, [error, isFetching]);

  const view = resolveCountrySelectorView({
    countriesLength: countries.length,
    isLoading,
    hasFailed: Boolean(error) || hasFailedBefore,
  });

  // Find current country from GraphQL data
  const currentCountry = countries.find((country: Country) => country.isoCode === selectedCountry);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter((country: Country) => 
      country.name.toLowerCase().includes(query) ||
      country.isoCode.toLowerCase().includes(query) ||
      country.currency.cc.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  // Update countries in store when they change
  useEffect(() => {
    setCountries(countries);
  }, [countries, setCountries]);

  const handleCountrySelect = (code: CountryCode) => {
    setCountry(code);
    setOpen(false);
  };

  // Show loading state if no countries loaded yet
  if (view === 'loading') {
    return (
      <div className="w-full h-12 flex items-center justify-center bg-background/40 backdrop-blur-md border-2 border-border/30 rounded-lg shadow-md">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">
          <Trans>Cargando países...</Trans>
        </span>
      </div>
    );
  }

  // Quiet empty state with a retry when the countries could not be loaded
  if (view === 'unavailable') {
    return (
      <CountriesUnavailable
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        collapsed={isCollapsed}
      />
    );
  }

  // Collapsed version - only flag
  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-center h-12 px-2',
                    'bg-background/40 backdrop-blur-md',
                    'border-2 border-border/30',
                    'hover:bg-background/60 hover:border-primary/30',
                    'transition-colors duration-150',
                    'shadow-md group'
                  )}
                >
                  <Globe2 className="w-5 h-5 text-primary" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>{currentCountry?.name || t`Seleccionar país`}</p>
              {currentCountry && (
                <p className="text-xs text-muted-foreground">{currentCountry.currency.cc}</p>
              )}
            </TooltipContent>
            <PopoverContent
              className={cn(
                'w-[320px] p-0',
                'bg-background/95 backdrop-blur-xl',
                'border-2 border-border/30',
                'shadow-md'
              )}
              align="start"
              side="right"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t`Buscar país, código o moneda...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-background/50"
                  />
                </div>
              </div>

              <ScrollArea className="h-[320px]">
                <div className="p-2">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isLoading ? t`Cargando países...` : 
                       filteredCountries.length === 0 ? t`Sin resultados` :
                       filteredCountries.length === 1 
                         ? t`1 país` 
                         : t`${filteredCountries.length} países`}
                    </p>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  ) : filteredCountries.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        <Trans>Sin resultados</Trans>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Trans>Intenta con otro término</Trans>
                      </p>
                    </div>
                  ) : (
                    filteredCountries.map((country: Country) => {
                      const isSelected = selectedCountry === country.isoCode;

                      return (
                        <motion.button
                          key={country.isoCode}
                          onClick={() => handleCountrySelect(country.isoCode)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                            'transition-colors duration-150',
                            'hover:bg-accent/80 hover:shadow-sm',
                            isSelected && 'bg-primary/10 ring-2 ring-primary/20'
                          )}
                        >
                          <div className="flex-1 flex flex-col items-start">
                            <span className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-primary font-semibold" : "text-foreground"
                            )}>
                              {country.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {country.isoCode} • {country.currency.cc}
                            </span>
                          </div>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border/30 p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  {currentCountry 
                    ? t`Contexto actual: ${currentCountry.name}`
                    : t`Cambia el contexto operativo del backoffice`
                  }
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded version - full display
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between h-12',
            'bg-background/40 backdrop-blur-md',
            'border-2 border-border/30',
            'hover:bg-background/60 hover:border-primary/30',
            'transition-colors duration-150',
            'shadow-md group'
          )}
        >
          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground">
                {currentCountry?.name || t`Seleccionar país`}
              </span>
              {currentCountry && (
                <span className="text-xs text-muted-foreground">
                  {currentCountry.isoCode} • {currentCountry.currency.cc}
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 opacity-50 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[320px] p-0',
          'bg-background/95 backdrop-blur-xl',
          'border-2 border-border/30',
          'shadow-md'
        )}
        align="start"
      >
        {/* Search Input */}
        <div className="p-3 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t`Buscar país, código o moneda...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          <div className="p-2">
            <div className="px-2 py-1.5 mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isLoading ? t`Cargando países...` : 
                 filteredCountries.length === 0 ? t`Sin resultados` :
                 filteredCountries.length === 1 
                   ? t`1 país` 
                   : t`${filteredCountries.length} países`}
              </p>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <Trans>Sin resultados</Trans>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <Trans>Intenta con otro término</Trans>
                </p>
              </div>
            ) : (
              filteredCountries.map((country: Country) => {
                const isSelected = selectedCountry === country.isoCode;

                return (
                  <motion.button
                    key={country.isoCode}
                    onClick={() => handleCountrySelect(country.isoCode)}
                    className={cn(
                      'w-11/12 flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2.5',
                      'transition-colors duration-150',
                      'hover:bg-accent/80 hover:shadow-sm',
                      isSelected && 'bg-primary/10 ring-2 ring-primary/20'
                    )}
                  >
                    <div className="flex-1 flex flex-col items-start">
                      <span className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary font-semibold" : "text-foreground"
                      )}>
                        {country.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {country.isoCode.toUpperCase()} • {country.currency.cc}
                      </span>
                    </div>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Context indicator */}
        <div className="border-t border-border/30 p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            {currentCountry 
              ? t`Contexto actual: ${currentCountry.name}`
              : t`Cambia el contexto operativo del backoffice`
            }
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
