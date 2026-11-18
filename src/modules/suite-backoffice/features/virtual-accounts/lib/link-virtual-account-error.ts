/**
 * Why `adminLoopay_linkVirtualAccount` refused a link, in Spanish, for the
 * inline error of the link form (NF-5). The backend answers in English with a
 * stable code; anything unknown is left to the default error mapping.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import { StatePillChipStatusLabel } from '@/shared/components/backoffice/StatePillChip';
import { railCodeLabel } from '@/shared/lib/rail-provider-labels';

type Translate = (descriptor: MessageDescriptor) => string;

interface GraphQLErrorEntry {
  message?: string;
  extensions?: { code?: string; error_code?: string };
}

function firstError(error: unknown): GraphQLErrorEntry | null {
  if (!error || typeof error !== 'object') return null;
  const errors = (error as { response?: { errors?: unknown } }).response?.errors;
  return Array.isArray(errors) && errors.length > 0 ? (errors[0] as GraphQLErrorEntry) : null;
}

const EXISTING_ACCOUNT = /already has an? (\w+) virtual account on rail '([^']+)'/i;
const MISSING_DETAILS = /miss: (.+)$/;

export function describeLinkVirtualAccountError(error: unknown, t: Translate): string | undefined {
  const entry = firstError(error);
  if (!entry) return undefined;

  const message = entry.message ?? '';
  const code = entry.extensions?.error_code ?? entry.extensions?.code ?? '';

  const existing = EXISTING_ACCOUNT.exec(message);
  if (existing) {
    const rail = railCodeLabel(existing[2]);
    const status = StatePillChipStatusLabel(existing[1]);
    return t(
      msg`El cliente ya tiene una cuenta virtual en el riel ${rail} (estado: ${status}). Desactívela antes de vincular otra.`
    );
  }

  if (code === 'VA_BANK_DETAILS_INCOMPLETE' || message.startsWith('Bank details for rail')) {
    const missing = MISSING_DETAILS.exec(message)?.[1] ?? '';
    return missing
      ? t(msg`Faltan datos bancarios del riel: ${missing}.`)
      : t(msg`Faltan datos bancarios del riel.`);
  }

  if (code === 'VA_PROVIDER_NOT_SUPPORTED') {
    return t(msg`Este proveedor no emite cuentas virtuales.`);
  }

  return undefined;
}
