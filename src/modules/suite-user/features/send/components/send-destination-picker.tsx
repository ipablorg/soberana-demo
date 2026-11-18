/**
 * SendDestinationPicker
 *
 * Step 1 of the send flow: country -> rail -> beneficiary. Beneficiaries the
 * provider has not approved yet (En revisión / Rechazado) are listed disabled
 * with the reason, so the user knows why they cannot be picked.
 */

import { useMemo, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

import { ReviewStatusBadge } from '@/modules/suite-user/features/beneficiaries/components/review-status-badge';
import { useReviewHint } from '@/modules/suite-user/features/beneficiaries/hooks/use-review-hint';
import {
  countryLabel,
  payoutCountries,
  payoutRails,
  type RailCatalogue,
} from '@/modules/suite-user/features/beneficiaries/lib/rail-catalogue';
import { ArrowRight, Landmark, User } from '@/shared/components/animated-icons';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';

import {
  beneficiariesForRail,
  defaultDestination,
  partitionByReview,
  type SendDestinationBeneficiary,
} from '../lib/send-destination';

export interface PickerBeneficiary extends SendDestinationBeneficiary {
  beneficiary_name: string;
  bank_name?: string | null;
  currency?: string | null;
}

interface SendDestinationPickerProps<T extends PickerBeneficiary> {
  beneficiaries: readonly T[];
  catalogue: RailCatalogue | undefined;
  catalogueLoading: boolean;
  catalogueError: boolean;
  onSelect: (beneficiary: T) => void;
  onAddBeneficiary: () => void;
}

function BeneficiaryRow<T extends PickerBeneficiary>({
  beneficiary,
  railName,
  onSelect,
}: {
  beneficiary: T;
  railName: string;
  onSelect: (beneficiary: T) => void;
}) {
  const { t } = useLingui();
  const hint = useReviewHint(beneficiary);
  const blocked = hint !== null;

  return (
    <button
      type="button"
      data-beneficiary-id={beneficiary.id}
      disabled={blocked}
      aria-disabled={blocked}
      onClick={() => {
        if (!blocked) onSelect(beneficiary);
      }}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors duration-150',
        blocked ? 'cursor-not-allowed opacity-70' : 'hover:bg-muted',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Landmark className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{beneficiary.beneficiary_name || '—'}</p>
        <p className="truncate text-xs text-muted-foreground">
          {beneficiary.bank_name || t`Cuenta bancaria`}
          {beneficiary.currency ? ` · ${beneficiary.currency}` : ''}
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {blocked ? (
        <ReviewStatusBadge beneficiary={beneficiary} />
      ) : (
        <>
          <Badge variant="outline">{railName}</Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </>
      )}
    </button>
  );
}

export function SendDestinationPicker<T extends PickerBeneficiary>({
  beneficiaries,
  catalogue,
  catalogueLoading,
  catalogueError,
  onSelect,
  onAddBeneficiary,
}: SendDestinationPickerProps<T>) {
  const { t } = useLingui();
  const [chosen, setChosen] = useState<{ country: string; railCode: string } | null>(null);

  const initial = useMemo(() => defaultDestination(catalogue, beneficiaries), [catalogue, beneficiaries]);
  const { country, railCode } = chosen ?? initial;

  const countries = useMemo(() => payoutCountries(catalogue), [catalogue]);
  const rails = useMemo(() => payoutRails(catalogue, country), [catalogue, country]);
  const rail = rails.find((candidate) => candidate.code === railCode) ?? (rails.length === 1 ? rails[0] : undefined);

  const listed = useMemo(() => {
    if (!country || !rail) return null;
    const matching = beneficiariesForRail(beneficiaries, country, rail.code);
    const { usable, blocked } = partitionByReview(matching);
    return [...usable, ...blocked];
  }, [beneficiaries, country, rail]);

  if (catalogueLoading) {
    return (
      <div data-testid="destination-loading" className="space-y-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (catalogueError) {
    return (
      <p role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
        <Trans>No pudimos cargar los países y rutas disponibles. Inténtalo de nuevo en unos minutos.</Trans>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="send-country">
          <Trans>País de destino</Trans>
        </Label>
        <Select
          value={country || undefined}
          onValueChange={(next) => {
            const available = payoutRails(catalogue, next);
            setChosen({ country: next, railCode: available.length === 1 ? available[0].code : '' });
          }}
        >
          <SelectTrigger id="send-country" className="h-11 rounded-lg">
            <SelectValue placeholder={t`Selecciona un país`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {countries.map((entry) => (
              <SelectItem key={entry.country} value={entry.country}>
                {countryLabel(entry.country)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {country && rails.length > 1 && (
        <div role="group" aria-label={t`Ruta`}>
          <Label>
            <Trans>Ruta</Trans>
          </Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {rails.map((option) => (
              <button
                key={option.code}
                type="button"
                aria-pressed={option.code === rail?.code}
                onClick={() => setChosen({ country, railCode: option.code })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition-colors duration-150',
                  option.code === rail?.code
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted',
                )}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {country && !rail && rails.length > 1 && (
        <p className="text-sm text-muted-foreground">
          <Trans>Elige la ruta para ver tus cuentas guardadas.</Trans>
        </p>
      )}

      {listed && listed.length > 0 && (
        <div className="space-y-2">
          {listed.map((beneficiary) => (
            <BeneficiaryRow key={beneficiary.id} beneficiary={beneficiary} railName={rail?.name ?? ''} onSelect={onSelect} />
          ))}
        </div>
      )}

      {listed && listed.length === 0 && (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-3 rounded-full bg-muted p-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">
            <Trans>Aún no tienes cuentas en esta ruta.</Trans>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <Trans>Guarda una y te la mostramos aquí.</Trans>
          </p>
          <Button variant="gradient" className="mt-4" onClick={onAddBeneficiary}>
            <Trans>Agregar beneficiario</Trans>
          </Button>
        </div>
      )}
    </div>
  );
}
