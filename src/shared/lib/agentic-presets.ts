/**
 * Agentic use case presets by country, rail, and product
 * Following the pattern: Intent → Route → Preview → Execute → Receipt
 */

export interface AgenticPreset {
  id: string;
  country: 'CO' | 'BR' | 'US' | 'EU' | 'MULTI';
  category: 'collect' | 'payout' | 'transfer' | 'convert' | 'account' | 'card' | 'treasury';
  title: string;
  subtitle: string;
  badges: { label: string; variant?: 'default' | 'secondary' | 'outline' }[];
  flow: {
    inputs: { label: string; type: string; placeholder?: string }[];
    routeLogic: string;
    whyExplanation: string;
  };
}

export const AGENTIC_PRESETS: AgenticPreset[] = [
  // COLOMBIA - COLLECT
  {
    id: 'co-collect-breb-usdc',
    country: 'CO',
    category: 'collect',
    title: 'Recibir COP con BRE-B → Wallet USDC (Base)',
    subtitle: 'Cobro instantáneo en pesos, conversión automática a stablecoin',
    badges: [
      { label: 'BRE-B', variant: 'default' },
      { label: '5-10 min', variant: 'secondary' },
      { label: '0.8% fee', variant: 'outline' },
    ],
    flow: {
      inputs: [
        { label: 'Monto COP', type: 'number', placeholder: '500000' },
        { label: 'Wallet destino', type: 'select' },
      ],
      routeLogic: 'BRE-B → Bridge (COP→USDC) → Base Network',
      whyExplanation:
        'BRE-B es el método más rápido para recibir COP en Colombia. Usamos un bridge confiable para convertir a USDC y depositamos en tu wallet Base para máxima liquidez.',
    },
  },
  {
    id: 'co-collect-pse-usd',
    country: 'CO',
    category: 'collect',
    title: 'Recaudar en COP vía PSE y consolidar en USD',
    subtitle: 'Transferencia bancaria tradicional con conversión a dólares',
    badges: [
      { label: 'PSE', variant: 'default' },
      { label: '1-2 días', variant: 'secondary' },
      { label: '1.2% fee', variant: 'outline' },
    ],
    flow: {
      inputs: [
        { label: 'Monto COP', type: 'number', placeholder: '1000000' },
        { label: 'Cuenta destino USD', type: 'select' },
      ],
      routeLogic: 'PSE → Banco local → FX (COP→USD) → Cuenta multi-moneda',
      whyExplanation:
        'PSE es ideal para montos grandes. Procesamos vía banco local para mejor tasa FX y depositamos USD en tu cuenta consolidada.',
    },
  },
  {
    id: 'co-payout-breb-massive',
    country: 'CO',
    category: 'payout',
    title: 'Dispersar masivo en COP: BRE-B y PSE mixto',
    subtitle: 'Motor inteligente elige el mejor rail por beneficiario',
    badges: [
      { label: 'BRE-B + PSE', variant: 'default' },
      { label: 'Optimizado', variant: 'secondary' },
    ],
    flow: {
      inputs: [{ label: 'Archivo CSV', type: 'file' }],
      routeLogic: 'Split engine: BRE-B (montos <500k), PSE (montos >500k)',
      whyExplanation:
        'Nuestro motor analiza cada pago y elige BRE-B para rapidez o PSE para costo, optimizando el batch completo.',
    },
  },
  {
    id: 'co-convert-usd-cop-breb',
    country: 'CO',
    category: 'convert',
    title: 'Recaudar en USD, liquidar a COP con BRE-B',
    subtitle: 'Recibe dólares internacionales y paga en pesos localmente',
    badges: [
      { label: 'ACH → BRE-B', variant: 'default' },
      { label: 'Lock 30s', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monto USD', type: 'number', placeholder: '1000' },
        { label: 'Beneficiario COP', type: 'select' },
      ],
      routeLogic: 'USD ACH → FX lock → COP → BRE-B payout',
      whyExplanation:
        'Bloqueamos la tasa FX por 30 segundos para protegerte de volatilidad, luego dispersamos vía BRE-B en minutos.',
    },
  },

  // BRAZIL - COLLECT
  {
    id: 'br-collect-pix-usd',
    country: 'BR',
    category: 'collect',
    title: 'Recibir BRL vía Pix y convertir a USD',
    subtitle: 'Cobro instantáneo Pix con conversión automática',
    badges: [
      { label: 'Pix', variant: 'default' },
      { label: 'Instantáneo', variant: 'secondary' },
      { label: '0.5% fee', variant: 'outline' },
    ],
    flow: {
      inputs: [
        { label: 'Monto BRL', type: 'number', placeholder: '5000' },
        { label: 'Cuenta USD', type: 'select' },
      ],
      routeLogic: 'Pix → FX (BRL→USD) → Cuenta multi-moneda',
      whyExplanation:
        'Pix es el método preferido en Brasil por su velocidad. Convertimos a USD con tasa competitiva y depositamos en tu cuenta consolidada.',
    },
  },
  {
    id: 'br-payout-pix-massive',
    country: 'BR',
    category: 'payout',
    title: 'Pagar nómina o proveedores BR vía Pix',
    subtitle: 'Pagos masivos instantáneos en Brasil',
    badges: [
      { label: 'Pix', variant: 'default' },
      { label: 'Batch', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Archivo CSV', type: 'file' },
        { label: 'Monto total BRL', type: 'number' },
      ],
      routeLogic: 'BRL account → Pix batch API → Confirmación individual',
      whyExplanation:
        'Pix permite dispersión instantánea 24/7. Procesamos cada pago con confirmación en tiempo real.',
    },
  },

  // US - COLLECT & CONVERT
  {
    id: 'us-collect-ach-usdc',
    country: 'US',
    category: 'collect',
    title: 'Recaudar en USD con ACH y convertir a USDC',
    subtitle: 'Transferencia bancaria tradicional a stablecoin',
    badges: [
      { label: 'ACH', variant: 'default' },
      { label: '2-3 días', variant: 'secondary' },
      { label: '0.3% fee', variant: 'outline' },
    ],
    flow: {
      inputs: [
        { label: 'Monto USD', type: 'number', placeholder: '10000' },
        { label: 'Wallet USDC', type: 'select' },
      ],
      routeLogic: 'ACH → On-ramp → USDC (Ethereum/Base/Polygon)',
      whyExplanation:
        'ACH es el método estándar en US. Usamos on-ramp confiable para convertir a USDC en la red de tu elección.',
    },
  },

  // MULTI-CURRENCY
  {
    id: 'multi-account-create',
    country: 'MULTI',
    category: 'account',
    title: 'Crear cuenta multi-moneda (USD, EUR, BRL)',
    subtitle: 'Una cuenta para operar en múltiples divisas',
    badges: [
      { label: 'Instantáneo', variant: 'default' },
      { label: 'Sin fee', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monedas', type: 'multi-select' },
        { label: 'Nombre cuenta', type: 'text' },
      ],
      routeLogic: 'Provisión de vIBAN por moneda + wallet unificado',
      whyExplanation:
        'Te damos un vIBAN por cada moneda seleccionada, todo bajo una sola cuenta para gestión simplificada.',
    },
  },

  // FX & BRIDGE
  {
    id: 'multi-convert-usd-cop-lock',
    country: 'CO',
    category: 'convert',
    title: 'Convertir USD → COP con tasa bloqueada',
    subtitle: 'Protección contra volatilidad con lock de 30 segundos',
    badges: [
      { label: 'FX Lock', variant: 'default' },
      { label: '30s', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monto USD', type: 'number' },
        { label: 'Cuenta COP destino', type: 'select' },
      ],
      routeLogic: 'USD → Rate lock → COP conversion → Local bank',
      whyExplanation:
        'Bloqueamos la tasa por 30 segundos para que apruebes. Una vez confirmado, ejecutamos la conversión inmediatamente.',
    },
  },
  {
    id: 'multi-convert-usdc-cop-ramp',
    country: 'CO',
    category: 'convert',
    title: 'USDC → COP vía off-ramp',
    subtitle: 'Stablecoin a pesos colombianos',
    badges: [
      { label: 'Off-ramp', variant: 'default' },
      { label: '1-2 horas', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monto USDC', type: 'number' },
        { label: 'Cuenta bancaria COP', type: 'select' },
      ],
      routeLogic: 'USDC (Base) → Off-ramp provider → COP bank transfer',
      whyExplanation:
        'Usamos off-ramp confiable para convertir tu USDC a COP y depositamos en tu cuenta bancaria local.',
    },
  },
  {
    id: 'multi-convert-brl-usdc-hedge',
    country: 'BR',
    category: 'convert',
    title: 'BRL → USDC para cobertura (hedge)',
    subtitle: 'Protege tu tesorería de volatilidad cambiaria',
    badges: [
      { label: 'Hedge', variant: 'default' },
      { label: 'On-ramp', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monto BRL', type: 'number' },
        { label: 'Wallet USDC', type: 'select' },
      ],
      routeLogic: 'BRL → On-ramp → USDC (Polygon/Base)',
      whyExplanation:
        'Convertimos BRL a USDC para protegerte de devaluación. Ideal para tesorería estable en stablecoin.',
    },
  },

  // VIRTUAL CARDS
  {
    id: 'card-single-use',
    country: 'MULTI',
    category: 'card',
    title: 'Crear tarjeta virtual de un solo uso (USD)',
    subtitle: 'Tarjeta desechable para compras seguras',
    badges: [
      { label: 'Single-use', variant: 'default' },
      { label: 'Instantánea', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Límite USD', type: 'number', placeholder: '500' },
        { label: 'Descripción', type: 'text' },
      ],
      routeLogic: 'Virtual card issuing → Tokenización → Auto-destrucción post-uso',
      whyExplanation:
        'Tarjeta virtual que se destruye automáticamente después de la primera transacción. Máxima seguridad para pagos únicos.',
    },
  },
  {
    id: 'card-recurring-saas',
    country: 'MULTI',
    category: 'card',
    title: 'Tarjeta recurrente SaaS (límite mensual)',
    subtitle: 'Para suscripciones con control de gastos',
    badges: [
      { label: 'Recurrente', variant: 'default' },
      { label: 'Límite mensual', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Límite mensual USD', type: 'number', placeholder: '1000' },
        { label: 'Merchant', type: 'text' },
      ],
      routeLogic: 'Virtual card → Límite mensual → Reset automático',
      whyExplanation:
        'Tarjeta diseñada para suscripciones. El límite se resetea cada mes para control automático de gastos.',
    },
  },
  {
    id: 'card-mcc-restricted',
    country: 'MULTI',
    category: 'card',
    title: 'Tarjeta con MCC restrictivo',
    subtitle: 'Bloquea categorías de comercio no deseadas',
    badges: [
      { label: 'MCC Lock', variant: 'default' },
      { label: 'Configurable', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Límite USD', type: 'number' },
        { label: 'MCCs permitidos', type: 'multi-select' },
      ],
      routeLogic: 'Virtual card → MCC validation → Decline si no match',
      whyExplanation:
        'Solo permite transacciones en categorías específicas (ej: software, marketing). Rechaza automáticamente otros MCCs.',
    },
  },

  // TREASURY AUTOMATION
  {
    id: 'treasury-hedge-brl',
    country: 'BR',
    category: 'treasury',
    title: 'Hedge automático: BRL → USDC si cae >1%',
    subtitle: 'Protección contra devaluación del real',
    badges: [
      { label: 'Automático', variant: 'default' },
      { label: 'Threshold 1%', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Monto BRL a proteger', type: 'number' },
        { label: 'Threshold %', type: 'number', placeholder: '1' },
      ],
      routeLogic: 'Monitor BRL/USD → Si cae >1% → Auto-convert BRL→USDC',
      whyExplanation:
        'Monitoreamos la tasa BRL/USD en tiempo real. Si detectamos caída superior al 1%, ejecutamos conversión automática a USDC.',
    },
  },
  {
    id: 'treasury-rebalance-daily',
    country: 'MULTI',
    category: 'treasury',
    title: 'Rebalance diario: 30/30/40 USD/BRL/USDC',
    subtitle: 'Mantén proporciones objetivo automáticamente',
    badges: [
      { label: 'Diario', variant: 'default' },
      { label: 'Auto-rebalance', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Target USD %', type: 'number', placeholder: '30' },
        { label: 'Target BRL %', type: 'number', placeholder: '30' },
        { label: 'Target USDC %', type: 'number', placeholder: '40' },
      ],
      routeLogic: 'Daily check → Calculate delta → Execute swaps to target',
      whyExplanation:
        'Cada día revisamos tus balances y ejecutamos las conversiones necesarias para mantener las proporciones deseadas.',
    },
  },
  {
    id: 'treasury-prefund-weekly',
    country: 'MULTI',
    category: 'treasury',
    title: 'Prefondeo semanal de wallets',
    subtitle: 'Asegura liquidez automática en tus wallets',
    badges: [
      { label: 'Semanal', variant: 'default' },
      { label: 'Auto-transfer', variant: 'secondary' },
    ],
    flow: {
      inputs: [
        { label: 'Wallet destino', type: 'select' },
        { label: 'Monto objetivo', type: 'number' },
      ],
      routeLogic: 'Weekly trigger → Check wallet balance → Top-up to target',
      whyExplanation:
        'Cada semana verificamos el balance de tu wallet y transferimos lo necesario para llegar al monto objetivo.',
    },
  },
];

// Helper functions
export function getPresetsByCountry(country: AgenticPreset['country']) {
  return AGENTIC_PRESETS.filter((p) => p.country === country || p.country === 'MULTI');
}

export function getPresetsByCategory(category: AgenticPreset['category']) {
  return AGENTIC_PRESETS.filter((p) => p.category === category);
}

export function getPresetById(id: string) {
  return AGENTIC_PRESETS.find((p) => p.id === id);
}
