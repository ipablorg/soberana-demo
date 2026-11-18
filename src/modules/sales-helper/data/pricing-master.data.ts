import type { PricingCorridor } from '../types';

export const PRICING_CORRIDORS: PricingCorridor[] = [
  // ─── USDT ───────────────────────────────────────────────
  { corridor: 'USDT/HKD', currency: 'USDT', minCost: '1.00%', dispersion: null, basePrice: '1.00%', startingTariff: null, deliveryTime: '60 Minutos', observations: null },
  { corridor: 'USDT - USD/MXN USD', currency: 'USDT', minCost: '0.60%', dispersion: null, basePrice: '0.60%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'USDT/USD', currency: 'USDT', minCost: '0.10%', dispersion: '0', basePrice: '0.10%', startingTariff: null, deliveryTime: '30 minutos', observations: null },
  { corridor: 'USDT/USD/PANAMA', currency: 'USDT', minCost: '0.45%', dispersion: '0', basePrice: '0.45%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'USDT/USD/COP', currency: 'USDT', minCost: '0.45%', dispersion: '0.20%', basePrice: '0.65%', startingTariff: '0.80%', deliveryTime: '4 Horas', observations: null, type: 'Off Ramp' },
  { corridor: 'USDT/USD/EUR', currency: 'USDT', minCost: '0.65%', dispersion: '0', basePrice: '0.65%', startingTariff: null, deliveryTime: '6 Horas', observations: 'Después de Compliance' },
  { corridor: 'USDT/SOLES', currency: 'USDT', minCost: null, dispersion: null, basePrice: '1.50%', startingTariff: null, deliveryTime: null, observations: null },

  // ─── COP ────────────────────────────────────────────────
  { corridor: 'COP/USDT', currency: 'COP', minCost: '0.30%', dispersion: '0', basePrice: '0.45%', startingTariff: '0.50%', deliveryTime: '30 minutos', observations: null, type: 'On Ramp' },
  { corridor: 'COP/USD', currency: 'COP', minCost: '0.30%', dispersion: '0', basePrice: '0.50%', startingTariff: null, deliveryTime: '30 minutos', observations: null },
  { corridor: 'COP/SOLES', currency: 'COP', minCost: '0.65%', dispersion: '0', basePrice: '0.65%', startingTariff: null, deliveryTime: 'T+1', observations: 'Hasta 100.000 USD el tiempo es T+2' },
  { corridor: 'COP/USDT/USD/EUR', currency: 'COP', minCost: '0.80%', dispersion: null, basePrice: '0.80%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'COP/USD/EUR', currency: 'COP', minCost: '0.60%', dispersion: null, basePrice: '0.60%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'COP/USD/HKD', currency: 'COP', minCost: '0.60%', dispersion: null, basePrice: '1.20%', startingTariff: null, deliveryTime: '12 horas', observations: null },
  { corridor: 'COP/MXN', currency: 'COP', minCost: '0.50%', dispersion: null, basePrice: '0.50%', startingTariff: null, deliveryTime: null, observations: null },

  // ─── USD ────────────────────────────────────────────────
  { corridor: 'USD/MXN', currency: 'USD', minCost: null, dispersion: null, basePrice: '0.60%', startingTariff: null, deliveryTime: null, observations: null },
  { corridor: 'USD/COP', currency: 'USD', minCost: '0.25%', dispersion: '0.20%', basePrice: '0.45%', startingTariff: '0.65%', deliveryTime: '4 Horas', observations: null },
  { corridor: 'USD/HKN', currency: 'USD', minCost: null, dispersion: null, basePrice: '1%', startingTariff: null, deliveryTime: null, observations: null },
  { corridor: 'USD/PANAMA', currency: 'USD', minCost: '0.30%', dispersion: '0', basePrice: '0.30%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'PANAMA/USD', currency: 'USD', minCost: '0.30%', dispersion: '0', basePrice: '0.30%', startingTariff: null, deliveryTime: 'T+1', observations: null },
  { corridor: 'USD/EUR', currency: 'USD', minCost: '0.55%', dispersion: '0', basePrice: '0.55%', startingTariff: null, deliveryTime: '6 Horas', observations: 'Después de Compliance' },
  { corridor: 'USD/CLP', currency: 'USD', minCost: '0.70%', dispersion: null, basePrice: '0.70%', startingTariff: null, deliveryTime: '6 horas', observations: null },
  { corridor: 'USD/USDT', currency: 'USD', minCost: null, dispersion: null, basePrice: '0.40%', startingTariff: null, deliveryTime: null, observations: null },
  { corridor: 'USD/HKD', currency: 'USD', minCost: '1.00%', dispersion: null, basePrice: '1.00%', startingTariff: null, deliveryTime: '3 Horas', observations: null },

  // ─── SOLES ──────────────────────────────────────────────
  { corridor: 'SOLES/USD/COP', currency: 'SOLES', minCost: '0.65%', dispersion: '0.20%', basePrice: '0.85%', startingTariff: null, deliveryTime: 'T+1', observations: 'Hasta 100.000 USD el tiempo es T+2' },
  { corridor: 'SOLES/USD', currency: 'SOLES', minCost: '0.60%', dispersion: null, basePrice: '0.60%', startingTariff: null, deliveryTime: '4 Horas', observations: null },
  { corridor: 'SOLES On Ramp', currency: 'SOLES', minCost: '1%', dispersion: null, basePrice: null, startingTariff: null, deliveryTime: null, observations: null, type: 'On Ramp' },
  { corridor: 'SOLES Off Ramp', currency: 'SOLES', minCost: '0.50%', dispersion: null, basePrice: null, startingTariff: null, deliveryTime: null, observations: null, type: 'Off Ramp' },
  { corridor: 'SOLES/USDT', currency: 'SOLES', minCost: '0.60%', dispersion: null, basePrice: '0.60%', startingTariff: null, deliveryTime: '4 Horas', observations: null },
  { corridor: 'SOLES/Panamá (Brex)', currency: 'SOLES', minCost: '0.65%', dispersion: null, basePrice: '0.65%', startingTariff: null, deliveryTime: 'T+2', observations: null },

  // ─── EUR ────────────────────────────────────────────────
  { corridor: 'EUR-USD', currency: 'EUR', minCost: '0.45%', dispersion: null, basePrice: '0.45%', startingTariff: null, deliveryTime: 'T+1', observations: 'Hasta las 12:00 PM (Hora Colombia) después es T+2' },
  { corridor: 'EUR-COP', currency: 'EUR', minCost: '0.45%', dispersion: null, basePrice: '0.45%', startingTariff: null, deliveryTime: 'T+1', observations: 'Hasta las 12:00 PM (Hora Colombia) después es T+2' },
  { corridor: 'EUR-MXN', currency: 'EUR', minCost: '0.80%', dispersion: null, basePrice: '0.80%', startingTariff: null, deliveryTime: null, observations: null },
  { corridor: 'EUR-BRL', currency: 'EUR', minCost: '0.52%', dispersion: null, basePrice: '0.52%', startingTariff: null, deliveryTime: null, observations: null },
  { corridor: 'EUR-USDT', currency: 'EUR', minCost: '0.52%', dispersion: null, basePrice: '0.52%', startingTariff: null, deliveryTime: null, observations: null },
];
