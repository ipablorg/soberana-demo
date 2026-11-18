/**
 * Spanish labels for the readiness issues of `adminLoopay_platformReadiness`.
 *
 * The backend returns free-text English issues (`client-readiness.ts`). The
 * backoffice is operated in Spanish, so each known issue shape is matched and
 * rendered through a Lingui descriptor; unknown issues are shown unchanged so
 * no information is lost.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

type Translate = (descriptor: MessageDescriptor) => string;

const WALLET_DEFAULT_FIELDS: Record<string, MessageDescriptor> = {
  walletProviderId: msg`proveedor de billetera`,
  walletDefaultChain: msg`cadena por defecto`,
  walletDefaultCurrency: msg`moneda por defecto`,
};

interface IssueRule {
  pattern: RegExp;
  label: (match: RegExpMatchArray, t: Translate) => string;
}

const RULES: readonly IssueRule[] = [
  {
    pattern: /^No active client provider rail to a live provider/,
    label: (_match, t) =>
      t(
        msg`El cliente no tiene ningún riel activo con un proveedor vigente: no se puede habilitar ningún riel para sus customers`
      ),
  },
  {
    pattern: /^(\d+) active junction\(s\) still point to dead providers/,
    label: (match, t) => {
      const count = match[1];
      return t(
        msg`${count} relaciones activas apuntan a proveedores retirados: ejecuta el cutover de proveedores retirados para este cliente`
      );
    },
  },
  {
    pattern: /^Wallet defaults missing in client\.config\.defaults: (.+)$/,
    label: (match, t) => {
      const fields = match[1]
        .split(',')
        .map((field) => field.trim())
        .map((field) => {
          const descriptor = WALLET_DEFAULT_FIELDS[field];
          return descriptor ? t(descriptor) : field;
        })
        .join(', ');
      return t(msg`Faltan los valores por defecto de billetera: ${fields}`);
    },
  },
  {
    pattern: /^No active junction to active provider '([^']+)'$/,
    label: (match, t) => {
      const provider = match[1];
      return t(msg`Sin relación activa con el proveedor ${provider}`);
    },
  },
  {
    pattern: /^walletProviderId (\S+) matches no provider/,
    label: (match, t) => {
      const providerId = match[1];
      return t(
        msg`El proveedor de billetera configurado (${providerId}) no existe: se usará el proveedor de custodia por defecto para crear billeteras`
      );
    },
  },
  {
    pattern: /^No wallet provider resolvable/,
    label: (_match, t) =>
      t(msg`No hay proveedor de billetera: al aprobar el KYC no se podrán crear billeteras`),
  },
  {
    pattern: /^Wallet provider '([^']+)' is inactive$/,
    label: (match, t) => {
      const provider = match[1];
      return t(msg`El proveedor de billetera ${provider} está inactivo`);
    },
  },
  {
    pattern: /^Wallet provider '([^']+)' has no config\.wallet/,
    label: (match, t) => {
      const provider = match[1];
      return t(
        msg`El proveedor de billetera ${provider} no tiene cadenas configuradas: la creación de billeteras fallará`
      );
    },
  },
  {
    pattern: /^Wallet chain '([^']+)' is not in config\.wallet\.chains of provider '([^']+)'/,
    label: (match, t) => {
      const chain = match[1];
      const provider = match[2];
      return t(
        msg`La cadena ${chain} no está habilitada en el proveedor ${provider}: la creación de billeteras fallará`
      );
    },
  },
];

/** Spanish label of one readiness issue; unknown issues are returned as-is. */
export function readinessIssueLabel(issue: string, t: Translate): string {
  for (const rule of RULES) {
    const match = issue.match(rule.pattern);
    if (match) return rule.label(match, t);
  }

  return issue;
}

/** One `issue_keys` entry of `adminLoopay_platformReadiness` (#411). */
export interface ReadinessIssueKey {
  key: string;
  params: Record<string, unknown> | null | undefined;
}

const param = (params: ReadinessIssueKey['params'], name: string): string => {
  const value = params?.[name];
  return value === undefined || value === null ? '' : String(value);
};

const KEY_LABELS: Readonly<
  Record<string, (params: ReadinessIssueKey['params'], t: Translate) => string>
> = {
  'readiness.no_live_rail': (_params, t) =>
    t(
      msg`El cliente no tiene ningún riel activo con un proveedor vigente: no se puede habilitar ningún riel para sus customers`
    ),
  'readiness.dead_provider_junctions': (params, t) => {
    const count = param(params, 'count');
    return t(
      msg`${count} relaciones activas apuntan a proveedores retirados: ejecuta el cutover de proveedores retirados para este cliente`
    );
  },
  'readiness.wallet_defaults_missing': (params, t) => {
    const raw = params?.fields;
    const list = Array.isArray(raw) ? raw.map(String) : param(params, 'fields').split(',');
    const fields = list
      .map((field) => field.trim())
      .filter(Boolean)
      .map((field) => {
        const descriptor = WALLET_DEFAULT_FIELDS[field];
        return descriptor ? t(descriptor) : field;
      })
      .join(', ');
    return t(msg`Faltan los valores por defecto de billetera: ${fields}`);
  },
  'readiness.wallet_provider_id_unknown': (params, t) => {
    const providerId = param(params, 'walletProviderId');
    return t(
      msg`El proveedor de billetera configurado (${providerId}) no existe: se usará el proveedor de custodia por defecto para crear billeteras`
    );
  },
  'readiness.no_wallet_provider': (_params, t) =>
    t(msg`No hay proveedor de billetera: al aprobar el KYC no se podrán crear billeteras`),
  'readiness.wallet_provider_inactive': (params, t) => {
    const provider = param(params, 'provider');
    return t(msg`El proveedor de billetera ${provider} está inactivo`);
  },
  'readiness.wallet_provider_not_configured': (params, t) => {
    const provider = param(params, 'provider');
    return t(
      msg`El proveedor de billetera ${provider} no tiene cadenas configuradas: la creación de billeteras fallará`
    );
  },
  'readiness.wallet_chain_unsupported': (params, t) => {
    const chain = param(params, 'chain');
    const provider = param(params, 'provider');
    return t(
      msg`La cadena ${chain} no está habilitada en el proveedor ${provider}: la creación de billeteras fallará`
    );
  },
  'readiness.provider_not_onboarded': (params, t) => {
    const provider = param(params, 'provider');
    return t(
      msg`El cliente no está registrado en ${provider}, que sus rieles habilitados necesitan`
    );
  },
};

/**
 * Spanish label of one readiness `issue_keys` entry; an unknown key falls
 * back to the matching English `issues` text, else to the key itself.
 */
export function readinessIssueKeyLabel(
  issue: ReadinessIssueKey,
  t: Translate,
  fallbackText?: string
): string {
  const label = KEY_LABELS[issue.key];
  if (label) return label(issue.params, t);

  return fallbackText ?? issue.key;
}
