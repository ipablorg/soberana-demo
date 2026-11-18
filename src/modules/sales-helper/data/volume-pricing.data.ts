import type { VolumePricingTable } from '../types';

export const VOLUME_PRICING_TABLES: VolumePricingTable[] = [
  {
    origin: 'Off Ramp',
    label: 'Off Ramp',
    corridors: [
      { corridor: 'USDT/USD', destination: 'USA', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
      { corridor: 'USDT/USD/COP', destination: 'Colombia', rates: { '0-2.5MM': '0.65%', '2.5-5MM': '0.60%', '5-10MM': '0.55%', '10-20MM': '0.50%', '20-40MM': '0.45%', '40MM+': '0.45%' } },
      { corridor: 'USDT/USD/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.70%', '2.5-5MM': '0.65%', '5-10MM': '0.60%', '10-20MM': '0.55%', '20-40MM': '0.50%', '40MM+': '0.50%' } },
      { corridor: 'USDT/SOLES', destination: 'Perú', rates: { '0-2.5MM': '1.70%', '2.5-5MM': '1.65%', '5-10MM': '1.60%', '10-20MM': '1.55%', '20-40MM': '1.50%', '40MM+': '1.50%' } },
      { corridor: 'USDT - USD/MXN USD', destination: 'México', rates: { '0-2.5MM': '0.20%', '2.5-5MM': '0.15%', '5-10MM': '0.10%', '10-20MM': '0.05%' } },
    ],
  },
  {
    origin: 'USA',
    label: 'USA Crossborder',
    corridors: [
      { corridor: 'USD-COP', destination: 'Colombia', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
      { corridor: 'USD/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
      { corridor: 'USD/HKD', destination: 'Hong Kong', rates: { '0-2.5MM': '1.20%', '2.5-5MM': '1.15%', '5-10MM': '1.10%', '10-20MM': '1.05%', '20-40MM': '1.00%', '40MM+': '1.00%' } },
      { corridor: 'USD/MXN', destination: 'México', rates: { '0-2.5MM': '0.20%', '2.5-5MM': '0.15%', '5-10MM': '0.10%', '10-20MM': '0.05%' } },
      { corridor: 'USD/PANAMA', destination: 'Panamá', rates: { '0-2.5MM': '0.50%', '2.5-5MM': '0.45%', '5-10MM': '0.40%', '10-20MM': '0.35%', '20-40MM': '0.30%', '40MM+': '0.30%' } },
      { corridor: 'USD/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
      { corridor: 'USD/CLP', destination: 'Chile', rates: { '0-2.5MM': '0.90%', '2.5-5MM': '0.85%', '5-10MM': '0.80%', '10-20MM': '0.75%', '20-40MM': '0.70%', '40MM+': '0.70%' } },
    ],
  },
  {
    origin: 'Colombia',
    label: 'Colombia Crossborder',
    corridors: [
      { corridor: 'COP/USD', destination: 'USA', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
      { corridor: 'COP/USD/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.70%', '2.5-5MM': '0.65%', '5-10MM': '0.60%', '10-20MM': '0.55%', '20-40MM': '0.50%', '40MM+': '0.50%' } },
      { corridor: 'COP/SOLES', destination: 'Perú', rates: { '0-2.5MM': '0.85%', '2.5-5MM': '0.80%', '5-10MM': '0.75%', '10-20MM': '0.70%', '20-40MM': '0.65%', '40MM+': '0.65%' } },
      { corridor: 'COP/USD/HKD', destination: 'Hong Kong', rates: { '0-2.5MM': '1.40%', '2.5-5MM': '1.35%', '5-10MM': '1.30%', '10-20MM': '1.25%', '20-40MM': '1.20%', '40MM+': '1.20%' } },
      { corridor: 'COP/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.60%', '2.5-5MM': '0.55%', '5-10MM': '0.50%', '10-20MM': '0.45%', '20-40MM': '0.40%', '40MM+': '0.40%' } },
    ],
  },
  {
    origin: 'Zona Sepa',
    label: 'Zona Sepa Crossborder',
    corridors: [
      { corridor: 'EUR-USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.70%', '2.5-5MM': '0.65%', '5-10MM': '0.60%', '10-20MM': '0.55%', '20-40MM': '0.50%', '40MM+': '0.50%' } },
    ],
  },
  {
    origin: 'Perú',
    label: 'Perú Crossborder',
    corridors: [
      { corridor: 'SOLES/USD/COP', destination: 'Colombia', rates: { '0-2.5MM': '1.05%', '2.5-5MM': '1.00%', '5-10MM': '0.95%', '10-20MM': '0.90%', '20-40MM': '0.85%', '40MM+': '0.85%' } },
      { corridor: 'SOLES-USD/USDT', destination: 'Global', rates: { '0-2.5MM': '1.70%', '2.5-5MM': '1.65%', '5-10MM': '1.60%', '10-20MM': '1.55%', '20-40MM': '1.50%', '40MM+': '1.50%' } },
    ],
  },
  {
    origin: 'Brasil',
    label: 'Brasil Crossborder',
    corridors: [
      { corridor: 'Reales/Reales', destination: 'Tesorería', rates: { '0-2.5MM': '1.25%', '2.5-5MM': '1.20%', '5-10MM': '1.15%', '10-20MM': '1.10%', '20-40MM': '1.05%', '40MM+': '1.00%' } },
      { corridor: 'REALES/USD', destination: 'USA', rates: { '0-2.5MM': '0.66%', '2.5-5MM': '0.61%', '5-10MM': '0.56%', '10-20MM': '0.51%', '20-40MM': '0.46%', '40MM+': '0.46%' } },
      { corridor: 'REALES/COP', destination: 'Colombia', rates: { '0-2.5MM': '1.25%', '2.5-5MM': '1.20%', '5-10MM': '1.15%', '10-20MM': '1.10%', '20-40MM': '1.05%', '40MM+': '1.00%' } },
      { corridor: 'REALES/EUR', destination: 'Zona Sepa', rates: { '0-2.5MM': '0.80%', '2.5-5MM': '0.75%', '5-10MM': '0.70%', '10-20MM': '0.65%', '20-40MM': '0.60%', '40MM+': '0.55%' } },
      { corridor: 'REALES/SOLES', destination: 'Perú', rates: { '0-2.5MM': '0.25%', '2.5-5MM': '0.20%', '5-10MM': '0.15%', '10-20MM': '0.10%', '20-40MM': '0.05%' } },
      { corridor: 'REALES/HKG', destination: 'Hong Kong', rates: { '0-2.5MM': '1.80%', '2.5-5MM': '1.75%', '5-10MM': '1.70%', '10-20MM': '1.65%', '20-40MM': '1.60%', '40MM+': '1.55%' } },
      { corridor: 'REALES/USDT', destination: 'On Ramp', rates: { '0-2.5MM': '0.70%', '2.5-5MM': '0.65%', '5-10MM': '0.60%', '10-20MM': '0.55%', '20-40MM': '0.50%', '40MM+': '0.45%' } },
      { corridor: 'USDT/REALES', destination: 'Off Ramp', rates: { '0-2.5MM': '0.70%', '2.5-5MM': '0.65%', '5-10MM': '0.60%', '10-20MM': '0.55%', '20-40MM': '0.50%', '40MM+': '0.45%' } },
    ],
  },
];
