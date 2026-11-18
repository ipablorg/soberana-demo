import type { CalculatorCorridor, ClientRate } from '../types';

export const COMEX_CORRIDORS: CalculatorCorridor[] = [
  { value: 'COP/USD', label: 'COP / USD', category: 'COMEX' },
  { value: 'COP/SOLES', label: 'COP / SOLES', category: 'COMEX' },
  { value: 'COP/USDT/USD/EUR', label: 'COP / USDT / USD / EUR', category: 'COMEX' },
  { value: 'COP/USD/EUR', label: 'COP / USD / EUR', category: 'COMEX' },
  { value: 'COP/USD/HKD', label: 'COP / USD / HKD', category: 'COMEX' },
  { value: 'COP/MXN', label: 'COP / MXN', category: 'COMEX' },
  { value: 'USD/MXN', label: 'USD / MXN', category: 'COMEX' },
  { value: 'USD/COP', label: 'USD / COP', category: 'COMEX' },
  { value: 'USD/HKN', label: 'USD / HKN', category: 'COMEX' },
  { value: 'USD/PANAMA', label: 'USD / PANAMA', category: 'COMEX' },
  { value: 'PANAMA/USD', label: 'PANAMA / USD', category: 'COMEX' },
  { value: 'USD/EUR', label: 'USD / EUR', category: 'COMEX' },
  { value: 'USD/CLP', label: 'USD / CLP', category: 'COMEX' },
  { value: 'USD/HKD', label: 'USD / HKD', category: 'COMEX' },
  { value: 'SOLES/USD/COP', label: 'SOLES / USD / COP', category: 'COMEX' },
  { value: 'SOLES/USD', label: 'SOLES / USD', category: 'COMEX' },
  { value: 'SOLES/PANAMA', label: 'SOLES / Panamá (Brex)', category: 'COMEX' },
  { value: 'EUR-USD', label: 'EUR – USD', category: 'COMEX' },
  { value: 'EUR-COP', label: 'EUR – COP', category: 'COMEX' },
  { value: 'EUR-MXN', label: 'EUR – MXN', category: 'COMEX' },
  { value: 'EUR-BRL', label: 'EUR – BRL', category: 'COMEX' },
];

export const OFF_RAMP_CORRIDORS: CalculatorCorridor[] = [
  { value: 'USDT/HKD', label: 'USDT / HKD', category: 'OFF_RAMP' },
  { value: 'USDT-USD/MXN', label: 'USDT – USD / MXN USD', category: 'OFF_RAMP' },
  { value: 'USDT/USD', label: 'USDT / USD', category: 'OFF_RAMP' },
  { value: 'USDT/USD/PANAMA', label: 'USDT / USD / PANAMA', category: 'OFF_RAMP' },
  { value: 'USDT/USD/COP', label: 'USDT / USD / COP', category: 'OFF_RAMP' },
  { value: 'USDT/USD/EUR', label: 'USDT / USD / EUR', category: 'OFF_RAMP' },
  { value: 'USDT/SOLES', label: 'USDT / SOLES', category: 'OFF_RAMP' },
];

export const ON_RAMP_CORRIDORS: CalculatorCorridor[] = [
  { value: 'COP/USDT', label: 'COP / USDT', category: 'ON_RAMP' },
  { value: 'COP/USDT/USD/EUR', label: 'COP / USDT / USD / EUR', category: 'ON_RAMP' },
  { value: 'USD/USDT', label: 'USD / USDT', category: 'ON_RAMP' },
  { value: 'EUR-USDT', label: 'EUR – USDT', category: 'ON_RAMP' },
  { value: 'SOLES/USDT', label: 'SOLES / USDT', category: 'ON_RAMP' },
];

export const CLIENT_RATES: ClientRate[] = [
  { name: 'TECTRIX', rate: '1%' },
  { name: 'WOLFIBITE', rate: '0.45%' },
  { name: 'VANK', rate: '0.40%' },
  { name: 'JHON RODRIGUEZ', rate: '0.45%' },
  { name: 'JJ CONSULTING CORP', rate: '0.40%' },
  { name: 'BEU INC', rate: '1%' },
  { name: 'WALLIB', rate: '0.40%' },
  { name: 'ORANGE INVESTMENT', rate: '0.40%' },
  { name: 'Jhon Rodriguez', rate: '0.40%' },
  { name: 'Colcambios', rate: '0.40%' },
  { name: 'Justiwallet', rate: '0.60%' },
];
