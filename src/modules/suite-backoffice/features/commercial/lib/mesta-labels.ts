/**
 * Human labels of the Mesta business profile: fields, select options and the
 * "what is missing" sentence. Lingui descriptors so they stay translatable;
 * callers resolve them with `t` from `useLingui()`.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type { SelectOption } from '../../platform-config/lib/catalog-options';

import {
  MESTA_BUSINESS_TYPE_VALUES,
  MESTA_JURISDICTION_CODES,
  MESTA_NATURE_OF_PAYMENTS_VALUES,
  MESTA_SOURCE_OF_FUNDS_VALUES,
  type MestaProfileFieldKey,
} from './mesta-profile';

type Translate = (descriptor: MessageDescriptor) => string;

const FIELD_LABELS: Record<MestaProfileFieldKey | 'taxId', MessageDescriptor> = {
  phone: msg`Teléfono`,
  addressStreet: msg`Calle`,
  addressCity: msg`Ciudad`,
  addressPostalCode: msg`Código postal`,
  registrationDate: msg`Fecha de constitución`,
  businessType: msg`Tipo de empresa`,
  isFinancialInstitution: msg`¿Es una institución financiera?`,
  numberOfEmployees: msg`Número de empleados`,
  expectedMonthlyVolumeEstimate: msg`Volumen mensual estimado (USD)`,
  averageTransactionSize: msg`Monto promedio por transacción (USD)`,
  primaryCounterpartyJurisdictions: msg`Países de las contrapartes`,
  natureOfPayments: msg`Naturaleza de los pagos`,
  sourceOfFunds: msg`Origen de los fondos`,
  websiteAbsenceReason: msg`Motivo por el que no tiene sitio web`,
  taxId: msg`ID fiscal del cliente (se edita en el cliente)`,
};

/** Label of a backend missing-field name; unknown names are shown as they come. */
export function mestaFieldLabel(key: string, t: Translate): string {
  const descriptor = (FIELD_LABELS as Record<string, MessageDescriptor | undefined>)[key];

  return descriptor ? t(descriptor) : key;
}

/** "Mesta necesita estos datos de la empresa: Teléfono, Calle, ..." */
export function describeMissingMestaFields(missing: readonly string[], t: Translate): string {
  const labels = missing.map((key) => mestaFieldLabel(key, t));

  return `${t(msg`Mesta necesita estos datos de la empresa:`)} ${labels.join(', ')}`;
}

const BUSINESS_TYPE_LABELS: Record<(typeof MESTA_BUSINESS_TYPE_VALUES)[number], MessageDescriptor> =
  {
    sole_proprietorship: msg`Empresa unipersonal`,
    partnership: msg`Sociedad colectiva`,
    corporation: msg`Sociedad anónima`,
    limited_liability_company: msg`Sociedad de responsabilidad limitada`,
    other: msg`Otro`,
  };

const SOURCE_OF_FUNDS_LABELS: Record<
  (typeof MESTA_SOURCE_OF_FUNDS_VALUES)[number],
  MessageDescriptor
> = {
  business_income: msg`Ingresos del negocio`,
  salary: msg`Salario`,
  saving: msg`Ahorros`,
  advance_from_director: msg`Anticipo de un director`,
};

const NATURE_OF_PAYMENTS_LABELS: Record<
  (typeof MESTA_NATURE_OF_PAYMENTS_VALUES)[number],
  MessageDescriptor
> = {
  payment_for_goods_and_services: msg`Pago de bienes y servicios`,
  vendor_payment: msg`Pago a proveedores`,
  operational_expense: msg`Gastos operativos`,
  administrative_expenses: msg`Gastos administrativos`,
  accounting_services: msg`Servicios contables`,
  legal_services: msg`Servicios legales`,
  subsidiary_transfer: msg`Transferencia a filial`,
};

const JURISDICTION_LABELS: Record<(typeof MESTA_JURISDICTION_CODES)[number], MessageDescriptor> = {
  US: msg`Estados Unidos`,
  CO: msg`Colombia`,
  MX: msg`México`,
  BR: msg`Brasil`,
  PE: msg`Perú`,
  EC: msg`Ecuador`,
  PA: msg`Panamá`,
  CL: msg`Chile`,
  AR: msg`Argentina`,
  GB: msg`Reino Unido`,
  ES: msg`España`,
  DE: msg`Alemania`,
  FR: msg`Francia`,
};

function options<K extends string>(
  values: readonly K[],
  labels: Record<K, MessageDescriptor>,
  t: Translate,
  withCode = false
): SelectOption[] {
  return values.map((value) => ({
    value,
    label: withCode ? `${t(labels[value])} (${value})` : t(labels[value]),
  }));
}

export const businessTypeOptions = (t: Translate) =>
  options(MESTA_BUSINESS_TYPE_VALUES, BUSINESS_TYPE_LABELS, t);
export const sourceOfFundsOptions = (t: Translate) =>
  options(MESTA_SOURCE_OF_FUNDS_VALUES, SOURCE_OF_FUNDS_LABELS, t);
export const natureOfPaymentsOptions = (t: Translate) =>
  options(MESTA_NATURE_OF_PAYMENTS_VALUES, NATURE_OF_PAYMENTS_LABELS, t);
export const jurisdictionOptions = (t: Translate) =>
  options(MESTA_JURISDICTION_CODES, JURISDICTION_LABELS, t, true);

export const employeeRangeOptions = (): SelectOption[] => [
  { value: '1', label: '1' },
  { value: '2-10', label: '2-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-1000', label: '201-1000' },
  { value: '1000+', label: '1000+' },
];
