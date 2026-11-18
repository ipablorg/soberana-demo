import {
  COUNTRY_CAPABILITIES,
  COLLECTION_METHODS,
  DISBURSEMENT_METHODS,
} from './country-capabilities.data';
import { VOLUME_PRICING_TABLES } from './volume-pricing.data';
import type { VolumeRange } from '../types';

export const COUNTRY_FLAGS: Record<string, string> = {
  USA: '🇺🇸',
  Colombia: '🇨🇴',
  'Zona Sepa': '🇪🇺',
  Perú: '🇵🇪',
  Brasil: '🇧🇷',
  México: '🇲🇽',
  'Hong Kong': '🇭🇰',
  Panamá: '🇵🇦',
  Venezuela: '🇻🇪',
  Chile: '🇨🇱',
  Global: '🌐',
};

// ─── Country-level service availability ──────────────────────────

export interface CountryNeed {
  id: 'collection' | 'disbursement' | 'international';
  label: string;
  description: string;
}

function getCollectionDescription(country: string): string {
  const row = COLLECTION_METHODS.find((m) => m.country === country);
  if (!row) return '';
  const methods: string[] = [];
  if (row.bankTransfer) methods.push('Transferencia');
  if (row.paymentLink) methods.push('Link de pago');
  if (row.creditDebitCard) methods.push('Tarjeta');
  if (row.qr) methods.push('QR');
  if (row.wallet) methods.push('Wallet');
  return methods.join(', ');
}

function getDisbursementDescription(country: string): string {
  const row = DISBURSEMENT_METHODS.find((m) => m.country === country);
  if (!row) return '';
  const parts: string[] = [];
  if (row.bankTransfer) parts.push(row.bankTransfer);
  if (row.wallet) parts.push('Wallet');
  return parts.join(', ');
}

export function getAvailableNeeds(country: string): CountryNeed[] {
  const needs: CountryNeed[] = [];

  const hasCollection = COLLECTION_METHODS.some((m) => m.country === country);
  if (hasCollection) {
    needs.push({
      id: 'collection',
      label: `Cobrar en ${country}`,
      description: getCollectionDescription(country),
    });
  }

  const hasDisbursement = DISBURSEMENT_METHODS.some((m) => m.country === country);
  if (hasDisbursement) {
    needs.push({
      id: 'disbursement',
      label: `Pagar en ${country}`,
      description: getDisbursementDescription(country),
    });
  }

  const cap = COUNTRY_CAPABILITIES.find((c) => c.country === country);
  const hasInternational = cap?.corridors.some(
    (c) => c.operationProcess !== 'SIN CANAL' && c.destination && c.destination !== country,
  );
  if (hasInternational) {
    needs.push({
      id: 'international',
      label: 'Enviar al exterior',
      description: 'Pagos crossborder, On/Off Ramp, crypto',
    });
  }

  return needs;
}

// ─── Active countries for the wizard ─────────────────────────────

export function getWizardCountries(): string[] {
  return COUNTRY_CAPABILITIES
    .filter((c) => c.status !== 'no-channel')
    .map((c) => c.country);
}

// ─── International helpers (kept from v1) ────────────────────────

export function getAvailableDestinations(originCountry: string): string[] {
  const country = COUNTRY_CAPABILITIES.find((c) => c.country === originCountry);
  if (!country) return [];

  const destinations = country.corridors
    .filter(
      (c) =>
        c.operationProcess !== 'SIN CANAL' &&
        c.destination &&
        c.destination !== originCountry,
    )
    .map((c) => c.destination);

  return [...new Set(destinations)];
}

export function getAvailableProductTypes(originCountry: string, destination: string): string[] {
  const country = COUNTRY_CAPABILITIES.find((c) => c.country === originCountry);
  if (!country) return [];

  const products = country.corridors
    .filter(
      (c) =>
        c.destination === destination &&
        c.operationProcess !== 'SIN CANAL' &&
        c.product,
    )
    .map((c) => c.product as string);

  return [...new Set(products)];
}

export function lookupVolumeRate(
  origin: string,
  destination: string,
  range: VolumeRange,
): string | null {
  const table = VOLUME_PRICING_TABLES.find((t) => t.origin === origin);
  if (!table) return null;
  const corridor = table.corridors.find((c) => c.destination === destination);
  return corridor?.rates[range] ?? null;
}

export const VOLUME_RANGE_MIN_VALUES: Record<VolumeRange, number> = {
  '0-2.5MM': 500_000,
  '2.5-5MM': 2_500_000,
  '5-10MM': 5_000_000,
  '10-20MM': 10_000_000,
  '20-40MM': 20_000_000,
  '40MM+': 40_000_000,
};
