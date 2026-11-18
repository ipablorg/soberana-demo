export interface RetentionResult {
  gross: number;
  retentionRate: number;
  retentionAmount: number;
  net: number;
  certificateRequired: boolean;
  regime: string;
}

const RETENTION_RATES: Record<string, number> = {
  EC: 0.05,  // Ecuador SRI — servicios profesionales 2026
  CO: 0.04,  // Colombia DIAN — retención en la fuente servicios
  MX: 0.1,   // México SAT — honorarios
  PE: 0.08,  // Perú SUNAT
  CL: 0.1,   // Chile SII
  DEFAULT: 0.0,
};

const REGIME_LABELS: Record<string, string> = {
  EC: 'SRI Ecuador',
  CO: 'DIAN Colombia',
  MX: 'SAT México',
  PE: 'SUNAT Perú',
  CL: 'SII Chile',
  DEFAULT: 'Sin retención',
};

export function calculateRetention(
  gross: number,
  countryCode: string,
): RetentionResult {
  const rate = RETENTION_RATES[countryCode] ?? RETENTION_RATES['DEFAULT'] ?? 0;
  const retentionAmount = Math.round(gross * rate * 100) / 100;
  const net = Math.round((gross - retentionAmount) * 100) / 100;
  return {
    gross,
    retentionRate: rate,
    retentionAmount,
    net,
    certificateRequired: rate > 0,
    regime: REGIME_LABELS[countryCode] ?? REGIME_LABELS['DEFAULT'] ?? 'Sin retención',
  };
}

export function formatRetentionRate(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}
