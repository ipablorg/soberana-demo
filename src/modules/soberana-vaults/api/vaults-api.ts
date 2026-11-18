/**
 * Soberana Vaults — API Client
 * Calls the CoverageLiquidityBot API via Vite proxy /api/vaults-live
 */

import type {
  HealthResponse,
  ResumenEjecutivo,
  InformeCompleto,
  MetricasHistorico,
  InformesListResponse,
} from '../types/vaults.types';

const BASE = '/api/vaults-live';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Vaults API error ${res.status} at ${path}`);
  }
  return res.json() as Promise<T>;
}

export const vaultsApi = {
  health: (): Promise<HealthResponse> =>
    apiFetch('/api/v1/health'),

  resumen: (): Promise<ResumenEjecutivo> =>
    apiFetch('/api/v1/resumen'),

  latestInforme: (): Promise<InformeCompleto> =>
    apiFetch('/api/v1/informes/latest'),

  historico: (ultimos = 100): Promise<MetricasHistorico> =>
    apiFetch(`/api/v1/metricas/historico?ultimos=${ultimos}`),

  informes: (limit = 20, page = 1): Promise<InformesListResponse> =>
    apiFetch(`/api/v1/informes?limit=${limit}&page=${page}`),
};
