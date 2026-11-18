const RECEIVE_RAIL_LABELS: Record<string, string> = {
  co_breb: 'COP',
  ec_bank_transfer: 'ECU Transferencia',
  ec_point_of_sale: 'ECU Punto físico',
  pe_bank_transfer: 'PER Transferencia',
  faster_payments: 'GBR',
};

const RECEIVE_RAIL_CURRENCIES: Record<string, string> = {
  ach: 'USD',
  wire: 'USD',
  us_ach: 'USD',
  us_wire: 'USD',
  pix: 'BRL',
  spei: 'MXN',
  sepa: 'EUR',
  iban: 'EUR',
  co_ach: 'COP',
  co_breb: 'COP',
  ec_bank_transfer: 'USD',
  ec_point_of_sale: 'USD',
  pe_bank_transfer: 'PEN',
  faster_payments: 'GBP',
};

const RAIL_ACRONYMS: Record<string, string> = {
  ach: 'ACH',
  breb: 'BRE-B',
  iban: 'IBAN',
  pix: 'PIX',
  pos: 'POS',
  sepa: 'SEPA',
  spei: 'SPEI',
  wire: 'Wire',
};

function normalizeRailCode(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function isRawRailCode(value: string): boolean {
  return /^[A-Z0-9_]+$/.test(value.trim());
}

function prettifyRailCode(code: string): string {
  return code
    .split('_')
    .filter(Boolean)
    .map((part) => RAIL_ACRONYMS[part] ?? `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}

function getMeaningfulBackendRailName(
  railCode: string,
  railName: string | null | undefined,
): string | null {
  const trimmed = railName?.trim();

  if (!trimmed) {
    return null;
  }

  if (normalizeRailCode(trimmed) === railCode || isRawRailCode(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getReceiveRailCurrency(railCode: string): string | null {
  return RECEIVE_RAIL_CURRENCIES[normalizeRailCode(railCode)] ?? null;
}

export function getReceiveRailLabel({
  railCode,
  railName,
}: {
  railCode: string;
  railName?: string | null;
}): string {
  const normalizedRail = normalizeRailCode(railCode);

  return (
    RECEIVE_RAIL_LABELS[normalizedRail] ??
    getMeaningfulBackendRailName(normalizedRail, railName) ??
    prettifyRailCode(normalizedRail)
  );
}
