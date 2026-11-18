import { RouteOption, Connector } from '@/shared/types/suite';

export interface RouteRequest {
  amount: number;
  currency: string;
  destination: string;
  urgency: 'instant' | 'fast' | 'standard';
  constraints?: {
    maxCostBps?: number;
    complianceLevel?: 'standard' | 'enhanced';
    preferredRails?: string[];
  };
}

export function optimizeRoute(
  request: RouteRequest,
  availableConnectors: Connector[]
): RouteOption[] {
  const { amount, currency, destination, urgency, constraints } = request;

  // Mock route optimization logic
  const routes: RouteOption[] = [];

  // Route 1: Direct bank rail
  if (availableConnectors.some((c) => c.category === 'rail')) {
    routes.push({
      id: 'route-bank-direct',
      connectors: ['pix', 'ach', 'sepa'].filter((id) =>
        availableConnectors.some((c) => c.id === id)
      ),
      estimatedCost: amount * 0.0025, // 25 bps
      estimatedEtaMins: urgency === 'instant' ? 5 : urgency === 'fast' ? 60 : 1440,
      riskScore: 0.1,
      explanation: `Ruta directa bancaria usando ${destination === 'BR' ? 'PIX' : destination === 'US' ? 'ACH' : 'SEPA'}. Menor costo, cumplimiento bancario estándar.`,
      steps: [
        { connector: 'openfort', action: 'custody_check', currency },
        { connector: destination === 'BR' ? 'pix' : 'ach', action: 'payout', currency },
      ],
    });
  }

  // Route 2: Stablecoin bridge
  if (availableConnectors.some((c) => c.category === 'stablecoin_platform')) {
    routes.push({
      id: 'route-stablecoin',
      connectors: ['circle-cctp', 'bridge-xyz'].filter((id) =>
        availableConnectors.some((c) => c.id === id)
      ),
      estimatedCost: amount * 0.0035, // 35 bps
      estimatedEtaMins: urgency === 'instant' ? 2 : 30,
      riskScore: 0.25,
      explanation:
        'Conversión a USDC, bridge cross-chain, y liquidación local. Más rápido, costo moderado.',
      steps: [
        { connector: 'brex-stablecoin', action: 'convert_to_usdc', currency: 'USDC' },
        { connector: 'circle-cctp', action: 'bridge', currency: 'USDC' },
        { connector: 'pix', action: 'offramp', currency },
      ],
    });
  }

  // Route 3: Hybrid (FX + Stablecoin)
  routes.push({
    id: 'route-hybrid',
    connectors: ['wise-platform', 'shield', 'pix'],
    estimatedCost: amount * 0.0045, // 45 bps
    estimatedEtaMins: urgency === 'instant' ? 10 : 120,
    riskScore: 0.15,
    explanation: 'FX via Wise + off-ramp stablecoin Shield. Balance entre costo y velocidad.',
    steps: [
      { connector: 'wise-platform', action: 'fx_convert', currency },
      { connector: 'shield', action: 'usdt_offramp', currency },
      { connector: 'pix', action: 'payout', currency },
    ],
  });

  // Sort by cost if standard, by ETA if instant
  const sorted = routes.sort((a, b) => {
    if (urgency === 'instant') return a.estimatedEtaMins - b.estimatedEtaMins;
    return a.estimatedCost - b.estimatedCost;
  });

  // Filter by constraints
  return sorted.filter((route) => {
    if (constraints?.maxCostBps) {
      const bps = (route.estimatedCost / amount) * 10000;
      if (bps > constraints.maxCostBps) return false;
    }
    return true;
  });
}

export function explainRoute(route: RouteOption): string {
  return `
**Ruta optimizada:** ${route.connectors.join(' → ')}

**Costo estimado:** $${route.estimatedCost.toFixed(2)} (${((route.estimatedCost / 1000) * 10000).toFixed(1)} bps)
**Tiempo estimado:** ${route.estimatedEtaMins < 60 ? `${route.estimatedEtaMins} minutos` : `${(route.estimatedEtaMins / 60).toFixed(1)} horas`}
**Riesgo:** ${route.riskScore < 0.2 ? 'Bajo' : route.riskScore < 0.5 ? 'Medio' : 'Alto'}

**Pasos:**
${route.steps.map((s, i) => `${i + 1}. ${s.connector}: ${s.action}${s.currency ? ` (${s.currency})` : ''}`).join('\n')}

**Por qué esta ruta:**
${route.explanation}
  `.trim();
}
