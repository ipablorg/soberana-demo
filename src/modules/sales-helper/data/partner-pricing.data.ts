import type { VolumePricingTable } from '../types';

export const PARTNER_PRICING_TABLES: VolumePricingTable[] = [
  {
    origin: 'USA',
    label: 'USA Crossborder — Aliados',
    corridors: [
      { corridor: 'USD-COP', destination: 'Colombia', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.57%', '5-10MM': '0.54%', '10-20MM': '0.51%', '20-40MM': '0.48%' } },
      { corridor: 'USD/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'USD/REALES', destination: 'Brasil', rates: { '0-2.5MM': '0.58%', '2.5-5MM': '0.55%', '5-10MM': '0.52%', '10-20MM': '0.49%', '20-40MM': '0.46%' } },
      { corridor: 'USD/HKD', destination: 'Hong Kong', rates: { '0-2.5MM': '1.12%', '2.5-5MM': '1.09%', '5-10MM': '1.06%', '10-20MM': '1.03%', '20-40MM': '1.00%' } },
      { corridor: 'USD/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%' } },
      { corridor: 'USDT/COP', destination: 'Off Ramp', rates: { '0-2.5MM': '0.57%', '2.5-5MM': '0.54%', '5-10MM': '0.51%', '10-20MM': '0.48%', '20-40MM': '0.45%' } },
      { corridor: 'USDT/USD', destination: 'Swap', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'USD/CLP', destination: 'Chile', rates: { '0-2.5MM': '0.90%', '2.5-5MM': '0.85%', '5-10MM': '0.80%', '10-20MM': '0.75%', '20-40MM': '0.70%' } },
    ],
  },
  {
    origin: 'Colombia',
    label: 'Colombia Crossborder — Aliados',
    corridors: [
      { corridor: 'COP/USD', destination: 'USA', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'COP/USD/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.62%', '2.5-5MM': '0.59%', '5-10MM': '0.56%', '10-20MM': '0.53%', '20-40MM': '0.50%' } },
      { corridor: 'COP/SOLES', destination: 'Perú', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'COP/REAL', destination: 'Brasil', rates: { '0-2.5MM': '1.12%', '2.5-5MM': '1.09%', '5-10MM': '1.06%', '10-20MM': '1.03%', '20-40MM': '1.00%' } },
      { corridor: 'COP/USD/HKD', destination: 'Hong Kong', rates: { '0-2.5MM': '1.32%', '2.5-5MM': '1.29%', '5-10MM': '1.26%', '10-20MM': '1.23%', '20-40MM': '1.20%' } },
      { corridor: 'COP/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'USDT/COP', destination: 'Off Ramp', rates: { '0-2.5MM': '0.57%', '2.5-5MM': '0.54%', '5-10MM': '0.51%', '10-20MM': '0.48%', '20-40MM': '0.45%' } },
    ],
  },
  {
    origin: 'Zona Sepa',
    label: 'Zona Sepa Crossborder — Aliados',
    corridors: [
      { corridor: 'EUR-USD', destination: 'USA', rates: { '0-2.5MM': '0.52%', '2.5-5MM': '0.49%', '5-10MM': '0.46%', '10-20MM': '0.43%', '20-40MM': '0.40%' } },
      { corridor: 'EUR-COP', destination: 'Colombia', rates: { '0-2.5MM': '0.62%', '2.5-5MM': '0.59%', '5-10MM': '0.56%', '10-20MM': '0.53%', '20-40MM': '0.50%' } },
      { corridor: 'EUR-REAL', destination: 'Brasil', rates: { '0-2.5MM': '0.82%', '2.5-5MM': '0.79%', '5-10MM': '0.76%', '10-20MM': '0.73%', '20-40MM': '0.70%' } },
      { corridor: 'EUR-USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.62%', '2.5-5MM': '0.59%', '5-10MM': '0.56%', '10-20MM': '0.53%', '20-40MM': '0.50%' } },
      { corridor: 'USDT/COP', destination: 'Off Ramp', rates: { '0-2.5MM': '0.62%', '2.5-5MM': '0.59%', '5-10MM': '0.56%', '10-20MM': '0.53%', '20-40MM': '0.50%' } },
    ],
  },
  {
    origin: 'Brasil',
    label: 'Brasil Crossborder — Aliados',
    corridors: [
      { corridor: 'Reales/Reales', destination: 'Tesorería', rates: { '0-2.5MM': '1.12%', '2.5-5MM': '1.09%', '5-10MM': '1.06%', '10-20MM': '1.03%', '20-40MM': '1.00%' } },
      { corridor: 'REALES/USD', destination: 'USA', rates: { '0-2.5MM': '0.58%', '2.5-5MM': '0.55%', '5-10MM': '0.52%', '10-20MM': '0.49%', '20-40MM': '0.46%' } },
      { corridor: 'REALES/COP', destination: 'Colombia', rates: { '0-2.5MM': '1.12%', '2.5-5MM': '1.09%', '5-10MM': '1.06%', '10-20MM': '1.03%', '20-40MM': '1.00%' } },
      { corridor: 'REALES/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.67%', '2.5-5MM': '0.64%', '5-10MM': '0.61%', '10-20MM': '0.58%', '20-40MM': '0.55%' } },
      { corridor: 'REALES/HKG', destination: 'Hong Kong', rates: { '0-2.5MM': '1.67%', '2.5-5MM': '1.64%', '5-10MM': '1.61%', '10-20MM': '1.58%', '20-40MM': '1.55%' } },
      { corridor: 'REALES/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.62%', '2.5-5MM': '0.59%', '5-10MM': '0.56%', '10-20MM': '0.53%', '20-40MM': '0.50%' } },
      { corridor: 'USDT/REALES', destination: 'Off Ramp', rates: { '0-2.5MM': '0.65%', '2.5-5MM': '0.60%', '5-10MM': '0.55%', '10-20MM': '0.50%', '20-40MM': '0.45%' } },
    ],
  },
  {
    origin: 'Perú',
    label: 'Perú Crossborder — Aliados',
    corridors: [
      { corridor: 'SOLES/USD/COP', destination: 'Colombia', rates: { '0-2.5MM': '1.05%', '2.5-5MM': '1.00%', '5-10MM': '0.95%', '10-20MM': '0.90%', '20-40MM': '0.85%', '40MM+': '0.85%' } },
      { corridor: 'SOLES-USD/USDT', destination: 'Global', rates: { '0-2.5MM': '1.70%', '2.5-5MM': '1.65%', '5-10MM': '1.60%', '10-20MM': '1.55%', '20-40MM': '1.50%', '40MM+': '1.50%' } },
    ],
  },
];
